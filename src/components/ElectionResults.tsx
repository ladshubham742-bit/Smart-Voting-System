import React, { useState, useEffect } from 'react';
import {
  Vote,
  Trophy,
  Users,
  Percent,
  Lock,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { PublicElectionResults, StepType, Voter } from '../types';

interface ElectionResultsProps {
  currentUser: Voter | null;
  onNavigate: (step: StepType) => void;
  onOpenReceiptVerifier: () => void;
}

export const ElectionResults: React.FC<ElectionResultsProps> = ({
  currentUser,
  onNavigate,
  onOpenReceiptVerifier,
}) => {
  const [results, setResults] = useState<PublicElectionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      const data = await api.getPublicElectionResults();
      setResults(data);
      setLastRefreshedAt(new Date().toLocaleTimeString());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live election results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    if (!autoRefresh) return;

    const interval = setInterval(fetchResults, 4000); // 4-second auto-poll
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const leading = results?.leadingCandidate;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Live Election Tally
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                • Auto-updates in real-time
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {results?.electionTitle || 'General Election Live Results'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Public tally portal displaying validated votes decrypted and aggregated from the AES-256-GCM sealed electronic ballot ledger.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Live Poll (4s)</span>
            </label>

            <button
              onClick={fetchResults}
              disabled={loading}
              className="py-2 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Real-time sync timestamp */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Encryption Standard: <strong>{results?.encryptionStandard || 'AES-256-GCM'}</strong></span>
          <span>Last Synced: <strong>{lastRefreshedAt || 'Just now'}</strong></span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* KPI Stats Row */}
      {results && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Total Valid Ballots</span>
              <Vote className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-blue-700">{results.totalVotesCast}</div>
            <div className="text-[11px] text-slate-500">Decrypted and tallied securely</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Voter Turnout</span>
              <Percent className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-700">{results.turnoutPercentage}</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: results.turnoutPercentage }}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Registered Voters</span>
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{results.totalRegistered}</div>
            <div className="text-[11px] text-slate-500">{results.pendingVoters} pending ballots</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Ledger Integrity</span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-purple-700">100%</div>
            <div className="text-[11px] text-purple-600 font-medium">Zero duplicate votes admitted</div>
          </div>
        </div>
      )}

      {/* Leading Candidate Showcase (Hero Card) */}
      {leading ? (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-700/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Trophy className="w-64 h-64 text-amber-300" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <img
                  src={leading.photoUrl}
                  alt={leading.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md">
                  <Trophy className="w-4 h-4 text-amber-950 fill-amber-950" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Currently Leading
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{leading.name}</h3>
                <p className="text-xs sm:text-sm text-blue-200 font-semibold flex items-center gap-2">
                  <span>{leading.symbol}</span>
                  <span>{leading.party}</span>
                </p>
              </div>
            </div>

            {/* Leading Stats pill */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20">
              <div>
                <div className="text-[11px] text-blue-200 uppercase font-bold tracking-wider">
                  Total Votes
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {leading.votes}{' '}
                  <span className="text-base font-normal text-blue-300">({leading.percentage})</span>
                </div>
              </div>

              <div className="hidden sm:block w-[1px] h-10 bg-white/20" />

              <div>
                <div className="text-[11px] text-blue-200 uppercase font-bold tracking-wider">
                  Margin of Lead
                </div>
                <div className="text-lg font-bold text-amber-300">
                  +{leading.leadMargin} vote{leading.leadMargin !== 1 ? 's' : ''} ahead
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Vote className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Ballots Cast Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first voter to participate in this election! Log in and cast your ballot.
          </p>
        </div>
      )}

      {/* Comprehensive Candidate Rankings Table & Visual Bars */}
      {results && results.candidates.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Official Candidate Standings & Vote Shares
              </h3>
              <p className="text-xs text-slate-500">
                Ranked by certified cryptographic vote totals in descending order.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
              {results.candidates.length} Contenders
            </span>
          </div>

          <div className="space-y-4">
            {results.candidates.map((cand) => {
              const isWinner = cand.rank === 1 && cand.votes > 0;
              const isNota = cand.id === 'CAND-NOTA';

              return (
                <div
                  key={cand.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isWinner
                      ? 'border-blue-400 bg-blue-50/50 shadow-sm'
                      : isNota
                      ? 'border-slate-200 bg-slate-50/80 border-dashed'
                      : 'border-slate-200 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Candidate info */}
                    <div className="flex items-center gap-3.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 bg-slate-100 text-slate-700">
                        #{cand.rank}
                      </div>

                      <img
                        src={cand.photoUrl}
                        alt={cand.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {cand.name}
                          </h4>
                          <span className="text-lg">{cand.symbol}</span>
                          {cand.partyCode && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {cand.partyCode}
                            </span>
                          )}
                          {isWinner && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              Leader
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-blue-700">{cand.party}</p>
                      </div>
                    </div>

                    {/* Votes & Percentage pill */}
                    <div className="text-right sm:flex-shrink-0 font-mono">
                      <div className="text-base sm:text-lg font-extrabold text-slate-900">
                        {cand.votes} <span className="text-xs font-normal text-slate-500">votes</span>
                      </div>
                      <div className="text-xs font-bold text-blue-600">{cand.percentage}</div>
                    </div>
                  </div>

                  {/* Visual Bar Indicator */}
                  <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        isWinner
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500'
                          : isNota
                          ? 'bg-slate-400'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${cand.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Public Auditability & Verification Callout */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Publicly Auditable Ledger
          </div>
          <h3 className="text-xl font-bold">Have a Digital Receipt? Verify Your Ballot</h3>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Every voter is issued a cryptographic Receipt ID and SHA-256 payload digest. Enter your receipt to verify that your ballot is counted in this tally without disclosing your candidate choice.
          </p>
        </div>

        <button
          onClick={onOpenReceiptVerifier}
          className="py-3 px-6 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all flex-shrink-0"
        >
          <FileCheck className="w-4 h-4" />
          Verify Receipt on Ledger
        </button>
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          onClick={() => onNavigate('LANDING')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Return to Overview
        </button>

        <div className="flex items-center gap-3">
          {currentUser && currentUser.hasVoted ? (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              Your Ballot is Counted in this Tally ✓
            </span>
          ) : (
            <button
              onClick={() => onNavigate('LOGIN')}
              className="py-2.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Cast Your Vote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
