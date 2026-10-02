import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Vote,
  Clock,
  Percent,
  ShieldAlert,
  Lock,
  RefreshCw,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Search,
  Eye,
  Database,
  Shield,
  Ban,
  Unlock,
  Fingerprint,
  ScanFace,
  X,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import {
  AdminStats,
  AuditLog,
  LedgerItem,
  StepType,
  Voter,
  DashboardTab,
  RegisteredVoterRecord,
  LoginRecord,
} from '../types';

interface AdminDashboardProps {
  currentUser: Voter | null;
  onNavigate: (step: StepType) => void;
  onOpenReceiptVerifierWithId: (id: string) => void;
  initialTab?: DashboardTab;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenReceiptVerifierWithId,
  initialTab = 'OVERVIEW',
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [votersList, setVotersList] = useState<RegisteredVoterRecord[]>([]);
  const [dbLogins, setDbLogins] = useState<LoginRecord[]>([]);
  const [voterSubTab, setVoterSubTab] = useState<'REGISTERED' | 'LOGINS'>('REGISTERED');
  const [voterFilter, setVoterFilter] = useState<'ALL' | 'VOTED' | 'NOT_VOTED' | 'RESTRICTED'>('ALL');
  const [voterSearch, setVoterSearch] = useState('');
  const [selectedVoterRecord, setSelectedVoterRecord] = useState<RegisteredVoterRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [unrestrictingId, setUnrestrictingId] = useState<string | null>(null);

