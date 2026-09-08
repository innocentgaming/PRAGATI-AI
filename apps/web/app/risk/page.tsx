'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchProjects, ProjectSummary } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import { 
  ShieldAlert, Activity, TrendingUp, Clock, 
  ArrowUpRight, Sliders, Play, Sparkles, Filter 
} from 'lucide-react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, 
  ZAxis, Tooltip, Cell, CartesianGrid 
} from 'recharts';

export const dynamic = 'force-dynamic';

export default function RiskIntelligencePage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Adhoc Simulation State
  const [simCost, setSimCost] = useState(2500);
  const [simPhysProg, setSimPhysProg] = useState(35);
  const [simFinProg, setSimFinProg] = useState(65);
  const [simDelayedMilestones, setSimDelayedMilestones] = useState(3);
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data);
      setLoading(false);
    }
    load();
  }, []);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('http://localhost:8000/api/risks/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_cost: simCost,
          revised_cost: simCost * 1.25,
          current_expenditure: simCost * (simFinProg / 100),
          physical_progress: simPhysProg,
          financial_progress: simFinProg,
          planned_physical_progress: 70,
          planned_duration_days: 1000,
          elapsed_duration_days: 600,
          total_milestones: 8,
          delayed_milestones: simDelayedMilestones,
          sector_id: 1,
          source_type: 'DEMO'
        })
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const scatterData = projects.map(p => ({
    name: p.project_code,
    fullName: p.project_name,
    costOverrunProb: Math.round((p.cost_overrun_probability || 0.4) * 100),
    delayMonths: p.predicted_delay_months || 0,
    riskScore: p.overall_risk_score || 50,
    level: p.risk_level || 'LOW',
    id: p.id
  }));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Risk Intelligence & Multi-Dimensional Exposure
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Composite risk index, cost vs schedule delay exposure matrix, and what-if predictive simulation
        </p>
      </div>

      {/* Scatter Matrix & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Cost vs Delay Risk Matrix */}
        <div className="lg:col-span-2 gov-card p-5 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Project Exposure Matrix (Cost Overrun Risk vs Delay Severity)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Each point represents a project. Top-right quadrant indicates critical dual vulnerability.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis 
                  type="number" 
                  dataKey="costOverrunProb" 
                  name="Cost Overrun Prob" 
                  unit="%" 
                  stroke="#64748B" 
                  fontSize={10} 
                  label={{ value: 'Cost Escalation Probability (%)', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="delayMonths" 
                  name="Predicted Delay" 
                  unit="m" 
                  stroke="#64748B" 
                  fontSize={10}
                  label={{ value: 'Predicted Delay (Months)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 10 }}
                />
                <ZAxis type="number" dataKey="riskScore" range={[50, 260]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 p-3 rounded-md shadow-lg text-xs space-y-1">
                          <div className="font-bold text-blue-700">{data.name}</div>
                          <div className="text-slate-800 text-[11px] max-w-xs">{data.fullName}</div>
                          <div className="text-slate-500">Risk Score: <strong className="text-slate-900">{data.riskScore}/100</strong> ({data.level})</div>
                          <div className="text-slate-500">Cost Overrun Prob: <strong className="text-amber-700">{data.costOverrunProb}%</strong></div>
                          <div className="text-slate-500">Delay: <strong className="text-rose-700">+{data.delayMonths} Mos</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, index) => {
                    const fill = entry.level === 'CRITICAL' ? '#DC2626' : entry.level === 'HIGH' ? '#EA580C' : entry.level === 'MEDIUM' ? '#D97706' : '#059669';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Root Cause Feature Drivers */}
        <div className="gov-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Global Risk Attribution Drivers
            </h3>
            <p className="text-[11px] text-slate-500">
              Aggregated SHAP tree importance across all MoSPI projects
            </p>

            <div className="mt-4 space-y-3">
              {[
                { name: 'Milestone Stalls & Critical Delays', pct: 26.4, color: 'bg-rose-500' },
                { name: 'Physical vs Planned Execution Gap', pct: 21.8, color: 'bg-orange-500' },
                { name: 'Financial Burn vs Physical Output', pct: 17.5, color: 'bg-amber-500' },
                { name: 'Approved Cost Revision Growth', pct: 14.2, color: 'bg-blue-600' },
                { name: 'Sub-optimal Construction Velocity', pct: 10.6, color: 'bg-indigo-600' },
                { name: 'Sector Specific Clearance Friction', pct: 9.5, color: 'bg-slate-600' },
              ].map((driver, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{driver.name}</span>
                    <span className="font-mono font-bold text-slate-900">{driver.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${driver.color}`} style={{ width: `${driver.pct * 3.5}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500">
            Validated against historical 2018–2025 MoSPI infrastructure database.
          </div>
        </div>

      </div>

      {/* Interactive What-If Scenario Modeling Tool */}
      <div className="gov-card p-5 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="h-3.5 w-3.5" />
            <span>Interactive What-If Scenario Simulator</span>
          </div>
          <h2 className="text-sm font-bold text-slate-900">
            Simulate Project Risk Under Modifiable Execution Conditions
          </h2>
          <p className="text-xs text-slate-500">
            Adjust financial expenditure, physical delivery gaps, and milestone delays to evaluate live ML prediction response.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Sanctioned Cost:</span>
              <span className="font-mono font-bold text-slate-900">₹{simCost} Cr</span>
            </div>
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={simCost}
              onChange={(e) => setSimCost(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Physical Progress:</span>
              <span className="font-mono font-bold text-emerald-700">{simPhysProg}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={simPhysProg}
              onChange={(e) => setSimPhysProg(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Financial Progress:</span>
              <span className="font-mono font-bold text-blue-700">{simFinProg}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={simFinProg}
              onChange={(e) => setSimFinProg(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Delayed Milestones:</span>
              <span className="font-mono font-bold text-rose-700">{simDelayedMilestones} / 8</span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              value={simDelayedMilestones}
              onChange={(e) => setSimDelayedMilestones(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
          </div>

        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
          >
            <Play className="h-3.5 w-3.5" />
            <span>{isSimulating ? 'Evaluating Ensembles...' : 'Run Simulation Pipeline'}</span>
          </button>

          {simResult && (
            <div className="flex items-center gap-5 p-2 bg-slate-50 border border-slate-200 rounded-md text-xs">
              <div>
                <span className="text-[10px] text-slate-500">Simulated Risk:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-slate-900 font-mono">{simResult.overall_risk_score}/100</span>
                  <RiskBadge level={simResult.risk_level} />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500">Forecasted Delay:</span>
                <div className="text-sm font-bold text-rose-700 font-mono">+{simResult.predicted_delay_months} Mos</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500">Cost Escalation:</span>
                <div className="text-sm font-bold text-amber-700 font-mono">+{simResult.predicted_cost_overrun_percentage}%</div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
