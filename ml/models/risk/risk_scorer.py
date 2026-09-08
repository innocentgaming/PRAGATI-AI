import numpy as np
from typing import Dict, Any, Tuple

class RiskScorer:
    """
    Computes an explainable, multi-dimensional 0-100 Risk Score for Infrastructure Projects.
    Formulation mandated by MoSPI monitoring guidelines:
        overall_risk_score = (
            0.30 * cost_risk +
            0.30 * delay_risk +
            0.20 * progress_risk +
            0.10 * financial_risk +
            0.10 * milestone_risk
        )
    """

    @classmethod
    def calculate_component_risks(cls, features: Dict[str, float]) -> Dict[str, float]:
        # 1. Cost Risk (0 - 100)
        cost_growth = max(0.0, features.get("cost_growth_percentage", 0.0))
        revised_ratio = features.get("revised_to_original_cost_ratio", 1.0)
        cost_risk = min(100.0, (cost_growth * 2.0) + max(0.0, (revised_ratio - 1.0) * 80.0))

        # 2. Delay / Schedule Risk (0 - 100)
        sched_variance = features.get("schedule_variance_ratio", 0.0) # > 0 means elapsed time is far ahead of progress
        planned_actual_gap = max(0.0, features.get("planned_actual_progress_gap", 0.0))
        delay_risk = min(100.0, max(0.0, (sched_variance * 70.0) + (planned_actual_gap * 1.2)))

        # 3. Progress Execution Risk (0 - 100)
        phys_progress = features.get("physical_progress", 0.0)
        prog_velocity = features.get("progress_velocity", 1.0) # % per month
        if phys_progress < 15.0 and features.get("elapsed_duration_days", 0) > 365:
            progress_risk = 85.0
        elif prog_velocity < 1.0 and phys_progress < 50.0:
            progress_risk = min(100.0, 50.0 + (1.0 - prog_velocity) * 40.0)
        else:
            progress_risk = min(100.0, max(0.0, (100.0 - phys_progress) * 0.4 + planned_actual_gap * 0.6))

        # 4. Financial Discrepancy Risk (0 - 100)
        # Risk when financial expenditure outpaces physical completion (money spent without physical results)
        phys_fin_gap = features.get("physical_financial_gap", 0.0) # physical - financial
        if phys_fin_gap < -20.0: # Spent 20% more money than physical progress
            financial_risk = min(100.0, abs(phys_fin_gap) * 2.5)
        elif phys_fin_gap < 0:
            financial_risk = abs(phys_fin_gap) * 1.5
        else:
            financial_risk = max(5.0, 30.0 - (phys_fin_gap * 0.5))

        # 5. Milestone Failure Risk (0 - 100)
        ms_delay_rate = features.get("milestone_delay_rate", 0.0)
        crit_delayed_rate = features.get("critical_delayed_rate", 0.0)
        milestone_risk = min(100.0, (ms_delay_rate * 60.0) + (crit_delayed_rate * 40.0))

        return {
            "cost_risk": round(cost_risk, 2),
            "delay_risk": round(delay_risk, 2),
            "progress_risk": round(progress_risk, 2),
            "financial_risk": round(financial_risk, 2),
            "milestone_risk": round(milestone_risk, 2)
        }

    @classmethod
    def compute_composite_risk(cls, features: Dict[str, float], ml_cost_prob: float = 0.0, ml_delay_prob: float = 0.0) -> Tuple[float, str, Dict[str, float]]:
        comps = cls.calculate_component_risks(features)

        # Blend ML probabilities with deterministic heuristics when available
        effective_cost_risk = (comps["cost_risk"] * 0.6) + (ml_cost_prob * 100.0 * 0.4) if ml_cost_prob > 0 else comps["cost_risk"]
        effective_delay_risk = (comps["delay_risk"] * 0.6) + (ml_delay_prob * 100.0 * 0.4) if ml_delay_prob > 0 else comps["delay_risk"]

        overall_score = (
            0.30 * effective_cost_risk +
            0.30 * effective_delay_risk +
            0.20 * comps["progress_risk"] +
            0.10 * comps["financial_risk"] +
            0.10 * comps["milestone_risk"]
        )
        overall_score = float(np.clip(round(overall_score, 1), 0.0, 100.0))

        # Risk tier classification
        if overall_score <= 30.0:
            risk_level = "LOW"
        elif overall_score <= 60.0:
            risk_level = "MEDIUM"
        elif overall_score <= 80.0:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        comps["overall_score"] = overall_score
        return overall_score, risk_level, comps
