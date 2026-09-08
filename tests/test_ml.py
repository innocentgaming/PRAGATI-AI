import os
import sys
import pytest
from datetime import date

# Ensure sys.path includes root directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.features.feature_builder import FeatureBuilder
from ml.models.cost.cost_model import CostOverrunPredictor
from ml.models.delay.delay_model import TimeOverrunPredictor
from ml.models.risk.risk_scorer import RiskScorer
from ml.explainability.explainer import SHAPExplainer


def test_feature_builder():
    proj = {
        "original_cost": 1000.0,
        "revised_cost": 1250.0,
        "current_expenditure": 900.0,
        "physical_progress": 45.0,
        "financial_progress": 72.0,
        "start_date": "2021-01-01",
        "original_completion_date": "2024-01-01",
        "sector_id": 1,
        "implementing_agency": "NHAI"
    }
    features = FeatureBuilder.extract_features(proj)
    assert features["original_cost"] == 1000.0
    assert features["cost_growth_percentage"] == 25.0
    assert features["physical_financial_gap"] == -27.0
    assert len(FeatureBuilder.to_feature_vector(features, "ALL")) > 15

def test_cost_and_delay_predictions():
    proj = {
        "original_cost": 5000.0,
        "revised_cost": 6500.0,
        "current_expenditure": 4800.0,
        "physical_progress": 40.0,
        "financial_progress": 73.8,
        "start_date": "2020-01-01",
        "original_completion_date": "2023-01-01",
        "sector_id": 1
    }
    features = FeatureBuilder.extract_features(proj)

    cost_model = CostOverrunPredictor()
    cost_res = cost_model.predict(features)
    assert 0.0 <= cost_res["probability"] <= 1.0
    assert cost_res["predicted_overrun_percentage"] >= 0.0

    delay_model = TimeOverrunPredictor()
    delay_res = delay_model.predict(features)
    assert 0.0 <= delay_res["delay_probability"] <= 1.0
    assert delay_res["predicted_delay_months"] >= 0.0

def test_risk_scorer_boundaries():
    proj_low = {
        "original_cost": 1000.0,
        "revised_cost": 1000.0,
        "current_expenditure": 500.0,
        "physical_progress": 65.0,
        "financial_progress": 50.0,
        "planned_duration_days": 1000,
        "elapsed_duration_days": 400,
        "total_milestones": 10,
        "delayed_milestones": 0
    }
    feat_low = FeatureBuilder.extract_features(proj_low)
    score_low, level_low, _ = RiskScorer.compute_composite_risk(feat_low)
    assert 0.0 <= score_low <= 40.0
    assert level_low in ["LOW", "MEDIUM"]

    proj_high = {
        "original_cost": 1000.0,
        "revised_cost": 1800.0,
        "current_expenditure": 1500.0,
        "physical_progress": 25.0,
        "financial_progress": 83.3,
        "start_date": "2018-01-01",
        "original_completion_date": "2021-01-01"
    }
    feat_high = FeatureBuilder.extract_features(proj_high)
    score_high, level_high, _ = RiskScorer.compute_composite_risk(feat_high, ml_cost_prob=0.85, ml_delay_prob=0.90)
    assert score_high >= 70.0
    assert level_high in ["HIGH", "CRITICAL"]

def test_shap_explainer():
    features = {
        "milestone_delay_rate": 0.6,
        "critical_delayed_rate": 0.4,
        "planned_actual_progress_gap": 22.0,
        "cost_growth_percentage": 30.0,
        "physical_financial_gap": -25.0,
        "progress_velocity": 0.5,
        "sector_risk_factor": 1.25
    }
    factors = SHAPExplainer.explain_prediction(features, 85.0)
    assert len(factors) > 0
    assert factors[0]["rank"] == 1
    assert "impact_score" in factors[0]
