import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Building2, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatusTimeline from '../components/StatusTimeline';
import ComplaintsMap from '../components/ComplaintsMap';

export default function TrackComplaintPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(id || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadComplaint(id);
    }
  }, [id]);

  const loadComplaint = async (identifier) => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaint(identifier);
      setComplaint(data);
    } catch (err) {
      setError(err.response?.data?.error || `Ticket '${identifier}' could not be found.`);
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    navigate(`/track/${searchInput.trim().toUpperCase()}`);
    loadComplaint(searchInput.trim().toUpperCase());
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Search Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Track Civic Issue Resolution
        </h1>
        <p className="text-xs text-slate-600 mb-6">
          Enter your unique complaint tracking number (e.g. <span className="font-mono text-emerald-700 font-bold">CVX-2026-10101</span>) to view real-time status and technician updates.
        </p>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Tracking ID (e.g. CVX-2026-10101)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            {loading ? 'Searching...' : 'Search Ticket'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="font-bold text-sm text-red-800">{error}</h3>
          <p className="text-xs text-red-600">
            Please verify the tracking number or try one of the demo tickets: <span className="font-mono font-bold">CVX-2026-10101</span>, <span className="font-mono font-bold">CVX-2026-10201</span>
          </p>
        </div>
      )}

      {/* Complaint Detail View */}
      {complaint && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Top Info Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono font-extrabold text-lg sm:text-xl text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  {complaint.tracking_number}
                </span>
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Link Copied!' : 'Share Ticket'}</span>
              </button>
            </div>

            {/* Title & Metadata */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
                {complaint.title}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Detail Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Category</span>
                <span className="font-bold text-slate-800">{complaint.category_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Responsible Dept</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  {complaint.department_name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Reported On</span>
                <span className="font-semibold text-slate-800">
                  {new Date(complaint.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Assigned Crew</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  {complaint.current_assignment?.assigned_to_name || 'Awaiting assignment'}
                </span>
              </div>
            </div>

            {/* Photo Evidence & Resolution Proof */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Citizen Photo Evidence
                </h4>
                {complaint.image_url ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm max-h-72">
                    <img
                      src={complaint.image_url}
                      alt="Citizen Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
                    No photo uploaded with this report
                  </div>
                )}
              </div>

              {/* Resolution Note if resolved */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Remediation & Closure Notes
                </h4>
                {complaint.status === 'Resolved' ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Issue Remediation Signed Off</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {complaint.resolution_notes || 'Field team resolved the complaint according to municipal standards.'}
                    </p>
                    {complaint.resolved_at && (
                      <div className="text-[11px] text-emerald-700 font-mono pt-1">
                        Resolved on {new Date(complaint.resolved_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    Remediation notes will appear here once municipal maintenance resolves the issue.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Interactive OpenStreetMap View */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Geographic Pin on OpenStreetMap</span>
              </h3>
              <span className="text-xs text-slate-500 truncate max-w-sm">
                📍 {complaint.address || `${complaint.latitude}, ${complaint.longitude}`}
              </span>
            </div>

            <ComplaintsMap
              complaints={[complaint]}
              centerLat={complaint.latitude}
              centerLon={complaint.longitude}
              zoom={15}
              height="360px"
            />
          </div>

          {/* Full Status Progression Stepper and Audit Trail */}
          <StatusTimeline
            currentStatus={complaint.status}
            history={complaint.status_history || []}
            isRejected={complaint.status === 'Rejected'}
          />

        </div>
      )}

    </div>
  );
}
