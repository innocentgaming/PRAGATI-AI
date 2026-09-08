'use client';

import React, { useEffect, useState } from 'react';
import { fetchReports, generateReport, ReportItem } from '@/lib/api';
import { FileText, Download, Sparkles, Plus, CheckCircle2, Clock, Filter, Printer, FileSpreadsheet } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('MONTHLY_EXECUTIVE_SUMMARY');
  const [format, setFormat] = useState('PDF');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchReports();
      setReports(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setSuccessMessage('');

    const titleMap: Record<string, string> = {
      MONTHLY_EXECUTIVE_SUMMARY: 'Monthly Central Sector Infrastructure Review (MoSPI)',
      CRITICAL_RISK_DOSSIER: 'Cabinet Committee on Infrastructure (CCI) Flash Dossier',
      SECTORAL_PERFORMANCE_REPORT: 'National Sector-Wise Capital Expenditure & Progress Report',
      CONTRACTOR_SCORECARD_DOSSIER: 'Annual Implementing Agency & Vendor Performance Audit',
      CUF_EXPERIMENT_TECHNICAL_PAPER: 'CUF Machine Learning Model Benchmark & Accuracy Report'
    };

    const newReport = await generateReport({
      report_type: reportType,
      title: titleMap[reportType] || 'Custom Infrastructure Analysis Report',
      format: format
    });

    setReports([newReport, ...reports]);
    setGenerating(false);
    setSuccessMessage(`Report "${newReport.title}" generated successfully.`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleDownload = (report: ReportItem) => {
    // Generate simulated download file
    const content = `GOVERNMENT OF INDIA\nMINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION (MoSPI)\n\nREPORT: ${report.title}\nCODE: ${report.report_code}\nGENERATED: ${report.created_at}\nPROJECTS COVERED: ${report.project_count}\n\n=========================================\nCONFIDENTIAL - FOR OFFICIAL USE ONLY\n=========================================\n\nExecutive Summary:\nThis dossier encapsulates cross-sector project performance, early warning indicators, and prescriptive risk interventions across monitored Central Sector Infrastructure Projects.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_code}.${report.format.toLowerCase() === 'excel' ? 'csv' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Reports & Executive Dossier Generator</h1>
          <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">
            MoSPI Export Engine
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Automated generation of Cabinet flash notes, PMO briefing dossiers, sectoral expenditure audits, and CSV/Excel exports.
        </p>
      </div>

      {/* Report Generation Form */}
      <div className="p-5 bg-gray-950 border border-indigo-900/40 rounded-xl space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">Generate Instant Official Dossier</h2>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Dossier Template</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="MONTHLY_EXECUTIVE_SUMMARY">Monthly Central Sector Review (MoSPI)</option>
              <option value="CRITICAL_RISK_DOSSIER">CCI / PMO Critical Flash Dossier</option>
              <option value="SECTORAL_PERFORMANCE_REPORT">Sectoral Capital Expenditure & Progress</option>
              <option value="CONTRACTOR_SCORECARD_DOSSIER">Vendor Scorecard & SLA Review</option>
              <option value="CUF_EXPERIMENT_TECHNICAL_PAPER">CUF ML Benchmark Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Export Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="PDF">Adobe PDF (.pdf)</option>
              <option value="EXCEL">Microsoft Excel / CSV (.xlsx)</option>
              <option value="JSON">Raw JSON Payload (.json)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>{generating ? 'Compiling Dossier...' : 'Generate & Store'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Reports Archive */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300">Generated Reports Archive</h2>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            Loading reports archive...
          </div>
        ) : reports.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-gray-500 text-xs border border-gray-800 rounded-xl bg-gray-900/30">
            No reports generated yet. Click "Generate & Store" above to create one.
          </div>
        ) : (
          <div className="space-y-2.5">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    {report.format === 'EXCEL' ? <FileSpreadsheet className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-400">{report.report_code}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                        {report.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">{report.title}</h3>
                    <div className="text-[11px] text-gray-500 flex items-center gap-3 mt-1">
                      <span>{report.project_count} Projects</span>
                      <span>•</span>
                      <span>{report.format} ({report.file_size_kb || 450} KB)</span>
                      <span>•</span>
                      <span>By {report.created_by}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(report)}
                    className="flex items-center gap-1.5 py-1.5 px-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-200 rounded-lg transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
