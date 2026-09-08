-- PRAGATI-AI Database Schema
-- Ministry of Statistics and Programme Implementation (MoSPI)
-- Problem Statement ID: 26103

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'VIEWER', -- ADMIN, MONITORING_OFFICER, MINISTRY_USER, ANALYST, VIEWER
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ministries Table
CREATE TABLE IF NOT EXISTS ministries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL
);

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    ministry_id INTEGER NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

-- 4. Sectors Table
CREATE TABLE IF NOT EXISTS sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- 5. States Table
CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    geometry GEOMETRY(MultiPolygon, 4326)
);

-- 6. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_code VARCHAR(100) UNIQUE NOT NULL,
    project_name VARCHAR(500) NOT NULL,
    ministry_id INTEGER REFERENCES ministries(id),
    department_id INTEGER REFERENCES departments(id),
    sector_id INTEGER REFERENCES sectors(id),
    state_id INTEGER REFERENCES states(id),
    implementing_agency VARCHAR(255) NOT NULL,
    original_cost DOUBLE PRECISION NOT NULL, -- in Crores (INR)
    revised_cost DOUBLE PRECISION NOT NULL,  -- in Crores (INR)
    current_expenditure DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    start_date DATE NOT NULL,
    original_completion_date DATE NOT NULL,
    revised_completion_date DATE,
    actual_completion_date DATE,
    physical_progress DOUBLE PRECISION NOT NULL DEFAULT 0.0, -- 0.0 to 100.0 %
    financial_progress DOUBLE PRECISION NOT NULL DEFAULT 0.0, -- 0.0 to 100.0 %
    project_status VARCHAR(50) NOT NULL DEFAULT 'ONGOING', -- ONGOING, COMPLETED, DELAYED, STALLED
    source_type VARCHAR(50) NOT NULL DEFAULT 'DEMO', -- OFFICIAL_API, OFFICIAL_REPORT, USER_UPLOAD, SYNTHETIC, DEMO
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Project Monthly Data Table (Time Series Records)
CREATE TABLE IF NOT EXISTS project_monthly_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reporting_month DATE NOT NULL,
    original_cost DOUBLE PRECISION NOT NULL,
    revised_cost DOUBLE PRECISION NOT NULL,
    expenditure DOUBLE PRECISION NOT NULL,
    physical_progress DOUBLE PRECISION NOT NULL,
    financial_progress DOUBLE PRECISION NOT NULL,
    planned_physical_progress DOUBLE PRECISION NOT NULL,
    planned_expenditure DOUBLE PRECISION NOT NULL,
    milestones_completed INTEGER NOT NULL DEFAULT 0,
    milestones_delayed INTEGER NOT NULL DEFAULT 0,
    expected_completion_date DATE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_project_month UNIQUE (project_id, reporting_month)
);

-- 8. Milestones Table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_code VARCHAR(100) NOT NULL,
    milestone_name VARCHAR(500) NOT NULL,
    planned_start DATE,
    planned_end DATE NOT NULL,
    actual_start DATE,
    actual_end DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, DELAYED
    delay_days INTEGER NOT NULL DEFAULT 0,
    criticality VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    description TEXT
);

-- 9. Risk Predictions Table
CREATE TABLE IF NOT EXISTS risk_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    prediction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cost_overrun_probability DOUBLE PRECISION NOT NULL,
    predicted_cost_overrun DOUBLE PRECISION NOT NULL, -- percentage
    delay_probability DOUBLE PRECISION NOT NULL,
    predicted_delay_months DOUBLE PRECISION NOT NULL,
    implementation_risk DOUBLE PRECISION NOT NULL,
    overall_risk_score DOUBLE PRECISION NOT NULL, -- 0 to 100
    risk_level VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    model_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Risk Factors Table (SHAP Contributions)
CREATE TABLE IF NOT EXISTS risk_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_prediction_id UUID NOT NULL REFERENCES risk_predictions(id) ON DELETE CASCADE,
    feature_name VARCHAR(255) NOT NULL,
    feature_value DOUBLE PRECISION NOT NULL,
    impact_score DOUBLE PRECISION NOT NULL, -- SHAP value
    impact_direction VARCHAR(20) NOT NULL, -- INCREASE_RISK, REDUCE_RISK
    rank INTEGER NOT NULL
);

-- 11. Alerts Table (Early Warning System)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    risk_prediction_id UUID REFERENCES risk_predictions(id) ON DELETE SET NULL,
    alert_type VARCHAR(100) NOT NULL, -- HIGH_DELAY_RISK, COST_ESCALATION, PROGRESS_DEVIATION, CRITICAL_MILESTONE, FINANCIAL_ANOMALY, CRITICAL_MULTI_FACTOR
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, ACKNOWLEDGED, RESOLVED, DISMISSED
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 12. Documents Table (RAG System)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    document_type VARCHAR(100) NOT NULL, -- MONTHLY_REPORT, DPR, AUDIT_REPORT, PAIMANA_DOC, CIRCULAR
    title VARCHAR(500) NOT NULL,
    source_url VARCHAR(1000),
    file_path VARCHAR(1000),
    published_date DATE,
    text_content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Document Chunks Table (Embeddings & Semantic Search)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(384), -- BGE-small/BGE-M3 standard vector dimension
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Interventions Table
CREATE TABLE IF NOT EXISTS interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
    recommended_action TEXT NOT NULL,
    officer_action TEXT NOT NULL,
    assigned_to VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS', -- PLANNED, IN_PROGRESS, COMPLETED, EVALUATING
    outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 17. Model Versions Table
CREATE TABLE IF NOT EXISTS model_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    training_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    feature_set JSONB NOT NULL DEFAULT '[]'::jsonb,
    artifact_path VARCHAR(1000)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector_id);
CREATE INDEX IF NOT EXISTS idx_projects_ministry ON projects(ministry_id);
CREATE INDEX IF NOT EXISTS idx_projects_state ON projects(state_id);
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(project_code);
CREATE INDEX IF NOT EXISTS idx_monthly_project_id ON project_monthly_data(project_id);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_project ON risk_predictions(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_project ON alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_interventions_project ON interventions(project_id);
