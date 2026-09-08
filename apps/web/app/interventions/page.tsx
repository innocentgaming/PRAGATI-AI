'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchInterventions, InterventionItem } from '@/lib/api';
import { 
  ClipboardCheck, CheckCircle2, Clock, 
  UserCheck, ArrowUpRight, Send, Plus, Filter,
  Building2, ShieldAlert
} from 'lucide-react';

export default function InterventionTrackingPage() {
  const [interventions, setInterventions] = useState<InterventionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchInterventions();
      setInterventions(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`http://localhost:8000/api/interventions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setInterventions(prev => prev.map(it => it.id === id ? { ...it, status: newStatus } : it));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">IN PROGRESS</span>;
      case 'EVALUATING':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-navy-50 text-navy-700 border border-navy-200">EVALUATING</span>;
      default:
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">PLANNED</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-navy-100 text-navy-800 border border-navy-200">
              Closed-Loop Governance
            </span>
            <span className="text-xs text-slate-400 font-medium">MoSPI Executive Directives</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Prescriptive Intervention Tracking Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track executive directives, assigned monitoring officers, and outcome resolution metrics
          </p>
        </div>

        <Link
          href="/projects"
          className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Project Directive</span>
        </Link>
      </div>

      {/* Interventions Table / Kanban */}
      <div className="gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">AI Recommended Action</th>
                <th className="py-3 px-4">Officer Action Directive</th>
                <th className="py-3 px-4">Assigned Officer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    Loading interventions ledger...
                  </td>
                </tr>
              ) : interventions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                    No active interventions recorded. Create an intervention from any Project 360 or Early Warning Alert.
                  </td>
                </tr>
              ) : (
                interventions.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link href={`/projects/${it.project_id}`} className="block hover:text-navy-700">
                        <span className="font-mono font-bold text-navy-800 mr-1.5">{it.project_code}</span>
                        <div className="font-semibold text-slate-900 line-clamp-1">{it.project_name}</div>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      {it.recommended_action}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-medium max-w-xs">
                      {it.officer_action}
                    </td>
                    <td className="py-3.5 px-4 text-navy-900 font-semibold whitespace-nowrap">
                      {it.assigned_to}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(it.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs">
                      {it.outcome || 'Pending verification'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <select
                        value={it.status}
                        onChange={(e) => handleUpdateStatus(it.id, e.target.value)}
                        className="bg-white border border-slate-300 text-slate-800 text-[11px] rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-navy-600 shadow-sm"
                      >
                        <option value="PLANNED">Planned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="EVALUATING">Evaluating</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
