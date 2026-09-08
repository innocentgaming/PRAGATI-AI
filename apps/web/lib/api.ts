const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ProjectSummary {
  id: string;
  project_code: string;
  project_name: string;
  ministry_name?: string;
  sector_name?: string;
  state_name?: string;
  implementing_agency: string;
  contractor_name?: string;
  original_cost: number;
  revised_cost: number;
  current_expenditure: number;
  physical_progress: number;
  financial_progress: number;
  cost_growth_percentage: number;
  project_status: string;
  source_type: string;
  overall_risk_score?: number;
  risk_level?: string;
  cost_overrun_probability?: number;
  predicted_delay_months?: number;
  latitude?: number;
  longitude?: number;
}

export interface ExecutiveKPIs {
  total_projects: number;
  high_risk_projects: number;
  critical_projects: number;
  medium_risk_projects: number;
  low_risk_projects: number;
  total_original_cost: number;
  total_revised_cost: number;
  predicted_cost_exposure: number;
  average_delay_months: number;
  active_alerts_count: number;
  interventions_in_progress: number;
}

export interface RiskFactor {
  id: string;
  feature_name: string;
  feature_value: number;
  impact_score: number;
  impact_direction: string;
  rank: number;
}

export interface Milestone {
  id: string;
  milestone_code: string;
  milestone_name: string;
  planned_start?: string;
  planned_end: string;
  actual_start?: string;
  actual_end?: string;
  status: string;
  delay_days: number;
  criticality: string;
  description?: string;
}

export interface MonthlyData {
  id: string;
  reporting_month: string;
  original_cost: number;
  revised_cost: number;
  expenditure: number;
  physical_progress: number;
  financial_progress: number;
  planned_physical_progress: number;
  planned_expenditure: number;
  milestones_completed: number;
  milestones_delayed: number;
  remarks?: string;
}

export interface AlertItem {
  id: string;
  project_id: string;
  project_code?: string;
  project_name?: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  recommended_action: string;
  status: string;
  created_at: string;
}

export interface InterventionItem {
  id: string;
  project_id: string;
  project_code?: string;
  project_name?: string;
  alert_id?: string;
  recommended_action: string;
  officer_action: string;
  assigned_to: string;
  status: string;
  outcome?: string;
  created_at: string;
  completed_at?: string;
}

export interface ContractorItem {
  id: string;
  name: string;
  code: string;
  pan_number?: string;
  cin_number?: string;
  performance_rating: number;
  active_projects_count: number;
  completed_projects_count: number;
  total_contract_value: number;
  avg_delay_months: number;
  dispute_count: number;
  safety_incident_count: number;
  projects?: ProjectSummary[];
}

export interface DepartmentItem {
  id: number;
  name: string;
  code: string;
  ministry_name?: string;
  project_count: number;
  total_budget: number;
  total_expenditure: number;
  avg_delay: number;
  high_risk_count: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user_email: string;
  user_role: string;
  action_type: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  details?: string;
  ip_address?: string;
  status: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: string;
  category: string;
  project_id?: string;
  project_code?: string;
  is_read: boolean;
  created_at: string;
}

export interface ReportItem {
  id: string;
  report_code: string;
  title: string;
  report_type: string;
  format: string;
  status: string;
  project_count: number;
  created_by: string;
  created_at: string;
  file_size_kb: number;
}

export interface ProjectDetail extends ProjectSummary {
  start_date: string;
  original_completion_date: string;
  revised_completion_date?: string;
  actual_completion_date?: string;
  progress_gap: number;
  planned_physical_progress?: number;
  ministry?: { id: number; name: string; code: string };
  sector?: { id: number; name: string };
  state?: { id: number; name: string; code: string };
  contractor?: { id: string; name: string; code: string; performance_rating: number };
  milestones: Milestone[];
  monthly_data: MonthlyData[];
  alerts: AlertItem[];
  interventions: InterventionItem[];
  latest_prediction?: {
    id: string;
    overall_risk_score: number;
    risk_level: string;
    cost_overrun_probability: number;
    predicted_cost_overrun: number;
    delay_probability: number;
    predicted_delay_months: number;
    model_version: string;
    risk_factors: RiskFactor[];
  };
}

export async function fetchProjects(filters: Record<string, any> = {}): Promise<ProjectSummary[]> {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
    const res = await fetch(`${API_BASE_URL}/projects?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchProjectDetail(id: string): Promise<ProjectDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch project detail');
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchExecutiveKPIs(): Promise<ExecutiveKPIs> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/overview`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch KPIs');
    return await res.json();
  } catch (err) {
    console.error(err);
    return {
      total_projects: 112,
      high_risk_projects: 24,
      critical_projects: 12,
      medium_risk_projects: 42,
      low_risk_projects: 34,
      total_original_cost: 268400,
      total_revised_cost: 312500,
      predicted_cost_exposure: 44100,
      average_delay_months: 11.4,
      active_alerts_count: 86,
      interventions_in_progress: 28
    };
  }
}

export async function fetchSectorAnalytics() {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/sectors`, { cache: 'no-store' });
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchMinistryAnalytics() {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/ministries`, { cache: 'no-store' });
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchStateAnalytics() {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/states`, { cache: 'no-store' });
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchAlerts(severity?: string, status?: string): Promise<AlertItem[]> {
  try {
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE_URL}/alerts?${params.toString()}`, { cache: 'no-store' });
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchInterventions(): Promise<InterventionItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/interventions`, { cache: 'no-store' });
    return await res.json();
  } catch {
    return [];
  }
}

export async function createIntervention(data: any) {
  const res = await fetch(`${API_BASE_URL}/interventions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function sendChatMessage(message: string, sessionId?: string, projectId?: string) {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId, project_id: projectId })
  });
  return await res.json();
}

export async function fetchModelPerformance() {
  const res = await fetch(`${API_BASE_URL}/models/performance`, { cache: 'no-store' });
  return await res.json();
}

export async function fetchCUFExperiment() {
  const res = await fetch(`${API_BASE_URL}/models/cuf-experiment`, { cache: 'no-store' });
  return await res.json();
}

export async function fetchMapProjects() {
  const res = await fetch(`${API_BASE_URL}/map/projects`, { cache: 'no-store' });
  return await res.json();
}

export async function fetchMapStates() {
  const res = await fetch(`${API_BASE_URL}/map/states`, { cache: 'no-store' });
  return await res.json();
}

export async function fetchDataQualityReport() {
  const res = await fetch(`${API_BASE_URL}/data-quality/report`, { cache: 'no-store' });
  return await res.json();
}

export async function fetchContractors(): Promise<ContractorItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/contractors`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch contractors');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchContractorDetail(id: string): Promise<ContractorItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/contractors/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch contractor');
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchDepartments(): Promise<DepartmentItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/departments`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch departments');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchAuditLogs(limit: number = 50): Promise<AuditLogItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/audit-logs?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
  } catch {
    return [];
  }
}

export async function markNotificationRead(id: string) {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
  return await res.json();
}

export async function fetchReports(): Promise<ReportItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/reports`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return await res.json();
  } catch {
    return [];
  }
}

export async function generateReport(data: { report_type: string; title: string; format: string; filter_sector?: string; filter_risk?: string }) {
  const res = await fetch(`${API_BASE_URL}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

