import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Lightbulb, 
  Layers, 
  MapPin, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import HotspotMap from '../components/HotspotMap';
import PriorityBadge from '../components/PriorityBadge';
import { Link } from 'react-router-dom';

export default function HotspotsAnalyticsPage() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRadius, setSelectedRadius] = useState(350);

  useEffect(() => {
    loadHotspots();
  }, [selectedRadius]);

  const loadHotspots = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getHotspots(selectedRadius, 2);
      setHotspots(data.hotspots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
            <Flame className="w-3.5 h-3.5" />
            <span>Advanced Engineering Challenge</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Recurring Hotspots & Preventive Maintenance Analytics
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Move municipal operations from reactive fire-fighting to proactive preventive engineering. This module detects spatial problem clusters and explains the root factors behind each infrastructure intervention.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 font-medium">Cluster Radius:</span>
              <select
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(Number(e.target.value))}
                className="bg-transparent text-white font-bold focus:outline-none"
              >
                <option value="200" className="text-slate-900">200 meters (Micro-block)</option>
                <option value="350" className="text-slate-900">350 meters (Neighborhood)</option>
                <option value="500" className="text-slate-900">500 meters (Ward Sector)</option>
              </select>
            </div>

            <button
              onClick={loadHotspots}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recompute Clusters</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Spatial Hotspot Map */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Geospatial Hotspot Proximity Zones</span>
            </h2>
            <p className="text-xs text-slate-500">
              Color rings represent spatial cluster radii with repeated infrastructure failures. Click circles to inspect recommendations.
            </p>
          </div>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            {hotspots.length} Recurring Hotspots
          </span>
        </div>

        <HotspotMap hotspots={hotspots} height="480px" />
      </div>

      {/* 2. Detailed Hotspot Factor Breakdown Cards */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-slate-900">
            Root-Cause Attribution & Preventive Actions
          </h2>
          <p className="text-xs text-slate-500">
            Explainable factors derived from complaint density, category keywords, and recurring intervals.
          </p>
        </div>

        {hotspots.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
            No recurring hotspots detected within the selected cluster radius.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hotspots.map((hs, i) => (
              <div
                key={hs.id || i}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-orange-100 text-orange-800 rounded text-[11px] font-bold">
                          Cluster #{i + 1}
                        </span>
                        <PriorityBadge priority={hs.priority_level} size="sm" />
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">
                        {hs.name}
                      </h3>
                    </div>
                  </div>

                  {/* Frequency Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total Reports:</span>
                      <b className="text-slate-900">{hs.total_complaints} incidents</b>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Unresolved:</span>
                      <b className="text-amber-600">{hs.unresolved_complaints} open</b>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Dominant Issue:</span>
                      <b className="text-slate-900">{hs.dominant_category}</b>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 mb-4">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Preventive Maintenance Strategy</span>
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {hs.recommendation}
                    </p>
                  </div>

                  {/* Factor Explainability */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Contributing Factors:
                    </span>
                    <ul className="space-y-1">
                      {hs.factors.map((factor, fIdx) => (
                        <li key={fIdx} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-orange-500 font-bold shrink-0">&bull;</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer budget & tracking numbers */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500">
                    <b>Budget Scope:</b> {hs.estimated_budget_impact}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-700">
                    <span>Tickets:</span>
                    {hs.tracking_numbers.slice(0, 3).map((tn) => (
                      <Link key={tn} to={`/track/${tn}`} className="hover:underline">
                        #{tn.split('-')[2]}
                      </Link>
                    ))}
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
