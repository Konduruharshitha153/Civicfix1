import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  BrainCircuit, 
  CopyCheck, 
  Layers, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function HomePage() {
  const [trackingInput, setTrackingInput] = useState('');
  const [stats, setStats] = useState(null);
  const [recentResolved, setRecentResolved] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardService.getPublicStats()
      .then((data) => {
        setStats(data.metrics);
        setRecentResolved(data.recent_resolutions || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    navigate(`/track/${trackingInput.trim().toUpperCase()}`);
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Civic Issue Accountability Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Make Local Civic Complaints <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">
                Trackable & Measurable
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Empowering citizens to report overflowing garbage, road craters, drainage leaks, and broken streetlights with AI-assisted categorization, duplicate detection, and verified municipal routing.
            </p>

            {/* Quick Tracking Search Form */}
            <div className="max-w-lg mx-auto pt-2">
              <form onSubmit={handleSearch} className="flex items-center gap-2 p-1.5 bg-white rounded-2xl shadow-lg border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/50">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter Tracking ID (e.g. CVX-2026-10101)"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="flex-1 px-2 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Track Issue
                </button>
              </form>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report an Issue Now</span>
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 shadow-xs transition-colors"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Explore Public Map</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 2. LIVE CIVIC METRICS TICKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">
                {stats ? stats.total_complaints : '10+'}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Complaints
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mb-1">
                {stats ? `${stats.resolution_rate_percent}%` : '85%'}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Resolution Rate
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-1">
                {stats ? `${stats.average_turnaround_days} Days` : '1.8 Days'}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Avg Resolution Time
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 mb-1">
                100%
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Open Accountability
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FOUR KEY PRODUCT PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How CivicFix Solves the Civic Void
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            A demonstrable, closed-loop workflow ensuring municipal responsiveness from field report to sign-off.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">
              1. AI Categorization
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Natural language models analyze issue descriptions and auto-route to the correct municipal authority with confidence scoring.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <CopyCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">
              2. Duplicate Detection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Spatial Haversine algorithms check open tickets within 350m to consolidate citizen reports and eliminate redundant visits.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">
              3. Dynamic Priority Rules
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Urgency is calculated dynamically considering severity, citizen population affected, and aging escalation timers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">
              4. Verifiable Resolution
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete status lifecycle from Submitted to Resolved with technician sign-off notes, photos, and public transparency.
            </p>
          </div>

        </div>
      </section>

      {/* 4. RECENT RESOLUTIONS SHOWCASE */}
      {recentResolved.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Recent Civic Fixes in Action
              </h2>
              <p className="text-xs text-slate-500">
                Transparent verification of resolved municipal issues across wards.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View all on map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentResolved.slice(0, 3).map((comp) => (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                {comp.image_url ? (
                  <img
                    src={comp.image_url}
                    alt={comp.title}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="h-44 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                    No image provided
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-xs text-emerald-700">
                        #{comp.tracking_number}
                      </span>
                      <StatusBadge status={comp.status} size="sm" />
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mb-1 line-clamp-1">
                      {comp.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {comp.description}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{comp.address}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {comp.department_name}
                    </span>
                    <Link
                      to={`/track/${comp.tracking_number}`}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      Audit Trail &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. HOTSPOT ANALYTICS CALLOUT (ADVANCED ENGINEERING CHALLENGE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Advanced Engineering Challenge</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Predictive Hotspot Analytics & Preventive Maintenance
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              CivicFix aggregates spatial report frequency using clustering algorithms to detect chronic civic hotspots and derive root-cause factor explanations for long-term municipal planning.
            </p>

            <div className="pt-2">
              <Link
                to="/hotspots"
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                <span>View Hotspots & Recommendations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
