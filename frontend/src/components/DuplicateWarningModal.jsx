import React from 'react';
import { AlertTriangle, ExternalLink, X, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DuplicateWarningModal({
  duplicates = [],
  isOpen,
  onClose,
  onProceedAnyway,
}) {
  if (!isOpen || duplicates.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-amber-50 border-b border-amber-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-900">
                Similar Issue Already Reported Nearby!
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                CivicFix detected {duplicates.length} open {duplicates.length === 1 ? 'report' : 'reports'} within 350 meters matching this issue.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Duplicates */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 divide-y divide-slate-100 flex-1">
          <p className="text-xs text-slate-600 mb-2">
            Instead of creating a duplicate ticket, you can track the existing ticket. This helps municipal crews consolidate efforts and resolve faster:
          </p>

          {duplicates.map((dup) => (
            <div key={dup.id} className="pt-3 first:pt-0">
              <div className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-start gap-3">
                {dup.image_url ? (
                  <img
                    src={dup.image_url}
                    alt="Existing Report"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs shrink-0 font-medium">
                    No Photo
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-emerald-700">
                      #{dup.tracking_number}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                      {dup.overall_match_percentage}% Similarity
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-800 truncate mb-1">
                    {dup.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {dup.distance_meters}m away
                    </span>
                    <span>Status: <b className="text-slate-700">{dup.status}</b></span>
                  </div>

                  <div className="mt-2 flex items-center justify-end">
                    <Link
                      to={`/track/${dup.tracking_number}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <span>Track this ticket</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 text-center sm:text-left">
            Is your report describing a separate distinct problem?
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel & Review
            </button>
            <button
              type="button"
              onClick={onProceedAnyway}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              Submit as New Incident
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
