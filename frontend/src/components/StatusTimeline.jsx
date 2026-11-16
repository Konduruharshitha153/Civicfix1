import React from 'react';
import { CheckCircle2, Clock, FileCheck2, Send, Wrench, XCircle, User } from 'lucide-react';

const STATUS_STEPS = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'];

export default function StatusTimeline({ currentStatus, history = [], isRejected = false }) {
  const currentStepIndex = isRejected || currentStatus === 'Rejected'
    ? -1
    : STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {/* 1. Horizontal Visual Stepper */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-6">Resolution Lifecycle Progress</h4>

        {currentStatus === 'Rejected' ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">Complaint Closed / Rejected</div>
              <div className="text-xs text-rose-700">
                This issue was closed or determined to be a duplicate of an existing ticket.
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex items-center justify-between">
            {/* Background Track Line */}
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-200 z-0" />
            
            {/* Active Progress Fill */}
            <div
              className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-emerald-500 z-0 transition-all duration-500"
              style={{
                width: currentStepIndex > 0 ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 92}%` : '0%',
              }}
            />

            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 border-white text-white shadow-lg ring-4 ring-emerald-100 scale-110'
                        : isCompleted
                        ? 'bg-emerald-500 border-white text-white shadow'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-semibold text-center whitespace-nowrap ${
                      isCurrent
                        ? 'text-emerald-700'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Audit Trail History List */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Status Audit Trail & Logs</span>
        </h4>

        {history.length === 0 ? (
          <div className="text-slate-400 text-xs text-center py-4">
            No history logs recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {history.map((h, i) => (
              <div key={h.id || i} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[1.85rem] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 shadow-sm" />

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px]">
                        {h.new_status}
                      </span>
                      {h.old_status && (
                        <span className="text-slate-400 font-normal">
                          (was {h.old_status})
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {h.created_at ? new Date(h.created_at).toLocaleString() : ''}
                    </span>
                  </div>

                  {h.notes && (
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">
                      {h.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Logged by: {h.changed_by_name} ({h.changed_by_role})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
