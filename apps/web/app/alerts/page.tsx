'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAlerts, AlertItem } from '@/lib/api';
import { InterventionModal } from '@/components/InterventionModal';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Clock, 
  Send, ArrowUpRight, Filter, AlertOctagon, ArrowRight
} from 'lucide-react';

export default function EarlyWarningCenter() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedInterventionAlert, setSelectedInterventionAlert] = useState<AlertItem | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchAlerts(selectedSeverity, selectedStatus);
      setAlerts(data);
      setLoading(false);
    }
    load();
  }, [selectedSeverity, selectedStatus]);

  const handleAcknowledge = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/alerts/${id}/acknowledge`, { method: 'POST' });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/alerts/${id}/resolve`, { method: 'POST' });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Early Warning Intelligence Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              Automated Triage
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Proactive early warnings triggered across Central Sector projects before budget escalation occurs
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="gov-card p-3.5 flex flex-wrap items-center gap-3">
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-700 focus:outline-none focus:border-blue-600"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical Severity</option>
          <option value="HIGH">High Severity</option>
          <option value="MEDIUM">Medium Severity</option>
          <option value="LOW">Low Severity</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-700 focus:outline-none focus:border-blue-600"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open (Unresolved)</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <div className="text-xs text-slate-500 font-mono ml-auto">
          Active Alerts: <strong className="text-slate-900">{alerts.length}</strong>
        </div>
      </div>

      {/* Alert Cards Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading early warnings...</div>
        ) : alerts.length === 0 ? (
          <div className="gov-card p-12 text-center text-xs text-slate-500">
            No early warnings match the selected criteria.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`gov-card p-4 space-y-2.5 border-l-4 ${
                alert.severity === 'CRITICAL' ? 'border-l-rose-600' :
                alert.severity === 'HIGH' ? 'border-l-orange-500' :
                'border-l-amber-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                    alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    {alert.severity}
                  </span>
                  <Link href={`/projects/${alert.project_id}`} className="font-mono text-xs font-bold text-blue-700 hover:underline">
                    {alert.project_code}
                  </Link>
                  <span className="text-xs font-bold text-slate-900">
                    {alert.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.2 rounded text-[10px] font-semibold ${
                    alert.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                    alert.status === 'ACKNOWLEDGED' ? 'bg-blue-100 text-blue-700' :
                    'bg-rose-100 text-rose-700 font-bold'
                  }`}>
                    {alert.status}
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono">
                    {alert.created_at?.substring(0, 10)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {alert.description}
              </p>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-slate-700">
                  <strong className="text-blue-700">Recommended Action: </strong>
                  <span>{alert.recommended_action}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {alert.status === 'OPEN' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold rounded transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-semibold rounded transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedInterventionAlert(alert)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-semibold rounded shadow-sm transition-colors"
                  >
                    <Send className="h-3 w-3" />
                    <span>Intervene</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Intervention Modal */}
      {selectedInterventionAlert && (
        <InterventionModal
          isOpen={!!selectedInterventionAlert}
          onClose={() => setSelectedInterventionAlert(null)}
          projectId={selectedInterventionAlert.project_id}
          projectCode={selectedInterventionAlert.project_code || 'PRJ'}
          projectName={selectedInterventionAlert.project_name || 'Infrastructure Project'}
          defaultAction={selectedInterventionAlert.recommended_action}
          onSuccess={() => {
            handleAcknowledge(selectedInterventionAlert.id);
          }}
        />
      )}

    </div>
  );
}
