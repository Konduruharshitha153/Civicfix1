import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Sparkles, AlertCircle, Shield, User, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin');
      } else {
        navigate('/my-complaints');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginAsDemo(role);
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin');
      } else {
        navigate('/my-complaints');
      }
    } catch (err) {
      setError('Demo login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to CivicFix
        </h1>
        <p className="text-xs text-slate-500">
          Access citizen tracking or municipal administration portals.
        </p>
      </div>

      {/* Quick 1-Click Demo Login Panel */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 p-4 rounded-2xl shadow-xs space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>One-Click Demo Account Login:</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Select any persona to immediately evaluate that perspective:
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleQuickDemo('citizen')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-emerald-100/60 border border-emerald-300 rounded-xl transition-all text-center"
          >
            <User className="w-4 h-4 text-emerald-700 mb-1" />
            <span className="text-xs font-bold text-slate-800">Citizen</span>
            <span className="text-[10px] text-slate-400">Arun</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('staff')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-indigo-100/60 border border-indigo-300 rounded-xl transition-all text-center"
          >
            <Wrench className="w-4 h-4 text-indigo-700 mb-1" />
            <span className="text-xs font-bold text-slate-800">Staff</span>
            <span className="text-[10px] text-slate-400">Kiran</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-purple-100/60 border border-purple-300 rounded-xl transition-all text-center"
          >
            <Shield className="w-4 h-4 text-purple-700 mb-1" />
            <span className="text-xs font-bold text-slate-800">Admin</span>
            <span className="text-[10px] text-slate-400">Moderator</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="citizen@civicfix.org"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <Link to="/register" className="text-emerald-600 font-bold hover:underline">
          Create Citizen Account
        </Link>
      </div>

    </div>
  );
}
