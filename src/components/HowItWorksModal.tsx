import React from 'react';
import {
  HelpCircle,
  X,
  Lock,
  ShieldCheck,
  Cpu,
  Database,
  KeyRound,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                SecureVote AI Architecture Guide
              </h3>
              <p className="text-xs text-slate-500">
                Cryptographic balloting, identity tokenization, and concurrency safeguards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {/* 1. Identity Masking */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>1. Zero-Exposure Identity Masking & Tokenization</span>
            </div>
            <p>
              When a voter registers with Aadhaar or College ID, the system applies privacy transforms. The database stores only a masked display ID (e.g. <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-700 font-mono">XXXX-XXXX-8421</code>) and an irreversible SHA-256 identity token. Raw national identification numbers are never held in storage.
            </p>
          </div>

          {/* 2. Biometric Simulation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>2. Biometric Simulation Boundaries</span>
            </div>
            <p>
              Because this application is an educational prototype, biometric operations (fingerprint scanning and facial recognition with liveness checks) are interactive simulations. Minutiae and facial feature vectors are simulated as token hashes. A 3-attempt limit protects against simulated brute-force authentication.
            </p>
          </div>

          {/* 3. AES-256-GCM Encryption */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>3. AES-256-GCM Ballot Secrecy & Decoupling</span>
            </div>
            <p>
              When a voter selects a candidate, the vote choice is encrypted on the server with <strong>AES-256-GCM</strong> using a unique 96-bit Initialization Vector (IV) and derives a 128-bit Authentication Tag. Crucially, the resulting encrypted ballot in the <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-700 font-mono">ballots</code> table contains <strong>no voter identifier</strong>, guaranteeing ballot secrecy.
            </p>
          </div>

          {/* 4. Atomic Double-Voting Lock */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Database className="w-4 h-4 text-amber-600" />
              <span>4. Atomic Concurrency Lock (Double-Vote Prevention)</span>
            </div>
            <p>
              The server executes vote casting inside a critical mutex transaction. It verifies <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-red-700 font-mono">hasVoted === false</code>, creates the encrypted ballot, and commits <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-emerald-700 font-mono">hasVoted = true</code> in one atomic block. Concurrent requests cannot bypass the check.
            </p>
          </div>

          {/* 5. Zero-Knowledge Digital Receipts */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FileCheck className="w-4 h-4 text-purple-600" />
              <span>5. Zero-Knowledge Digital Receipts</span>
            </div>
            <p>
              Voters receive a Receipt ID and SHA-256 payload digest. The receipt can be verified against the public ledger to confirm inclusion in the election tally without ever exposing which candidate was chosen.
            </p>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-md transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
