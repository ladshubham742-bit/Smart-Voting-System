import React, { useState } from 'react';
import {
  Sparkles,
  X,
  UserCheck,
  ShieldAlert,
  LayoutDashboard,
  RotateCcw,
  CheckCircle2,
  Lock,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { StepType, Voter } from '../types';
import { api } from '../services/api';

interface DemoToolbarProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickLogin: (id: string, pass: string) => void;
  onNavigateStep: (step: StepType) => void;
  onResetComplete: () => void;
}

export const DemoToolbar: React.FC<DemoToolbarProps> = ({
  isOpen,
  onClose,
  onQuickLogin,
  onNavigateStep,
  onResetComplete,
}) => {
  const [resetting, setResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = async () => {
    setResetting(true);
    setStatusMessage(null);
    try {
      const res = await api.resetDemoElection();
      setStatusMessage('Demo election successfully reset! Voter 001 is ready to vote.');
      onResetComplete();
    } catch (e: any) {
      setStatusMessage(e.message || 'Reset failed.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Demo Mode Evaluation Console
              </h3>
              <p className="text-[11px] text-slate-500">
                1-Click scenarios for testing registration, biometric verification, and ballot rules
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

        {statusMessage && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Demo Personas Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Evaluation Persona
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Persona 1: Eligible Voter */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Priya Sharma</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                    Not Voted
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">DEMO-VOTER-001</div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Ready to test full flow: Biometrics → Candidate → AES-256-GCM Encryption.
                </div>
              </div>

              <button
                onClick={() => {
                  onQuickLogin('DEMO-VOTER-001', 'Demo@123');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <span>Login as Voter 001</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Persona 2: Already Voted */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-amber-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Aditya Patel</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    Already Voted
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">DEMO-VOTER-002</div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Tests One Person One Vote: Voter ID gets restricted when attempting to vote again.
                </div>
              </div>

              <button
                onClick={() => {
                  onQuickLogin('DEMO-VOTER-002', 'Demo@123');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <span>Test ID Restriction</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Persona 3: Admin */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-purple-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Election Commissioner</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800">
                    Admin
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">admin</div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Access real-time tallies, encrypted cipher ledger, and audit trail.
                </div>
              </div>

              <button
                onClick={() => {
                  onQuickLogin('admin', 'Admin@123');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <span>Login as Administrator</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Persona 4: Election Officer */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-cyan-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Presiding Officer Rao</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-100 text-cyan-800">
                    Officer
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">officer</div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Oversee live polling status and fraud warning alerts.
                </div>
              </div>

              <button
                onClick={() => {
                  onQuickLogin('officer', 'Officer@123');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 px-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <span>Login as Officer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* View Live Results Shortcut */}
        <div className="pt-1">
          <button
            onClick={() => {
              onNavigateStep('RESULTS');
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-emerald-200" />
            <span>Open Public Live Election Results Portal</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </button>
        </div>

        {/* Global Reset Action */}
        <div className="p-4 bg-red-50/70 rounded-2xl border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left text-xs text-red-900">
            <div className="font-bold">Reset Demo Election Data</div>
            <div className="text-red-700 text-[11px]">
              Restores initial voters, clears all cast ballots, and restarts tallies.
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="w-full sm:w-auto py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors flex-shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset Election'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
