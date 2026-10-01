import React, { useState } from 'react';
import {
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { StepType, Voter } from '../types';

interface VoterLoginProps {
  onSuccess: (voter: Voter) => void;
  onNavigate: (step: StepType) => void;
  presetVoterId?: string;
  presetPassword?: string;
}

export const VoterLogin: React.FC<VoterLoginProps> = ({
  onSuccess,
  onNavigate,
  presetVoterId = '',
  presetPassword = '',
}) => {
  const [voterId, setVoterId] = useState(presetVoterId || 'DEMO-VOTER-001');
  const [password, setPassword] = useState(presetPassword || 'Demo@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!voterId.trim() || !password) {
      setError('Please provide both Voter ID and Password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login(voterId, password);
      onSuccess(res.voter);
    } catch (err: any) {
      setError(err.message || 'Invalid Voter ID or Password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (id: string, pass: string) => {
    setVoterId(id);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
            Step 5 of 8 • Authentication
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Voter & Authority Login
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in with your Voter ID or Student Registry ID. You will proceed to biometric verification.
          </p>
        </div>

        {/* Demo Fast-Select Pills */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Demo Test Accounts (Click to Fill):
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleApplyPreset('DEMO-VOTER-001', 'Demo@123')}
              className={`p-2 rounded-lg text-left border transition-all ${
                voterId === 'DEMO-VOTER-001'
                  ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-semibold truncate">Voter 001 (Eligible)</div>
              <div className="text-slate-500 text-[10px]">hasVoted = false</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('DEMO-VOTER-002', 'Demo@123')}
              className={`p-2 rounded-lg text-left border transition-all ${
                voterId === 'DEMO-VOTER-002'
                  ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-semibold truncate">Voter 002 (Voted)</div>
              <div className="text-slate-500 text-[10px]">Test Double-Vote Block</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('admin', 'Admin@123')}
              className={`p-2 rounded-lg text-left border transition-all ${
                voterId === 'admin'
                  ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold ring-1 ring-purple-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-semibold truncate">Administrator</div>
              <div className="text-slate-500 text-[10px]">Audit Logs & Charts</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('officer', 'Officer@123')}
              className={`p-2 rounded-lg text-left border transition-all ${
                voterId === 'officer'
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-900 font-bold ring-1 ring-cyan-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-semibold truncate">Election Officer</div>
              <div className="text-slate-500 text-[10px]">Monitoring & Audit</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Voter ID / College ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DEMO-VOTER-001 or admin"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all font-mono"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <span className="text-[11px] text-slate-400">Demo: Demo@123 / Admin@123</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Login & Proceed to Biometrics
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have a voter record yet?{' '}
            <button
              onClick={() => onNavigate('REGISTRATION')}
              className="text-blue-600 font-bold hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
