import React, { useEffect } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  Download,
  ExternalLink,
  LogOut,
  Sparkles,
  QrCode,
  FileCheck,
  BarChart3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EncryptedReceipt, StepType, Voter } from '../types';

interface ConfirmationReceiptProps {
  receipt: EncryptedReceipt;
  currentUser: Voter | null;
  onLogout: () => void;
  onVerifyReceipt: (receiptId: string) => void;
  onNavigate: (step: StepType) => void;
}

export const ConfirmationReceipt: React.FC<ConfirmationReceiptProps> = ({
  receipt,
  currentUser,
  onLogout,
  onVerifyReceipt,
  onNavigate,
}) => {
  // Trigger celebratory confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#3b82f6', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Receipt Card */}
      <div className="bg-white rounded-3xl border-2 border-emerald-200 shadow-xl p-6 sm:p-8 space-y-6 text-center relative overflow-hidden">
        {/* Top green accent strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            Ballot Encrypted & Stored
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ✓ Vote Successfully Recorded
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Thank you for participating. Your ballot has been cryptographically sealed and incorporated into the immutable election tally.
          </p>
        </div>

        {/* Digital Receipt Specs */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left text-xs space-y-3 font-mono">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-sans font-bold">Voter Status:</span>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
              Voted ✓
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-sans font-bold">Vote Status:</span>
            <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
              <Lock className="w-3 h-3" /> Encrypted (AES-256-GCM)
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-sans font-bold">Voting Time:</span>
            <span className="text-slate-800 font-semibold">
              {new Date(receipt.timestamp).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-sans font-bold">Transaction / Receipt ID:</span>
            <span className="text-indigo-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200 select-all">
              {receipt.receiptId}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-sans font-bold">Internal Ballot UUID:</span>
            <span className="text-slate-700 font-semibold select-all">
              {receipt.ballotId}
            </span>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-slate-500 font-sans font-bold block">
              Cryptographic Proof Hash (SHA-256):
            </span>
            <div className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 break-all select-all font-mono leading-tight">
              {receipt.verificationHash}
            </div>
          </div>
        </div>

        {/* Ballot Secrecy Constitutional Notice */}
        <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-left text-xs text-blue-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[11px] uppercase tracking-wide text-blue-950 block">
              Democratic Ballot Secrecy Preserved
            </span>
            <span className="text-[11px] text-blue-800 leading-relaxed">
              In accordance with election guidelines, the selected candidate is strictly omitted from this public confirmation receipt to prevent voter coercion or ballot buying.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => onVerifyReceipt(receipt.receiptId)}
            className="py-3 px-4 rounded-xl font-bold text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            Verify on Public Ledger
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Save / Print Receipt
          </button>
        </div>

        {/* View Live Results Button */}
        <div>
          <button
            type="button"
            onClick={() => onNavigate('RESULTS')}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4 text-emerald-200" />
            <span>View Live Election Standings & Results</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </button>
        </div>

        {/* Final Signout */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout & Clear Session
          </button>
        </div>
      </div>
    </div>
  );
};
