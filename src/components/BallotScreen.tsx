import React, { useState, useEffect } from 'react';
import {
  Vote,
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  ShieldCheck,
  X,
  FileCheck,
  Sparkles,
  Ban,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { Candidate, EncryptedReceipt, StepType, Voter } from '../types';

interface BallotScreenProps {
  currentUser: Voter | null;
  onVoteCastSuccess: (receipt: EncryptedReceipt) => void;
  onNavigate: (step: StepType) => void;
  onOpenReceiptVerifierWithId: (id: string) => void;
}

export const BallotScreen: React.FC<BallotScreenProps> = ({
  currentUser,
  onVoteCastSuccess,
  onNavigate,
  onOpenReceiptVerifierWithId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votedAt, setVotedAt] = useState<string | null>(null);
  const [isRestricted, setIsRestricted] = useState<boolean>(false);
  const [restrictedReason, setRestrictedReason] = useState<string | null>(null);
  const [restrictedAt, setRestrictedAt] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [electionTitle, setElectionTitle] = useState('General Campus Election');

  // Voting state
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionStepText, setEncryptionStepText] = useState('Initializing AES-256-GCM cipher...');
  const [encryptionSuccess, setEncryptionSuccess] = useState(false);

  // Check voter status from server (Source of Truth)
  useEffect(() => {
    let mounted = true;

    async function loadBallotState() {
      setLoading(true);
      setError(null);

      try {
        // Query server as absolute source of truth
        const status = await api.getVoterStatus();

        if (status.isRestricted || status.hasVoted) {
          if (mounted) {
            setHasVoted(status.hasVoted);
            setIsRestricted(status.isRestricted || false);
            setRestrictedReason(status.restrictedReason || null);
            setRestrictedAt(status.restrictedAt || null);
            setVotedAt(status.votedAt);
            setLoading(false);
          }
          return;
        }

        // Voter has not voted, load candidates
        const ballotData = await api.getCandidates();
        if (mounted) {
          setCandidates(ballotData.candidates);
          setElectionTitle(ballotData.electionTitle);
          setHasVoted(false);
          setIsRestricted(false);
        }
      } catch (err: any) {
        if (mounted) {
          const errMsg = err.message || '';
          if (errMsg.includes('RESTRICTED') || errMsg.includes('already cast') || errMsg.includes('already voted')) {
            setHasVoted(true);
            setIsRestricted(true);
            setRestrictedReason(errMsg);
          } else {
            setError(err.message || 'Failed to initialize official ballot.');
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadBallotState();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCastVote = async () => {
    if (!selectedCandidateId) return;

    setShowConfirmModal(false);
    setIsEncrypting(true);
    setError(null);

    // Live cryptographic encryption visualization
    setEncryptionStepText('1. Generating cryptographically secure 96-bit Initialization Vector (IV)...');
    await new Promise((r) => setTimeout(r, 600));

    setEncryptionStepText('2. Applying AES-256-GCM authenticated cipher with Master Election Key...');
    await new Promise((r) => setTimeout(r, 600));

    setEncryptionStepText('3. Calculating 128-bit Galois Authentication Tag & ballot checksum...');
    await new Promise((r) => setTimeout(r, 600));

    setEncryptionStepText('4. Anonymizing ballot payload and committing atomic double-vote lock...');

    try {
      const res = await api.castVote(selectedCandidateId);
      setEncryptionSuccess(true);
      setEncryptionStepText('Vote encrypted successfully ✓');

      await new Promise((r) => setTimeout(r, 700));
      onVoteCastSuccess(res.receipt);
    } catch (err: any) {
      setIsEncrypting(false);
      const errMsg = err.message || 'Double voting prohibited or database failure.';
      setError(errMsg);

      // If user attempted duplicate voting, server restricts them
      if (errMsg.includes('RESTRICTED') || errMsg.includes('already recorded') || errMsg.includes('already cast')) {
        setHasVoted(true);
        setIsRestricted(true);
        setRestrictedReason(errMsg);
      }
    }
  };

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">
          Querying Election Server for One Person, One Vote Compliance...
        </p>
      </div>
    );
  }

  // CASE 1: VOTER HAS ALREADY VOTED OR ATTEMPTED TO VOTE AGAIN -> VOTER ID RESTRICTED
  if (hasVoted || isRestricted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl border-2 border-red-300 shadow-2xl p-6 sm:p-8 space-y-6 text-center">
          {/* Header Icon */}
          <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner ring-4 ring-red-50">
            <Ban className="w-11 h-11" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Voter ID Restricted • One Person, One Vote Enforced</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Access Denied: Voter ID Suspended
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              In accordance with democratic election guidelines, <strong>each voter is strictly permitted to vote only once</strong>. Because your ballot has already been recorded in the cryptographic ledger, your voter ID has been restricted from accessing the ballot again.
            </p>
          </div>

          {/* Audit Verification & Security Lock Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-red-200 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Voter Registry ID:</span>
              <span className="font-bold text-slate-900">{currentUser?.id || 'AUTHENTICATED_VOTER'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Original Vote Committed:</span>
              <span className="font-semibold text-slate-800">
                {votedAt ? new Date(votedAt).toLocaleString() : 'Recorded in Current Session'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Restriction Status:</span>
              <span className="font-black text-red-700 bg-red-100 px-2 py-0.5 rounded text-[11px]">
                RESTRICTED / SUSPENDED
              </span>
            </div>

            <div className="py-1 text-[11px] text-red-700 leading-tight">
              <strong>Violation Reason:</strong>{' '}
              {restrictedReason ||
                'Attempted second ballot access or duplicate voting transaction after having already cast a vote.'}
            </div>

            <div className="flex justify-between py-1.5 border-t border-slate-200 text-[10px] text-slate-500 font-sans">
              <span>Security Policy:</span>
              <span>Atomic Mutex Guard & Immutable Ledger Token</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('RESULTS')}
              className="py-3 px-5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Public Live Election Results</span>
            </button>
            <button
              onClick={() => onNavigate('LANDING')}
              className="py-3 px-5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-all"
            >
              Return to Landing Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: VOTER IS ELIGIBLE -> SHOW OFFICIAL BALLOT
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Step 7 of 8 • Official Electronic Ballot
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {electionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              One Person, One Vote. Once cast, your ballot is irreversibly encrypted and your voter ID is finalized.
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Authenticated Voter
            </div>
            <div className="text-xs font-bold text-slate-800">{currentUser?.name}</div>
            <div className="text-[10px] font-mono text-slate-500">{currentUser?.id}</div>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-amber-950">One-Time Voting Warning</div>
            <div className="text-[11px] text-amber-800">
              You can vote exactly <strong>one time</strong>. If you attempt to vote again after submitting, your voter ID will be automatically restricted under election security rules.
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider px-1">
          Select Your Candidate Choice
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {candidates.map((c) => {
            const isSelected = selectedCandidateId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCandidateId(c.id)}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Photo / Avatar */}
                  <img
                    src={c.photoUrl}
                    alt={c.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />

                  {/* Candidate Details */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.symbol}</span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{c.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {c.partyCode}
                      </span>
                    </div>
                    <div className="text-xs text-blue-700 font-semibold">{c.party}</div>
                    <p className="text-[11px] text-slate-500 max-w-md line-clamp-2">
                      {c.description}
                    </p>
                  </div>
                </div>

                {/* Radio selection check */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cast Ballot Action Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm sticky bottom-4 z-20">
        <div>
          <div className="text-xs text-slate-500">Currently Selected:</div>
          <div className="text-sm font-extrabold text-slate-900">
            {selectedCandidate ? (
              <span className="text-blue-600 flex items-center gap-1.5">
                <span>{selectedCandidate.symbol}</span>
                <span>{selectedCandidate.name}</span>
              </span>
            ) : (
              <span className="text-slate-400 italic">None selected yet</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={!selectedCandidateId || isEncrypting}
          className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Vote className="w-4 h-4" />
          <span>Confirm & Encrypt Vote</span>
        </button>
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Confirm Final Ballot Submission</span>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-center space-y-2">
              <div className="text-3xl">{selectedCandidate.symbol}</div>
              <div className="text-lg font-black text-slate-900">{selectedCandidate.name}</div>
              <div className="text-xs font-bold text-blue-700">{selectedCandidate.party}</div>
            </div>

            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Irreversible Vote Action</span>
              </div>
              <p className="text-[11px] text-red-800 leading-relaxed">
                You are about to cast your vote for <strong>{selectedCandidate.name}</strong>. In accordance with <strong>One Person, One Vote</strong> rules, this action cannot be undone. Attempting to vote again will permanently lock your voter ID.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Cancel / Change Choice
              </button>
              <button
                onClick={handleCastVote}
                className="py-3 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Vote className="w-4 h-4" />
                <span>Confirm Vote</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Encryption Animation Modal */}
      {isEncrypting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_#38bdf8]">
                <Key className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold tracking-tight text-white">
                {encryptionSuccess ? 'Vote Encrypted & Sealed ✓' : 'Encrypting Ballot with AES-256-GCM'}
              </h3>
              <p className="text-xs text-slate-400">
                Preserving voter anonymity through cryptographic decoupling.
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 font-mono text-xs text-cyan-300 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>{encryptionStepText}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Double-vote atomic mutex locking in progress...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
