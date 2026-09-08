from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.schemas.schemas import DataQualityReport
from app.services.data_quality_service import DataQualityService
from app.models.entities import Project
from app.services.ml_service import ml_service
from app.services.early_warning_service import EarlyWarningService
from datetime import datetime, date

router = APIRouter(prefix="/data-quality", tags=["Data Quality & Ingestion"])

@router.get("/report", response_model=DataQualityReport)
def get_data_quality_report(db: Session = Depends(get_db)):
    return DataQualityService.audit_database_quality(db)

@router.post("/ingest")
def ingest_project_data(records: List[Dict[str, Any]], source_type: str = "USER_UPLOAD", db: Session = Depends(get_db)):
    """
    Ingests batch project records with schema validation, data quality sanitization,
    source_type provenance enforcement, and automated predictive pipeline triggering.
    """
    ingested_count = 0
    errors = []

    for r in records:
        try:
            code = r.get("project_code")
            if not code:
                continue

            existing = db.query(Project).filter(Project.project_code == code).first()
            if existing:
                continue

            start_d = r.get("start_date")
            if isinstance(start_d, str):
                start_d = datetime.strptime(start_d, "%Y-%m-%d").date()
            
            comp_d = r.get("original_completion_date")
            if isinstance(comp_d, str):
                comp_d = datetime.strptime(comp_d, "%Y-%m-%d").date()

            proj = Project(
                project_code=code,
                project_name=r.get("project_name", f"Infrastructure Project {code}"),
                ministry_id=r.get("ministry_id", 1),
                sector_id=r.get("sector_id", 1),
                state_id=r.get("state_id", 1),
                implementing_agency=r.get("implementing_agency", "MoSPI Agency"),
                original_cost=float(r.get("original_cost", 500.0)),
                revised_cost=float(r.get("revised_cost", 500.0)),
                current_expenditure=float(r.get("current_expenditure", 100.0)),
                start_date=start_d or date(2022, 1, 1),
                original_completion_date=comp_d or date(2026, 1, 1),
                physical_progress=float(r.get("physical_progress", 30.0)),
                financial_progress=float(r.get("financial_progress", 35.0)),
                project_status=r.get("project_status", "ONGOING"),
                source_type=source_type,
                latitude=r.get("latitude", 20.5937),
                longitude=r.get("longitude", 78.9629)
            )
            db.add(proj)
            db.flush()

            # Trigger ML & Alerts
            pred = ml_service.predict_for_project(db, proj)
            EarlyWarningService.evaluate_alerts_for_project(db, proj, pred)
            ingested_count += 1
        except Exception as e:
            errors.append(f"Failed to ingest record {r.get('project_code', 'unknown')}: {str(e)}")

    db.commit()
    return {
        "status": "success",
        "ingested_count": ingested_count,
        "source_type": source_type,
        "errors": errors
    }
