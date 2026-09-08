'use client';

import React from 'react';
import { RiskFactor } from '@/lib/api';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface SHAPChartProps {
  factors: RiskFactor[];
  overallScore: number;
}

export const SHAPChart: React.FC<SHAPChartProps> = ({ factors, overallScore }) => {
  if (!factors || factors.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs">
        No local SHAP explanations computed for this observation.
      </div>
    );
  }

  const maxAbsImpact = Math.max(...factors.map(f => Math.abs(f.impact_score)), 1.0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-blue-600" />
          <span>TreeSHAP Feature Attribution (Impact on 0–100 Risk Score)</span>
        </div>
        <div className="text-right font-mono text-[11px]">
          Baseline Prior: <span className="font-bold text-slate-700">50.0 pts</span>
        </div>
      </div>

      <div className="space-y-2">
        {factors.map((factor, idx) => {
          const isRiskIncrease = factor.impact_score > 0 || factor.impact_direction === 'INCREASE_RISK';
          const impactPercent = Math.min(100, (Math.abs(factor.impact_score) / maxAbsImpact) * 100);

          return (
            <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${
                    isRiskIncrease ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {factor.feature_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                  {isRiskIncrease ? (
                    <span className="text-rose-700 flex items-center">
                      <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                      +{Math.abs(factor.impact_score).toFixed(1)} pts
                    </span>
                  ) : (
                    <span className="text-emerald-700 flex items-center">
                      <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                      -{Math.abs(factor.impact_score).toFixed(1)} pts
                    </span>
                  )}
                </div>
              </div>

              {/* Relative Impact Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isRiskIncrease ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${impactPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
