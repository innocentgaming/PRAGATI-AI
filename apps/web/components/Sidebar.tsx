'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderKanban, ShieldAlert, AlertTriangle,
  MapPin, BarChart3, Bot, ClipboardCheck, Cpu, Database,
  FileText, History, Settings, Building2, Users
} from 'lucide-react';

const navigation = [
  { name: 'Executive Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Project Explorer', href: '/projects', icon: FolderKanban },
  { name: 'Risk Intelligence', href: '/risk', icon: ShieldAlert },
  { name: 'Early Warning Center', href: '/alerts', icon: AlertTriangle, badge: 'Live' },
  { name: 'India Infra Map', href: '/map', icon: MapPin },
  { name: 'Analytics & Benchmarking', href: '/analytics', icon: BarChart3 },
  { name: 'PRAGATI AI Assistant', href: '/assistant', icon: Bot, highlight: true },
  { name: 'Intervention Tracking', href: '/interventions', icon: ClipboardCheck },
  { name: 'Model Performance', href: '/models', icon: Cpu },
  { name: 'Data Management', href: '/data', icon: Database },
  { name: 'Audit & Governance', href: '/audit', icon: History },
  { name: 'Reports & Dossiers', href: '/reports', icon: FileText },
  { name: 'Platform Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex-shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3.5 shadow-sm overflow-y-auto hidden md:flex">
      <div className="space-y-0.5">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Navigation Modules
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/60'
                  : item.highlight
                  ? 'text-blue-700 bg-blue-50/50 hover:bg-blue-100/60'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : item.highlight ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Tagline */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mt-4 text-xs">
        <div className="text-[11px] font-bold text-slate-800">MoSPI IPMD Intelligence</div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Predictive Central Sector Project Monitoring
        </div>
        <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 font-mono pt-1.5 border-t border-slate-200">
          <span>v2.0 Blended</span>
          <span className="text-emerald-600 font-semibold">● Operational</span>
        </div>
      </div>
    </aside>
  );
};
