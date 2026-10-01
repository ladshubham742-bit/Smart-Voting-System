import React from 'react';
import { Shield, CheckCircle, User, LogOut, LayoutDashboard, KeyRound, Sparkles } from 'lucide-react';
import { Voter, StepType } from '../types';

interface NavbarProps {
  currentStep: StepType;
  onNavigate: (step: StepType) => void;
  currentUser: Voter | null;
  onLogout: () => void;
  onOpenHowItWorks: () => void;
  onOpenDemoSwitcher: () => void;
  onOpenReceiptVerifier: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNavigate,
  currentUser,
  onLogout,
  onOpenHowItWorks,
  onOpenDemoSwitcher,
  onOpenReceiptVerifier,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      {/* Top Prototype Notice Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 text-amber-50 px-4 py-1 text-xs font-medium text-center flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-200 animate-ping"></span>
        <span>
          <strong>EDUCATIONAL PROTOTYPE:</strong> Biometric operations are simulated demonstrations. Stored ballots are cryptographically sealed with AES-256-GCM.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('LANDING')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                SecureVote AI
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              Smart e-Governance & Encrypted Voting System
            </p>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('LANDING')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentStep === 'LANDING'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('RESULTS')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              currentStep === 'RESULTS'
                ? 'bg-blue-600 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-800/60 text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Live Results</span>
          </button>
          <button
            onClick={onOpenHowItWorks}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={onOpenReceiptVerifier}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Verify Receipt
          </button>
          {currentUser && (currentUser.role === 'Administrator' || currentUser.role === 'Election Officer') && (
            <button
              onClick={() => onNavigate('ADMIN_DASHBOARD')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                currentStep === 'ADMIN_DASHBOARD'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-blue-300 hover:bg-blue-900/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher Button */}
          <button
            onClick={onOpenDemoSwitcher}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition-all shadow-sm"
            title="Open Demo Accounts & Simulation Controls"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">DEMO MODE</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white flex items-center justify-end gap-1.5">
                  <User className="w-3 h-3 text-slate-400" />
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  <span>{currentUser.role}</span>
                  {currentUser.role === 'Voter' && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        currentUser.hasVoted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {currentUser.hasVoted ? 'VOTED ✓' : 'NOT VOTED'}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('LOGIN')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Voter Login
              </button>
              <button
                onClick={() => onNavigate('REGISTRATION')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-500/30"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
