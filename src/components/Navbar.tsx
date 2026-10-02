import React, { useState } from 'react';
import {
  Shield,
  CheckCircle,
  User,
  LogOut,
  LayoutDashboard,
  KeyRound,
  Sparkles,
  BarChart3,
  FileText,
  Ban,
  ChevronDown,
  Menu,
  X,
  Vote,
  Users,
} from 'lucide-react';
import { Voter, StepType, DashboardTab } from '../types';

interface NavbarProps {
  currentStep: StepType;
  onNavigate: (step: StepType) => void;
  onNavigateToDashboardTab?: (tab: DashboardTab) => void;
  currentUser: Voter | null;
  onLogout: () => void;
  onOpenHowItWorks: () => void;
  onOpenDemoSwitcher: () => void;
  onOpenReceiptVerifier: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNavigate,
  onNavigateToDashboardTab,
  currentUser,
  onLogout,
  onOpenHowItWorks,
  onOpenDemoSwitcher,
  onOpenReceiptVerifier,
  onOpenProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transparencyDropdownOpen, setTransparencyDropdownOpen] = useState(false);

  const handleSelectTab = (tab: DashboardTab) => {
    if (onNavigateToDashboardTab) {
      onNavigateToDashboardTab(tab);
    } else {
      onNavigate('ADMIN_DASHBOARD');
    }
    setTransparencyDropdownOpen(false);
    setMobileMenuOpen(false);
  };

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

        {/* Center / Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('LANDING')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentStep === 'LANDING'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Home
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

          {/* Direct Dropdown for the 4 requested audit & governance views */}
          <div className="relative group">
            <button
              onClick={() => handleSelectTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                currentStep === 'ADMIN_DASHBOARD'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'hover:text-white hover:bg-slate-800/60 text-blue-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Command & Audit</span>
              <ChevronDown className="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform" />
            </button>

            {/* Dropdown Menu showing the exact 4 modules */}
            <div className="absolute left-0 mt-1 w-72 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-800">
                Audit & Governance Views
              </div>

              {/* 1. Executive Overview */}
              <button
                onClick={() => handleSelectTab('OVERVIEW')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Executive Overview</div>
                  <div className="text-[10px] text-slate-400 font-normal">Turnout, KPIs & active security counters</div>
                </div>
              </button>

              {/* 2. Candidate Tallies and Chart */}
              <button
                onClick={() => handleSelectTab('TALLIES')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Candidate Tallies and Chart</div>
                  <div className="text-[10px] text-slate-400 font-normal">Vote counts, share graphs & leader margin</div>
                </div>
              </button>

              {/* 3. Voter Database Directory */}
              <button
                onClick={() => handleSelectTab('VOTERS')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Voter Database Directory</div>
                  <div className="text-[10px] text-slate-400 font-normal">Registered citizens, logins & vote records</div>
                </div>
              </button>

              {/* 4. Security Audit Trail */}
              <button
                onClick={() => handleSelectTab('AUDIT')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Security Audit Trail</div>
                  <div className="text-[10px] text-slate-400 font-normal">Cryptographic event logs & forensic trace</div>
                </div>
              </button>

              {/* 4. Restricted IDs */}
              <button
                onClick={() => handleSelectTab('RESTRICTED')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Restricted IDs</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-red-900/60 text-red-300 border border-red-500/40">Lockout</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">One Person, One Vote suspended IDs</div>
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={onOpenReceiptVerifier}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Verify Receipt
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            How It Works
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher Button */}
          <button
            onClick={onOpenDemoSwitcher}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition-all shadow-sm"
            title="Open Demo Accounts & Simulation Controls"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">DEMO SANDBOX</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <button
                type="button"
                onClick={onOpenProfile}
                className="text-right hidden sm:block px-2.5 py-1 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700 group cursor-pointer"
                title="View My Citizen Database Record & Profile"
              >
                <div className="text-xs font-semibold text-white flex items-center justify-end gap-1.5 group-hover:text-blue-300 transition-colors">
                  <User className="w-3 h-3 text-slate-400 group-hover:text-blue-400" />
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  <span>{currentUser.role}</span>
                  {currentUser.role === 'Voter' && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        currentUser.isRestricted
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : currentUser.hasVoted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {currentUser.isRestricted ? 'RESTRICTED 🔒' : currentUser.hasVoted ? 'VOTED ✓' : 'NOT VOTED'}
                    </span>
                  )}
                  <span className="text-indigo-400 text-[9px] font-mono group-hover:underline">Record ↗</span>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onNavigate('LOGIN')}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
              <button
                onClick={() => onNavigate('REGISTRATION')}
                className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-500/30"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
            <button
              onClick={() => {
                onNavigate('LANDING');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-800/80 text-left hover:bg-slate-800 text-white"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('RESULTS');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-800/80 text-left hover:bg-slate-800 text-white flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Live Results</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Command & Governance Modules:
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => handleSelectTab('OVERVIEW')}
                className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-left hover:bg-blue-900/50 text-blue-200 text-xs font-bold flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span>Executive Overview</span>
              </button>

              <button
                onClick={() => handleSelectTab('TALLIES')}
                className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-left hover:bg-emerald-900/50 text-emerald-200 text-xs font-bold flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Candidate Tallies and Chart</span>
              </button>

              <button
                onClick={() => handleSelectTab('VOTERS')}
                className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-left hover:bg-indigo-900/50 text-indigo-200 text-xs font-bold flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Voter Database Directory</span>
              </button>

              <button
                onClick={() => handleSelectTab('AUDIT')}
                className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-left hover:bg-amber-900/50 text-amber-200 text-xs font-bold flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Security Audit Trail</span>
              </button>

              <button
                onClick={() => handleSelectTab('RESTRICTED')}
                className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-left hover:bg-red-900/50 text-red-200 text-xs font-bold flex items-center gap-2"
              >
                <Ban className="w-4 h-4 text-red-400" />
                <span>Restricted IDs (Duplicate Lockouts)</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
            <button
              onClick={() => {
                onOpenReceiptVerifier();
                setMobileMenuOpen(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              Verify Receipt
            </button>
            <button
              onClick={() => {
                onOpenHowItWorks();
                setMobileMenuOpen(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              How It Works
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
