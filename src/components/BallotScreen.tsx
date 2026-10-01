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

        if (status.hasVoted) {
          if (mounted) {
            setHasVoted(true);
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
        }
      } catch (err: any) {
        if (mounted) {
          // If server threw 403 because already voted
          if (err.message && err.message.toLowerCase().includes('already voted')) {
            setHasVoted(true);
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
      setError(err.message || 'Double voting prohibited or database failure.');
      // Refresh status if double voting triggered
      if (err.message && err.message.toLowerCase().includes('already recorded')) {
        setHasVoted(true);
      }
    }
  };

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">
          Querying Election Server for Voter Eligibility & Status...
        </p>
      </div>
    );
  }

  // CASE 1: VOTER HAS ALREADY VOTED -> ACCESS DENIED
  if (hasVoted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border-2 border-red-300 shadow-md p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
              Ballot Access Strictly Denied
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              You Have Already Voted
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Our backend database confirms that your ballot has already been encrypted and committed. In accordance with the <strong>"One Person, One Vote"</strong> democratic standard, duplicate access to the ballot is rejected.
            </p>
          </div>

          {/* Audit Verification Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Voter Registry ID:</span>
              <span className="font-bold text-slate-800">{currentUser?.id || 'AUTHENTICATED_VOTER'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Vote Commitment Timestamp:</span>
              <span className="font-semibold text-red-600">
                {votedAt ? new Date(votedAt).toLocaleString() : 'Recorded in Current Election Session'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Duplicate Attempt Status:</span>
              <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                BLOCKED & LOGGED IN AUDIT TRAIL
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Enforcement Model:</span>
              <span className="text-slate-700">Atomic Backend Mutex Lock</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('LANDING')}
              className="py-3 px-5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-all"
            >
              Return to Landing Page
            </button>
            <button
              onClick={() => onNavigate('ADMIN_DASHBOARD')}
              className="py-3 px-5 rounded-xl font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
            >
              View Election Results on Dashboard
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Step 7 of 8 • Official Electronic Ballot
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {electionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Please review each candidate and mark your preference. Do not reveal your screen to others.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="font-bold">Biometrics Authenticated</div>
              <div className="text-[11px] text-emerald-600">Eligible to Cast 1 Ballot</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Candidate List Cards */}
        <div className="space-y-3 pt-2">
          {candidates.map((candidate) => {
            const isSelected = selectedCandidateId === candidate.id;
            const isNota = candidate.id === 'CAND-NOTA';

            return (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidateId(candidate.id)}
                className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-200'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                } ${isNota ? 'bg-slate-50/80 border-dashed' : ''}`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  {/* Avatar / Symbol */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={candidate.photoUrl}
                      alt={candidate.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs shadow-xs">
                      {candidate.symbol}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {candidate.name}
                      </h4>
                      {candidate.partyCode && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {candidate.partyCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-blue-700">{candidate.party}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-md">
                      {candidate.description}
                    </p>
                  </div>
                </div>

                {/* Radio Button Custom */}
                <div className="flex-shrink-0 pt-1 sm:pt-0">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button: Confirm Candidate */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted with AES-256-GCM upon confirmation.</span>
          </div>

          <button
            type="button"
            disabled={!selectedCandidateId || isEncrypting}
            onClick={() => setShowConfirmModal(true)}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Vote className="w-4 h-4" />
            Confirm Candidate Selection
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                Confirm Your Ballot Selection
              </h3>
              <p className="text-sm text-slate-600">
                You are about to cast your vote for:
              </p>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 font-extrabold text-base">
                {selectedCandidate.name} ({selectedCandidate.party})
              </div>
              <p className="text-xs text-amber-700 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                This action cannot be undone. Once submitted, your vote is cryptographically encrypted and your voter record is locked against duplicate voting.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-3 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel / Change
              </button>

              <button
                type="button"
                onClick={handleCastVote}
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-md shadow-blue-600/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Vote className="w-3.5 h-3.5" />
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Encryption In-Progress Modal */}
      {isEncrypting && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-700 space-y-6 text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                {encryptionSuccess ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-in zoom-in" />
                ) : (
                  <Lock className="w-10 h-10 text-cyan-400 animate-pulse" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold tracking-tight">
                {encryptionSuccess ? 'Vote Encrypted Successfully ✓' : 'Encrypting Vote...'}
              </h3>
              <p className="text-xs font-mono text-cyan-300 h-10 flex items-center justify-center">
                {encryptionStepText}
              </p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-left text-[11px] font-mono text-slate-300 space-y-1">
              <div>Algorithm: <span className="text-cyan-300">AES-256-GCM (Authenticated)</span></div>
              <div>Decoupling: <span className="text-emerald-300">Zero-Knowledge Voter Separation</span></div>
              <div>Concurrency: <span className="text-amber-300">Server Mutex Transaction Active</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
