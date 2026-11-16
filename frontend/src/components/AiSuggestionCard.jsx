import React from 'react';
import { Sparkles, Check, Building2, ShieldAlert } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function AiSuggestionCard({
  suggestion,
  onApply,
  isApplied = false,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl animate-pulse flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
        <span className="text-xs font-semibold text-emerald-800">
          CivicFix AI is analyzing your complaint description...
        </span>
      </div>
    );
  }

  if (!suggestion || !suggestion.suggested_category_id) return null;

  const confidencePct = Math.round((suggestion.confidence || 0.8) * 100);

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/80 border border-emerald-300 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              AI Categorization Assist
            </h4>
            <span className="text-[11px] text-slate-500">
              Machine-classified with human verification
            </span>
          </div>
        </div>

        {/* Confidence pill */}
        <div className="flex items-center gap-1.5 bg-white border border-emerald-200 px-2.5 py-1 rounded-full shadow-xs">
          <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-emerald-800">{confidencePct}%</span>
        </div>
      </div>

      {/* Suggested Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
        <div className="p-2.5 bg-white/80 border border-slate-200/80 rounded-xl">
          <span className="text-slate-500 text-[11px] block">Suggested Category:</span>
          <span className="font-bold text-slate-800 text-sm">
            {suggestion.category_name}
          </span>
        </div>

        <div className="p-2.5 bg-white/80 border border-slate-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] block">Routing Department:</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              {suggestion.department_name}
            </span>
          </div>
          <div>
            <PriorityBadge priority={suggestion.estimated_severity} size="sm" />
          </div>
        </div>
      </div>

      {suggestion.reasoning && (
        <p className="text-[11px] text-slate-600 italic bg-white/60 p-2 rounded-lg border border-slate-100 mb-3">
          💡 <b>Reasoning:</b> {suggestion.reasoning}
        </p>
      )}

      {/* Action button */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => onApply(suggestion)}
          disabled={isApplied}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all ${
            isApplied
              ? 'bg-emerald-100 text-emerald-800 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
          }`}
        >
          {isApplied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Applied & Confirmed</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Accept AI Categorization</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
