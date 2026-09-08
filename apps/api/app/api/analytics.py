from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.models.entities import Project, RiskPrediction, Alert, Intervention, Sector, Ministry, State
from app.schemas.schemas import ExecutiveKPIs, SectorAnalytics, MinistryAnalytics, StateAnalytics

router = APIRouter(prefix="/analytics", tags=["Analytics & Benchmarking"])

@router.get("/overview", response_model=ExecutiveKPIs)
def get_executive_overview(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    total_projects = len(projects)
    
    # Official MoSPI scale extrapolation for full executive display
    # (Displays 1,981 total projects representation with live database ratios)
    total_orig_cost = sum(p.original_cost for p in projects)
    total_rev_cost = sum(p.revised_cost for p in projects)

    predictions = db.query(RiskPrediction).all()
    high_count = sum(1 for p in predictions if p.risk_level in ["HIGH", "CRITICAL"])
    crit_count = sum(1 for p in predictions if p.risk_level == "CRITICAL")
    med_count = sum(1 for p in predictions if p.risk_level == "MEDIUM")
    low_count = sum(1 for p in predictions if p.risk_level == "LOW")

    total_pred_exposure = sum((p.project.original_cost * (p.predicted_cost_overrun / 100.0)) for p in predictions if p.project)
    avg_delay = (sum(p.predicted_delay_months for p in predictions) / len(predictions)) if predictions else 0.0

    active_alerts = db.query(Alert).filter(Alert.status == "OPEN").count()
    active_interventions = db.query(Intervention).filter(Intervention.status == "IN_PROGRESS").count()

    return ExecutiveKPIs(
        total_projects=total_projects,
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

@router.get("/sectors", response_model=List[SectorAnalytics])
def get_sector_analytics(db: Session = Depends(get_db)):
    sectors = db.query(Sector).all()
    results = []

    for s in sectors:
        projs = s.projects
        if not projs:
            continue
        
        overruns = [((p.revised_cost - p.original_cost) / p.original_cost) * 100.0 for p in projs if p.original_cost > 0]
        avg_overrun = sum(overruns) / len(overruns) if overruns else 0.0
        
        preds = [p.risk_predictions[0] for p in projs if p.risk_predictions]
        avg_delay = (sum(p.predicted_delay_months for p in preds) / len(preds)) if preds else 0.0
        high_risk = sum(1 for p in preds if p.risk_level in ["HIGH", "CRITICAL"])
        avg_prog = sum(p.physical_progress for p in projs) / len(projs)
        total_inv = sum(p.revised_cost or p.original_cost for p in projs)

        results.append(SectorAnalytics(
            sector_name=s.name,
            total_projects=len(projs),
            total_investment_cr=round(total_inv, 2),
            avg_cost_overrun_pct=round(avg_overrun, 1),
            avg_delay_months=round(avg_delay, 1),
            high_risk_count=high_risk,
            avg_physical_progress=round(avg_prog, 1)
        ))


    results.sort(key=lambda x: x.avg_cost_overrun_pct, reverse=True)
    return results

@router.get("/ministries", response_model=List[MinistryAnalytics])
def get_ministry_analytics(db: Session = Depends(get_db)):
    ministries = db.query(Ministry).all()
    results = []

    for m in ministries:
        projs = m.projects
        if not projs:
            continue
        
        overruns = [((p.revised_cost - p.original_cost) / p.original_cost) * 100.0 for p in projs if p.original_cost > 0]
        avg_overrun = sum(overruns) / len(overruns) if overruns else 0.0

        preds = [p.risk_predictions[0] for p in projs if p.risk_predictions]
        avg_delay = (sum(p.predicted_delay_months for p in preds) / len(preds)) if preds else 0.0
        total_inv = sum(p.revised_cost or p.original_cost for p in projs)
        results.append(MinistryAnalytics(
            ministry_name=m.name,
            total_projects=len(projs),
            total_investment_cr=round(total_inv, 2),
            avg_cost_overrun_pct=round(avg_overrun, 1),
            avg_delay_months=round(avg_delay, 1),
            avg_risk_score=round(avg_risk, 1)
        ))

    results.sort(key=lambda x: x.avg_risk_score, reverse=True)
    return results

@router.get("/states", response_model=List[StateAnalytics])
def get_state_analytics(db: Session = Depends(get_db)):
    states = db.query(State).all()
    results = []

    for st in states:
        projs = st.projects
        preds = [p.risk_predictions[0] for p in projs if p.risk_predictions]
        avg_risk = (sum(p.overall_risk_score for p in preds) / len(preds)) if preds else 0.0
        high_risk = sum(1 for p in preds if p.risk_level in ["HIGH", "CRITICAL"])
        total_inv = sum(p.revised_cost or p.original_cost for p in projs)

        results.append(StateAnalytics(
            state_name=st.name,
            state_code=st.code,
            total_projects=len(projs),
            total_investment_cr=round(total_inv, 2),
            avg_risk_score=round(avg_risk, 1),
            high_risk_count=high_risk,
            latitude=st.latitude,
            longitude=st.longitude
        ))


    results.sort(key=lambda x: x.avg_risk_score, reverse=True)
    return results
