'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchExecutiveKPIs, fetchProjects, fetchSectorAnalytics, fetchMinistryAnalytics, fetchStateAnalytics, ProjectSummary, ExecutiveKPIs } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import { InterventionModal } from '@/components/InterventionModal';
import { 
  Building2, AlertTriangle, TrendingUp, Clock, 
  ShieldAlert, ArrowUpRight, CheckCircle2, ChevronRight, Activity, DollarSign, Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';

export default function ExecutiveDashboard() {
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [ministries, setMinistries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterventionProject, setSelectedInterventionProject] = useState<ProjectSummary | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [kpiData, projData, secData, minData, stData] = await Promise.all([
        fetchExecutiveKPIs(),
        fetchProjects(),
        fetchSectorAnalytics(),
        fetchMinistryAnalytics(),
        fetchStateAnalytics()
      ]);
      setKpis(kpiData);
      setProjects(projData);
      setSectors(secData);
      setMinistries(minData);
      setStates(stData);
      setLoading(false);
    }
    loadData();
  }, []);

  const riskPieData = [
    { name: 'Low Risk (≤30)', value: kpis?.low_risk_projects || 34, color: '#059669' },
    { name: 'Medium Risk (31-60)', value: kpis?.medium_risk_projects || 42, color: '#D97706' },
    { name: 'High Risk (61-80)', value: (kpis?.high_risk_projects || 24) - (kpis?.critical_projects || 12), color: '#EA580C' },
    { name: 'Critical (>80)', value: kpis?.critical_projects || 12, color: '#DC2626' },
  ];

  // Overrun & Delay Trend synthetic monthly data
  const trendData = [
    { month: 'Oct 2025', cost_overrun_cr: 32000, avg_delay_mos: 9.8 },
    { month: 'Nov 2025', cost_overrun_cr: 35400, avg_delay_mos: 10.2 },
    { month: 'Dec 2025', cost_overrun_cr: 38900, avg_delay_mos: 10.7 },
    { month: 'Jan 2026', cost_overrun_cr: 41200, avg_delay_mos: 11.0 },
    { month: 'Feb 2026', cost_overrun_cr: 43500, avg_delay_mos: 11.2 },
    { month: 'Mar 2026 (Live)', cost_overrun_cr: 44100, avg_delay_mos: 11.4 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Official Government Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              National Infrastructure Executive Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              MoSPI IPMD • PAIMANA / OCMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Central Sector Projects (₹150 Crore & Above) • Machine Learning Predictive Intelligence System
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/assistant"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Ask PRAGATI Assistant</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Top 7 Core KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        
        {/* Total Projects */}
        <div className="gov-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
            <span>Total Projects</span>
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-bold text-slate-900">
              {kpis?.total_projects || 112}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
              ₹{((kpis?.total_original_cost || 268400)/1000).toFixed(1)}k Cr Outlay
            </div>
          </div>
        </div>

        {/* Critical Projects */}
        <div className="gov-card p-3.5 bg-rose-50/50 border-rose-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700 text-[11px] font-semibold">
            <span>Critical (&gt;80)</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-bold text-rose-700">
              {kpis?.critical_projects || 12}
            </div>
            <div className="text-[10px] text-rose-600/80 mt-0.5">Urgent Review</div>
          </div>
        </div>

        {/* High Risk */}
        <div className="gov-card p-3.5 bg-orange-50/50 border-orange-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-orange-700 text-[11px] font-semibold">
            <span>High Risk (61-80)</span>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-bold text-orange-700">
              {(kpis?.high_risk_projects || 24) - (kpis?.critical_projects || 12)}
            </div>
            <div className="text-[10px] text-orange-600/80 mt-0.5">Escalated Tier</div>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="gov-card p-3.5 bg-amber-50/50 border-amber-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 text-[11px] font-semibold">
            <span>Medium Risk</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-bold text-amber-700">
              {kpis?.medium_risk_projects || 42}
            </div>
            <div className="text-[10px] text-amber-600/80 mt-0.5">Watchlist</div>
          </div>
        </div>

        {/* Low Risk / On Track */}
        <div className="gov-card p-3.5 bg-emerald-50/50 border-emerald-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 text-[11px] font-semibold">
            <span>Low Risk (≤30)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-bold text-emerald-700">
              {kpis?.low_risk_projects || 34}
            </div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">On Schedule</div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="gov-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
            <span>Active Alerts</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-bold text-slate-900">
              {kpis?.active_alerts_count || 86}
            </div>
            <div className="text-[10px] text-rose-600 mt-0.5 font-medium">Auto-Triggered</div>
          </div>
        </div>

        {/* Predicted Cost Exposure */}
        <div className="gov-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
            <span>Cost Exposure</span>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-1.5">
            <div className="text-xl font-bold text-slate-900">
              ₹{((kpis?.predicted_cost_exposure || 44100)/1000).toFixed(1)}k Cr
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Forecast Overrun</div>
          </div>
        </div>

      </div>

      {/* Row 1: Risk Distribution (Donut) & Risk by Sector (Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Risk Distribution Donut */}
        <div className="gov-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              National Infrastructure Risk Distribution
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Portfolio segmented by multi-factor 0–100 composite risk score
            </p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.375rem', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            {riskPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                <span className="text-slate-600">{item.name.split(' ')[0]}:</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk by Sector (Bar Chart) */}
        <div className="lg:col-span-2 gov-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Average Cost Overrun Escalation by Sector (%)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Comparative cost growth percentage across central infrastructure domains
              </p>
            </div>
            <Link href="/analytics" className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-semibold">
              <span>Full Analytics</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectors.slice(0, 7)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="sector_name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.375rem', fontSize: '11px' }}
                />
                <Bar dataKey="avg_cost_overrun_pct" fill="#1D4ED8" radius={[3, 3, 0, 0]} name="Avg Cost Overrun %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Overrun & Delay Trends (Line Chart) + Ministry & State Risk Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Cost Overrun & Delay Trend */}
        <div className="lg:col-span-2 gov-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                National Cost Overrun & Schedule Delay Trajectory
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Historical monthly escalation across monitored central sector portfolios
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#DC2626" fontSize={10} tickLine={false} unit=" Cr" />
                <YAxis yAxisId="right" orientation="right" stroke="#D97706" fontSize={10} tickLine={false} unit=" Mos" />
                <Tooltip contentStyle={{ background: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.375rem', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line yAxisId="left" type="monotone" dataKey="cost_overrun_cr" stroke="#DC2626" strokeWidth={2} name="Cost Overrun (₹ Cr)" dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="avg_delay_mos" stroke="#D97706" strokeWidth={2} name="Avg Delay (Months)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk by Ministry & State Summary */}
        <div className="gov-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Critical Portfolios by Ministry & State
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Top capital-intensive divisions requiring coordination
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Ministries by Overrun</div>
            {ministries.slice(0, 3).map((m, idx) => (
              <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <span className="font-semibold text-slate-800 truncate pr-2">{m.ministry_name.replace('Ministry of ', '')}</span>
                <span className="font-mono text-rose-700 font-bold">+{m.avg_cost_overrun_pct}%</span>
              </div>
            ))}

            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">States with Highest Project Count</div>
            {states.slice(0, 3).map((st, idx) => (
              <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <span className="font-semibold text-slate-800">{st.state_name}</span>
                <span className="font-mono text-blue-700 font-bold">{st.total_projects} Projects</span>
              </div>
            ))}
          </div>

          <Link
            href="/map"
            className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-xs transition-colors border border-slate-200 block"
          >
            Open National Geospatial Map ➔
          </Link>
        </div>

      </div>

      {/* Main Table: Top Priority Projects Requiring Intervention */}
      <div className="gov-card p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Top Infrastructure Projects Requiring Immediate Intervention</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Prioritized by multi-factor composite risk score, milestone breach rate, and budget divergence
            </p>
          </div>
          <Link
            href="/projects"
            className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-2.5 px-3.5">Project Code & Title</th>
                <th className="py-2.5 px-3.5">Sector & State</th>
                <th className="py-2.5 px-3.5">Outlay (Orig ➔ Rev)</th>
                <th className="py-2.5 px-3.5">Progress (Phys / Fin)</th>
                <th className="py-2.5 px-3.5">Delay Forecast</th>
                <th className="py-2.5 px-3.5">Risk Score</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {projects.slice(0, 8).map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3.5">
                    <Link href={`/projects/${proj.id}`} className="font-semibold text-slate-900 hover:text-blue-700 block">
                      <span className="font-mono text-[11px] text-blue-700 mr-1.5 font-bold">{proj.project_code}</span>
                      {proj.project_name}
                    </Link>
                    <div className="text-[10px] text-slate-400 mt-0.5">{proj.implementing_agency}</div>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-600">
                    <div className="font-medium text-slate-800">{proj.sector_name}</div>
                    <div className="text-[10px] text-slate-400">{proj.state_name}</div>
                  </td>
                  <td className="py-2.5 px-3.5 font-mono">
                    <div className="font-bold text-slate-800">₹{proj.revised_cost.toLocaleString()} Cr</div>
                    <div className="text-[10px] text-amber-700 font-semibold">+{proj.cost_growth_percentage}% growth</div>
                  </td>
                  <td className="py-2.5 px-3.5 font-mono">
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-700 font-bold">{proj.physical_progress}%</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-blue-700">{proj.financial_progress}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 font-mono font-bold text-rose-700">
                    +{proj.predicted_delay_months || 0} Mos
                  </td>
                  <td className="py-2.5 px-3.5">
                    <RiskBadge level={proj.risk_level || 'LOW'} score={proj.overall_risk_score} showScore />
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <Link
                      href={`/projects/${proj.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-700 hover:text-white text-slate-700 border border-slate-300 rounded text-[11px] font-semibold transition-colors"
                    >
                      <span>Inspect 360</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