  const handleUnrestrict = async (voterId: string) => {
    setUnrestrictingId(voterId);
    try {
      await api.unrestrictVoter(voterId);
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to lift restriction.');
    } finally {
      setUnrestrictingId(null);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, logsData, votersData, loginsData] = await Promise.all([
        api.getAdminStats(),
        api.getAuditLogs(),
        api.getRegisteredVoters(),
        api.getDatabaseLogins(),
      ]);
      setStats(statsData);
      setAuditLogs(logsData.logs);
      setVotersList(votersData.voters);
      setDbLogins(loginsData.logins);

      // If user is Admin, also fetch ledger
      if (currentUser?.role === 'Administrator') {
        try {
          const ledgerData = await api.getBallotsLedger();
          setLedger(ledgerData.ledger);
        } catch (e) {
          // ignore if officer
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load administrative analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 8000); // Polling update
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleResetElection = async () => {
    setIsResetting(true);
    setResetMessage(null);
    try {
      const res = await api.resetDemoElection();
      setResetMessage(res.message);
      setShowResetConfirm(false);
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to reset election.');
    } finally {
      setIsResetting(false);
    }
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.voterTokenOrId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Election Command Center & Transparency Portal
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                currentUser?.role === 'Administrator'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : currentUser?.role === 'Election Officer'
                  ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {currentUser?.role || 'Public Transparency Mode'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time election oversight: Executive Overview, Candidate Tallies & Charts, Security Audit Trail, and Restricted Voter IDs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {currentUser?.role === 'Administrator' && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="py-2.5 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Election
            </button>
          )}
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`py-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Executive Overview
        </button>

        <button
          onClick={() => setActiveTab('TALLIES')}
          className={`py-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'TALLIES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Vote className="w-4 h-4" />
          Candidate Tallies & Charts
        </button>

        <button
          onClick={() => setActiveTab('VOTERS')}
          className={`py-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'VOTERS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-500" />
          <span>Voter Database Directory ({votersList.length})</span>
        </button>

        {currentUser?.role === 'Administrator' && (
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`py-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'LEDGER'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            Cryptographic Ballots Ledger ({ledger.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`py-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'AUDIT'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Security Audit Trail ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('RESTRICTED')}
          className={`py-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'RESTRICTED'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Ban className="w-4 h-4 text-red-500" />
          <span>Restricted IDs</span>
          {stats?.restrictedVotersCount ? (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-red-100 text-red-700">
              {stats.restrictedVotersCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && stats && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Total Registered</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{stats.totalRegistered}</div>
              <div className="text-[11px] text-slate-500">Verified KYC voter profiles</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Total Votes Cast</span>
                <Vote className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-700">{stats.totalVotesCast}</div>
              <div className="text-[11px] text-emerald-600 font-medium">Ballots sealed in database</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Pending Voters</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{stats.pendingVoters}</div>
              <div className="text-[11px] text-slate-500">Eligible to cast ballot</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Voter Turnout</span>
                <Percent className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold text-indigo-700">{stats.votingPercentage}</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: stats.votingPercentage }}
                />
              </div>
            </div>
          </div>

          {/* Security & Threat Defenses Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  Failed Auth Attempts
                </span>
                <div className="text-2xl font-extrabold text-amber-900">
                  {stats.failedAttemptsCounter}
                </div>
                <div className="text-xs text-amber-700">
                  Simulated biometric mismatches & incorrect passwords intercepted
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">
                  Duplicate Attempts Blocked
                </span>
                <div className="text-2xl font-extrabold text-red-900">
                  {stats.duplicateAttemptsCounter}
                </div>
                <div className="text-xs text-red-700">
                  Atomic backend mutex strictly rejected second vote submissions
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-red-300 bg-red-50/60 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-900 uppercase tracking-wider block">
                  Restricted Voter IDs
                </span>
                <div className="text-2xl font-black text-red-700">
                  {stats.restrictedVotersCount || 0}
                </div>
                <div className="text-xs text-red-800">
                  One Person, One Vote enforcement suspended duplicate actors
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-200 text-red-800 flex items-center justify-center flex-shrink-0">
                <Ban className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Summary of Candidates */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Live Contested Candidates Breakdown
            </h3>
            <div className="space-y-3">
              {stats.candidateTallies.map((c) => (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <span>{c.symbol}</span>
                      <span>{c.name}</span>
                      <span className="font-normal text-slate-500">({c.party})</span>
                    </span>
                    <span className="text-slate-700 font-mono">
                      {c.votes} votes ({c.percentage})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATE TALLIES & CHARTS */}
      {activeTab === 'TALLIES' && stats && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Official Candidate Tallies</h3>
              <p className="text-xs text-slate-500">
                Aggregated from cryptographically verified ballots in the electronic ballot box.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Total Valid Ballots: <strong>{stats.totalVotesCast}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.candidateTallies.map((candidate) => (
              <div
                key={candidate.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={candidate.photoUrl}
                    alt={candidate.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{candidate.name}</h4>
                      <span className="text-xl">{candidate.symbol}</span>
                    </div>
                    <p className="text-xs font-semibold text-blue-700">{candidate.party}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{candidate.description}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-200/80">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500">Vote Share:</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {candidate.votes} votes ({candidate.percentage})
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${candidate.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: REGISTERED VOTERS & ACTIVITY DIRECTORY (DATABASE RECORDS) */}
      {activeTab === 'VOTERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-extrabold text-slate-900">
                  Registered Voters & Activity Directory
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Central database registry showing all registered citizens, login timestamps, biometric enrollment, and real-time voting status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 font-bold">
                {votersList.length} Citizens • {dbLogins.length} Logins in DB
              </span>
            </div>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setVoterSubTab('REGISTERED')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                voterSubTab === 'REGISTERED'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Registered Citizens Directory ({votersList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setVoterSubTab('LOGINS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                voterSubTab === 'LOGINS'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database Login History Log ({dbLogins.length})</span>
            </button>
          </div>

          {/* VIEW A: REGISTERED CITIZENS DIRECTORY */}
          {voterSubTab === 'REGISTERED' && (
            <>
              {/* Quick Summary Pill Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setVoterFilter('ALL')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    voterFilter === 'ALL'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-200 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Total Registered</div>
                  <div className="text-2xl font-black text-slate-900">{votersList.length}</div>
                  <div className="text-[10px] text-slate-400">All database records</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVoterFilter('VOTED')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    voterFilter === 'VOTED'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-200 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-bold text-emerald-800 uppercase">Voted (Committed)</div>
                  <div className="text-2xl font-black text-emerald-700">
                    {votersList.filter((v) => v.hasVoted).length}
                  </div>
                  <div className="text-[10px] text-emerald-600">Ballots sealed in ledger</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVoterFilter('NOT_VOTED')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    voterFilter === 'NOT_VOTED'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-200 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-bold text-blue-800 uppercase">Pending Vote</div>
                  <div className="text-2xl font-black text-blue-700">
                    {votersList.filter((v) => !v.hasVoted && !v.isRestricted).length}
                  </div>
                  <div className="text-[10px] text-blue-600">Eligible to cast ballot</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVoterFilter('RESTRICTED')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    voterFilter === 'RESTRICTED'
                      ? 'border-red-600 bg-red-50/70 ring-2 ring-red-200 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-bold text-red-800 uppercase">Restricted IDs</div>
                  <div className="text-2xl font-black text-red-700">
                    {votersList.filter((v) => v.isRestricted).length}
                  </div>
                  <div className="text-[10px] text-red-600">Duplicate vote lockouts</div>
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, email or document..."
                    value={voterSearch}
                    onChange={(e) => setVoterSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-200 bg-slate-50"
                  />
                </div>

                <div className="text-xs text-slate-500 font-mono self-end sm:self-auto">
                  Showing{' '}
                  <strong>
                    {
                      votersList.filter((v) => {
                        const matchesSearch =
                          v.id.toLowerCase().includes(voterSearch.toLowerCase()) ||
                          v.name.toLowerCase().includes(voterSearch.toLowerCase()) ||
                          v.email.toLowerCase().includes(voterSearch.toLowerCase()) ||
                          v.idNumberMasked.toLowerCase().includes(voterSearch.toLowerCase());
                        if (!matchesSearch) return false;
                        if (voterFilter === 'VOTED') return v.hasVoted && !v.isRestricted;
                        if (voterFilter === 'NOT_VOTED') return !v.hasVoted && !v.isRestricted;
                        if (voterFilter === 'RESTRICTED') return v.isRestricted;
                        return true;
                      }).length
                    }
                  </strong>{' '}
                  of {votersList.length} citizens
                </div>
              </div>

              {/* Voters Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Voter / Registry ID</th>
                      <th className="p-3.5">Citizen Profile</th>
                      <th className="p-3.5">KYC Document</th>
                      <th className="p-3.5">Database Registration</th>
                      <th className="p-3.5">Last Login Activity</th>
                      <th className="p-3.5">Biometrics</th>
                      <th className="p-3.5">Voting Status</th>
                      <th className="p-3.5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {votersList
                      .filter((v) => {
                        const matchesSearch =
                          v.id.toLowerCase().includes(voterSearch.toLowerCase()) ||
                          v.name.toLowerCase().includes(voterSearch.toLowerCase()) ||
                          v.email.toLowerCase().includes(voterSearch.toLowerCase()) ||
                          v.idNumberMasked.toLowerCase().includes(voterSearch.toLowerCase());
                        if (!matchesSearch) return false;
                        if (voterFilter === 'VOTED') return v.hasVoted && !v.isRestricted;
                        if (voterFilter === 'NOT_VOTED') return !v.hasVoted && !v.isRestricted;
                        if (voterFilter === 'RESTRICTED') return v.isRestricted;
                        return true;
                      })
                      .map((voter) => (
                        <tr key={voter.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* ID */}
                          <td className="p-3.5">
                            <div className="font-mono font-bold text-slate-900 text-xs">{voter.id}</div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {voter.identityTokenSnippet}
                            </div>
                          </td>

                          {/* Citizen Name & Email */}
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{voter.name}</div>
                            <div className="text-slate-500 text-[11px]">{voter.email}</div>
                            <div className="text-slate-400 text-[10px] font-mono">{voter.mobile}</div>
                          </td>

                          {/* KYC Document */}
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 inline-block mb-1">
                              {voter.idType}
                            </span>
                            <div className="font-mono text-xs text-slate-600">{voter.idNumberMasked}</div>
                          </td>

                          {/* Registration Timestamp */}
                          <td className="p-3.5 text-slate-600 text-[11px] font-mono">
                            <div>{new Date(voter.createdAt).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(voter.createdAt).toLocaleTimeString()}
                            </div>
                          </td>

                          {/* Last Login & Count */}
                          <td className="p-3.5 text-slate-600 text-[11px]">
                            {voter.lastLoginAt ? (
                              <div className="font-mono">
                                <span className="text-slate-700 font-bold">
                                  {new Date(voter.lastLoginAt).toLocaleTimeString()}
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(voter.lastLoginAt).toLocaleDateString()} • {voter.loginCount} {voter.loginCount === 1 ? 'login' : 'logins'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No login recorded</span>
                            )}
                          </td>

                          {/* Biometrics */}
                          <td className="p-3.5">
                            <div className="flex flex-col gap-1 text-[10px]">
                              <span
                                className={`flex items-center gap-1 font-semibold ${
                                  voter.hasRegisteredFingerprint ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                <Fingerprint className="w-3 h-3" />
                                {voter.hasRegisteredFingerprint ? 'FP Enrolled ✓' : 'FP Pending'}
                              </span>
                              <span
                                className={`flex items-center gap-1 font-semibold ${
                                  voter.hasRegisteredFace ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                <ScanFace className="w-3 h-3" />
                                {voter.hasRegisteredFace ? 'Face Enrolled ✓' : 'Face Pending'}
                              </span>
                            </div>
                          </td>

                          {/* Voting Status */}
                          <td className="p-3.5">
                            {voter.isRestricted ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                                  <Ban className="w-3 h-3 text-red-600" />
                                  RESTRICTED 🔒
                                </span>
                                <div className="text-[9px] text-red-600 max-w-[140px] truncate" title={voter.restrictedReason || ''}>
                                  Duplicate attempt blocked
                                </div>
                              </div>
                            ) : voter.hasVoted ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  VOTED ✓
                                </span>
                                {voter.votedAt && (
                                  <div className="text-[9px] font-mono text-emerald-700">
                                    {new Date(voter.votedAt).toLocaleTimeString()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <Clock className="w-3 h-3" />
                                NOT VOTED (ELIGIBLE)
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedVoterRecord(voter)}
                              className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* VIEW B: DATABASE LOGIN ACTIVITY LOG */}
          {voterSubTab === 'LOGINS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-600" />
                    Central Database Login Records Ledger
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Real-time persisted log of citizen, officer, and administrator logins stored in database (<span className="font-mono text-indigo-700">data/election_database.json</span>).
                  </p>
                </div>
                <span className="font-mono font-bold text-indigo-700 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 self-start sm:self-auto">
                  Total Logins: {dbLogins.length}
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] sticky top-0">
                    <tr>
                      <th className="p-3">Session Log ID</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Voter / User ID</th>
                      <th className="p-3">Citizen Name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">IP / Host</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
                    {dbLogins.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-indigo-600 font-bold">{entry.id}</td>
                        <td className="p-3 text-slate-500 font-sans">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-bold text-slate-900">{entry.voterId}</td>
                        <td className="p-3 font-sans font-medium text-slate-800">{entry.name}</td>
                        <td className="p-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {entry.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              entry.status === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {entry.status === 'SUCCESS' ? 'AUTHENTICATED ✓' : 'FAILED ✗'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[10px]">{entry.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CRYPTOGRAPHIC LEDGER INSPECTOR */}
      {activeTab === 'LEDGER' && currentUser?.role === 'Administrator' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <span>Cryptographic Ballots Ledger</span>
              </h3>
              <p className="text-xs text-slate-500">
                Inspect raw sealed ballots. Notice that voter IDs are strictly separated to preserve secret balloting.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              AES-256-GCM Cryptographically Sealed
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Ballot UUID</th>
                  <th className="p-3">Public Receipt ID</th>
                  <th className="p-3">Ciphertext Snippet (AES-GCM)</th>
                  <th className="p-3">96-bit IV</th>
                  <th className="p-3">Auth Tag</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Verify</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {ledger.map((item) => (
                  <tr key={item.ballotId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-blue-600 select-all">{item.ballotId}</td>
                    <td className="p-3 font-semibold select-all text-slate-900">{item.receiptId}</td>
                    <td className="p-3 text-[11px] text-slate-600 select-all">{item.ciphertextSnippet}</td>
                    <td className="p-3 text-[11px] text-slate-500 truncate max-w-[80px]">{item.iv}</td>
                    <td className="p-3 text-[11px] text-slate-500 truncate max-w-[80px]">{item.authTag}</td>
                    <td className="p-3 text-[11px] text-slate-500 font-sans">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onOpenReceiptVerifierWithId(item.receiptId)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 text-[10px] font-bold"
                      >
                        Verify Proof
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Security Audit Log & Access Trail</span>
              </h3>
              <p className="text-xs text-slate-500">
                Append-only forensic event log recording registrations, biometrics, ballot locks, and security warnings.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Voter / Token</th>
                  <th className="p-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-mono text-[11px]">
                {filteredLogs.map((log) => {
                  let badge = 'bg-slate-100 text-slate-700';
                  if (log.status === 'SUCCESS') badge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  if (log.status === 'WARNING') badge = 'bg-amber-100 text-amber-800 border-amber-300';
                  if (log.status === 'BLOCKED' || log.status === 'ALERT')
                    badge = 'bg-red-100 text-red-800 border-red-300 font-bold';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-slate-500">{log.id}</td>
                      <td className="p-3 text-slate-500 font-sans">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] ${badge}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">{log.event}</td>
                      <td className="p-3 text-blue-600 font-bold">{log.voterTokenOrId}</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate" title={log.detail}>
                        {log.detail}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: RESTRICTED VOTER IDS */}
      {activeTab === 'RESTRICTED' && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Restricted Voter IDs (One Person, One Vote Enforcement)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Voters whose IDs have been automatically locked because they attempted to vote again after already submitting a ballot.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-red-50 text-red-800 text-xs font-bold border border-red-200">
              {stats?.restrictedVotersCount || 0} Suspended Credentials
            </div>
          </div>

          {stats?.restrictedVoters && stats.restrictedVoters.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-red-50 text-red-900 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Voter ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Restricted At</th>
                    <th className="p-3">Violation Reason</th>
                    {currentUser?.role === 'Administrator' && <th className="p-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-mono text-[11px]">
                  {stats.restrictedVoters.map((v) => (
                    <tr key={v.id} className="hover:bg-red-50/40 transition-colors">
                      <td className="p-3 font-bold text-red-700">{v.id}</td>
                      <td className="p-3 font-sans font-semibold text-slate-900">{v.name}</td>
                      <td className="p-3 font-sans text-slate-500">
                        {v.restrictedAt !== 'N/A' ? new Date(v.restrictedAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-3 font-sans text-slate-600 max-w-sm truncate" title={v.reason}>
                        {v.reason}
                      </td>
                      {currentUser?.role === 'Administrator' && (
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleUnrestrict(v.id)}
                            disabled={unrestrictingId === v.id}
                            className="py-1 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-sans font-bold transition-all disabled:opacity-50 flex items-center gap-1 ml-auto"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>{unrestrictingId === v.id ? 'Reinstating...' : 'Lift Lock'}</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center space-y-2 text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">No Voter IDs Currently Restricted</div>
              <p className="text-xs max-w-md mx-auto">
                All voter records are in good standing. If a voter attempts to vote a second time, their voter ID will automatically appear here with full forensic timestamps.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Resetting Demo Election */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                Reset Demo Election Database?
              </h3>
              <p className="text-xs text-slate-600">
                This will re-initialize all demo voters (Voter 001 unvoted, Voter 002 voted), clear cast ballots, and reset audit counters.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleResetElection}
                disabled={isResetting}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs text-white shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Demo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Database Passport & Record Modal */}
      {selectedVoterRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Citizen Database Entry & Voting Record
                </h3>
              </div>
              <button
                onClick={() => setSelectedVoterRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Header */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-indigo-600">
                  {selectedVoterRecord.id}
                </div>
                <div className="text-base font-black text-slate-900">
                  {selectedVoterRecord.name}
                </div>
                <div className="text-xs text-slate-500">{selectedVoterRecord.email}</div>
              </div>

              <div>
                {selectedVoterRecord.isRestricted ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
                    RESTRICTED 🔒
                  </span>
                ) : selectedVoterRecord.hasVoted ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    VOTED ✓
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                    NOT VOTED
                  </span>
                )}
              </div>
            </div>

            {/* Database Fields Grid */}
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Database Record ID:</span>
                  <span className="font-bold text-indigo-700">{selectedVoterRecord.databaseRecordId || 'REG-DB-2026-0001'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Document Type:</span>
                  <span className="font-bold text-slate-800">{selectedVoterRecord.idType}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Masked Identifier:</span>
                  <span className="font-bold text-slate-800">{selectedVoterRecord.idNumberMasked}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Identity Hash Token:</span>
                  <span className="text-[10px] text-slate-600 truncate max-w-[220px]">
                    {selectedVoterRecord.identityTokenSnippet}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Registered in Database:</span>
                  <span className="text-slate-800 font-semibold font-sans">
                    {new Date(selectedVoterRecord.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Last Login Timestamp:</span>
                  <span className="text-slate-800 font-semibold font-sans">
                    {selectedVoterRecord.lastLoginAt
                      ? new Date(selectedVoterRecord.lastLoginAt).toLocaleString()
                      : 'Never logged in'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Total Database Sessions:</span>
                  <span className="text-slate-800 font-bold">
                    {selectedVoterRecord.loginCount} session(s)
                  </span>
                </div>

                {selectedVoterRecord.receiptId && (
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-sans">Receipt Identifier:</span>
                    <span className="font-bold text-indigo-700">{selectedVoterRecord.receiptId}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Fingerprint Token:</span>
                  <span className={selectedVoterRecord.hasRegisteredFingerprint ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {selectedVoterRecord.hasRegisteredFingerprint ? 'Enrolled ✓ (Minutiae Hash)' : 'Not Enrolled'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Facial Biometric Vector:</span>
                  <span className={selectedVoterRecord.hasRegisteredFace ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {selectedVoterRecord.hasRegisteredFace ? 'Enrolled ✓ (512-D Landmark Vector)' : 'Not Enrolled'}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Vote Committed:</span>
                  <span className={selectedVoterRecord.hasVoted ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                    {selectedVoterRecord.hasVoted
                      ? `Yes, at ${selectedVoterRecord.votedAt ? new Date(selectedVoterRecord.votedAt).toLocaleString() : 'Recorded'}`
                      : 'No, ballot pending'}
                  </span>
                </div>

                {selectedVoterRecord.isRestricted && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] font-sans">
                    <strong>Lockout Reason:</strong> {selectedVoterRecord.restrictedReason}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setSelectedVoterRecord(null)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
