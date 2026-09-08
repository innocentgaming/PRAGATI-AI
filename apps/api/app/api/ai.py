from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.models.entities import Project
import os

router = APIRouter(prefix="/ai", tags=["AI Project Insights"])

class ProjectSummaryRequest(BaseModel):
    project_id: str
    include_recommendations: bool = True

class ProjectSummaryResponse(BaseModel):
    project_id: str
    project_code: str
    project_name: str
    current_situation: str
    key_issues: List[str]
    risk_factors: List[str]
    recommended_actions: List[str]
    disclaimer: str = "AI-generated estimate / insight. Based on IPMD predictive models and historical project patterns."
    model_source: str = "Deterministic Rule-Engine & Predictive Hybrid Fallback"

@router.post("/project-summary", response_model=ProjectSummaryResponse)
def generate_ai_project_summary(req: ProjectSummaryRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(
        (Project.id == req.project_id) | (Project.project_code == req.project_id)
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail=f"Project with ID '{req.project_id}' not found")
    
    pred = project.risk_predictions[0] if project.risk_predictions else None
    
    # Analyze metrics
    physical = project.physical_progress
    financial = project.financial_progress
    planned = project.planned_physical_progress or physical
    variance = planned - physical
    cost_growth = ((project.revised_cost - project.original_cost) / project.original_cost * 100.0) if project.original_cost > 0 else 0.0
    
    # Determine Situation
    delayed_milestones = sum(1 for m in project.milestones if m.status == "DELAYED")
    total_milestones = len(project.milestones)
    
    situation_parts = []
    if variance > 10.0:
        situation_parts.append(f"The project is currently {round(variance, 1)}% behind planned physical schedule.")
    elif variance > 0:
        situation_parts.append(f"Physical progress ({physical}%) is slightly lagging behind planned schedule ({planned}%).")
    else:
        situation_parts.append(f"Physical execution ({physical}%) is progressing on schedule.")
        
    if delayed_milestones > 0:
        situation_parts.append(f"{delayed_milestones} of {total_milestones} critical milestones have suffered schedule slippages.")
    
    if financial > physical + 10.0:
        situation_parts.append(f"Financial expenditure ({financial}%) has outpaced physical milestone completion ({physical}%).")
        
    if cost_growth > 0:
        situation_parts.append(f"Approved cost has expanded by {round(cost_growth, 1)}% from original sanction.")

    situation = " ".join(situation_parts) or f"Project {project.project_name} is under active IPMD monitoring with {physical}% physical progress."

    # Key Issues
    issues = []
    if variance > 10.0:
        issues.append(f"Critical physical-financial gap of {round(variance, 1)}% detected.")
    if delayed_milestones > 0:
        issues.append(f"{delayed_milestones} milestone deadline(s) breached on primary critical path.")
    if cost_growth > 15.0:
        issues.append(f"Significant cost escalation of ₹{round(project.revised_cost - project.original_cost, 2)} Cr ({round(cost_growth, 1)}%).")
    if project.alerts:
        for a in project.alerts[:2]:
            issues.append(f"Active Alert: {a.title}")
    if not issues:
        issues.append("No critical blocking issues currently detected on site.")

    # Risk Factors
    risks = []
    if pred:
        for rf in pred.risk_factors[:3]:
            risks.append(f"{rf.feature_name.replace('_', ' ').title()}: Impact score {rf.impact_score}/100 ({rf.impact_direction})")
    else:
        if variance > 5.0:
            risks.append("Schedule Slippage Risk due to delayed civil works")
        if cost_growth > 0:
            risks.append("Capital Budget Escalation Risk")

    # Recommended Actions
    actions = []
    if variance > 10.0:
        actions.append("Convene emergency tripartite review with Implementing Agency and Main Contractor for critical path recovery.")
    if delayed_milestones > 0:
        actions.append("Expedite statutory clearances and utility shifting affecting overdue milestones.")
    if financial > physical + 15.0:
        actions.append("Initiate milestone-linked fund disbursement audit to verify work measurement against billing.")
    if cost_growth > 20.0:
        actions.append("Submit Revised Cost Estimate (RCE) memorandum to Cabinet Committee on Infrastructure (CCI).")
    actions.append("Maintain bi-weekly reporting cadence in PAIMANA monitoring portal.")

    return ProjectSummaryResponse(
        project_id=project.id,
        project_code=project.project_code,
        project_name=project.project_name,
        current_situation=situation,
        key_issues=issues,
        risk_factors=risks,
        recommended_actions=actions,
        disclaimer="AI-generated estimate / insight. Based on IPMD predictive algorithms and historical project patterns."
    )
