import React from 'react';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                CF
              </div>
              <span className="text-white font-bold text-base tracking-tight">CivicFix</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Open civic issue tracking platform empowering citizens, issue moderators, and maintenance departments to collaborate on public infrastructure improvement.
            </p>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/submit" className="hover:text-emerald-400 transition-colors">Submit Issue Report</Link></li>
              <li><Link to="/track" className="hover:text-emerald-400 transition-colors">Live Status Tracking</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Public Transparency Map</Link></li>
              <li><Link to="/hotspots" className="hover:text-emerald-400 transition-colors">Recurring Hotspot Analytics</Link></li>
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Departments Covered
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Solid Waste & Sanitation (SWM)</li>
              <li>Roads & Asphalt Infrastructure</li>
              <li>Public Street Lighting (BESCOM)</li>
              <li>Water Supply & Drainage (BWSSB)</li>
              <li>Public Amenities & Parks</li>
            </ul>
          </div>

          {/* Safety & Ethics Disclaimer */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ethics & Safety</span>
            </h4>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-[11px] leading-relaxed text-slate-300">
              <p className="mb-1 font-medium text-slate-200">Demonstration Notice:</p>
              CivicFix is a civic technology demonstration platform. It does not claim an official municipal partnership. All submissions undergo moderator review to protect privacy and prevent exposure of personal information.
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} CivicFix Platform. Built for Real-World Problem Solving.
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by OpenStreetMap & AI Classifier</span>
            <span>Status: Operational (v1.0.0)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
