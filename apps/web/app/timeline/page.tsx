'use client';

import React, { useEffect, useState } from 'react';
import { fetchProjects, ProjectSummary } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ChevronRight, Filter, Search, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

export default function TimelinePage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.project_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter ? p.sector_name === sectorFilter : true;
    const matchesStatus = statusFilter ? p.project_status === statusFilter : true;
    return matchesSearch && matchesSector && matchesStatus;
  });

  const sectors = Array.from(new Set(projects.map((p) => p.sector_name).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Milestone & Schedule Timeline</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">
              Gantt View
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Visual milestone tracker, critical path slippage monitoring, and projected delay analysis across national projects.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-900/80 border border-gray-800 rounded-xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search project code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="ON_TRACK">On Track</option>
          <option value="DELAYED">Delayed</option>
          <option value="CRITICAL">Critical</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Timeline Gantt List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          Loading milestone timelines...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm border border-gray-800 rounded-xl bg-gray-900/40">
          No projects match the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => {
            const delay = project.predicted_delay_months || 0;
            const progress = project.physical_progress || 0;

            return (
              <div
                key={project.id}
                className="p-4 bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-xl transition-all space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                      {project.project_code}
                    </span>
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors"
                    >
                      {project.project_name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {project.sector_name} • {project.state_name}
                    </span>
                    <RiskBadge level={project.risk_level || 'LOW'} score={project.overall_risk_score} showScore />
                  </div>
                </div>

                {/* Progress & Milestone Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Physical Progress: <b className="text-white">{progress}%</b></span>
                    <span>
                      Predicted Delay:{' '}
                      <b className={delay > 12 ? 'text-rose-400' : delay > 6 ? 'text-amber-400' : 'text-emerald-400'}>
                        {delay > 0 ? `+${delay} Months` : 'On Schedule'}
                      </b>
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="relative h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                    <div
                      className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                    {delay > 0 && (
                      <div
                        className="absolute top-0 bottom-0 bg-rose-500/30 border-l border-rose-500 border-dashed"
                        style={{ left: `${Math.min(95, progress)}%`, width: `${Math.min(30, delay * 2)}%` }}
                        title={`Estimated schedule slippage: ${delay} mos`}
                      />
                    )}
                  </div>
                </div>

                {/* Quick Meta Footer */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-900">
                  <div className="flex items-center gap-4">
                    <span>Agency: <span className="text-gray-300">{project.implementing_agency}</span></span>
                    <span>Cost: <span className="text-gray-300">₹{project.revised_cost || project.original_cost} Cr</span></span>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                  >
                    <span>View Project Gantt</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
