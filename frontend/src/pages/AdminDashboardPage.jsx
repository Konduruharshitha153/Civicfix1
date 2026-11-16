import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Filter, 
  Search, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  CopyCheck, 
  ExternalLink,
  Edit3,
  UserPlus,
  RefreshCw,
  X
} from 'lucide-react';
import { complaintService } from '../services/complaintService';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function AdminDashboardPage() {
  const { user, isStaff, isAdmin } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unverified', 'overdue', 'duplicates'

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);

  // Status form
  const [newStatus, setNewStatus] = useState('Verified');
  const [statusNotes, setStatusNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Assign form
  const [assigneeId, setAssigneeId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignableStaff, setAssignableStaff] = useState([]);

  // Duplicate form
  const [parentTrackingNo, setParentTrackingNo] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, statsData, depts] = await Promise.all([
        complaintService.getComplaints({ limit: 200 }),
        dashboardService.getAdminStats(),
        complaintService.getDepartments(),
      ]);
      setComplaints(res.complaints || []);
      setAdminStats(statsData.admin_metrics);
      setDepartments(depts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open Status Change Modal
  const openStatusModal = (comp) => {
    setSelectedComplaint(comp);
    setNewStatus(comp.status);
    setStatusNotes('');
    setResolutionNotes(comp.resolution_notes || '');
    setStatusModalOpen(true);
  };

  // Submit Status Change
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setActionLoading(true);
    try {
      await complaintService.updateStatus(selectedComplaint.id, {
        status: newStatus,
        notes: statusNotes,
        resolution_notes: newStatus === 'Resolved' ? resolutionNotes : null,
      });
      setStatusModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Assign Modal
  const openAssignModal = async (comp) => {
    setSelectedComplaint(comp);
    setAssignNotes('');
    setAssignModalOpen(true);
    try {
      const staffList = await complaintService.getDepartmentStaff(comp.department_id);
      setAssignableStaff(staffList);
      if (staffList.length > 0) setAssigneeId(staffList[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !assigneeId) return;
    setActionLoading(true);
    try {
      await complaintService.assignComplaint(selectedComplaint.id, {
        assigned_to_user_id: Number(assigneeId),
        notes: assignNotes,
      });
      setAssignModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign complaint');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Duplicate Modal
  const openDuplicateModal = (comp) => {
    setSelectedComplaint(comp);
    setParentTrackingNo('');
    setDuplicateModalOpen(true);
  };

  // Submit Duplicate Link
  const handleDuplicateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !parentTrackingNo) return;
    setActionLoading(true);
    try {
      const parent = await complaintService.getComplaint(parentTrackingNo.trim());
      await complaintService.linkDuplicate(selectedComplaint.id, parent.id);
      setDuplicateModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to link duplicate ticket');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter complaints based on tab & filters
  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === 'unverified' && c.status !== 'Submitted') return false;
    if (activeTab === 'overdue' && c.priority !== 'Critical' && c.status === 'Resolved') return false;
    if (activeTab === 'duplicates' && !c.is_duplicate) return false;

    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
    if (deptFilter !== 'All' && c.department_id !== Number(deptFilter)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTrack = c.tracking_number?.toLowerCase().includes(q);
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchAddr = c.address?.toLowerCase().includes(q);
      if (!matchTrack && !matchTitle && !matchAddr) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Role Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <Shield className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Triage & Dispatch Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <b className="text-slate-800">{user?.full_name || 'Administrator'}</b> ({user?.role || 'admin'}). Verify incoming issues, assign technicians, and close work orders.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Queue
          </span>
          <span className="text-2xl font-extrabold text-slate-900">
            {adminStats?.total_complaints || complaints.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">
            New Submitted
          </span>
          <span className="text-2xl font-extrabold text-blue-600">
            {adminStats?.pending_verification || 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider block">
            Awaiting Assign
          </span>
          <span className="text-2xl font-extrabold text-purple-600">
            {adminStats?.awaiting_assignment || 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider block">
            Active Critical
          </span>
          <span className="text-2xl font-extrabold text-red-600">
            {adminStats?.critical_active || 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
            Overdue / SLA Alert
          </span>
          <span className="text-2xl font-extrabold text-amber-600">
            {adminStats?.overdue_escalations || 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
            Duplicates Caught
          </span>
          <span className="text-2xl font-extrabold text-emerald-600">
            {adminStats?.detected_duplicates || 0}
          </span>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 pb-2 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 transition-colors ${
              activeTab === 'all'
                ? 'border-b-2 border-indigo-600 text-indigo-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Reports ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('unverified')}
            className={`pb-2 transition-colors ${
              activeTab === 'unverified'
                ? 'border-b-2 border-indigo-600 text-indigo-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            New Submissions Pending Verification
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`pb-2 transition-colors ${
              activeTab === 'overdue'
                ? 'border-b-2 border-indigo-600 text-indigo-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Critical / Escalated
          </button>
        </div>

        {/* Search & Select Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Tracking ID, keyword, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none"
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
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Triage Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Issue Title & Locality</th>
                <th className="py-3 px-4">Category / Dept</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No tickets found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Link
                        to={`/track/${c.tracking_number}`}
                        className="font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        #{c.tracking_number}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        📍 {c.address}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{c.category_name}</div>
                      <div className="text-[11px] text-slate-400">{c.department_name}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {c.current_assignment?.assigned_to_name ? (
                        <span className="font-medium text-slate-800">
                          {c.current_assignment.assigned_to_name}
                        </span>
                      ) : (
                        <span className="text-amber-600 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => openStatusModal(c)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] transition-colors"
                        title="Update Status"
                      >
                        Status
                      </button>

                      <button
                        onClick={() => openAssignModal(c)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] transition-colors"
                        title="Assign Field Technician"
                      >
                        Assign
                      </button>

                      <button
                        onClick={() => openDuplicateModal(c)}
                        className="px-2 py-1 text-slate-400 hover:text-slate-700 rounded-lg"
                        title="Mark as Duplicate"
                      >
                        <CopyCheck className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 1. Modal: Update Status */}
      {statusModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900">
                Update Status for #{selectedComplaint.tracking_number}
              </h3>
              <button onClick={() => setStatusModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Status Value
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="Submitted">Submitted (Under initial triage)</option>
                  <option value="Verified">Verified (Confirmed valid by moderator)</option>
                  <option value="Assigned">Assigned (Sent to field crew)</option>
                  <option value="In Progress">In Progress (Work active on site)</option>
                  <option value="Resolved">Resolved (Remediation completed)</option>
                  <option value="Rejected">Rejected (Invalid or duplicate)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Audit Notes / Reason
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified pothole depth on street inspection. Priority confirmed."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {newStatus === 'Resolved' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Remediation / Resolution Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe how the road/drainage was fixed, materials used, sign-off..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {actionLoading ? 'Saving...' : 'Update & Notify Citizen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Assign Technician */}
      {assignModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900">
                Assign Technician to #{selectedComplaint.tracking_number}
              </h3>
              <button onClick={() => setAssignModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Field Engineer / Technician
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  {assignableStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.department_name || s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dispatch Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inspect site by 2pm today with asphalt hot mix truck."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {actionLoading ? 'Assigning...' : 'Dispatch Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Link Duplicate */}
      {duplicateModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900">
                Mark #{selectedComplaint.tracking_number} as Duplicate
              </h3>
              <button onClick={() => setDuplicateModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleDuplicateSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                This will link this complaint to the primary master ticket and mark this ticket as <b className="text-rose-600">Rejected (Duplicate)</b>.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Ticket Tracking ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. CVX-2026-10101"
                  value={parentTrackingNo}
                  onChange={(e) => setParentTrackingNo(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDuplicateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {actionLoading ? 'Linking...' : 'Confirm Duplicate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
