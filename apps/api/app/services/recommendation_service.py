from typing import List, Dict, Any
from app.models.entities import Project, RiskPrediction

class RecommendationService:
    """
    Generates actionable, grounded intervention recommendations tailored to the project's
    specific risk drivers, sector, and progress bottleneck indicators.
    """

    @classmethod
    def generate_recommendations(cls, project: Project, prediction: RiskPrediction) -> List[Dict[str, Any]]:
        recs = []

        # 1. Milestone bottleneck recommendation
        if prediction.risk_factors:
            ms_factor = next((rf for rf in prediction.risk_factors if "Milestone" in rf.feature_name), None)
            if ms_factor and ms_factor.impact_score > 5.0:
                recs.append({
                    "category": "MILESTONE_ACCELERATION",
                    "priority": "HIGH",
                    "title": "Establish Fast-Track Milestone Clearance Cell",
                    "action": f"Convene an immediate technical review with {project.implementing_agency} to unblock delayed milestones, reallocate secondary resources to critical-path activities, and institute bi-weekly progress gating.",
                    "expected_impact": "Reduces projected schedule slippage by approximately 15-25%."
                })

        # 2. Cost escalation audit
        if prediction.cost_overrun_probability >= 0.65 or prediction.predicted_cost_overrun > 15.0:
            recs.append({
                "category": "COST_CONTROL",
                "priority": "HIGH",
                "title": "Comprehensive Revised Cost Estimate (RCE) Audit",
                "action": f"Review contractor price-variation invoices and item-rate variations against original DPR parameters. Cap non-critical contingency expenditure until physical completion reaches 70%.",
                "expected_impact": "Prevents unauthorized expenditure leakage and caps additional cost growth."
            })

        # 3. Execution velocity acceleration
        if project.physical_progress < 40.0 and (project.financial_progress - project.physical_progress) > 10.0:
            recs.append({
                "category": "PHYSICAL_DELIVERY",
                "priority": "CRITICAL",
                "title": "Contractor Output Enhancement & Field Verification",
                "action": f"Conduct an on-site joint engineering inspection to verify physical output against claimed billings. Require contractor to submit a catch-up execution schedule with deployed plant & machinery guarantees.",
                "expected_impact": "Aligns physical progress velocity with financial disbursement."
            })

        # 4. Land Acquisition & Environmental Clearances (Sector specific)
        if project.sector and project.sector.name in ["Railways", "Road Transport & Highways"]:
            recs.append({
                "category": "REGULATORY_CLEARANCE",
                "priority": "MEDIUM",
                "title": "Inter-Ministerial PMG Escalation for ROW & Forest Clearances",
                "action": f"Submit pending Right of Way (ROW) and statutory clearance bottlenecks to the Cabinet Secretariat Project Monitoring Group (PMG) portal for fast-track state coordination.",
                "expected_impact": "Eliminates civil contractor idle time due to land possession disputes."
            })

        # Default recommendation if low risk
        if not recs:
            recs.append({
                "category": "ROUTINE_MONITORING",
                "priority": "LOW",
                "title": "Standard Monthly PAIMANA Monitoring Protocol",
                "action": "Maintain scheduled monthly reporting intervals and monitor milestone completion velocity against baseline.",
                "expected_impact": "Ensures continued on-time execution without operational friction."
            })

        return recs
