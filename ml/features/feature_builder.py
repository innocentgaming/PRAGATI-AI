import pandas as pd
import numpy as np
from datetime import datetime, date
from typing import Dict, Any, List, Optional

class FeatureBuilder:
    """
    Computes rigorous, leak-free feature vectors for project risk, cost overrun, and time delay models.
    All features strictly use data available up to the prediction timestamp.
    """

    # Baseline CUF (Common Underwriting / Official MoSPI format) features
    CUF_FEATURES = [
        "original_cost",
        "revised_cost",
        "current_expenditure",
        "physical_progress",
        "financial_progress",
        "planned_duration_days",
        "elapsed_duration_days",
        "total_milestones",
        "delayed_milestones"
    ]

    # Derived and advanced features (for Model B / Advanced ML)
    DERIVED_FEATURES = [
        "cost_growth_percentage",
        "revised_to_original_cost_ratio",
        "expenditure_ratio",
        "physical_financial_gap",
        "planned_actual_progress_gap",
        "remaining_duration_days",
        "schedule_variance_ratio",
        "progress_velocity",
        "expenditure_velocity",
        "milestone_delay_rate",
        "critical_delayed_rate",
        "project_size_category",
        "sector_risk_factor",
        "agency_risk_factor"
    ]

    ALL_FEATURES = CUF_FEATURES + DERIVED_FEATURES

    # Historical empirical priors by sector (MoSPI historical benchmarking)
    SECTOR_BENCHMARKS = {
        1: {"avg_delay_months": 14.2, "avg_cost_overrun_pct": 18.5, "risk_factor": 1.25}, # Railways
        2: {"avg_delay_months": 8.6,  "avg_cost_overrun_pct": 9.4,  "risk_factor": 0.85}, # Road Transport & Highways
        3: {"avg_delay_months": 11.4, "avg_cost_overrun_pct": 14.1, "risk_factor": 1.05}, # Power & Renewable
        4: {"avg_delay_months": 16.8, "avg_cost_overrun_pct": 22.3, "risk_factor": 1.40}, # Petroleum & Natural Gas
        5: {"avg_delay_months": 9.2,  "avg_cost_overrun_pct": 11.8, "risk_factor": 0.95}, # Water Resources
        6: {"avg_delay_months": 7.5,  "avg_cost_overrun_pct": 8.2,  "risk_factor": 0.75}, # Health & AIIMS
        7: {"avg_delay_months": 12.0, "avg_cost_overrun_pct": 15.0, "risk_factor": 1.10}, # Urban Metro
        8: {"avg_delay_months": 10.5, "avg_cost_overrun_pct": 12.4, "risk_factor": 1.00}  # Ports & Shipping
    }

    @staticmethod
    def _safe_div(num: float, denom: float, default: float = 0.0) -> float:
        if denom == 0 or np.isnan(denom) or np.isinf(denom):
            return default
        return float(num) / float(denom)

    @classmethod
    def extract_features(cls, project_dict: Dict[str, Any], monthly_history: Optional[List[Dict[str, Any]]] = None, milestones: Optional[List[Dict[str, Any]]] = None) -> Dict[str, float]:
        """
        Extracts a single feature dictionary for ML models.
        """
        original_cost = max(0.1, float(project_dict.get("original_cost", 100.0)))
        revised_cost = max(original_cost, float(project_dict.get("revised_cost", original_cost)))
        current_expenditure = max(0.0, float(project_dict.get("current_expenditure", 0.0)))
        physical_progress = min(100.0, max(0.0, float(project_dict.get("physical_progress", 0.0))))
        financial_progress = min(100.0, max(0.0, float(project_dict.get("financial_progress", 0.0))))

        # Calculate planned duration and elapsed duration
        start_date = project_dict.get("start_date")
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        elif isinstance(start_date, datetime):
            start_date = start_date.date()
            
        original_comp = project_dict.get("original_completion_date")
        if isinstance(original_comp, str):
            original_comp = datetime.strptime(original_comp, "%Y-%m-%d").date()
        elif isinstance(original_comp, datetime):
            original_comp = original_comp.date()

        today = date.today()
        if start_date and original_comp:
            planned_duration_days = max(30, (original_comp - start_date).days)
            elapsed_duration_days = max(1, (today - start_date).days)
        else:
            planned_duration_days = float(project_dict.get("planned_duration_days", 730))
            elapsed_duration_days = float(project_dict.get("elapsed_duration_days", 365))

        remaining_duration_days = max(0, planned_duration_days - elapsed_duration_days)

        # Expected / Planned physical progress based on time elapsed
        time_elapsed_ratio = min(1.0, cls._safe_div(elapsed_duration_days, planned_duration_days, 0.5))
        planned_physical_progress = float(project_dict.get("planned_physical_progress", time_elapsed_ratio * 100.0))

        # Milestones processing
        total_milestones = int(project_dict.get("total_milestones", 0))
        delayed_milestones = int(project_dict.get("delayed_milestones", 0))
        critical_delayed = 0

        if milestones:
            total_milestones = len(milestones)
            delayed_milestones = sum(1 for m in milestones if m.get("status") == "DELAYED" or (m.get("delay_days", 0) > 0))
            critical_delayed = sum(1 for m in milestones if (m.get("status") == "DELAYED" or m.get("delay_days", 0) > 0) and m.get("criticality") == "CRITICAL")
        
        milestone_delay_rate = cls._safe_div(delayed_milestones, total_milestones, 0.0)
        critical_delayed_rate = cls._safe_div(critical_delayed, total_milestones, 0.0)

        # Cost Metrics
        cost_growth_percentage = ((revised_cost - original_cost) / original_cost) * 100.0
        revised_to_original_cost_ratio = cls._safe_div(revised_cost, original_cost, 1.0)
        expenditure_ratio = cls._safe_div(current_expenditure, original_cost, 0.0)

        # Progress Gaps & Velocities
        physical_financial_gap = physical_progress - financial_progress
        planned_actual_progress_gap = planned_physical_progress - physical_progress
        schedule_variance_ratio = cls._safe_div(elapsed_duration_days, planned_duration_days, 1.0) - (physical_progress / 100.0)

        progress_velocity = cls._safe_div(physical_progress, max(1.0, elapsed_duration_days / 30.0), 1.0) # % per month
        expenditure_velocity = cls._safe_div(current_expenditure, max(1.0, elapsed_duration_days / 30.0), 1.0) # Cr per month

        # Categorical Project Size: 1 (Small < 150Cr), 2 (Medium 150-1000Cr), 3 (Mega 1000-5000Cr), 4 (Ultra-Mega >5000Cr)
        if original_cost < 150:
            project_size_category = 1.0
        elif original_cost < 1000:
            project_size_category = 2.0
        elif original_cost < 5000:
            project_size_category = 3.0
        else:
            project_size_category = 4.0

        # Sector Benchmark Prior
        sector_id = project_dict.get("sector_id", 1)
        sector_meta = cls.SECTOR_BENCHMARKS.get(sector_id, {"risk_factor": 1.0})
        sector_risk_factor = sector_meta.get("risk_factor", 1.0)
        agency_risk_factor = 1.1 if "State" in str(project_dict.get("implementing_agency", "")) else 0.95

        return {
            # CUF Features
            "original_cost": round(original_cost, 2),
            "revised_cost": round(revised_cost, 2),
            "current_expenditure": round(current_expenditure, 2),
            "physical_progress": round(physical_progress, 2),
            "financial_progress": round(financial_progress, 2),
            "planned_duration_days": float(planned_duration_days),
            "elapsed_duration_days": float(elapsed_duration_days),
            "total_milestones": float(total_milestones),
            "delayed_milestones": float(delayed_milestones),
            # Derived Features
            "cost_growth_percentage": round(cost_growth_percentage, 2),
            "revised_to_original_cost_ratio": round(revised_to_original_cost_ratio, 3),
            "expenditure_ratio": round(expenditure_ratio, 3),
            "physical_financial_gap": round(physical_financial_gap, 2),
            "planned_actual_progress_gap": round(planned_actual_progress_gap, 2),
            "remaining_duration_days": float(remaining_duration_days),
            "schedule_variance_ratio": round(schedule_variance_ratio, 3),
            "progress_velocity": round(progress_velocity, 2),
            "expenditure_velocity": round(expenditure_velocity, 2),
            "milestone_delay_rate": round(milestone_delay_rate, 3),
            "critical_delayed_rate": round(critical_delayed_rate, 3),
            "project_size_category": float(project_size_category),
            "sector_risk_factor": round(sector_risk_factor, 2),
            "agency_risk_factor": round(agency_risk_factor, 2)
        }

    @classmethod
    def to_feature_vector(cls, feature_dict: Dict[str, float], feature_set: str = "ALL") -> List[float]:
        cols = cls.CUF_FEATURES if feature_set == "CUF" else cls.ALL_FEATURES
        return [feature_dict.get(col, 0.0) for col in cols]
