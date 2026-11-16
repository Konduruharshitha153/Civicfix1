import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Layers, 
  MapPin, 
  TrendingUp, 
  Building2,
  RefreshCw
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { complaintService } from '../services/complaintService';
import ComplaintsMap from '../components/ComplaintsMap';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { Link } from 'react-router-dom';

export default function PublicDashboardPage() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchFilteredComplaints();
  }, [statusFilter, deptFilter, priorityFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, deptData, catData] = await Promise.all([
        dashboardService.getPublicStats(),
        complaintService.getDepartments(),
        complaintService.getCategories(),
      ]);
      setStats(statsData);
      setDepartments(deptData);
      setCategories(catData);
      await fetchFilteredComplaints();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredComplaints = async () => {
    try {
      const filters = {};
      if (statusFilter !== 'All') filters.status = statusFilter;
      if (deptFilter !== 'All') filters.department_id = deptFilter;
      if (priorityFilter !== 'All') filters.priority = priorityFilter;

      const res = await complaintService.getComplaints(filters);
      setComplaints(res.complaints || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Public Civic Transparency Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time open data on municipal complaints, spatial distribution, and resolution performance.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. Core Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Reports
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats?.metrics?.total_complaints || complaints.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Registered civic incidents</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resolved
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {stats?.metrics?.resolved_complaints || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats?.metrics?.resolution_rate_percent || 0}% overall closure rate
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Turnaround
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            {stats?.metrics?.average_turnaround_days || 1.8} d
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats?.metrics?.average_turnaround_hours || 42} hours from submission
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In Remediation
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">
            {stats?.metrics?.in_progress_complaints || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active field deployments</div>
        </div>
      </div>

      {/* 2. Interactive OpenStreetMap with Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Live Geographic Distribution of Issues</span>
            </h2>
            <p className="text-xs text-slate-500">
              Interactive OpenStreetMap showing active and resolved issues. Click any pin to inspect.
            </p>
          </div>

          {/* Map Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-700">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* The OpenStreetMap */}
        <ComplaintsMap
          complaints={complaints}
          centerLat={12.9716}
          centerLon={77.5946}
          zoom={12}
          height="520px"
        />

        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
          <span>Showing {complaints.length} filtered pins on map</span>
          <span className="text-emerald-700 font-medium">Click markers for details & direct tracking link</span>
        </div>
      </div>

      {/* 3. Breakdown Insights & Department Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Complaint Volume by Category</span>
          </h3>

          <div className="space-y-3">
            {stats?.category_distribution?.map((cat) => {
              const maxCount = Math.max(...(stats.category_distribution.map(c => c.count) || [1]));
              const pct = Math.round((cat.count / (maxCount || 1)) * 100);

              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="font-bold text-slate-600">{cat.count} reports</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Resolution Accountability */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Department Resolution Accountability</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {stats?.department_distribution?.map((dept) => {
              const rate = dept.total_complaints > 0 
                ? Math.round((dept.resolved_complaints / dept.total_complaints) * 100) 
                : 100;

              return (
                <div key={dept.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{dept.name}</span>
                    <span className="text-[11px] text-slate-500">
                      Code: {dept.code} &bull; {dept.total_complaints} total tickets
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${rate >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {rate}% Resolved
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {dept.resolved_complaints} closed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
