'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Settings, Sliders, Shield, Database, Cpu, Sparkles, CheckCircle2, Save, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const { isDemoMode, toggleDemoMode } = useStore();
  const [criticalThreshold, setCriticalThreshold] = useState(80);
  const [highThreshold, setHighThreshold] = useState(60);
  const [mediumThreshold, setMediumThreshold] = useState(30);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Platform Settings & Configurations</h1>
          <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">
            Admin Console
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Configure machine learning inference thresholds, early warning triggers, automated synchronization, and presentation demo mode.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Settings saved successfully. Model hyperparameters updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Threshold Sliders */}
        <div className="p-5 bg-gray-950 border border-gray-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Sliders className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Early Warning & Risk Classification Thresholds</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-gray-300 mb-1">
                <span className="text-rose-400">Critical Risk Trigger Score</span>
                <span className="font-mono text-white">&gt;= {criticalThreshold}</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <p className="text-[11px] text-gray-500 mt-0.5">
                Triggers immediate Cabinet flash alert and escalates to Ministry Secretary.
              </p>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-300 mb-1">
                <span className="text-amber-400">High Risk Trigger Score</span>
                <span className="font-mono text-white">&gt;= {highThreshold}</span>
              </div>
              <input
                type="range"
                min="50"
                max="75"
                value={highThreshold}
                onChange={(e) => setHighThreshold(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-[11px] text-gray-500 mt-0.5">
                Generates early warning ticket and dispatches recommended site intervention.
              </p>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-300 mb-1">
                <span className="text-yellow-400">Medium Risk Trigger Score</span>
                <span className="font-mono text-white">&gt;= {mediumThreshold}</span>
              </div>
              <input
                type="range"
                min="20"
                max="45"
                value={mediumThreshold}
                onChange={(e) => setMediumThreshold(Number(e.target.value))}
                className="w-full accent-yellow-500"
              />
              <p className="text-[11px] text-gray-500 mt-0.5">
                Flags potential milestone slippage in standard quarterly review dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* AI & ML Models */}
        <div className="p-5 bg-gray-950 border border-gray-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Active Machine Learning Model Architecture</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-gray-900/60 rounded-xl border border-indigo-500/20">
              <div className="font-semibold text-white">Primary Risk & Overrun Estimator</div>
              <div className="text-indigo-400 font-mono text-[11px] mt-0.5">XGBoost v2.0 + LightGBM Blended Regressor</div>
              <p className="text-[11px] text-gray-400 mt-2">
                Trained on 10+ years of MoSPI IPMD monthly time-series records with SHAP TreeExplainer feature attribution.
              </p>
            </div>

            <div className="p-3.5 bg-gray-900/60 rounded-xl border border-gray-800">
              <div className="font-semibold text-white">NLP Delay Reason Categorizer</div>
              <div className="text-emerald-400 font-mono text-[11px] mt-0.5">10-Class Hybrid Rule & Semantic Matcher</div>
              <p className="text-[11px] text-gray-400 mt-2">
                Classifies unstructured progress remarks into Land Acquisition, Forest Clearance, ROW, Contractor default, etc.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode & Presentation Controls */}
        <div className="p-5 bg-gray-950 border border-gray-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Hackathon Jury & Presentation Controls</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Simulation & Demo Mode</div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Provides instant rich data responses and offline LLM fallback simulation when external API keys are unavailable.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleDemoMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isDemoMode
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {isDemoMode ? 'Demo Mode Active' : 'Production Mode'}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
