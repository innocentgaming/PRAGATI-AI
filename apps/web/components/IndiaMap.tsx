'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RiskBadge } from '@/components/RiskBadge';
import { MapPin, ExternalLink, Activity, ArrowUpRight, DollarSign, Filter } from 'lucide-react';

interface MapProject {
  id: string;
  project_code: string;
  project_name: string;
  sector: string;
  state: string;
  implementing_agency: string;
  original_cost: number;
  revised_cost: number;
  physical_progress: number;
  financial_progress: number;
  risk_score: number;
  risk_level: string;
  predicted_delay_months: number;
  latitude: number;
  longitude: number;
}

interface IndiaMapProps {
  projects: MapProject[];
}

export const IndiaMap: React.FC<IndiaMapProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<MapProject | null>(projects[0] || null);
  const [selectedRisk, setSelectedRisk] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // Extract unique sectors & states for filters
  const sectors = Array.from(new Set(projects.map((p) => p.sector).filter(Boolean)));
  const states = Array.from(new Set(projects.map((p) => p.state).filter(Boolean)));

  const filteredProjects = projects.filter((p) => {
    const matchesRisk = selectedRisk ? p.risk_level === selectedRisk : true;
    const matchesSector = selectedSector ? p.sector === selectedSector : true;
    const matchesState = selectedState ? p.state === selectedState : true;
    return matchesRisk && matchesSector && matchesState;
  });

  // India Bounding Box: Lat ~ 8.0 to 37.0, Lng ~ 68.0 to 97.0
  const latMin = 7.5;
  const latMax = 37.5;
  const lngMin = 68.0;
  const lngMax = 97.5;

  const projectToXY = (lat: number, lng: number) => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    const y = ((latMax - lat) / (latMax - latMin)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const getPinColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-500 shadow-rose-500/50';
      case 'HIGH': return 'bg-orange-500 shadow-orange-500/50';
      case 'MEDIUM': return 'bg-amber-500 shadow-amber-500/50';
      case 'COMPLETED': return 'bg-blue-500 shadow-blue-500/50';
      default: return 'bg-emerald-500 shadow-emerald-500/50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-950/90 border border-gray-800 rounded-xl text-xs">
        <div className="flex items-center gap-1.5 text-gray-400 font-semibold">
          <Filter className="h-3.5 w-3.5 text-indigo-400" />
          <span>Map Filters:</span>
        </div>

        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
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
          className="px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All States</option>
          {states.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        <span className="text-[11px] text-gray-400 ml-auto font-mono">
          Showing: <strong className="text-white">{filteredProjects.length}</strong> pins
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Visualizer */}
        <div className="lg:col-span-2 relative bg-gray-950/80 border border-gray-800 rounded-2xl p-6 h-[560px] flex items-center justify-center overflow-hidden">
          
          {/* Background Grid & Compass */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          {/* Simplified Vector Map Projection of India */}
          <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Stylized Geo-spatial outline */}
            <path
              d="M 35 12 L 42 10 L 48 18 L 54 22 L 72 26 L 85 28 L 88 36 L 78 42 L 75 52 L 68 56 L 62 65 L 55 78 L 48 90 L 42 82 L 32 68 L 22 55 L 20 40 L 25 30 Z"
              fill="none"
              stroke="#6366F1"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
          </svg>

          {/* Dynamic Project Markers */}
          <div className="absolute inset-0 p-8">
            {filteredProjects.map((proj) => {
              const { x, y } = projectToXY(proj.latitude, proj.longitude);
              const isSelected = selectedProject?.id === proj.id;

              return (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-10 ${
                    isSelected ? 'scale-125 z-20' : 'hover:scale-110'
                  }`}
                >
                  {/* Outer Ping for Critical/High */}
                  {proj.risk_level === 'CRITICAL' && (
                    <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping" />
                  )}
                  
                  {/* Pin Circle */}
                  <div className={`h-5 w-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[9px] font-bold text-white ${getPinColor(proj.risk_level)} ${
                    isSelected ? 'ring-4 ring-indigo-500/50' : ''
                  }`}>
                    <MapPin className="h-3 w-3" />
                  </div>

                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 border border-gray-700 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-30">
                    <div className="font-bold">{proj.project_code}</div>
                    <div className="text-gray-400 text-[10px]">{proj.project_name.substring(0, 24)}...</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-gray-900/90 border border-gray-800 backdrop-blur-md rounded-xl p-3 text-xs flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span>Critical (&gt;80)</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              <span>High (61-80)</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>Medium (31-60)</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Low (≤30)</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* Selected Project 360 Fast Preview */}
        <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          {selectedProject ? (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {selectedProject.project_code}
                  </span>
                  <RiskBadge level={selectedProject.risk_level} score={selectedProject.risk_score} showScore />
                </div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {selectedProject.project_name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedProject.state} • {selectedProject.sector}
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-xl">
                  <div className="text-[11px] text-gray-400">Sanctioned Cost</div>
                  <div className="text-sm font-bold text-gray-200 mt-0.5">
                    ₹{selectedProject.original_cost.toLocaleString()} Cr
                  </div>
                </div>

                <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-xl">
                  <div className="text-[11px] text-gray-400">Revised Cost</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    ₹{selectedProject.revised_cost.toLocaleString()} Cr
                  </div>
                </div>

                <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-xl">
                  <div className="text-[11px] text-gray-400">Physical Progress</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {selectedProject.physical_progress}%
                  </div>
                </div>

                <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-xl">
                  <div className="text-[11px] text-gray-400">Predicted Delay</div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5">
                    +{selectedProject.predicted_delay_months} Mos
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-950/20 border border-indigo-800/30 rounded-xl text-xs space-y-1">
                <div className="font-semibold text-indigo-300">Implementing Agency:</div>
                <div className="text-gray-300">{selectedProject.implementing_agency}</div>
              </div>

              <Link
                href={`/projects/${selectedProject.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/20"
              >
                <span>Open Complete Project 360</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-500">
              Select a project pin on the map to inspect live metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
