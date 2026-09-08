'use client';

import React, { useState } from 'react';
import { createIntervention } from '@/lib/api';
import { X, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectCode: string;
  projectName: string;
  defaultAction?: string;
  onSuccess?: () => void;
}

export const InterventionModal: React.FC<InterventionModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectCode,
  projectName,
  defaultAction = 'Initiate immediate on-site joint engineering inspection and audit revised estimates.',
  onSuccess
}) => {
  const [recommendedAction, setRecommendedAction] = useState(defaultAction);
  const [officerAction, setOfficerAction] = useState('');
  const [assignedTo, setAssignedTo] = useState('Ananya Sharma (Director IPMD)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createIntervention({
        project_id: projectId,
        recommended_action: recommendedAction,
        officer_action: officerAction || 'Formal directive issued to implementing agency for catch-up execution schedule.',
        assigned_to: assignedTo,
        status: 'IN_PROGRESS'
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Intervention Dispatched!</h3>
            <p className="text-xs text-gray-400">
              Assigned to {assignedTo} and logged into the MoSPI tracking ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Dispatch MoSPI Prescriptive Intervention</span>
              </div>
              <h2 className="text-base font-bold text-white">
                {projectCode}: {projectName}
              </h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                AI Recommended Action
              </label>
              <textarea
                value={recommendedAction}
                onChange={(e) => setRecommendedAction(e.target.value)}
                rows={2}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Officer Action Directive / Notes
              </label>
              <textarea
                value={officerAction}
                onChange={(e) => setOfficerAction(e.target.value)}
                placeholder="e.g. Scheduled emergency coordination review with State Chief Secretary and NHAI regional head."
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Assigned Monitoring Officer
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Ananya Sharma (Director IPMD)">Ananya Sharma (Director IPMD)</option>
                <option value="Dr. Rajesh Verma (Joint Secretary)">Dr. Rajesh Verma (Joint Secretary)</option>
                <option value="Suresh Kumar (Railway Board Advisor)">Suresh Kumar (Railway Board Advisor)</option>
                <option value="Pooja Nair (Senior Data Analyst)">Pooja Nair (Senior Data Analyst)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white rounded-xl hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Intervention'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
