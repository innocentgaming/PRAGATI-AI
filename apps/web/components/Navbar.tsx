'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore, UserRole } from '@/lib/store';
import { 
  Bell, Bot, UserCheck, ChevronDown, 
  LayoutDashboard, FolderKanban, ShieldAlert, 
  AlertTriangle, BarChart3, MapPin, ClipboardCheck, Building2
} from 'lucide-react';

const topNavLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Risk Intelligence', href: '/risk', icon: ShieldAlert },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle, badge: 'Live' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Map', href: '/map', icon: MapPin },
  { name: 'AI Assistant', href: '/assistant', icon: Bot, highlight: true },
  { name: 'Interventions', href: '/interventions', icon: ClipboardCheck },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, switchRole, isDemoMode } = useStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F172A] border-b border-slate-800 text-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Government Emblem & PRAGATI-AI Branding */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-blue-700 border border-blue-500/40 flex items-center justify-center text-white font-extrabold shadow-sm">
              <span className="text-base tracking-tight">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  PRAGATI-AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700/50">
                  MoSPI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden xl:block leading-tight">
                Predictive Risk Analytics & Government Infrastructure Intelligence
              </p>
            </div>
          </Link>

          {/* Top Primary Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {topNavLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : item.highlight
                      ? 'text-blue-300 bg-blue-950/60 hover:bg-blue-900 border border-blue-800/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="px-1 py-0.2 text-[9px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Role Switcher & Live Profile */}
        <div className="flex items-center gap-3">
          
          {/* Active Alerts Shortcut */}
          <Link 
            href="/alerts"
            className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Early Warning Center"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </Link>

          {/* Role Switcher Dropdown for Reviewers & Judges */}
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition-colors">
              <div className="h-6 w-6 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center justify-center text-xs font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-100">{currentUser.name}</div>
                <div className="text-[10px] text-blue-300 font-mono font-medium">{currentUser.role}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-1 w-60 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 hidden group-hover:block z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Role (RBAC Simulation)
              </div>
              {(['ADMIN', 'MONITORING_OFFICER', 'MINISTRY_USER', 'ANALYST', 'VIEWER'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    currentUser.role === r ? 'text-blue-300 font-semibold bg-blue-950/60' : 'text-slate-300'
                  }`}
                >
                  <span>{r.replace('_', ' ')}</span>
                  {currentUser.role === r && <UserCheck className="h-3.5 w-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
