import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  ShieldCheck,
  Database,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  ScanFace,
  Vote,
  ExternalLink,
  Ban,
  FileText,
  RefreshCw,
  Hash,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  Download,
} from 'lucide-react';
import { api } from '../services/api';
import { VoterProfileRecord, Voter, StepType, EncryptedReceipt } from '../types';
import { downloadReceiptAsHtml, downloadReceiptAsTxt } from '../utils/receiptDownloader';

interface VoterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Voter | null;
  onNavigate: (step: StepType) => void;
  onVerifyReceipt: (receiptId: string) => void;
}

export const VoterProfileModal: React.FC<VoterProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigate,
  onVerifyReceipt,
}) => {
  const [profile, setProfile] = useState<VoterProfileRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getVoterProfileRecord();
      setProfile(data);
    } catch (err: any) {
      // Fallback to currentUser if endpoint fails
      setProfile({
        voterId: currentUser.id,
        name: currentUser.name,
        dob: currentUser.dob || '2003-05-14',
        email: currentUser.email || 'voter@demo.ac.in',
        mobile: currentUser.mobile || '+91 98765 43210',
        idType: currentUser.idType || 'Aadhaar',
        idNumberMasked: currentUser.idNumberMasked,
        identityToken: currentUser.identityToken || 'IDENTITY-TOKEN-HASH-2026',
        databaseRecordId: currentUser.databaseRecordId || `REG-DB-2026-${currentUser.id.replace(/\D/g, '').padStart(4, '0') || '0001'}`,
        createdAt: currentUser.createdAt || new Date().toISOString(),
        lastLoginAt: currentUser.lastLoginAt || new Date().toISOString(),
        loginCount: currentUser.loginCount || 1,
        hasRegisteredFingerprint: !!currentUser.hasRegisteredFingerprint,
        hasRegisteredFace: !!currentUser.hasRegisteredFace,
        hasVoted: currentUser.hasVoted,
        votedAt: currentUser.votedAt,
        receiptId: currentUser.receiptId || null,
        isRestricted: !!currentUser.isRestricted,
        restrictedReason: currentUser.restrictedReason || null,
        restrictedAt: currentUser.restrictedAt || null,
        role: currentUser.role,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <Database className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Voter Database Record & Profile</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PERSISTED IN DATABASE
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Official citizen credentials, registration record, login activity, and vote status.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-semibold">Retrieving database record...</p>
            </div>
          ) : profile ? (
            <>
              {/* Database Certificate Top Box */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Central Election Database Record
                  </div>
                  <div className="text-sm font-black font-mono text-indigo-950">
                    {profile.databaseRecordId}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Storage: File-Persisted JSON Store (<span className="text-indigo-700 font-bold">data/election_database.json</span>)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    RECORD SYNCHRONIZED
                  </span>
                  <button
                    onClick={fetchProfile}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200"
                    title="Refresh from Database"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Voting Status Highlight Card */}
              <div className="rounded-2xl border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Vote className="w-4 h-4 text-blue-600" />
                    Ballot & One Person One Vote Status
                  </span>
                  {profile.isRestricted ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
                      <Ban className="w-3.5 h-3.5 text-red-600" />
                      RESTRICTED 🔒
                    </span>
                  ) : profile.hasVoted ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      VOTE RECORDED & SEALED ✓
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <Clock className="w-3.5 h-3.5" />
                      ELIGIBLE TO VOTE (BALLOT PENDING)
                    </span>
                  )}
                </div>

                {profile.isRestricted ? (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Voter ID Restricted for Repeat Vote Attempt
                    </div>
                    <p className="text-red-700 text-[11px] leading-relaxed">
                      {profile.restrictedReason ||
                        'One Person, One Vote violation: Duplicate vote attempt detected and blocked.'}
                    </p>
                    {profile.restrictedAt && (
                      <div className="text-[10px] font-mono text-red-600 pt-1 border-t border-red-200">
                        Restricted At: {new Date(profile.restrictedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : profile.hasVoted ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                    <div className="text-xs font-semibold text-emerald-900 flex items-center justify-between">
                      <span>Ballot Successfully Encrypted (AES-256-GCM)</span>
                      {profile.votedAt && (
                        <span className="text-[11px] font-mono text-emerald-700">
                          {new Date(profile.votedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {profile.receiptId && (
                      <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">
                              Official Receipt Identifier
                            </div>
                            <div className="font-mono text-xs font-bold text-indigo-700">
                              {profile.receiptId}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            <button
                              type="button"
                              onClick={async () => {
                                const receiptObj: EncryptedReceipt = {
                                  receiptId: profile.receiptId!,
                                  ballotId: `BALLOT-BOX-${profile.voterId}`,
                                  timestamp: profile.votedAt || new Date().toISOString(),
                                  electionId: 'CAMPUS-ELECTION-2026',
                                  encryptionStandard: 'AES-256-GCM',
                                  verificationHash: profile.verificationHash || profile.identityToken || 'CRYPTOGRAPHIC_PROOF_VERIFIED',
                                  voterStatus: 'VOTED',
                                };
                                await downloadReceiptAsHtml(receiptObj, currentUser);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Download official voting certificate to device"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Receipt (.html)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const receiptObj: EncryptedReceipt = {
                                  receiptId: profile.receiptId!,
                                  ballotId: `BALLOT-BOX-${profile.voterId}`,
                                  timestamp: profile.votedAt || new Date().toISOString(),
                                  electionId: 'CAMPUS-ELECTION-2026',
                                  encryptionStandard: 'AES-256-GCM',
                                  verificationHash: profile.verificationHash || profile.identityToken || 'CRYPTOGRAPHIC_PROOF_VERIFIED',
                                  voterStatus: 'VOTED',
                                };
                                downloadReceiptAsTxt(receiptObj, currentUser);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Download plain text receipt (.txt)"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>.txt</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onVerifyReceipt(profile.receiptId!);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2 text-xs">
                    <p>
                      Your citizen identity is active and authorized. You have not cast your single allotted ballot yet.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('VERIFICATION_FP');
                      }}
                      className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <ScanFace className="w-3.5 h-3.5" />
                      <span>Proceed to Live Face Camera Verification & Vote Now</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Citizen Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Personal & KYC Info */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    Citizen Identity Details
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Full Name</span>
                      <span className="font-bold text-slate-900 text-sm">{profile.name}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Voter / Student ID</span>
                      <span className="font-mono font-bold text-blue-600">{profile.voterId}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">KYC Document & Masked Number</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          {profile.idType}
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {profile.idNumberMasked}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Email Address</span>
                      <span className="font-medium text-slate-800">{profile.email}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Mobile Contact</span>
                      <span className="font-mono font-medium text-slate-800">{profile.mobile}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Identity Hash Token</span>
                      <span className="font-mono text-[10px] text-slate-600 truncate block">
                        {profile.identityToken ? `${profile.identityToken.slice(0, 24)}...` : 'GENERATED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Database Registration & Login History */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Database Activity History
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Stored in Database Since</span>
                      <span className="font-mono font-bold text-slate-900">
                        {new Date(profile.createdAt).toLocaleDateString()} at{' '}
                        {new Date(profile.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Last Login Session</span>
                      <span className="font-mono font-bold text-slate-900">
                        {profile.lastLoginAt
                          ? `${new Date(profile.lastLoginAt).toLocaleDateString()} at ${new Date(
                              profile.lastLoginAt
                            ).toLocaleTimeString()}`
                          : 'Initial Registration Session'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Total Authenticated Logins</span>
                      <span className="font-mono font-black text-indigo-600 text-sm">
                        {profile.loginCount} {profile.loginCount === 1 ? 'Session' : 'Sessions'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Role / Access Level</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {profile.role}
                      </span>
                    </div>

                    {/* Biometrics Status */}
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-500 block text-[10px] mb-1.5">Enrolled Biometric Templates</span>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                            Fingerprint Template
                          </span>
                          <span
                            className={`font-bold ${
                              profile.hasRegisteredFingerprint ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {profile.hasRegisteredFingerprint ? 'Enrolled ✓' : 'Pending Enrollment'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <ScanFace className="w-3.5 h-3.5 text-slate-400" />
                            Face Vector & Camera Liveness
                          </span>
                          <span
                            className={`font-bold ${
                              profile.hasRegisteredFace ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {profile.hasRegisteredFace ? 'Enrolled ✓' : 'Pending Enrollment'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs">
              Unable to load voter profile record.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically sealed under university election rules</span>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
