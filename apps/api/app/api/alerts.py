from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.entities import Alert, Project
from app.schemas.schemas import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Early Warning Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Alert).join(Project)

    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)

    alerts = query.order_by(Alert.created_at.desc()).all()
    results = []

    for a in alerts:
        results.append(AlertResponse(
            id=a.id,
            project_id=a.project_id,
            risk_prediction_id=a.risk_prediction_id,
            alert_type=a.alert_type,
            severity=a.severity,
            title=a.title,
            description=a.description,
            recommended_action=a.recommended_action,
            status=a.status,
            assigned_to=a.assigned_to,
            created_at=a.created_at,
            resolved_at=a.resolved_at,
            project_code=a.project.project_code if a.project else None,
            project_name=a.project.project_name if a.project else None
        ))
    return results

@router.post("/{id}/acknowledge")
def acknowledge_alert(id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "ACKNOWLEDGED"
    db.commit()
    return {"message": "Alert status updated to ACKNOWLEDGED", "alert_id": id}

@router.post("/{id}/resolve")
def resolve_alert(id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "RESOLVED"
    alert.resolved_at = datetime.utcnow()
    db.commit()
    return {"message": "Alert resolved successfully", "alert_id": id}
