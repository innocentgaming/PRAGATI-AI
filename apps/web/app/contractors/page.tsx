'use client';

import React, { useEffect, useState } from 'react';
import { fetchContractors, ContractorItem } from '@/lib/api';
import { Users, Star, AlertTriangle, ShieldCheck, Clock, FileCheck, ArrowUpRight, Search } from 'lucide-react';
import Link from 'next/link';

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<ContractorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchContractors();
      setContractors(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredContractors = contractors.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 4.0) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (rating >= 3.0) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Contractors & Vendor Intelligence</h1>
          <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">
            Vendor Scorecard
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Historical execution performance, SLA compliance, dispute frequency, and safety tracking for major national infrastructure contractors.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 p-4 bg-gray-900/80 border border-gray-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contractor name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Contractors Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          Loading contractor intelligence...
        </div>
      ) : filteredContractors.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm border border-gray-800 rounded-xl bg-gray-900/40">
          No contractors match the search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContractors.map((c) => (
            <div
              key={c.id}
              className="p-5 bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-xl flex flex-col justify-between space-y-4 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                    {c.code}
                  </span>
                  <div className={`px-2 py-0.5 text-xs font-bold rounded border flex items-center gap-1 ${getRatingColor(c.performance_rating)}`}>
                    <Star className="h-3 w-3 fill-current" />
                    <span>{c.performance_rating.toFixed(1)} / 5.0</span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white leading-tight">{c.name}</h3>
                <p className="text-xs text-gray-400 mt-1">CIN: {c.cin_number || 'N/A'}</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-gray-900/60 rounded-lg">
                  <div className="text-gray-400">Total Contract Value</div>
                  <div className="font-semibold text-white mt-0.5">₹{c.total_contract_value.toLocaleString()} Cr</div>
                </div>
                <div className="p-2.5 bg-gray-900/60 rounded-lg">
                  <div className="text-gray-400">Active Packages</div>
                  <div className="font-semibold text-indigo-400 mt-0.5">{c.active_projects_count} Active</div>
                </div>
                <div className="p-2.5 bg-gray-900/60 rounded-lg">
                  <div className="text-gray-400">Avg Schedule Delay</div>
                  <div className={`font-semibold mt-0.5 ${c.avg_delay_months > 6 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {c.avg_delay_months} Months
                  </div>
                </div>
                <div className="p-2.5 bg-gray-900/60 rounded-lg">
                  <div className="text-gray-400">Disputes / Claims</div>
                  <div className={`font-semibold mt-0.5 ${c.dispute_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {c.dispute_count} Recorded
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-900">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {c.safety_incident_count} Safety Incidents
                </span>
                <Link
                  href={`/projects?search=${encodeURIComponent(c.name)}`}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <span>View Projects</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
