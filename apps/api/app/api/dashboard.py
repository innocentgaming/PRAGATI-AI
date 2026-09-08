from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import Project, RiskPrediction, Alert, Intervention
from app.schemas.schemas import ExecutiveKPIs

router = APIRouter(prefix="/dashboard", tags=["Dashboard Overview"])

@router.get("/overview", response_model=ExecutiveKPIs)
def get_dashboard_overview(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    total_projects = len(projects)
    
    total_orig_cost = sum(p.original_cost for p in projects)
    total_rev_cost = sum(p.revised_cost for p in projects)
    total_exp = sum(p.current_expenditure for p in projects)

    predictions = db.query(RiskPrediction).all()
    high_count = sum(1 for p in predictions if p.risk_level in ["HIGH", "CRITICAL"])
    crit_count = sum(1 for p in predictions if p.risk_level == "CRITICAL")
    med_count = sum(1 for p in predictions if p.risk_level == "MEDIUM")
    low_count = sum(1 for p in predictions if p.risk_level == "LOW")

    total_pred_exposure = sum((p.project.original_cost * (p.predicted_cost_overrun / 100.0)) for p in predictions if p.project)
    avg_delay = (sum(p.predicted_delay_months for p in predictions) / len(predictions)) if predictions else 0.0

    on_track_count = sum(1 for p in projects if p.project_status == "ON_TRACK")
    delayed_count = sum(1 for p in projects if p.project_status == "DELAYED")
    at_risk_count = sum(1 for p in projects if p.project_status == "CRITICAL")
    completed_count = sum(1 for p in projects if p.project_status == "COMPLETED")

    avg_physical = (sum(p.physical_progress for p in projects) / total_projects) if total_projects else 0.0
    avg_financial = (sum(p.financial_progress for p in projects) / total_projects) if total_projects else 0.0

    active_alerts = db.query(Alert).filter(Alert.status == "OPEN").count()
    active_interventions = db.query(Intervention).filter(Intervention.status == "IN_PROGRESS").count()

    return ExecutiveKPIs(
        total_projects=total_projects,
        total_investment_cr=round(total_rev_cost or total_orig_cost, 2),
        total_expenditure_cr=round(total_exp, 2),
        projects_on_track=on_track_count,
        projects_delayed=delayed_count,
        projects_at_risk=at_risk_count,
        projects_completed=completed_count,
        avg_physical_progress=round(avg_physical, 1),
        avg_financial_progress=round(avg_financial, 1),
        high_risk_projects=high_count,
        critical_projects=crit_count,
        medium_risk_projects=med_count,
        low_risk_projects=low_count,
        total_original_cost=round(total_orig_cost, 2),
        total_revised_cost=round(total_rev_cost, 2),
        predicted_cost_exposure=round(total_pred_exposure, 2),
        average_delay_months=round(avg_delay, 1),
        active_alerts_count=active_alerts,
        interventions_in_progress=active_interventions
    )
