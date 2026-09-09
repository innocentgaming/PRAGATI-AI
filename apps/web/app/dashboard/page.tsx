'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchExecutiveKPIs, fetchProjects, fetchSectorAnalytics, ProjectSummary, ExecutiveKPIs } from '@/lib/api';

export default function ExecutiveDashboard() {
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastProjectName, setToastProjectName] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [kpiData, projData, secData] = await Promise.all([
        fetchExecutiveKPIs(),
        fetchProjects(),
        fetchSectorAnalytics(),
      ]);
      setKpis(kpiData);
      setProjects(projData);
      setSectors(secData);
      setLoading(false);
    }
    loadData();
  }, []);

  const triggerInterventionModal = (projectName: string) => {
    setToastProjectName(projectName);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3200);
  };

  const totalProjects = kpis?.total_projects || 0;
  const lowRiskCount = kpis?.low_risk_projects || 0;
  const mediumRiskCount = kpis?.medium_risk_projects || 0;
  const criticalRiskCount = kpis?.critical_projects || 0;
  const highRiskCount = Math.max(0, (kpis?.high_risk_projects || 0) - criticalRiskCount);

  // Calculate percentages for the donut chart based on total projects
  const getDashArray = (count: number) => {
    if (totalProjects === 0) return 0;
    const percentage = count / totalProjects;
    return percentage * 219.9; // 219.9 is the circumference of r=35
  };

  const lowRiskDash = getDashArray(lowRiskCount);
  const mediumRiskDash = getDashArray(mediumRiskCount);
  const highRiskDash = getDashArray(highRiskCount);
  const criticalRiskDash = getDashArray(criticalRiskCount);

  const formatCr = (val: number) => `₹${(val / 1000).toFixed(1)}k Cr`;

  return (
    <div className="flex flex-col w-full gap-unit-lg pb-unit-2xl">
      
      {/* Executive Hero & Title Banner */}
      <section className="flex flex-col gap-unit-md bg-surface-container-lowest p-unit-lg rounded-xl shadow-sm">
        <div className="flex items-center justify-between gap-unit-xs">
          <div className="inline-flex items-center gap-unit-xs px-unit-sm py-unit-2xs rounded-full bg-surface-container text-secondary font-label-sm text-label-sm tracking-wide uppercase">
            <span className="material-symbols-outlined text-[14px]">assured_workload</span>
            <span>MoSPI IPMD • PAIMANA / OCMS</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-risk-low-subtle text-risk-low font-label-sm text-label-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse"></span>
            <span>v2.0 Blended • Live</span>
          </div>
        </div>
        <div className="flex flex-col gap-unit-2xs">
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">
            National Infrastructure Executive Dashboard
          </h1>
          <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
            Central Sector Projects (≥ ₹150 Cr) • Machine Learning Predictive Intelligence System
          </p>
        </div>
        
        {/* AI Quick Action */}
        <Link 
          href="/assistant"
          className="w-full flex items-center justify-between px-unit-lg py-unit-md rounded-xl bg-gradient-to-r from-secondary to-secondary-container text-on-secondary shadow-md hover:shadow-lg transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center gap-unit-sm">
            <div className="w-8 h-8 rounded-lg bg-on-secondary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-secondary">Ask PRAGATI Assistant</span>
              <span className="font-label-sm text-label-sm text-on-secondary/80">Query cost forecasts, bottlenecks & delays</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[22px] transition-transform group-hover:translate-x-1">north_east</span>
        </Link>
      </section>

      {/* High-Impact Executive KPI Grid (2-column layout) */}
      <section className="grid grid-cols-2 gap-kpi-grid-gutter">
        {/* 1. Total Projects */}
        <div className="flex flex-col justify-between p-unit-md rounded-xl bg-surface-container-low shadow-sm">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-text-secondary uppercase">Total Monitored</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">apartment</span>
          </div>
          <div className="my-unit-xs">
            <span className="font-kpi-value text-kpi-value text-text-primary tracking-tight">{totalProjects}</span>
          </div>
          <div className="flex items-center gap-1 font-body-sm text-body-sm text-secondary font-medium">
            <span>{formatCr(kpis?.total_original_cost || 0)}</span>
            <span className="text-text-tertiary">Outlay</span>
          </div>
        </div>

        {/* 2. Cost Exposure */}
        <div className="flex flex-col justify-between p-unit-md rounded-xl bg-risk-critical-subtle shadow-sm">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-risk-critical uppercase">Cost Exposure</span>
            <span className="material-symbols-outlined text-risk-critical text-[20px]">trending_up</span>
          </div>
          <div className="my-unit-xs">
            <span className="font-kpi-value text-kpi-value text-risk-critical tracking-tight">{formatCr(kpis?.predicted_cost_exposure || 0)}</span>
          </div>
          <div className="inline-flex items-center self-start px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
            <span>Forecast Overrun</span>
          </div>
        </div>

        {/* 3. Critical Risk (>80) */}
        <div className="flex flex-col justify-between p-unit-md rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-text-secondary uppercase">Critical (&gt;80)</span>
            <span className="material-symbols-outlined text-risk-critical text-[20px]">emergency</span>
          </div>
          <div className="my-unit-xs">
            <span className="font-kpi-value text-kpi-value text-risk-critical">{criticalRiskCount}</span>
          </div>
          <div className="inline-flex items-center self-start px-2 py-0.5 rounded-full bg-risk-critical-subtle text-risk-critical font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-critical mr-1 animate-ping"></span>
            <span>Urgent Review</span>
          </div>
        </div>

        {/* 4. High Risk (61-80) */}
        <div className="flex flex-col justify-between p-unit-md rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-text-secondary uppercase">High Risk (61-80)</span>
            <span className="material-symbols-outlined text-risk-high text-[20px]">warning</span>
          </div>
          <div className="my-unit-xs">
            <span className="font-kpi-value text-kpi-value text-risk-high">{highRiskCount}</span>
          </div>
          <div className="inline-flex items-center self-start px-2 py-0.5 rounded-full bg-risk-high-subtle text-risk-high font-label-sm text-label-sm font-semibold">
            <span>Escalated Tier</span>
          </div>
        </div>

        {/* 5. Medium Risk (31-60) */}
        <div className="flex flex-col justify-between p-unit-md rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-text-secondary uppercase">Medium Risk</span>
            <span className="material-symbols-outlined text-risk-medium text-[20px]">schedule</span>
          </div>
          <div className="my-unit-xs">
            <span className="font-kpi-value text-kpi-value text-text-primary">{mediumRiskCount}</span>
          </div>
          <div className="inline-flex items-center self-start px-2 py-0.5 rounded-full bg-risk-medium-subtle text-text-secondary font-label-sm text-label-sm">
            <span>Watchlist</span>
          </div>
        </div>

        {/* 6. Low Risk (≤30) */}
        <div className="flex flex-col justify-between p-unit-md rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-text-secondary uppercase">Low Risk (≤30)</span>
            <span className="material-symbols-outlined text-risk-low text-[20px]">check_circle</span>
          </div>
          <div className="my-unit-xs">
            <span className="font-kpi-value text-kpi-value text-risk-low">{lowRiskCount}</span>
          </div>
          <div className="inline-flex items-center self-start px-2 py-0.5 rounded-full bg-risk-low-subtle text-risk-low font-label-sm text-label-sm">
            <span>On Schedule</span>
          </div>
        </div>
      </section>

      {/* Active Alerts Micro-Bar */}
      <div className="flex items-center justify-between px-unit-md py-unit-sm rounded-xl bg-surface-container-low shadow-sm">
        <div className="flex items-center gap-unit-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-critical opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-risk-critical"></span>
          </span>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-text-primary">{kpis?.active_alerts_count || 0} Active System Alerts</span>
            <span className="font-body-sm text-body-sm text-text-secondary">Auto-triggered by milestone slippage</span>
          </div>
        </div>
        <Link href="/alerts" className="px-2.5 py-1 rounded-lg bg-surface-container-highest text-secondary font-label-sm text-label-sm uppercase">Inspect</Link>
      </div>

      {/* National Infrastructure Risk Distribution */}
      <section className="flex flex-col p-unit-lg rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="flex flex-col gap-1 mb-unit-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-text-primary tracking-tight">Portfolio Risk Distribution</h2>
            <span className="material-symbols-outlined text-text-tertiary text-[20px]">donut_large</span>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary">Segmented by composite 0–100 multi-factor risk score</p>
        </div>

        {/* Donut Chart & Stat Center */}
        <div className="relative flex items-center justify-center my-unit-sm">
          <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
            {/* Low Risk */}
            <circle cx="50" cy="50" fill="transparent" r="35" stroke="#10B981" strokeWidth="14" strokeDasharray={`${lowRiskDash} 219.9`} strokeDashoffset="0"></circle>
            {/* Medium Risk */}
            <circle cx="50" cy="50" fill="transparent" r="35" stroke="#EAB308" strokeWidth="14" strokeDasharray={`${mediumRiskDash} 219.9`} strokeDashoffset={`-${lowRiskDash}`}></circle>
            {/* High Risk */}
            <circle cx="50" cy="50" fill="transparent" r="35" stroke="#F59E0B" strokeWidth="14" strokeDasharray={`${highRiskDash} 219.9`} strokeDashoffset={`-${lowRiskDash + mediumRiskDash}`}></circle>
            {/* Critical Risk */}
            <circle cx="50" cy="50" fill="transparent" r="35" stroke="#EF4444" strokeWidth="14" strokeDasharray={`${criticalRiskDash} 219.9`} strokeDashoffset={`-${lowRiskDash + mediumRiskDash + highRiskDash}`}></circle>
          </svg>
          
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="font-kpi-value text-kpi-value text-text-primary">{totalProjects}</span>
            <span className="font-label-sm text-label-sm text-text-tertiary uppercase tracking-widest">Total Units</span>
          </div>
        </div>

        {/* Interactive Grid Legend */}
        <div className="grid grid-cols-2 gap-unit-sm mt-unit-sm">
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-risk-low"></span>
              <span className="font-label-sm text-label-sm text-text-secondary">Low (≤30)</span>
            </div>
            <span className="font-numeric-mono text-numeric-mono text-text-primary">{lowRiskCount} <span className="text-text-tertiary font-normal">({totalProjects ? Math.round((lowRiskCount/totalProjects)*100) : 0}%)</span></span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-risk-medium"></span>
              <span className="font-label-sm text-label-sm text-text-secondary">Medium</span>
            </div>
            <span className="font-numeric-mono text-numeric-mono text-text-primary">{mediumRiskCount} <span className="text-text-tertiary font-normal">({totalProjects ? Math.round((mediumRiskCount/totalProjects)*100) : 0}%)</span></span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-risk-high"></span>
              <span className="font-label-sm text-label-sm text-text-secondary">High (61-80)</span>
            </div>
            <span className="font-numeric-mono text-numeric-mono text-text-primary">{highRiskCount} <span className="text-text-tertiary font-normal">({totalProjects ? Math.round((highRiskCount/totalProjects)*100) : 0}%)</span></span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-risk-critical"></span>
              <span className="font-label-sm text-label-sm text-text-secondary">Critical (&gt;80)</span>
            </div>
            <span className="font-numeric-mono text-numeric-mono text-risk-critical">{criticalRiskCount} <span className="text-text-tertiary font-normal">({totalProjects ? Math.round((criticalRiskCount/totalProjects)*100) : 0}%)</span></span>
          </div>
        </div>
      </section>

      {/* Average Cost Overrun Escalation by Sector */}
      <section className="flex flex-col p-unit-lg rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between mb-unit-xs">
          <h2 className="font-headline-md text-headline-md text-text-primary tracking-tight">Cost Escalation by Sector</h2>
          <Link href="/analytics" className="flex items-center gap-0.5 font-label-md text-label-md text-secondary hover:underline">
            <span>Full Analytics</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>
        <p className="font-body-sm text-body-sm text-text-secondary mb-unit-md">Comparative budget deviation across primary central domains</p>
        
        {/* Sector Progress Bars */}
        <div className="flex flex-col gap-unit-md">
          {sectors.slice(0, 4).map((sector, i) => {
            const icons = ['train', 'add_road', 'local_gas_station', 'bolt'];
            const colors = ['bg-risk-critical', 'bg-risk-high', 'bg-risk-medium', 'bg-secondary'];
            const textColors = ['text-risk-critical', 'text-risk-high', 'text-risk-medium', 'text-secondary'];
            const maxVal = Math.max(...sectors.map(s => s.avg_cost_overrun_pct));
            const widthPct = maxVal > 0 ? (sector.avg_cost_overrun_pct / maxVal) * 100 : 0;
            return (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-body-sm font-body-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-text-secondary text-[18px]">{icons[i % icons.length]}</span>
                    <span className="text-text-primary font-medium">{sector.sector_name}</span>
                  </div>
                  <span className={`font-numeric-mono text-numeric-mono ${textColors[i % textColors.length]}`}>+{sector.avg_cost_overrun_pct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${widthPct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* National Cost Overrun & Schedule Delay Trajectory (SVG Chart) */}
      <section className="flex flex-col p-unit-lg rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="flex flex-col gap-1 mb-unit-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-text-tertiary">Predictive ML Modeling</span>
          <h2 className="font-headline-md text-headline-md text-text-primary tracking-tight">Escalation & Delay Trajectory</h2>
          <p className="font-body-sm text-body-sm text-text-secondary">Historical escalation vs avg milestone lag across portfolios</p>
        </div>
        
        <div className="relative w-full h-52 mt-unit-xs">
          <svg className="w-full h-full" fill="none" viewBox="0 0 320 180">
            <defs>
              <linearGradient id="costGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25"></stop>
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0"></stop>
              </linearGradient>
              <linearGradient id="delayGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2"></stop>
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0"></stop>
              </linearGradient>
            </defs>
            <line opacity="0.5" stroke="#CBD5E1" strokeDasharray="3 3" x1="30" x2="310" y1="20" y2="20"></line>
            <line opacity="0.5" stroke="#CBD5E1" strokeDasharray="3 3" x1="30" x2="310" y1="60" y2="60"></line>
            <line opacity="0.5" stroke="#CBD5E1" strokeDasharray="3 3" x1="30" x2="310" y1="100" y2="100"></line>
            <line opacity="0.5" stroke="#CBD5E1" strokeDasharray="3 3" x1="30" x2="310" y1="140" y2="140"></line>
            
            <text fill="#94A3B8" fontFamily="Inter" fontSize="9" textAnchor="end" x="24" y="24">60k</text>
            <text fill="#94A3B8" fontFamily="Inter" fontSize="9" textAnchor="end" x="24" y="64">45k</text>
            <text fill="#94A3B8" fontFamily="Inter" fontSize="9" textAnchor="end" x="24" y="104">30k</text>
            <text fill="#94A3B8" fontFamily="Inter" fontSize="9" textAnchor="end" x="24" y="144">15k</text>
            
            <path d="M 35 110 Q 100 95 160 82 T 290 68 L 290 150 L 35 150 Z" fill="url(#costGrad)"></path>
            <path d="M 35 110 Q 100 95 160 82 T 290 68" fill="none" stroke="#EF4444" strokeLinecap="round" strokeWidth="3"></path>
            
            <path d="M 35 90 Q 110 75 180 70 T 290 55 L 290 150 L 35 150 Z" fill="url(#delayGrad)"></path>
            <path d="M 35 90 Q 110 75 180 70 T 290 55" fill="none" stroke="#F59E0B" strokeDasharray="5 3" strokeLinecap="round" strokeWidth="2.5"></path>
            
            <circle cx="290" cy="68" fill="#EF4444" r="4.5" stroke="#FFFFFF" strokeWidth="2"></circle>
            <circle cx="290" cy="55" fill="#F59E0B" r="4.5" stroke="#FFFFFF" strokeWidth="2"></circle>
            
            <text fill="#94A3B8" fontFamily="Inter" fontSize="9" x="40" y="166">Nov 2025</text>
            <text fill="#94A3B8" fontFamily="Inter" fontSize="9" textAnchor="middle" x="150" y="166">Jan 2026</text>
            <text fill="#0051d5" fontFamily="Inter" fontSize="9" fontWeight="600" textAnchor="middle" x="285" y="166">Mar 2026 (Live)</text>
          </svg>
        </div>
        
        <div className="flex items-center justify-around pt-unit-sm mt-unit-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 rounded-full bg-risk-critical"></span>
            <span className="font-label-sm text-label-sm text-text-secondary">Cost Overrun (₹ Cr)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 rounded-full bg-risk-high"></span>
            <span className="font-label-sm text-label-sm text-text-secondary">Avg Delay (Months)</span>
          </div>
        </div>
      </section>

      {/* Geospatial Strategic Banner */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-navy-deep to-navy-surface text-on-primary p-unit-lg shadow-md">
        <div className="relative z-10 flex flex-col gap-unit-xs">
          <div className="flex items-center gap-1.5 text-surface-dim">
            <span className="material-symbols-outlined text-[16px]">public</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Spatial Intelligence</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-primary">Critical Portfolios by Ministry & State</h3>
          <p className="font-body-sm text-body-sm text-slate-300 mb-unit-xs">Inter-ministerial GIS mapping with high density capital outlay in Rajasthan, Kerala, and UP.</p>
          <Link href="/map" className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-unit-md rounded-lg bg-surface-container-lowest text-text-primary font-headline-sm text-headline-sm shadow hover:bg-surface-container transition-colors active:scale-[0.98]">
            <span className="material-symbols-outlined text-secondary text-[18px]">travel_explore</span>
            <span>Open National Geospatial Map</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Top Infrastructure Projects Requiring Immediate Intervention */}
      <section className="flex flex-col gap-unit-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-unit-xs">
            <div className="w-7 h-7 rounded-lg bg-risk-critical-subtle flex items-center justify-center text-risk-critical">
              <span className="material-symbols-outlined text-[18px]">crisis_alert</span>
            </div>
            <div className="flex flex-col">
              <h2 className="font-headline-sm text-headline-sm text-text-primary tracking-tight">Immediate Interventions</h2>
              <span className="font-label-sm text-label-sm text-text-tertiary">Prioritized by Risk Score & Delay Factor</span>
            </div>
          </div>
          <Link href="/projects" className="font-label-md text-label-md text-secondary font-semibold hover:underline">View All →</Link>
        </div>

        {projects.slice(0, 5).map(proj => {
          const isCritical = proj.risk_level === 'CRITICAL';
          const isHigh = proj.risk_level === 'HIGH';
          
          let badgeBg = 'bg-surface-container-low text-text-secondary';
          let badgeText = `${proj.risk_level}`;
          if (isCritical) { badgeBg = 'bg-risk-critical text-on-primary'; badgeText = `Risk: ${proj.overall_risk_score} • Critical`; }
          else if (isHigh) { badgeBg = 'bg-risk-high text-on-primary'; badgeText = `Risk: ${proj.overall_risk_score} • High`; }
          else if (proj.risk_level === 'MEDIUM') { badgeBg = 'bg-risk-medium text-on-primary'; badgeText = `Risk: ${proj.overall_risk_score} • Medium`; }

          let costColor = 'text-text-primary';
          if (isCritical) costColor = 'text-risk-critical';
          else if (isHigh) costColor = 'text-risk-high';

          return (
            <article key={proj.id} className="flex flex-col p-unit-md rounded-xl bg-surface-container-lowest shadow-sm gap-unit-sm">
              <div className="flex items-start justify-between gap-unit-xs">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm text-text-tertiary">{proj.project_code}</span>
                  <h3 className="font-headline-sm text-headline-sm text-text-primary truncate font-bold">{proj.project_name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold shrink-0 ${badgeBg}`}>
                  {badgeText}
                </span>
              </div>
              
              <div className="flex items-center gap-unit-xs text-body-sm font-body-sm text-text-secondary">
                <span className="material-symbols-outlined text-[16px] text-text-tertiary">location_on</span>
                <span className="truncate">{proj.state_name} • {proj.sector_name}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-unit-xs p-unit-xs rounded-lg bg-surface-container-low">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-text-tertiary uppercase">Outlay (Orig → Rev)</span>
                  <span className="font-body-md text-body-md text-text-primary font-semibold">
                    ₹{proj.original_cost.toLocaleString()} Cr → <span className={costColor}>₹{proj.revised_cost.toLocaleString()} Cr</span>
                  </span>
                  <span className={`font-label-sm text-label-sm font-medium ${costColor}`}>
                    +{proj.cost_growth_percentage}% Breach
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-text-tertiary uppercase">Milestone Lag</span>
                  <span className={`font-body-md text-body-md font-semibold ${costColor}`}>+{proj.predicted_delay_months || 0} Months</span>
                  <span className="font-label-sm text-label-sm text-text-secondary truncate">{proj.implementing_agency}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-body-sm font-body-sm">
                  <span className="text-text-secondary">Physical Progress: <strong className="text-text-primary">{proj.physical_progress}%</strong></span>
                  <span className="text-text-secondary">Financial Expended: <strong className="text-text-primary">{proj.financial_progress}%</strong></span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden flex">
                  <div className="h-full bg-secondary rounded-l-full" style={{ width: `${proj.physical_progress}%` }}></div>
                  <div className={`h-full ${isCritical ? 'bg-risk-critical' : isHigh ? 'bg-risk-high' : 'bg-risk-medium'} rounded-r-full`} style={{ width: `${Math.max(0, 100 - proj.physical_progress)}%` }}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-unit-xs">
                <span className="font-label-sm text-label-sm text-text-tertiary">CS Project Code: #{proj.id}</span>
                <button 
                  onClick={() => triggerInterventionModal(proj.project_name)}
                  className="px-unit-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Intervene Now</span>
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* Interactive Intervention Toast Feedback */}
      <div 
        id="interventionToast" 
        className={`fixed bottom-20 left-4 right-4 z-50 transform transition-all duration-300 pointer-events-none ${toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-deep text-on-primary shadow-2xl">
          <div className="w-8 h-8 rounded-full bg-risk-low/20 flex items-center justify-center text-risk-low shrink-0">
            <span className="material-symbols-outlined text-[20px]">check</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-headline-sm text-headline-sm text-on-primary truncate">Intervention Triggered: {toastProjectName}</span>
            <span className="font-label-sm text-label-sm text-surface-dim">MoSPI Inter-Ministerial memo drafted for PMO PRAGATI review.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
