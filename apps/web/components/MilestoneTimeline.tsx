'use client';

import React from 'react';
import { Milestone } from '@/lib/api';
import { CheckCircle2, Clock, AlertOctagon, Hourglass } from 'lucide-react';

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  if (!milestones || milestones.length === 0) {
    return <div className="text-gray-500 text-xs py-4">No milestone records tracked.</div>;
  }

  const getStatusIcon = (status: string, delayDays: number) => {
    if (status === 'COMPLETED') {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    } else if (status === 'DELAYED' || delayDays > 0) {
      return <AlertOctagon className="h-4 w-4 text-rose-400" />;
    } else if (status === 'IN_PROGRESS') {
      return <Clock className="h-4 w-4 text-amber-400 animate-spin" />;
    }
    return <Hourglass className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string, delayDays: number) => {
    if (status === 'COMPLETED') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPLETED</span>;
    } else if (status === 'DELAYED' || delayDays > 0) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{delayDays > 0 ? `+${delayDays}d DELAYED` : 'DELAYED'}</span>;
    } else if (status === 'IN_PROGRESS') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">IN PROGRESS</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700">PENDING</span>;
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-800">
      {milestones.map((ms, idx) => (
        <div key={idx} className="relative group">
          {/* Timeline Node */}
          <div className="absolute -left-6 top-1 flex items-center justify-center h-4 w-4 rounded-full bg-gray-900 ring-4 ring-[#0B0F19]">
            {getStatusIcon(ms.status, ms.delay_days)}
          </div>

          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 hover:border-gray-700 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-400">{ms.milestone_code}</span>
                <span className="text-xs font-semibold text-gray-200">{ms.milestone_name}</span>
              </div>
              <div className="flex items-center gap-2">
                {ms.criticality === 'CRITICAL' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    CRITICAL PATH
                  </span>
                )}
                {getStatusBadge(ms.status, ms.delay_days)}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
              <div>
                Target: <span className="text-gray-300 font-mono">{ms.planned_end}</span>
              </div>
              {ms.actual_end && (
                <div>
                  Actual: <span className="text-emerald-400 font-mono">{ms.actual_end}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
