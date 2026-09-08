from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.entities import Contractor, Project
from app.schemas.schemas import ContractorBase

router = APIRouter(prefix="/contractors", tags=["Contractors"])

@router.get("", response_model=List[ContractorBase])
def get_contractors(db: Session = Depends(get_db)):
    contractors = db.query(Contractor).order_by(Contractor.performance_score.desc()).all()
    return contractors

@router.get("/{id}")
def get_contractor_details(id: str, db: Session = Depends(get_db)):
    contractor = db.query(Contractor).filter((Contractor.id == id) | (Contractor.name == id)).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    projects = contractor.projects
    return {
        "id": contractor.id,
        "name": contractor.name,
        "sector_specialization": contractor.sector_specialization,
        "performance_score": contractor.performance_score,
        "total_projects": len(projects),
        "completed_projects": sum(1 for p in projects if p.project_status == "COMPLETED"),
        "delayed_projects": sum(1 for p in projects if p.project_status == "DELAYED"),
        "total_contract_value": sum(p.revised_cost for p in projects),
        "average_delay_days": contractor.average_delay_days,
        "rating": contractor.rating,
        "projects": [
            {
                "id": p.id,
                "project_code": p.project_code,
                "project_name": p.project_name,
                "physical_progress": p.physical_progress,
                "status": p.project_status,
                "cost": p.revised_cost
            }
            for p in projects
        ]
    }
