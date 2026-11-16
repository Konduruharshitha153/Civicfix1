import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  PlusCircle, 
  MapPin, 
  Clock, 
  ExternalLink, 
  AlertCircle,
  Calendar
} from 'lucide-react';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function MyComplaintsPage() {
  const { user, isAuthenticated } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      complaintService.getMyComplaints()
        .then((data) => setComplaints(data.complaints || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Authentication Required</h2>
        <p className="text-xs text-slate-600">
          Please sign in to view and track all your reported civic complaints.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Reported Civic Issues
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status transitions and technician logs for issues submitted under your citizen account.
          </p>
        </div>

        <Link
          to="/submit"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Report</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Loading your complaints...
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">
            No Complaints Filed Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't submitted any civic issue reports under this account. Notice a broken road or overflowing garbage?
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report First Issue</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    #{c.tracking_number}
                  </span>
                  <StatusBadge status={c.status} size="sm" />
                  <PriorityBadge priority={c.priority} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-1">
                  {c.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-xs">{c.address}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                <Link
                  to={`/track/${c.tracking_number}`}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  <span>Track Timeline</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
