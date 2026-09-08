from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.entities import Project, RiskPrediction, Milestone, ProjectMonthlyData, Alert, Intervention
from app.schemas.schemas import (
    ProjectListResponse, ProjectDetailResponse, ProjectCreate,
    MilestoneResponse, MonthlyDataResponse, RiskPredictionResponse,
    AlertResponse, InterventionResponse
)
from app.services.ml_service import ml_service
from app.services.early_warning_service import EarlyWarningService
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectListResponse])
def get_projects(
    sector_id: Optional[int] = Query(None),
    ministry_id: Optional[int] = Query(None),
    state_id: Optional[int] = Query(None),
    risk_level: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Project)

    if sector_id:
        query = query.filter(Project.sector_id == sector_id)
    if ministry_id:
        query = query.filter(Project.ministry_id == ministry_id)
    if state_id:
        query = query.filter(Project.state_id == state_id)
    if status:
        query = query.filter(Project.project_status == status)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Project.project_name.ilike(search_pattern)) | 
            (Project.project_code.ilike(search_pattern)) |
            (Project.implementing_agency.ilike(search_pattern))
        )

    projects = query.all()
    results = []

    for p in projects:
        latest_pred = p.risk_predictions[0] if p.risk_predictions else None
        
        # Filter by risk level if requested
        if risk_level and latest_pred and latest_pred.risk_level != risk_level:
            continue
        elif risk_level and not latest_pred:
            continue

        cost_growth = round(((p.revised_cost - p.original_cost) / p.original_cost) * 100.0, 1) if p.original_cost > 0 else 0.0

        results.append(ProjectListResponse(
            id=p.id,
            project_code=p.project_code,
            project_name=p.project_name,
            ministry_name=p.ministry.name if p.ministry else None,
            department_name=p.department.name if p.department else None,
            sector_name=p.sector.name if p.sector else None,
            state_name=p.state.name if p.state else None,
            contractor_name=p.contractor.name if p.contractor else None,
            implementing_agency=p.implementing_agency,
            original_cost=p.original_cost,
            revised_cost=p.revised_cost,
            current_expenditure=p.current_expenditure,
            physical_progress=p.physical_progress,
            financial_progress=p.financial_progress,
            planned_physical_progress=p.planned_physical_progress or 0.0,
            cost_growth_percentage=cost_growth,
            project_status=p.project_status,
            source_type=p.source_type,
            overall_risk_score=latest_pred.overall_risk_score if latest_pred else None,
            risk_level=latest_pred.risk_level if latest_pred else "LOW",
            cost_overrun_probability=latest_pred.cost_overrun_probability if latest_pred else None,
            predicted_delay_months=latest_pred.predicted_delay_months if latest_pred else None,
            latitude=p.latitude,
            longitude=p.longitude
        ))

    # Default sort by risk score descending
    results.sort(key=lambda x: x.overall_risk_score or 0.0, reverse=True)
    return results

@router.get("/{id}", response_model=ProjectDetailResponse)
def get_project_detail(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter((Project.id == id) | (Project.project_code == id)).first()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project with ID '{id}' not found")
    
    cost_growth = round(((project.revised_cost - project.original_cost) / project.original_cost) * 100.0, 1) if project.original_cost > 0 else 0.0
    progress_gap = round(project.financial_progress - project.physical_progress, 1)
    latest_pred = project.risk_predictions[0] if project.risk_predictions else None

    return ProjectDetailResponse(
        id=project.id,
        project_code=project.project_code,
        project_name=project.project_name,
        ministry_id=project.ministry_id,
        department_id=project.department_id,
        sector_id=project.sector_id,
        state_id=project.state_id,
        implementing_agency=project.implementing_agency,
        original_cost=project.original_cost,
        revised_cost=project.revised_cost,
        current_expenditure=project.current_expenditure,
        start_date=project.start_date,
        original_completion_date=project.original_completion_date,
        revised_completion_date=project.revised_completion_date,
        actual_completion_date=project.actual_completion_date,
        physical_progress=project.physical_progress,
        financial_progress=project.financial_progress,
        project_status=project.project_status,
        source_type=project.source_type,
        latitude=project.latitude,
        longitude=project.longitude,
        created_at=project.created_at,
        updated_at=project.updated_at,
        ministry=project.ministry,
        sector=project.sector,
        state=project.state,
        latest_prediction=latest_pred,
        milestones=project.milestones,
        monthly_data=project.monthly_data,
        alerts=project.alerts,
        interventions=project.interventions,
        cost_growth_percentage=cost_growth,
        progress_gap=progress_gap
    )

@router.post("", response_model=ProjectDetailResponse)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    existing = db.query(Project).filter(Project.project_code == project_in.project_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project with this project code already exists")

    project = Project(**project_in.dict())
    db.add(project)
    db.commit()
    db.refresh(project)

    # Automatically trigger ML prediction & early warning evaluation
    pred = ml_service.predict_for_project(db, project)
    EarlyWarningService.evaluate_alerts_for_project(db, project, pred)

    return get_project_detail(project.id, db)

@router.get("/{id}/history", response_model=List[MonthlyDataResponse])
@router.get("/{id}/progress", response_model=List[MonthlyDataResponse])
def get_project_history(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter((Project.id == id) | (Project.project_code == id)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.monthly_data

@router.get("/{id}/milestones", response_model=List[MilestoneResponse])
def get_project_milestones(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter((Project.id == id) | (Project.project_code == id)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.milestones

@router.get("/{id}/risk", response_model=RiskPredictionResponse)
@router.get("/{id}/risks", response_model=RiskPredictionResponse)
def get_project_risk(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter((Project.id == id) | (Project.project_code == id)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.risk_predictions:
        pred = ml_service.predict_for_project(db, project)
        return pred
    return project.risk_predictions[0]


@router.get("/{id}/alerts", response_model=List[AlertResponse])
def get_project_alerts(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter((Project.id == id) | (Project.project_code == id)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.alerts

@router.get("/{id}/interventions", response_model=List[InterventionResponse])
def get_project_interventions(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter((Project.id == id) | (Project.project_code == id)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.interventions

@router.get("/{id}/recommendations")
def get_project_recommendations(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter((Project.id == id) | (Project.project_code == id)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    latest_pred = project.risk_predictions[0] if project.risk_predictions else ml_service.predict_for_project(db, project)
    return RecommendationService.generate_recommendations(project, latest_pred)
