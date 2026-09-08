from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.entities import Intervention, Project, Alert
from app.schemas.schemas import InterventionCreate, InterventionUpdate, InterventionResponse

router = APIRouter(prefix="/interventions", tags=["Intervention Tracking"])

@router.get("", response_model=List[InterventionResponse])
def get_interventions(db: Session = Depends(get_db)):
    interventions = db.query(Intervention).order_by(Intervention.created_at.desc()).all()
    results = []
    for it in interventions:
        results.append(InterventionResponse(
            id=it.id,
            project_id=it.project_id,
            alert_id=it.alert_id,
            recommended_action=it.recommended_action,
            officer_action=it.officer_action,
            assigned_to=it.assigned_to,
            status=it.status,
            outcome=it.outcome,
            created_at=it.created_at,
            completed_at=it.completed_at,
            project_name=it.project.project_name if it.project else None,
            project_code=it.project.project_code if it.project else None
        ))
    return results

@router.post("", response_model=InterventionResponse)
def create_intervention(req: InterventionCreate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    intervention = Intervention(
        project_id=req.project_id,
        alert_id=req.alert_id,
        recommended_action=req.recommended_action,
        officer_action=req.officer_action,
        assigned_to=req.assigned_to,
        status=req.status
    )
    db.add(intervention)

    # If linked to alert, mark alert as ACKNOWLEDGED
    if req.alert_id:
        alert = db.query(Alert).filter(Alert.id == req.alert_id).first()
        if alert:
            alert.status = "ACKNOWLEDGED"

    db.commit()
    db.refresh(intervention)

    return InterventionResponse(
        id=intervention.id,
        project_id=intervention.project_id,
        alert_id=intervention.alert_id,
        recommended_action=intervention.recommended_action,
        officer_action=intervention.officer_action,
        assigned_to=intervention.assigned_to,
        status=intervention.status,
        outcome=intervention.outcome,
        created_at=intervention.created_at,
        completed_at=intervention.completed_at,
        project_name=project.project_name,
        project_code=project.project_code
    )

@router.patch("/{id}", response_model=InterventionResponse)
def update_intervention(id: str, req: InterventionUpdate, db: Session = Depends(get_db)):
    intervention = db.query(Intervention).filter(Intervention.id == id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")

    if req.officer_action is not None:
        intervention.officer_action = req.officer_action
    if req.status is not None:
        intervention.status = req.status
        if req.status == "COMPLETED" and not intervention.completed_at:
            intervention.completed_at = datetime.utcnow()
    if req.outcome is not None:
        intervention.outcome = req.outcome

    db.commit()
    db.refresh(intervention)

    return InterventionResponse(
        id=intervention.id,
        project_id=intervention.project_id,
        alert_id=intervention.alert_id,
        recommended_action=intervention.recommended_action,
        officer_action=intervention.officer_action,
        assigned_to=intervention.assigned_to,
        status=intervention.status,
        outcome=intervention.outcome,
        created_at=intervention.created_at,
        completed_at=intervention.completed_at,
        project_name=intervention.project.project_name if intervention.project else None,
        project_code=intervention.project.project_code if intervention.project else None
    )
