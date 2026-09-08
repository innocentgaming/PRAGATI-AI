from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.entities import Department, Project

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("")
def get_departments_dashboard(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    results = []
    
    for d in departments:
        projs = d.projects
        total_projs = len(projs)
        total_inv = sum(p.revised_cost for p in projs)
        completed = sum(1 for p in projs if p.project_status == "COMPLETED")
        delayed = sum(1 for p in projs if p.project_status == "DELAYED")
        
        preds = [p.risk_predictions[0] for p in projs if p.risk_predictions]
        at_risk = sum(1 for p in preds if p.risk_level in ["HIGH", "CRITICAL"])
        avg_prog = (sum(p.physical_progress for p in projs) / total_projs) if total_projs > 0 else 0.0

        results.append({
            "id": d.id,
            "name": d.name,
            "code": d.code or "DEPT",
            "ministry_name": d.ministry.name if d.ministry else "Government of India",
            "total_projects": total_projs,
            "total_investment_cr": round(total_inv, 2),
            "completed_projects": completed,
            "delayed_projects": delayed,
            "at_risk_projects": at_risk,
            "average_progress": round(avg_prog, 1)
        })
    
    results.sort(key=lambda x: x["total_investment_cr"], reverse=True)
    return results
