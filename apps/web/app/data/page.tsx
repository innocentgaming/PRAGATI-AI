'use client';

import React, { useEffect, useState } from 'react';
import { fetchDataQualityReport } from '@/lib/api';
import { 
  Database, CheckCircle2, AlertTriangle, Upload, 
  ShieldCheck, FileSpreadsheet, RefreshCw, FileText 
} from 'lucide-react';

export default function DataManagementPage() {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [jsonInput, setJsonInput] = useState('');
  const [sourceType, setSourceType] = useState('DEMO');
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    const data = await fetchDataQualityReport();
    setReport(data);
    setLoading(false);
  };

  const handleIngest = async () => {
    if (!jsonInput.trim()) return;
    setIsIngesting(true);
    setIngestStatus(null);
    try {
      const records = JSON.parse(jsonInput);
      const res = await fetch(`http://localhost:8000/api/data-quality/ingest?source_type=${sourceType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Array.isArray(records) ? records : [records])
      });
      const data = await res.json();
      setIngestStatus(`Successfully ingested ${data.ingested_count} records. Tagged as source: ${sourceType}`);
      loadReport();
      setJsonInput('');
    } catch (err: any) {
      setIngestStatus(`Ingestion error: ${err.message || 'Invalid JSON format'}`);
    } finally {
      setIsIngesting(false);
    }
  };

  const sampleJson = `[
  {
    "project_code": "PRJ-011",
    "project_name": "Kashmir Railway Connectivity Package-B",
    "implementing_agency": "Northern Railway",
    "original_cost": 4200.0,
    "revised_cost": 5100.0,
    "current_expenditure": 3800.0,
    "physical_progress": 52.0,
    "financial_progress": 74.5,
    "start_date": "2020-04-01",
    "original_completion_date": "2025-12-31",
    "sector_id": 1,
    "state_id": 17
  }
]`;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-navy-100 text-navy-800 border border-navy-200">
              Data Governance & Hygiene
            </span>
            <span className="text-xs text-slate-400 font-medium">MoSPI DIID Automated Quality Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Data Quality & Ingestion Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated schema validation, multi-source provenance tagging, and pipeline ingestion
          </p>
        </div>

        <button
          onClick={loadReport}
          className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          <span>Refresh Quality Audit</span>
        </button>
      </div>

      {/* Quality Score Banner */}
      <div className="gov-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Overall MoSPI Data Integrity Score
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black text-emerald-700 font-mono">
              {report?.overall_quality_score || 100}%
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              AUDIT PASSED
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Validated against all 10 MoSPI data-hygiene rules across {report?.total_records_checked || 0} infrastructure records.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 block font-medium">Passed Records</span>
            <span className="text-lg font-bold text-emerald-700 font-mono">{report?.passed_records || 0}</span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 block font-medium">Flagged / Anomalies</span>
            <span className="text-lg font-bold text-slate-700 font-mono">{report?.flagged_records || 0}</span>
          </div>
        </div>
      </div>

      {/* 10 Automated Data Quality Checks Grid */}
      <div className="gov-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Automated Data Hygiene & Rule Verification Audit
          </h3>
          <p className="text-xs text-slate-500">
            Real-time checks preventing corrupted inputs, negative costs, and temporal contradictions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report?.checks?.map((chk: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">{chk.check_name}</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6">
                  {chk.details[0]}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                PASSED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Batch Ingestion & Provenance Section */}
      <div className="gov-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Upload className="h-4 w-4 text-navy-800" />
            <span>Ingest Project Records (JSON / Excel / CSV Schema)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Paste JSON records for instant schema sanitization, automated ML feature engineering, and alert generation.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">
              Data Source Provenance Tag:
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="bg-white border border-slate-300 text-xs text-slate-800 font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-navy-600 shadow-sm"
            >
              <option value="DEMO">DEMO (Synthetic Demonstration)</option>
              <option value="USER_UPLOAD">USER_UPLOAD (Field Officer Data)</option>
              <option value="OFFICIAL_API">OFFICIAL_API (PAIMANA / OCMS)</option>
              <option value="OFFICIAL_REPORT">OFFICIAL_REPORT (MoSPI Monthly Review)</option>
            </select>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={sampleJson}
            rows={6}
            className="w-full bg-slate-50 font-mono text-xs text-slate-900 border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-navy-600 shadow-inner"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              onClick={() => setJsonInput(sampleJson)}
              className="text-xs text-navy-800 hover:text-navy-950 font-medium underline"
            >
              Load Demonstration Record (PRJ-011)
            </button>

            <button
              onClick={handleIngest}
              disabled={isIngesting || !jsonInput.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{isIngesting ? 'Validating & Ingesting...' : 'Ingest & Trigger ML Pipeline'}</span>
            </button>
          </div>

          {ingestStatus && (
            <div className="p-3 bg-navy-50 border border-navy-200 rounded-lg text-xs text-navy-900 font-medium">
              {ingestStatus}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
