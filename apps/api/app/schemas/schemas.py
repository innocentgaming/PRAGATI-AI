from datetime import date, datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# User & Auth Schemas
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "VIEWER"

class UserCreate(UserBase):
    password: str
    department_id: Optional[int] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    department_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Ministry, Department, Sector, State, Contractor
class MinistryBase(BaseModel):
    id: int
    name: str
    code: str
    class Config:
        from_attributes = True

class DepartmentBase(BaseModel):
    id: int
    ministry_id: int
    name: str
    code: Optional[str] = None
    class Config:
        from_attributes = True

class SectorBase(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class StateBase(BaseModel):
    id: int
    name: str
    code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    class Config:
        from_attributes = True

class ContractorBase(BaseModel):
    id: str
    name: str
    sector_specialization: Optional[str] = None
    performance_score: float = 85.0
    total_projects: int = 0
    completed_projects: int = 0
    delayed_projects: int = 0
    total_contract_value: float = 0.0
    average_delay_days: float = 0.0
    rating: str = "A"
    class Config:
        from_attributes = True

# Milestone Schemas
class MilestoneBase(BaseModel):
    milestone_code: str
    milestone_name: str
    planned_start: Optional[date] = None
    planned_end: date
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    status: str = "NOT_STARTED"
    completion_percentage: float = 0.0
    delay_days: int = 0
    criticality: str = "MEDIUM"
    dependencies: Optional[str] = None
    description: Optional[str] = None

class MilestoneResponse(MilestoneBase):
    id: str
    project_id: str
    class Config:
        from_attributes = True

# Monthly Data Schemas
class MonthlyDataBase(BaseModel):
    reporting_month: date
    original_cost: float
    revised_cost: float
    expenditure: float
    physical_progress: float
    financial_progress: float
    planned_physical_progress: float
    planned_expenditure: float
    milestones_completed: int = 0
    milestones_delayed: int = 0
    expected_completion_date: Optional[date] = None
    remarks: Optional[str] = None

class MonthlyDataResponse(MonthlyDataBase):
    id: str
    project_id: str
    created_at: datetime
    class Config:
        from_attributes = True

# Risk Factor & Prediction Schemas
class RiskFactorResponse(BaseModel):
    id: str
    feature_name: str
    feature_value: float
    impact_score: float
    impact_direction: str
    rank: int
    class Config:
        from_attributes = True

class RiskPredictionResponse(BaseModel):
    id: str
    project_id: str
    prediction_date: datetime
    cost_overrun_probability: float
    predicted_cost_overrun: float
    predicted_final_cost: float = 0.0
    delay_probability: float
    predicted_delay_months: float
    implementation_risk: float
    overall_risk_score: float
    risk_level: str
    model_version: str
    risk_factors: List[RiskFactorResponse] = []
    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    project_id: str
    alert_type: str
    severity: str
    title: str
    description: str
    recommended_action: str
    priority: str = "HIGH"

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: str
    risk_prediction_id: Optional[str] = None
    status: str = "OPEN"
    assigned_to: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    project_code: Optional[str] = None
    project_name: Optional[str] = None
    class Config:
        from_attributes = True

# Intervention Schemas
class InterventionCreate(BaseModel):
    project_id: str
    alert_id: Optional[str] = None
    recommended_action: str
    officer_action: str
    assigned_to: str
    status: str = "IN_PROGRESS"

class InterventionUpdate(BaseModel):
    officer_action: Optional[str] = None
    status: Optional[str] = None
    outcome: Optional[str] = None

class InterventionResponse(BaseModel):
    id: str
    project_id: str
    alert_id: Optional[str] = None
    recommended_action: str
    officer_action: str
    assigned_to: str
    status: str
    outcome: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    project_name: Optional[str] = None
    project_code: Optional[str] = None
    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    project_code: str
    project_name: str
    ministry_id: Optional[int] = None
    department_id: Optional[int] = None
    sector_id: Optional[int] = None
    state_id: Optional[int] = None
    contractor_id: Optional[str] = None
    implementing_agency: str
    original_cost: float
    revised_cost: float
    current_expenditure: float = 0.0
    committed_amount: float = 0.0
    start_date: date
    original_completion_date: date
    revised_completion_date: Optional[date] = None
    actual_completion_date: Optional[date] = None
    physical_progress: float = 0.0
    financial_progress: float = 0.0
    planned_physical_progress: float = 0.0
    project_status: str = "ON_TRACK"
    source_type: str = "DEMO"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectListResponse(BaseModel):
    id: str
    project_code: str
    project_name: str
    ministry_name: Optional[str] = None
    department_name: Optional[str] = None
    sector_name: Optional[str] = None
    state_name: Optional[str] = None
    contractor_name: Optional[str] = None
    implementing_agency: str
    original_cost: float
    revised_cost: float
    current_expenditure: float = 0.0
    physical_progress: float = 0.0
    financial_progress: float = 0.0
    planned_physical_progress: float = 0.0
    progress_variance: float = 0.0
    cost_growth_percentage: float = 0.0
    project_status: str = "ON_TRACK"
    source_type: str = "DEMO"
    overall_risk_score: Optional[float] = None
    risk_level: Optional[str] = "LOW"
    cost_overrun_probability: Optional[float] = None
    predicted_delay_months: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ProjectDetailResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    ministry: Optional[MinistryBase] = None
    department: Optional[DepartmentBase] = None
    sector: Optional[SectorBase] = None
    state: Optional[StateBase] = None
    contractor: Optional[ContractorBase] = None
    latest_prediction: Optional[RiskPredictionResponse] = None
    milestones: List[MilestoneResponse] = []
    monthly_data: List[MonthlyDataResponse] = []
    alerts: List[AlertResponse] = []
    interventions: List[InterventionResponse] = []
    cost_growth_percentage: float = 0.0
    progress_gap: float = 0.0
    class Config:
        from_attributes = True

# Audit Log & Notification Schemas
class AuditLogResponse(BaseModel):
    id: str
    user_name: str
    user_role: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    project_code: Optional[str] = None
    details: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    severity: str
    project_code: Optional[str] = None
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

class ReportRecordResponse(BaseModel):
    id: str
    title: str
    report_type: str
    parameters: Dict[str, Any] = {}
    summary: Optional[str] = None
    generated_by: str
    file_format: str
    created_at: datetime
    class Config:
        from_attributes = True

# Prediction Request & Response
class PredictionRequest(BaseModel):
    project_id: Optional[str] = None
    original_cost: float
    revised_cost: float
    current_expenditure: float
    physical_progress: float
    financial_progress: float
    planned_physical_progress: float
    planned_duration_days: int
    elapsed_duration_days: int
    total_milestones: int
    delayed_milestones: int
    sector_id: Optional[int] = None
    source_type: str = "DEMO"

class PredictionResponse(BaseModel):
    cost_overrun_probability: float
    predicted_cost_overrun_percentage: float
    predicted_final_cost: float
    delay_probability: float
    predicted_delay_months: float
    predicted_completion_date: str
    overall_risk_score: float
    risk_level: str
    risk_drivers: List[Dict[str, Any]]
    model_version: str

# Chat & Copilot Schemas
class Citation(BaseModel):
    document_title: str
    document_type: str
    project_code: Optional[str] = None
    section: Optional[str] = None
    page: Optional[int] = None
    excerpt: str

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    project_id: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    session_id: str
    message: str
    citations: List[Citation] = []
    structured_data: Optional[Dict[str, Any]] = None
    suggested_actions: List[str] = []

# Analytics Schemas
class ExecutiveKPIs(BaseModel):
    total_projects: int = 0
    total_investment_cr: float = 0.0
    total_expenditure_cr: float = 0.0
    projects_on_track: int = 0
    projects_delayed: int = 0
    projects_at_risk: int = 0
    projects_completed: int = 0
    avg_physical_progress: float = 0.0
    avg_financial_progress: float = 0.0
    high_risk_projects: int = 0
    critical_projects: int = 0
    medium_risk_projects: int = 0
    low_risk_projects: int = 0
    total_original_cost: float = 0.0
    total_revised_cost: float = 0.0
    predicted_cost_exposure: float = 0.0
    average_delay_months: float = 0.0
    active_alerts_count: int = 0
    interventions_in_progress: int = 0


class SectorAnalytics(BaseModel):
    sector_name: str
    total_projects: int
    total_investment_cr: float
    avg_cost_overrun_pct: float
    avg_delay_months: float
    high_risk_count: int
    avg_physical_progress: float

class MinistryAnalytics(BaseModel):
    ministry_name: str
    total_projects: int
    total_investment_cr: float
    avg_cost_overrun_pct: float
    avg_delay_months: float
    avg_risk_score: float

class StateAnalytics(BaseModel):
    state_name: str
    state_code: str
    total_projects: int
    total_investment_cr: float
    avg_risk_score: float
    high_risk_count: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# Data Quality Schemas
class DataQualityCheckResult(BaseModel):
    check_name: str
    passed: bool
    severity: str
    affected_count: int
    details: List[str] = []

class DataQualityReport(BaseModel):
    overall_quality_score: float
    total_records_checked: int
    passed_records: int
    flagged_records: int
    checks: List[DataQualityCheckResult]
    timestamp: datetime
