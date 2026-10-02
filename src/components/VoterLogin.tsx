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
  CheckCircle2,
  Database,
  Calendar,
  Vote,
  Ban,
  Clock,
  ExternalLink,
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
  const [authenticatedVoter, setAuthenticatedVoter] = useState<Voter | null>(null);

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
      setAuthenticatedVoter(res.voter);
    } catch (err: any) {
      setError(err.message || 'Invalid Voter ID or Password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!authenticatedVoter) return;
    onSuccess(authenticatedVoter);
  };

  const handleApplyPreset = (id: string, pass: string) => {
    setVoterId(id);
    setPassword(pass);
    setError(null);
    setAuthenticatedVoter(null);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* If citizen authenticated, display their live database record and voting status */}
        {authenticatedVoter ? (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Success Banner */}
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-inner border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block">
                AUTHENTICATED & LOGGED IN DATABASE ✓
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome, {authenticatedVoter.name}
              </h2>
              <p className="text-xs text-slate-500">
                Identity confirmed in central voter registry with active cryptographic session.
              </p>
            </div>

            {/* Voter Database Details Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>Central Database Record</span>
                </div>
                <span className="font-mono font-bold text-indigo-700">
                  {authenticatedVoter.databaseRecordId || 'REG-DB-2026-ACTIVE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-white border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Voter / Student ID</span>
                  <span className="font-mono font-bold text-blue-600">{authenticatedVoter.id}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Role / Access</span>
                  <span className="font-bold text-slate-800">{authenticatedVoter.role}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">KYC Document</span>
                  <span className="font-mono font-bold text-slate-700">{authenticatedVoter.idNumberMasked}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Login Session Count</span>
                  <span className="font-mono font-bold text-indigo-600">
                    Session #{authenticatedVoter.loginCount || 1}
                  </span>
                </div>
              </div>

              {/* Voting Status Highlight in Login */}
              <div className="p-3 rounded-xl border bg-white space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Voting Status in Database</span>
                  {authenticatedVoter.isRestricted ? (
                    <span className="text-red-700 font-bold flex items-center gap-1">
                      <Ban className="w-3 h-3" /> RESTRICTED
                    </span>
                  ) : authenticatedVoter.hasVoted ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> VOTED ✓
                    </span>
                  ) : (
                    <span className="text-blue-700 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> NOT VOTED (ELIGIBLE)
                    </span>
                  )}
                </div>

                {authenticatedVoter.isRestricted ? (
                  <div className="text-[11px] text-red-700 font-medium">
                    {authenticatedVoter.restrictedReason ||
                      'Voter ID restricted for duplicate voting attempt under One Person, One Vote enforcement.'}
                  </div>
                ) : authenticatedVoter.hasVoted ? (
                  <div className="text-[11px] text-emerald-800 space-y-1">
                    <div>You have already cast your ballot in this election.</div>
                    {authenticatedVoter.votedAt && (
                      <div className="text-[10px] font-mono text-emerald-700">
                        Voted on: {new Date(authenticatedVoter.votedAt).toLocaleString()}
                      </div>
                    )}
                    {authenticatedVoter.receiptId && (
                      <div className="text-[10px] font-mono text-slate-600">
                        Receipt: {authenticatedVoter.receiptId}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-600">
                    Your single ballot is ready. Remember: One Person, One Vote applies — attempting to vote a second time will restrict your voter ID.
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleContinue}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
              >
                {authenticatedVoter.role === 'Administrator' || authenticatedVoter.role === 'Election Officer' ? (
                  <>
                    <span>Enter Authority Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Proceed to Live Face Camera Verification & Ballot</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAuthenticatedVoter(null)}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Switch Account / Sign In with Another ID
              </button>
            </div>
          </div>
        ) : (
          <>
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
                Sign in with your registered Voter ID. Login events are recorded in the election database.
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
                      Authenticating & Recording in DB...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Login & View Voter Details
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
          </>
        )}
      </div>
    </div>
  );
};

