import os
from typing import Dict, Any, List, Optional
from datetime import date
from sqlalchemy.orm import Session
from app.models.entities import Project, RiskPrediction, RiskFactor, ProjectMonthlyData, Milestone
from ml.features.feature_builder import FeatureBuilder
from ml.models.cost.cost_model import CostOverrunPredictor
from ml.models.delay.delay_model import TimeOverrunPredictor
from ml.models.risk.risk_scorer import RiskScorer
from ml.explainability.explainer import SHAPExplainer

class MLService:
    def __init__(self):
        self.cost_model = CostOverrunPredictor()
        self.delay_model = TimeOverrunPredictor()

    def predict_for_project(self, db: Session, project: Project) -> RiskPrediction:
        # Build features
        proj_dict = {
            "original_cost": project.original_cost,
            "revised_cost": project.revised_cost,
            "current_expenditure": project.current_expenditure,
            "physical_progress": project.physical_progress,
            "financial_progress": project.financial_progress,
            "start_date": project.start_date,
            "original_completion_date": project.original_completion_date,
            "sector_id": project.sector_id,
            "implementing_agency": project.implementing_agency
        }

        milestone_dicts = [
            {
                "status": m.status,
                "delay_days": m.delay_days,
                "criticality": m.criticality
            }
            for m in project.milestones
        ]

        features = FeatureBuilder.extract_features(proj_dict, milestones=milestone_dicts)

        # ML Predictions
        cost_pred = self.cost_model.predict(features)
        target_date = project.revised_completion_date or project.original_completion_date
        delay_pred = self.delay_model.predict(features, target_completion_date=target_date)

        # Composite Risk Scoring
        overall_score, risk_level, comps = RiskScorer.compute_composite_risk(
            features,
            ml_cost_prob=cost_pred["probability"],
            ml_delay_prob=delay_pred["delay_probability"]
        )

        # SHAP Explainability
        shap_factors = SHAPExplainer.explain_prediction(features, overall_score)

        # Save to database
        risk_prediction = RiskPrediction(
            project_id=project.id,
            cost_overrun_probability=cost_pred["probability"],
            predicted_cost_overrun=cost_pred["predicted_overrun_percentage"],
            delay_probability=delay_pred["delay_probability"],
            predicted_delay_months=delay_pred["predicted_delay_months"],
            implementation_risk=comps["progress_risk"],
            overall_risk_score=overall_score,
            risk_level=risk_level,
            model_version=f"{cost_pred['model_version']}+{delay_pred['model_version']}"
        )
        db.add(risk_prediction)
        db.flush() # get id

        for f in shap_factors:
            rf = RiskFactor(
                risk_prediction_id=risk_prediction.id,
                feature_name=f["feature_name"],
                feature_value=float(f.get("feature_value", 0.0)),
                impact_score=float(f["impact_score"]),
                impact_direction=f["impact_direction"],
                rank=f["rank"]
            )
            db.add(rf)

        db.commit()
        db.refresh(risk_prediction)
        return risk_prediction

ml_service = MLService()
