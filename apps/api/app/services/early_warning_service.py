from typing import List
from sqlalchemy.orm import Session
from app.models.entities import Project, Alert, RiskPrediction

class EarlyWarningService:
    @classmethod
    def evaluate_alerts_for_project(cls, db: Session, project: Project, prediction: RiskPrediction) -> List[Alert]:
        alerts_created = []

        # 1. High Delay Risk Rule
        if prediction.delay_probability >= 0.75:
            alert = Alert(
                project_id=project.id,
                risk_prediction_id=prediction.id,
                alert_type="HIGH_DELAY_RISK",
                severity="HIGH" if prediction.delay_probability < 0.85 else "CRITICAL",
                title=f"Critical Schedule Delay Warning for {project.project_code}",
                description=f"Model detected a {round(prediction.delay_probability * 100, 1)}% probability of severe project delay, estimating an extra {prediction.predicted_delay_months} months overrun beyond the scheduled completion date.",
                recommended_action="Initiate immediate tripartite review meeting with implementing agency and PMC. Fast-track pending ROW (Right of Way) and utility shifting clearances.",
                status="OPEN"
            )
            db.add(alert)
            alerts_created.append(alert)

        # 2. Cost Escalation Rule
        if prediction.cost_overrun_probability >= 0.70:
            alert = Alert(
                project_id=project.id,
                risk_prediction_id=prediction.id,
                alert_type="COST_ESCALATION",
                severity="CRITICAL" if prediction.predicted_cost_overrun > 25.0 else "HIGH",
                title=f"Cost Escalation Exposure: +{round(prediction.predicted_cost_overrun, 1)}% Predicted",
                description=f"Predicted cost escalation of ₹{round((project.original_cost * prediction.predicted_cost_overrun) / 100, 2)} Cr above original sanction due to material index escalation and scope modification.",
                recommended_action="Conduct audit of revised estimates, review contractor price variation clauses, and cap non-critical contingent expenditures.",
                status="OPEN"
            )
            db.add(alert)
            alerts_created.append(alert)

        # 3. Physical vs Planned Progress Deviation Rule
        time_elapsed_ratio = 0.5
        if project.start_date and project.original_completion_date:
            from datetime import date
            total_days = max(1, (project.original_completion_date - project.start_date).days)
            elapsed_days = max(0, (date.today() - project.start_date).days)
            time_elapsed_ratio = min(1.0, elapsed_days / total_days)

        expected_progress = time_elapsed_ratio * 100.0
        progress_gap = expected_progress - project.physical_progress
        if progress_gap >= 20.0:
            alert = Alert(
                project_id=project.id,
                risk_prediction_id=prediction.id,
                alert_type="PROGRESS_DEVIATION",
                severity="HIGH",
                title=f"Severe Execution Gap: {round(progress_gap, 1)}% Behind Target",
                description=f"Physical progress is {round(project.physical_progress, 1)}%, whereas planned schedule requires {round(expected_progress, 1)}% at the current elapsed timeline.",
                recommended_action="Demand recovery schedule with augmented machinery/manpower deployment from contractor under liquidated damages notice warning.",
                status="OPEN"
            )
            db.add(alert)
            alerts_created.append(alert)

        # 4. Critical Milestones Delayed
        crit_delayed = [m for m in project.milestones if (m.status == "DELAYED" or m.delay_days > 30) and m.criticality in ["HIGH", "CRITICAL"]]
        if crit_delayed:
            ms_names = ", ".join([m.milestone_name for m in crit_delayed[:2]])
            alert = Alert(
                project_id=project.id,
                risk_prediction_id=prediction.id,
                alert_type="CRITICAL_MILESTONE",
                severity="HIGH",
                title=f"Critical Path Milestone Stall ({len(crit_delayed)} Milestones)",
                description=f"Key path milestones stalled: {ms_names}. Delays in these dependencies directly block subsequent project commissioning phases.",
                recommended_action="Escalate milestone bottlenecks to Ministry Project Monitoring Group (PMG) for inter-ministerial resolution.",
                status="OPEN"
            )
            db.add(alert)
            alerts_created.append(alert)

        # 5. Financial Anomaly (High spend, low physical work)
        if (project.financial_progress - project.physical_progress) >= 20.0:
            alert = Alert(
                project_id=project.id,
                risk_prediction_id=prediction.id,
                alert_type="FINANCIAL_ANOMALY",
                severity="CRITICAL",
                title="Financial Expenditure Outpacing Physical Delivery",
                description=f"Financial progress ({round(project.financial_progress, 1)}%) exceeds physical completion ({round(project.physical_progress, 1)}%) by {round(project.financial_progress - project.physical_progress, 1)}%. High risk of premature fund depletion.",
                recommended_action="Freeze next milestone mobilization advance disbursement pending physical field verification and engineer certification.",
                status="OPEN"
            )
            db.add(alert)
            alerts_created.append(alert)

        db.commit()
        return alerts_created
