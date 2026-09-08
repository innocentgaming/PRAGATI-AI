import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Date, DateTime, Text, ForeignKey, JSON, Boolean
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="VIEWER")  # ADMIN, PMO_OFFICER, DEPARTMENT_OFFICER, PROJECT_MANAGER, VIEWER
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    chat_sessions = relationship("ChatSession", back_populates="user")
    assigned_alerts = relationship("Alert", back_populates="assignee")


class Ministry(Base):
    __tablename__ = "ministries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)

    departments = relationship("Department", back_populates="ministry")
    projects = relationship("Project", back_populates="ministry")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ministry_id = Column(Integer, ForeignKey("ministries.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=True)

    ministry = relationship("Ministry", back_populates="departments")
    projects = relationship("Project", back_populates="department")


class Sector(Base):
    __tablename__ = "sectors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)

    projects = relationship("Project", back_populates="sector")


class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    projects = relationship("Project", back_populates="state")


class Contractor(Base):
    __tablename__ = "contractors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, nullable=False)
    sector_specialization = Column(String(255), nullable=True)
    performance_score = Column(Float, default=85.0)  # 0 to 100
    total_projects = Column(Integer, default=0)
    completed_projects = Column(Integer, default=0)
    delayed_projects = Column(Integer, default=0)
    total_contract_value = Column(Float, default=0.0)  # in ₹ Cr
    average_delay_days = Column(Float, default=0.0)
    rating = Column(String(10), default="A")  # A+, A, B, C, D
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="contractor")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_code = Column(String(100), unique=True, nullable=False, index=True)
    project_name = Column(String(500), nullable=False)
    ministry_id = Column(Integer, ForeignKey("ministries.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=True)
    contractor_id = Column(String(36), ForeignKey("contractors.id"), nullable=True)
    implementing_agency = Column(String(255), nullable=False)
    original_cost = Column(Float, nullable=False)  # in ₹ Crores
    revised_cost = Column(Float, nullable=False)   # in ₹ Crores
    current_expenditure = Column(Float, nullable=False, default=0.0)  # in ₹ Crores
    committed_amount = Column(Float, nullable=False, default=0.0)
    start_date = Column(Date, nullable=False)
    original_completion_date = Column(Date, nullable=False)
    revised_completion_date = Column(Date, nullable=True)
    actual_completion_date = Column(Date, nullable=True)
    physical_progress = Column(Float, nullable=False, default=0.0)  # 0.0 - 100.0%
    financial_progress = Column(Float, nullable=False, default=0.0)  # 0.0 - 100.0%
    planned_physical_progress = Column(Float, nullable=False, default=0.0)
    project_status = Column(String(50), nullable=False, default="ONGOING")  # ON_TRACK, DELAYED, CRITICAL, COMPLETED, STALLED
    source_type = Column(String(50), nullable=False, default="DEMO")  # OFFICIAL_API, OFFICIAL_REPORT, USER_UPLOAD, SYNTHETIC, DEMO
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ministry = relationship("Ministry", back_populates="projects")
    department = relationship("Department", back_populates="projects")
    sector = relationship("Sector", back_populates="projects")
    state = relationship("State", back_populates="projects")
    contractor = relationship("Contractor", back_populates="projects")
    
    monthly_data = relationship("ProjectMonthlyData", back_populates="project", cascade="all, delete-orphan", order_by="ProjectMonthlyData.reporting_month")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan", order_by="Milestone.planned_end")
    risk_predictions = relationship("RiskPrediction", back_populates="project", cascade="all, delete-orphan", order_by="desc(RiskPrediction.prediction_date)")
    alerts = relationship("Alert", back_populates="project", cascade="all, delete-orphan", order_by="desc(Alert.created_at)")
    interventions = relationship("Intervention", back_populates="project", cascade="all, delete-orphan", order_by="desc(Intervention.created_at)")
    documents = relationship("Document", back_populates="project")
    audit_logs = relationship("AuditLog", back_populates="project", cascade="all, delete-orphan")


class ProjectMonthlyData(Base):
    __tablename__ = "project_monthly_data"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    reporting_month = Column(Date, nullable=False)
    original_cost = Column(Float, nullable=False)
    revised_cost = Column(Float, nullable=False)
    expenditure = Column(Float, nullable=False)
    physical_progress = Column(Float, nullable=False)
    financial_progress = Column(Float, nullable=False)
    planned_physical_progress = Column(Float, nullable=False)
    planned_expenditure = Column(Float, nullable=False)
    milestones_completed = Column(Integer, nullable=False, default=0)
    milestones_delayed = Column(Integer, nullable=False, default=0)
    expected_completion_date = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="monthly_data")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    milestone_code = Column(String(100), nullable=False)
    milestone_name = Column(String(500), nullable=False)
    planned_start = Column(Date, nullable=True)
    planned_end = Column(Date, nullable=False)
    actual_start = Column(Date, nullable=True)
    actual_end = Column(Date, nullable=True)
    status = Column(String(50), nullable=False, default="NOT_STARTED")  # NOT_STARTED, IN_PROGRESS, COMPLETED, DELAYED, BLOCKED
    completion_percentage = Column(Float, default=0.0)
    delay_days = Column(Integer, nullable=False, default=0)
    criticality = Column(String(50), nullable=False, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    dependencies = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    project = relationship("Project", back_populates="milestones")


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_date = Column(DateTime, default=datetime.utcnow)
    cost_overrun_probability = Column(Float, nullable=False)
    predicted_cost_overrun = Column(Float, nullable=False)  # %
    predicted_final_cost = Column(Float, nullable=False, default=0.0)  # in ₹ Cr
    delay_probability = Column(Float, nullable=False)
    predicted_delay_months = Column(Float, nullable=False)
    implementation_risk = Column(Float, nullable=False)
    overall_risk_score = Column(Float, nullable=False)  # 0 to 100
    risk_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    model_version = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="risk_predictions")
    risk_factors = relationship("RiskFactor", back_populates="risk_prediction", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="risk_prediction")


class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    risk_prediction_id = Column(String(36), ForeignKey("risk_predictions.id", ondelete="CASCADE"), nullable=False, index=True)
    feature_name = Column(String(255), nullable=False)
    feature_value = Column(Float, nullable=False)
    impact_score = Column(Float, nullable=False)  # SHAP value
    impact_direction = Column(String(20), nullable=False)  # INCREASE_RISK, REDUCE_RISK
    rank = Column(Integer, nullable=False)

    risk_prediction = relationship("RiskPrediction", back_populates="risk_factors")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    risk_prediction_id = Column(String(36), ForeignKey("risk_predictions.id", ondelete="SET NULL"), nullable=True)
    alert_type = Column(String(100), nullable=False)  # SCHEDULE_DELAY, COST_OVERRUN, SLOW_PROGRESS, LOW_UTILIZATION, MISSED_MILESTONE, HIGH_RISK, CONTRACTOR_UNDERPERFORMANCE
    severity = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    priority = Column(String(20), default="HIGH")
    status = Column(String(50), nullable=False, default="OPEN")  # OPEN, ACKNOWLEDGED, RESOLVED, DISMISSED
    assigned_to = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="alerts")
    risk_prediction = relationship("RiskPrediction", back_populates="alerts")
    assignee = relationship("User", back_populates="assigned_alerts")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    document_type = Column(String(100), nullable=False)  # DPR, MONTHLY_REPORT, AUDIT, CIRCULAR, SANCTION_ORDER
    title = Column(String(500), nullable=False)
    source_url = Column(String(1000), nullable=True)
    file_path = Column(String(1000), nullable=True)
    file_size_bytes = Column(Integer, default=1024000)
    published_date = Column(Date, nullable=True)
    text_content = Column(Text, nullable=False)
    doc_metadata = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)
    chunk_metadata = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False, default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    citations = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_id = Column(String(36), ForeignKey("alerts.id", ondelete="SET NULL"), nullable=True)
    recommended_action = Column(Text, nullable=False)
    officer_action = Column(Text, nullable=False)
    assigned_to = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="IN_PROGRESS")  # PLANNED, IN_PROGRESS, COMPLETED, EVALUATING
    outcome = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="interventions")


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    model_name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    training_date = Column(DateTime, default=datetime.utcnow)
    metrics = Column(JSON, nullable=False, default=dict)
    feature_set = Column(JSON, nullable=False, default=list)
    artifact_path = Column(String(1000), nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_name = Column(String(255), nullable=False, default="System Admin")
    user_role = Column(String(50), nullable=False, default="ADMIN")
    action = Column(String(100), nullable=False)  # PROJECT_CREATED, PROGRESS_UPDATED, MILESTONE_CHANGED, RISK_LOGGED, REPORT_GENERATED
    entity_type = Column(String(100), nullable=False)  # PROJECT, MILESTONE, RISK, REPORT, USER
    entity_id = Column(String(100), nullable=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    details = Column(Text, nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    ip_address = Column(String(50), default="10.0.4.12")
    timestamp = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="audit_logs")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="ALERT")  # ALERT, MILESTONE, REPORT, SYSTEM
    severity = Column(String(20), default="HIGH")  # INFO, WARNING, CRITICAL
    project_code = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ReportRecord(Base):
    __tablename__ = "report_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False)  # NATIONAL, STATE, SECTOR, DEPARTMENT, DELAYED, RISK, FINANCIAL, MONTHLY_PMO
    parameters = Column(JSON, default=dict)
    summary = Column(Text, nullable=True)
    generated_by = Column(String(255), default="PMO Officer")
    file_format = Column(String(20), default="PDF")
    created_at = Column(DateTime, default=datetime.utcnow)
