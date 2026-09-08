from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.entities import RiskPrediction, Project
from app.schemas.schemas import PredictionRequest, PredictionResponse, RiskPredictionResponse
from ml.features.feature_builder import FeatureBuilder
from ml.models.cost.cost_model import CostOverrunPredictor
from ml.models.delay.delay_model import TimeOverrunPredictor
from ml.models.risk.risk_scorer import RiskScorer
from ml.explainability.explainer import SHAPExplainer

router = APIRouter(prefix="/risks", tags=["Risk Intelligence"])

cost_model = CostOverrunPredictor()
delay_model = TimeOverrunPredictor()

@router.get("", response_model=List[RiskPredictionResponse])
def get_all_risks(db: Session = Depends(get_db)):
    predictions = db.query(RiskPrediction).order_by(RiskPrediction.overall_risk_score.desc()).all()
    return predictions

@router.post("/predict", response_model=PredictionResponse)
def predict_adhoc(req: PredictionRequest):
    """
    On-the-fly predictive inference for what-if scenario modeling and project risk forecasting.
    """
    proj_dict = req.dict()
    features = FeatureBuilder.extract_features(proj_dict)
    
    cost_pred = cost_model.predict(features)
    delay_pred = delay_model.predict(features)
    
    overall_score, risk_level, comps = RiskScorer.compute_composite_risk(
        features,
        ml_cost_prob=cost_pred["probability"],
        ml_delay_prob=delay_pred["delay_probability"]
    )
    
    shap_factors = SHAPExplainer.explain_prediction(features, overall_score)

    return PredictionResponse(
        cost_overrun_probability=cost_pred["probability"],
        predicted_cost_overrun_percentage=cost_pred["predicted_overrun_percentage"],
        delay_probability=delay_pred["delay_probability"],
        predicted_delay_months=delay_pred["predicted_delay_months"],
        predicted_completion_date=delay_pred["predicted_completion_date"],
        overall_risk_score=overall_score,
        risk_level=risk_level,
        risk_drivers=shap_factors,
        model_version=f"{cost_pred['model_version']}+{delay_pred['model_version']}"
    )
