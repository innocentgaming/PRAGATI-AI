'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchProjects, ProjectSummary } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import { 
  Search, Filter, LayoutGrid, Table as TableIcon, 
  ArrowUpRight, Building2, MapPin, Calendar, Clock, DollarSign, Download
} from 'lucide-react';

export default function ProjectExplorer() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchProjects({
        risk_level: selectedRisk || undefined,
        status: selectedStatus || undefined,
        search: search || undefined
      });
      setProjects(data);
      setLoading(false);
    }
    const timeout = setTimeout(load, 200);
    return () => clearTimeout(timeout);
  }, [search, selectedRisk, selectedStatus]);

  const sectors = Array.from(new Set(projects.map((p) => p.sector_name).filter(Boolean)));
  const states = Array.from(new Set(projects.map((p) => p.state_name).filter(Boolean)));

  const filteredProjects = projects.filter((p) => {
    const matchesSector = selectedSector ? p.sector_name === selectedSector : true;
    const matchesState = selectedState ? p.state_name === selectedState : true;
    return matchesSector && matchesState;
  });

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Central Sector Project Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive repository of major infrastructure projects monitored by MoSPI IPMD
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors ${viewMode === 'table' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="gov-card p-3.5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project code, title, implementing agency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-700 focus:outline-none focus:border-blue-600"
        >
          <option value="">All Risk Tiers</option>
          <option value="CRITICAL">Critical Risk (&gt;80)</option>
          <option value="HIGH">High Risk (61-80)</option>
          <option value="MEDIUM">Medium Risk (31-60)</option>
          <option value="LOW">Low Risk (≤30)</option>
        </select>

        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-700 focus:outline-none focus:border-blue-600"
        >
          <option value="">All Sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-700 focus:outline-none focus:border-blue-600"
        >
          <option value="">All States</option>
          {states.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-700 focus:outline-none focus:border-blue-600"
        >
          <option value="">All Statuses</option>
          <option value="ON_TRACK">On Track</option>
          <option value="DELAYED">Delayed</option>
          <option value="CRITICAL">Critical</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <div className="text-xs text-slate-500 font-mono ml-auto">
          Showing: <strong className="text-slate-900">{filteredProjects.length}</strong> Projects
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-2.5 px-3.5">Project ID</th>
                  <th className="py-2.5 px-3.5">Project Name</th>
                  <th className="py-2.5 px-3.5">Sector & State</th>
                  <th className="py-2.5 px-3.5">Investment (₹ Cr)</th>
                  <th className="py-2.5 px-3.5">Physical Progress</th>
                  <th className="py-2.5 px-3.5">Financial Progress</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Risk Score</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">
                      {proj.project_code}
                    </td>
                    <td className="py-2.5 px-3.5 max-w-xs">
                      <Link href={`/projects/${proj.id}`} className="font-semibold text-slate-900 hover:text-blue-700 block truncate">
                        {proj.project_name}
                      </Link>
                      <div className="text-[10px] text-slate-400 truncate">{proj.implementing_agency}</div>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600">
                      <div className="font-medium text-slate-800">{proj.sector_name}</div>
                      <div className="text-[10px] text-slate-400">{proj.state_name}</div>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono">
                      <div className="font-bold text-slate-800">₹{proj.revised_cost.toLocaleString()} Cr</div>
                      <div className="text-[10px] text-slate-400">Orig: ₹{proj.original_cost.toLocaleString()} Cr</div>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${proj.physical_progress}%` }} />
                        </div>
                        <span className="font-bold text-emerald-700">{proj.physical_progress}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${proj.financial_progress}%` }} />
                        </div>
                        <span className="font-bold text-blue-700">{proj.financial_progress}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        proj.project_status === 'CRITICAL' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                        proj.project_status === 'DELAYED' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        proj.project_status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {proj.project_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <RiskBadge level={proj.risk_level || 'LOW'} score={proj.overall_risk_score} showScore />
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <Link
                        href={`/projects/${proj.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-700 hover:text-white text-slate-700 border border-slate-300 rounded text-[11px] font-semibold transition-colors"
                      >
                        <span>Project 360</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => (
            <Link
              key={proj.id}
              href={`/projects/${proj.id}`}
              className="gov-card gov-card-hover p-4 flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {proj.project_code}
                  </span>
                  <RiskBadge level={proj.risk_level || 'LOW'} score={proj.overall_risk_score} showScore />
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                  {proj.project_name}
                </h3>

                <div className="text-xs text-slate-500 space-y-0.5">
                  <div>Agency: <strong className="text-slate-700">{proj.implementing_agency}</strong></div>
                  <div>Location: <strong className="text-slate-700">{proj.state_name} • {proj.sector_name}</strong></div>
                </div>

                <div className="space-y-1 pt-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Physical / Financial:</span>
                    <span className="font-mono font-bold text-slate-800">{proj.physical_progress}% / {proj.financial_progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${proj.physical_progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Revised Cost</div>
                  <div className="font-mono font-bold text-slate-900">₹{proj.revised_cost.toLocaleString()} Cr</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Delay Forecast</div>
                  <div className="font-mono font-bold text-rose-700">+{proj.predicted_delay_months || 0} Mos</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
