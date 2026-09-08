'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, UserRole } from '@/lib/store';
import { Shield, ArrowRight, UserCheck, Lock, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { switchRole } = useStore();
  const [email, setEmail] = useState('officer@mospi.gov.in');
  const [password, setPassword] = useState('Officer@123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const handleQuickRole = (role: UserRole) => {
    switchRole(role);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[82vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
        
        {/* Government Emblem & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-blue-700 text-white font-extrabold text-xl shadow-sm">
            P
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            PRAGATI-AI Portal
          </h2>
          <p className="text-xs text-slate-500">
            Ministry of Statistics and Programme Implementation (MoSPI)
          </p>
          <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            Central Sector Infrastructure Monitoring Console
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Government Official Email / NIC ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Secure Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
          >
            <span>Sign In to Executive Console</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* 1-Click Evaluation Accounts */}
        <div className="pt-5 border-t border-slate-200 space-y-2.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            SIH Evaluation 1-Click Role Login
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickRole('MONITORING_OFFICER')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-left transition-colors"
            >
              <div className="font-bold text-blue-700 text-xs">Director IPMD</div>
              <div className="text-[10px] text-slate-500">Monitoring Officer</div>
            </button>
            <button
              onClick={() => handleQuickRole('ADMIN')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-left transition-colors"
            >
              <div className="font-bold text-blue-700 text-xs">Joint Secretary</div>
              <div className="text-[10px] text-slate-500">Admin Level</div>
            </button>
            <button
              onClick={() => handleQuickRole('MINISTRY_USER')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-left transition-colors"
            >
              <div className="font-bold text-blue-700 text-xs">Ministry Advisor</div>
              <div className="text-[10px] text-slate-500">Railway Board</div>
            </button>
            <button
              onClick={() => handleQuickRole('VIEWER')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-left transition-colors"
            >
              <div className="font-bold text-blue-700 text-xs">SIH Judge</div>
              <div className="text-[10px] text-slate-500">Evaluation Role</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
