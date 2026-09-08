'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchProjectDetail, ProjectDetail } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import { SHAPChart } from '@/components/SHAPChart';
import { MilestoneTimeline } from '@/components/MilestoneTimeline';
import { InterventionModal } from '@/components/InterventionModal';
import { 
  Building2, MapPin, Calendar, Clock, DollarSign, 
  TrendingUp, ShieldAlert, AlertTriangle, Send, 
  CheckCircle2, ArrowLeft, Bot, ExternalLink, Activity, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, Legend, AreaChart, Area, CartesianGrid 
} from 'recharts';

export default function Project360Page() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInterventionModal, setShowInterventionModal] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchProjectDetail(id);
      setProject(data);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 text-xs text-slate-500">
        <div className="h-7 w-7 rounded-full border-2 border-blue-700 border-t-transparent animate-spin" />
        <span>Loading Project 360 Intelligence Dossier...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Project Not Found</h2>
        <p className="text-xs text-slate-500">The requested infrastructure project code or ID does not exist in MoSPI records.</p>
        <Link href="/projects" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md text-xs font-semibold">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Project Explorer</span>
        </Link>
      </div>
    );
  }

  const latestPred = project.latest_prediction;
  const riskScore = latestPred?.overall_risk_score || 50;

  // Circular gauge color
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-rose-600 stroke-rose-600';
    if (s >= 61) return 'text-orange-600 stroke-orange-600';
    if (s >= 31) return 'text-amber-600 stroke-amber-600';
    return 'text-emerald-600 stroke-emerald-600';
  };

  // Monthly trends chart data
  const monthlyChartData = project.monthly_data.map((m) => ({
    month: m.reporting_month.substring(0, 7),
    physical_progress: m.physical_progress,
    financial_progress: m.financial_progress,
    expenditure: m.expenditure,
    planned_progress: m.planned_physical_progress
  }));

  const costVariance = project.revised_cost - project.original_cost;
  const remainingBudget = Math.max(0, project.revised_cost - project.current_expenditure);

  return (
    <div className="space-y-6">
      
      {/* Navigation Breadcrumb & Meta Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-1.5 bg-white border border-slate-300 rounded-md text-slate-600 hover:text-slate-900 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {project.project_code}
              </span>
              <RiskBadge level={latestPred?.risk_level || 'LOW'} score={riskScore} showScore size="md" />
              <span className="text-[11px] text-slate-500 font-semibold">
                {project.ministry?.name || 'MoSPI Central Sector'} • {project.sector?.name}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              {project.project_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/assistant?q=Why is ${project.project_code} at risk?`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-blue-700 rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <Bot className="h-3.5 w-3.5 text-blue-700" />
            <span>Ask AI Assistant</span>
          </Link>

          <button
            onClick={() => setShowInterventionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Dispatch Directive</span>
          </button>
        </div>
      </div>

      {/* Meta Specs Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="gov-card p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Implementing Agency</div>
          <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">{project.implementing_agency}</div>
          <div className="text-[10px] text-slate-500">{project.state?.name}</div>
        </div>

        <div className="gov-card p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Timeline Targets</div>
          <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
            {project.start_date} ➔ {project.revised_completion_date || project.original_completion_date}
          </div>
          <div className="text-[10px] text-slate-500">Status: <strong className="text-slate-700">{project.project_status}</strong></div>
        </div>

        <div className="gov-card p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Remaining Budget</div>
          <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
            ₹{remainingBudget.toLocaleString()} Cr
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">{Math.round((project.current_expenditure / (project.revised_cost || 1)) * 100)}% Spent</div>
        </div>

        <div className="gov-card p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AI Predicted Overrun</div>
          <div className="text-xs font-mono font-bold text-rose-700 mt-0.5">
            +{latestPred?.predicted_delay_months || 0} Mos • +{latestPred?.predicted_cost_overrun || 0}%
          </div>
          <div className="text-[10px] text-slate-500">Probability: {Math.round((latestPred?.delay_probability || 0) * 100)}%</div>
        </div>
      </div>

      {/* Row 1: Cost Cards + Progress Gauges + Large Circular 0-100 Risk Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Cost Cards Breakdown */}
        <div className="gov-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-blue-700" />
              <span>Financial & Cost Variance</span>
            </h3>
            <span className="text-xs font-mono font-bold text-amber-700">
              +{project.cost_growth_percentage}% growth
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Original Approved Cost:</span>
              <span className="font-mono font-bold text-slate-800">₹{project.original_cost.toLocaleString()} Cr</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Current Revised Cost:</span>
              <span className="font-mono font-bold text-amber-700">₹{project.revised_cost.toLocaleString()} Cr</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Cumulative Expenditure:</span>
              <span className="font-mono font-bold text-slate-800">₹{project.current_expenditure.toLocaleString()} Cr</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Cost Variance:</span>
              <span className={`font-mono font-bold ${costVariance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {costVariance > 0 ? `+₹${costVariance.toLocaleString()} Cr` : '₹0 Cr'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Gauges */}
        <div className="gov-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>Physical vs Financial Progress</span>
            </h3>
            <span className={`text-xs font-mono font-bold ${project.progress_gap > 10 ? 'text-rose-700' : 'text-emerald-700'}`}>
              Gap: {project.progress_gap}%
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Physical Progress:</span>
                <span className="font-mono font-bold text-emerald-700">{project.physical_progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${project.physical_progress}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Financial Progress:</span>
                <span className="font-mono font-bold text-blue-700">{project.financial_progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${project.financial_progress}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Planned Target Progress:</span>
                <span className="font-mono font-bold text-slate-700">{project.planned_physical_progress || project.physical_progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: `${project.planned_physical_progress || project.physical_progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Large Circular 0-100 Risk Score Card */}
        <div className="gov-card p-4 flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Multi-Factor Risk Score</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">0–100 Scale</span>
          </div>

          <div className="my-2 relative flex items-center justify-center">
            {/* Circular Gauge SVG */}
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-200"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={getScoreColor(riskScore)}
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * riskScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl font-black font-mono leading-none ${getScoreColor(riskScore)}`}>
                {riskScore.toFixed(0)}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                {latestPred?.risk_level}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full text-[11px] pt-2 border-t border-slate-100">
            <div className="text-left text-slate-500">
              Cost Risk: <strong className="text-amber-700">{Math.round((latestPred?.cost_overrun_probability || 0)*100)}%</strong>
            </div>
            <div className="text-right text-slate-500">
              Delay Risk: <strong className="text-rose-700">{Math.round((latestPred?.delay_probability || 0)*100)}%</strong>
            </div>
          </div>
        </div>

      </div>

      {/* AI Project Insight Box with official label */}
      <div className="gov-card p-5 border-l-4 border-blue-700 space-y-3 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              PRAGATI AI Situation Insight & Prescriptive Analysis
            </h3>
            <span className="px-2 py-0.2 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
              AI-generated estimate / insight
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Model: Ensemble Hybrid v2.0
          </div>
        </div>

        <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-200">
          <strong className="text-slate-900">Current Situation Assessment: </strong>
          {project.progress_gap > 10 ? (
            <span>
              The project is experiencing execution divergence where cumulative expenditure ({project.financial_progress}%) outpaces verified physical delivery ({project.physical_progress}%) by {project.progress_gap.toFixed(1)}%. Model forecasts an estimated schedule slippage of +{latestPred?.predicted_delay_months || 8} months and a {latestPred?.predicted_cost_overrun || 15}% budget escalation unless immediate site coordination is enforced.
            </span>
          ) : (
            <span>
              The project maintains physical-financial synchronicity with {project.physical_progress}% physical progress. Milestone execution remains aligned with sanctioned baselines, though land acquisition and vendor SLA compliance must be audited quarterly.
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md space-y-1.5">
            <div className="font-bold text-rose-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              <span>Key Issues & Risk Factors</span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
              <li>Physical progress gap: {project.progress_gap.toFixed(1)}% variance against expenditure.</li>
              <li>Milestones status: {project.milestones.filter(m => m.status === 'DELAYED').length} of {project.milestones.length} milestones delayed.</li>
              <li>Cost escalation: ₹{project.revised_cost.toLocaleString()} Cr (+{project.cost_growth_percentage}% growth).</li>
            </ul>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md space-y-1.5">
            <div className="font-bold text-emerald-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Recommended Interventions</span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
              <li>Convene tripartite coordination meeting with {project.implementing_agency}.</li>
              <li>Audit physical milestone verification prior to next tranche disbursement.</li>
              <li>Reallocate critical path resources for overdue milestone packages.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Row 2: SHAP Top Risk Drivers + Monthly Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* SHAP Explanation Card */}
        <div className="gov-card p-5 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              SHAP Explainability: Top Risk Drivers
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Transparent factor attribution explaining why this project received its composite risk score
            </p>
          </div>
          <SHAPChart factors={latestPred?.risk_factors || []} overallScore={riskScore} />
        </div>

        {/* Historical Progress & Expenditure Trajectory */}
        <div className="gov-card p-5 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Monthly Progress & Expenditure Trajectory
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Historical physical delivery curve compared against financial burn
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ background: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.375rem', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Area type="monotone" dataKey="physical_progress" stroke="#059669" fill="#D1FAE5" name="Physical Progress %" />
                <Area type="monotone" dataKey="financial_progress" stroke="#2563EB" fill="#DBEAFE" name="Financial Progress %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Milestone Timeline & Early Warnings / Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Milestone Timeline */}
        <div className="gov-card p-5 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Critical Path Milestone Pipeline
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Chronological milestones tracking planned vs actual delivery and delay days
            </p>
          </div>
          <MilestoneTimeline milestones={project.milestones} />
        </div>

        {/* Active Early Warning Alerts */}
        <div className="gov-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Active Early Warning Alerts ({project.alerts.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Rule-engine and ML automated triggers
              </p>
            </div>
            <button
              onClick={() => setShowInterventionModal(true)}
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              + Create Directive
            </button>
          </div>

          <div className="space-y-2.5">
            {project.alerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No active early warning alerts for this project.
              </div>
            ) : (
              project.alerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{alert.description}</p>
                  <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-500">
                    <strong className="text-blue-700">Recommended Action: </strong> {alert.recommended_action}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Intervention Modal */}
      <InterventionModal
        isOpen={showInterventionModal}
        onClose={() => setShowInterventionModal(false)}
        projectId={project.id}
        projectCode={project.project_code}
        projectName={project.project_name}
        defaultAction={`Initiate immediate tripartite review with ${project.implementing_agency} and audit price-variation escalations.`}
        onSuccess={() => {
          fetchProjectDetail(id).then(setProject);
        }}
      />

    </div>
  );
}
