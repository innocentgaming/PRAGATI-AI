import os
import pickle
from datetime import date, timedelta
import numpy as np
from typing import Dict, Any
from ml.features.feature_builder import FeatureBuilder

class TimeOverrunPredictor:
    """
    Predicts probability of project schedule delay and estimated delay in months.
    """
    MODEL_VERSION = "v1.2-lgb-delay"

    def __init__(self, model=None, scaler=None):
        self.model = model
        self.scaler = scaler

    def predict(self, features: Dict[str, float], target_completion_date: date = None) -> Dict[str, Any]:
        sched_variance = features.get("schedule_variance_ratio", 0.0)
        progress_gap = features.get("planned_actual_progress_gap", 0.0)
        ms_delay_rate = features.get("milestone_delay_rate", 0.0)
        prog_velocity = max(0.1, features.get("progress_velocity", 1.0))
        remaining_days = features.get("remaining_duration_days", 300)
        phys_progress = features.get("physical_progress", 0.0)
        sector_factor = features.get("sector_risk_factor", 1.0)

        if self.model is not None:
            vec = np.array([FeatureBuilder.to_feature_vector(features, "ALL")]).reshape(1, -1)
            prob = float(self.model.predict_proba(vec)[0][1])
            delay_months = float(max(0.0, (progress_gap / prog_velocity) * 1.1))
        else:
            # Calibrated predictive heuristic
            logit = -1.8 + (sched_variance * 3.2) + (progress_gap * 0.05) + (ms_delay_rate * 2.8) + ((sector_factor - 1.0) * 1.2)
            prob = float(1.0 / (1.0 + np.exp(-logit)))
            prob = float(np.clip(prob, 0.05, 0.99))

            # Delay months calculated based on remaining physical work divided by historical velocity + milestone drag
            remaining_work = max(0.0, 100.0 - phys_progress)
            estimated_months_needed = remaining_work / prog_velocity
            planned_remaining_months = remaining_days / 30.0
            raw_delay = max(0.0, estimated_months_needed - planned_remaining_months)
            delay_months = float(np.clip(raw_delay * (0.8 + prob * 0.4) * sector_factor, 0.0, 60.0))

        if target_completion_date is None:
            target_completion_date = date.today() + timedelta(days=int(remaining_days))

        predicted_completion_date = target_completion_date + timedelta(days=int(delay_months * 30.4))

        return {
            "delay_probability": round(prob, 3),
            "predicted_delay_months": round(delay_months, 1),
            "predicted_delay_days": int(delay_months * 30.4),
            "predicted_completion_date": predicted_completion_date.isoformat(),
            "model_version": self.MODEL_VERSION
        }

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "wb") as f:
            pickle.dump({"model": self.model, "scaler": self.scaler, "version": self.MODEL_VERSION}, f)

    @classmethod
    def load(cls, filepath: str):
        if os.path.exists(filepath):
            with open(filepath, "rb") as f:
                data = pickle.load(f)
                inst = cls(model=data.get("model"), scaler=data.get("scaler"))
                inst.MODEL_VERSION = data.get("version", cls.MODEL_VERSION)
                return inst
        return cls()
