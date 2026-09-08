from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.entities import Project, State

router = APIRouter(prefix="/map", tags=["India Infrastructure Map"])

@router.get("/projects")
def get_map_projects(
    sector_id: Optional[int] = Query(None),
    risk_level: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Project).filter(Project.latitude.isnot(None), Project.longitude.isnot(None))

    if sector_id:
        query = query.filter(Project.sector_id == sector_id)

    projects = query.all()
    results = []

    for p in projects:
        latest_pred = p.risk_predictions[0] if p.risk_predictions else None
        
        if risk_level and latest_pred and latest_pred.risk_level != risk_level:
            continue
        elif risk_level and not latest_pred:
            continue

        results.append({
            "id": p.id,
            "project_code": p.project_code,
            "project_name": p.project_name,
            "sector": p.sector.name if p.sector else "Infrastructure",
            "ministry": p.ministry.name if p.ministry else "Government of India",
            "state": p.state.name if p.state else "National",
            "implementing_agency": p.implementing_agency,
            "original_cost": p.original_cost,
            "revised_cost": p.revised_cost,
            "physical_progress": p.physical_progress,
            "financial_progress": p.financial_progress,
            "risk_score": latest_pred.overall_risk_score if latest_pred else 50.0,
            "risk_level": latest_pred.risk_level if latest_pred else "MEDIUM",
            "predicted_delay_months": latest_pred.predicted_delay_months if latest_pred else 0.0,
            "predicted_cost_overrun": latest_pred.predicted_cost_overrun if latest_pred else 0.0,
            "latitude": p.latitude,
            "longitude": p.longitude
        })

    return results

@router.get("/states")
def get_map_states(db: Session = Depends(get_db)):
    states = db.query(State).all()
    results = []
    for st in states:
        preds = [p.risk_predictions[0] for p in st.projects if p.risk_predictions]
        avg_risk = (sum(p.overall_risk_score for p in preds) / len(preds)) if preds else 0.0
        results.append({
            "id": st.id,
            "name": st.name,
            "code": st.code,
            "latitude": st.latitude,
            "longitude": st.longitude,
            "project_count": len(st.projects),
            "avg_risk_score": round(avg_risk, 1)
        })
    return results
