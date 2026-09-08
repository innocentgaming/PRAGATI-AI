from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.models.entities import ReportRecord, Project, Alert
from app.schemas.schemas import ReportRecordResponse
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=List[ReportRecordResponse])
def get_reports_list(db: Session = Depends(get_db)):
    reports = db.query(ReportRecord).order_by(ReportRecord.created_at.desc()).all()
    return reports

@router.post("/generate")
def generate_custom_report(
    report_type: str = Query("NATIONAL"),
    title: Optional[str] = Query(None),
    file_format: str = Query("PDF"),
    db: Session = Depends(get_db)
):
    projects = db.query(Project).all()
    total_projects = len(projects)
    total_cost = sum(p.revised_cost for p in projects)
    delayed_count = sum(1 for p in projects if p.project_status == "DELAYED")
    
    report_title = title or f"MoSPI Executive {report_type.replace('_', ' ').title()} Infrastructure Report - {datetime.utcnow().strftime('%B %Y')}"
    
    summary = (
        f"This official executive briefing covers {total_projects} central sector infrastructure projects totaling "
        f"₹{total_cost:,.2f} Cr. Currently, {delayed_count} projects exhibit schedule variance requiring PMO intervention."
    )

    report = ReportRecord(
        title=report_title,
        report_type=report_type,
        parameters={"total_projects": total_projects, "total_cost_cr": total_cost},
        summary=summary,
        generated_by="PMO Monitoring Officer",
        file_format=file_format
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "status": "success",
        "report_id": report.id,
        "title": report.title,
        "summary": summary,
        "file_format": file_format,
        "download_url": f"/api/reports/{report.id}/download",
        "generated_at": report.created_at
    }

@router.get("/{id}")
def get_report_detail(id: str, db: Session = Depends(get_db)):
    report = db.query(ReportRecord).filter(ReportRecord.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
