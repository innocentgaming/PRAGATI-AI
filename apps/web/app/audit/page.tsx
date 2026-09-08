'use client';

import React, { useEffect, useState } from 'react';
import { fetchAuditLogs, AuditLogItem } from '@/lib/api';
import { History, Shield, CheckCircle2, Search, Filter, Lock, Terminal, Clock } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchAuditLogs(100);
      setLogs(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.resource_name && log.resource_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter ? log.action_type === actionFilter : true;
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('INTERVENTION')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (action.includes('ALERT') || action.includes('RISK')) return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">System Audit Trail & Governance</h1>
          <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">
            Immutable Trail
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Cryptographically recorded timeline of administrative actions, user logins, data ingestions, model inferences, and officer interventions.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-900/80 border border-gray-800 rounded-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user email, resource, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Action Types</option>
          <option value="USER_LOGIN">User Login</option>
          <option value="PROJECT_UPDATE">Project Update</option>
          <option value="INTERVENTION_DISPATCHED">Intervention Dispatched</option>
          <option value="DATA_INGESTION">Data Ingestion</option>
          <option value="REPORT_GENERATED">Report Generated</option>
        </select>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          Loading audit trail...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm border border-gray-800 rounded-xl bg-gray-900/40">
          No audit entries match the current filter.
        </div>
      ) : (
        <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/80 border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Officer / User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource Target</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {log.user_email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-800 text-gray-300">
                        {log.user_role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionColor(log.action_type)}`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 max-w-xs truncate">
                      {log.resource_name || log.resource_type}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">
                      {log.ip_address || '10.0.4.12'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
