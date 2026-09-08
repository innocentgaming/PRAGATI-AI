'use client';

import React, { useEffect, useState } from 'react';
import { fetchSectorAnalytics, fetchMinistryAnalytics, fetchStateAnalytics } from '@/lib/api';
import { 
  BarChart3, TrendingUp, Clock, Building2, 
  MapPin, ShieldAlert, Award, ArrowUpRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, LineChart, Line, CartesianGrid
} from 'recharts';

export default function AnalyticsBenchmarkingPage() {
  const [sectors, setSectors] = useState<any[]>([]);
  const [ministries, setMinistries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [secData, minData, stateData] = await Promise.all([
        fetchSectorAnalytics(),
        fetchMinistryAnalytics(),
        fetchStateAnalytics()
      ]);
      setSectors(secData);
      setMinistries(minData);
      setStates(stateData);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-navy-100 text-navy-800 border border-navy-200">
              Cross-Sector Benchmarking
            </span>
            <span className="text-xs text-slate-400 font-medium">MoSPI DIID Empirical Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Analytics & Inter-Ministry Benchmarking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comparative performance metrics, schedule variance distributions, and cost escalation across sectors and ministries
          </p>
        </div>
      </div>

      {/* Sector Comparison Bar Chart */}
      <div className="gov-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-navy-700" />
              <span>Infrastructure Sector Performance Comparison</span>
            </h3>
            <p className="text-xs text-slate-500">
              Average cost escalation (%) vs schedule delay (months) by infrastructure domain
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectors} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="sector_name" stroke="#64748B" fontSize={11} tickLine={false} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.5rem', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="avg_cost_overrun_pct" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Avg Cost Overrun %" />
              <Bar dataKey="avg_delay_months" fill="#F97316" radius={[4, 4, 0, 0]} name="Avg Delay (Months)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Benchmarking Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ministry Benchmarking */}
        <div className="gov-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-navy-700" />
            <span>Ministry-Level Performance League</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Ministry</th>
                  <th className="py-2.5 px-3">Projects</th>
                  <th className="py-2.5 px-3">Avg Overrun</th>
                  <th className="py-2.5 px-3">Avg Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ministries.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">{m.ministry_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{m.total_projects}</td>
                    <td className="py-3 px-3 font-mono text-amber-700 font-bold">+{m.avg_cost_overrun_pct}%</td>
                    <td className="py-3 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.avg_risk_score > 60 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {m.avg_risk_score}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sector Health Metrics */}
        <div className="gov-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <span>Sector Risk & High-Vulnerability Index</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Sector</th>
                  <th className="py-2.5 px-3">Total Proj</th>
                  <th className="py-2.5 px-3">High Risk Count</th>
                  <th className="py-2.5 px-3">Avg Phys Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sectors.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">{s.sector_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{s.total_projects}</td>
                    <td className="py-3 px-3 font-mono text-rose-600 font-bold">{s.high_risk_count}</td>
                    <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">{s.avg_physical_progress}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
