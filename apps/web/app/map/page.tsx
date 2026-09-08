'use client';

import React, { useEffect, useState } from 'react';
import { fetchMapProjects, fetchMapStates } from '@/lib/api';
import { IndiaMap } from '@/components/IndiaMap';
import { MapPin, Layers, Filter } from 'lucide-react';

export default function IndiaMapPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [projData, stateData] = await Promise.all([
        fetchMapProjects(),
        fetchMapStates()
      ]);
      setProjects(projData);
      setStates(stateData);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            National Infrastructure GIS Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial visualization of Central Sector projects across Indian States & Union Territories
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Loading Geospatial Infrastructure Map...</div>
      ) : (
        <IndiaMap projects={projects} />
      )}

      {/* State-Level Density Table */}
      <div className="gov-card p-5 space-y-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            State-wise Project Density & Average Risk Score
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Regional infrastructure distribution and predictive vulnerability index
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {states.map((st) => (
            <div key={st.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>{st.name}</span>
                <span className="font-mono text-blue-700 text-[11px]">{st.code}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Projects: <strong className="text-slate-800">{st.project_count}</strong></span>
                <span>Avg Risk: <strong className={st.avg_risk_score > 60 ? 'text-rose-700' : 'text-emerald-700'}>{st.avg_risk_score}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
