'use client';

import React, { useEffect, useState } from 'react';
import { fetchDepartments, DepartmentItem } from '@/lib/api';
import { Building2, TrendingUp, AlertTriangle, Clock, ArrowUpRight, DollarSign, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchDepartments();
      setDepartments(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const totalBudget = departments.reduce((sum, d) => sum + d.total_budget, 0);
  const totalExpenditure = departments.reduce((sum, d) => sum + d.total_expenditure, 0);
  const totalProjects = departments.reduce((sum, d) => sum + d.project_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Ministries & Implementing Departments</h1>
          <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">
            Portfolio View
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Comparative capital allocation, expenditure utilization, average delay, and high-risk project counts across Union Ministries.
        </p>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total Monitored Departments</span>
            <Building2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{departments.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">{totalProjects} active national projects</div>
        </div>

        <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Sanctioned Outlay</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">₹{totalBudget.toLocaleString()} Cr</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">
            ₹{totalExpenditure.toLocaleString()} Cr utilized ({Math.round((totalExpenditure / (totalBudget || 1)) * 100)}%)
          </div>
        </div>

        <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">High-Risk Portfolios</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {departments.reduce((sum, d) => sum + d.high_risk_count, 0)} Projects
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Flagged for executive IPMD review</div>
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          Loading departmental data...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const utilRate = Math.round((dept.total_expenditure / (dept.total_budget || 1)) * 100);

            return (
              <div
                key={dept.id}
                className="p-5 bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-xl flex flex-col justify-between space-y-4 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                      {dept.code}
                    </span>
                    {dept.high_risk_count > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {dept.high_risk_count} Critical
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white">{dept.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{dept.ministry_name || 'Government of India'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-gray-900/60 rounded-lg">
                    <div className="text-gray-400">Total Outlay</div>
                    <div className="font-semibold text-white mt-0.5">₹{dept.total_budget.toLocaleString()} Cr</div>
                  </div>
                  <div className="p-2.5 bg-gray-900/60 rounded-lg">
                    <div className="text-gray-400">Expenditure</div>
                    <div className="font-semibold text-emerald-400 mt-0.5">{utilRate}% Utilized</div>
                  </div>
                  <div className="p-2.5 bg-gray-900/60 rounded-lg">
                    <div className="text-gray-400">Active Projects</div>
                    <div className="font-semibold text-white mt-0.5">{dept.project_count} Projects</div>
                  </div>
                  <div className="p-2.5 bg-gray-900/60 rounded-lg">
                    <div className="text-gray-400">Avg Schedule Delay</div>
                    <div className={`font-semibold mt-0.5 ${dept.avg_delay > 6 ? 'text-amber-400' : 'text-gray-300'}`}>
                      {dept.avg_delay} Mos
                    </div>
                  </div>
                </div>

                <Link
                  href={`/projects?ministry=${encodeURIComponent(dept.name)}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-900 hover:bg-gray-800 text-xs font-medium text-gray-200 hover:text-white rounded-lg transition-colors border border-gray-800"
                >
                  <span>Explore Department Projects</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
