import React from 'react';
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  LayoutDashboard,
  HelpCircle,
  Lock,
  Fingerprint,
  Camera,
  CheckCircle,
  XCircle,
  FileKey,
  Database,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Info,
  Server,
  Zap,
  BarChart3,
  Vote,
} from 'lucide-react';
import { StepType } from '../types';

interface LandingPageProps {
  onNavigate: (step: StepType) => void;
  onOpenHowItWorks: () => void;
  onOpenDemoSwitcher: () => void;
  onQuickLogin: (id: string, pass: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenHowItWorks,
  onOpenDemoSwitcher,
  onQuickLogin,
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Official Prototype • Government & University Voting Framework</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            SecureVote AI
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-blue-200/90 tracking-wide">
            Secure • Transparent • One Person, One Vote
          </p>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            A state-of-the-art electronic balloting architecture combining tokenized identity verification, simulated multi-factor biometric authentication, and mathematically verifiable AES-256-GCM vote encryption with zero double-voting tolerance.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('REGISTRATION')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <UserPlus className="w-4 h-4" />
              Register as Voter
            </button>

            <button
              onClick={() => onNavigate('LOGIN')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <KeyRound className="w-4 h-4 text-blue-400" />
              Voter Login
            </button>

            <button
              onClick={() => onNavigate('RESULTS')}
              className="px-5 py-3.5 rounded-xl font-bold text-sm bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-700/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-emerald-500/50"
            >
              <BarChart3 className="w-4 h-4 text-emerald-200" />
              <span>Live Election Results</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            </button>

            <button
              onClick={() => onNavigate('ADMIN_DASHBOARD')}
              className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-200 border border-indigo-700/50 flex items-center gap-2 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              Admin Dashboard
            </button>

            <button
              onClick={onOpenHowItWorks}
              className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 flex items-center gap-2 transition-all"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              How It Works
            </button>
          </div>

          {/* Quick Demo Shortcuts Banner */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 max-w-3xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick 1-Click Interactive Scenarios (Demo Sandbox):
              </span>
              <button
                onClick={onOpenDemoSwitcher}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2"
              >
                View all accounts
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
              <button
                onClick={() => onQuickLogin('DEMO-VOTER-001', 'Demo@123')}
                className="p-3 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-blue-500/50 transition-all text-xs group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white group-hover:text-blue-300">Priya Sharma</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300">
                    Not Voted
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">Walk through full biometric verification & vote casting</div>
              </button>

              <button
                onClick={() => onQuickLogin('DEMO-VOTER-002', 'Demo@123')}
                className="p-3 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-500/50 transition-all text-xs group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white group-hover:text-amber-300">Aditya Patel</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                    Already Voted
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">Test double-vote rejection & ballot lockout logic</div>
              </button>

              <button
                onClick={() => onQuickLogin('admin', 'Admin@123')}
                className="p-3 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-purple-500/50 transition-all text-xs group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white group-hover:text-purple-300">Admin Authority</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300">
                    Commissioner
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">View live tally charts, audit trail & cipher ledger</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Voting Workflow Visual Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            System Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            End-to-End Smart Voting Lifecycle
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            The exact 12-stage security pipeline executed by SecureVote AI to guarantee voter authenticity, ballot secrecy, and atomic one-person-one-vote enforcement.
          </p>
        </div>

        {/* Workflow Diagram */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-xs">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Voter Registration</h4>
              <p className="text-xs text-slate-500">Collects KYC credentials, DOB (18+), email & phone with zero plaintext storage.</p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-xs">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">ID Verification</h4>
              <p className="text-xs text-slate-500">Aadhaar/College ID masked (XXXX-XXXX-8421) and converted into an identity hash token.</p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-xs">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Fingerprint Registration</h4>
              <p className="text-xs text-slate-500">Simulates optical sensor scanner, extracts ridge minutiae, stores cryptographic template token.</p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-xs">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Face Registration</h4>
              <p className="text-xs text-slate-500">Simulates facial biometric mesh extraction, registers pose vector token with simulation banner.</p>
            </div>
          </div>

          <div className="flex justify-center my-4 text-blue-600 font-bold">
            <ArrowDown className="w-6 h-6 animate-bounce" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 5 */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                5
              </div>
              <h4 className="font-bold text-blue-950 text-sm">Voter Login</h4>
              <p className="text-xs text-slate-600">Voter ID + PBKDF2 hashed password authenticates into secure session token.</p>
            </div>

            {/* Step 6 */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                6
              </div>
              <h4 className="font-bold text-blue-950 text-sm">Fingerprint Verification</h4>
              <p className="text-xs text-slate-600">Simulated 1:1 template match with 3-attempt brute force safety lockout.</p>
            </div>

            {/* Step 7 */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                7
              </div>
              <h4 className="font-bold text-blue-950 text-sm">Face & Liveness Check</h4>
              <p className="text-xs text-slate-600">Simulated angle positioning & blink/smile detection to prevent spoofing.</p>
            </div>

            {/* Step 8 (Check Branch) */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                8
              </div>
              <h4 className="font-bold text-amber-950 text-sm">Check: Has Voter Voted?</h4>
              <div className="flex gap-2 text-[11px] font-bold mt-1">
                <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded">YES → Reject</span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">NO → Ballot</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center my-4 text-emerald-600 font-bold">
            <ArrowDown className="w-6 h-6 animate-bounce" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 9 */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                9
              </div>
              <h4 className="font-bold text-emerald-950 text-sm">Candidate Selection</h4>
              <p className="text-xs text-slate-600">Neutral ballot presentation with NOTA option and mandatory confirmation modal.</p>
            </div>

            {/* Step 10 */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                10
              </div>
              <h4 className="font-bold text-emerald-950 text-sm">AES-256-GCM Encryption</h4>
              <p className="text-xs text-slate-600">Vote encrypted with 96-bit IV & 128-bit Auth Tag. Decoupled from voter ID.</p>
            </div>

            {/* Step 11 */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                11
              </div>
              <h4 className="font-bold text-emerald-950 text-sm">Atomic Mark = VOTED</h4>
              <p className="text-xs text-slate-600">Backend mutex transaction commits hasVoted=true to eliminate race conditions.</p>
            </div>

            {/* Step 12 */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                12
              </div>
              <h4 className="font-bold text-emerald-950 text-sm">Digital Confirmation</h4>
              <p className="text-xs text-slate-600">Issues cryptographically signed receipt. Candidate selection kept confidential.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Cryptographic Ballot Privacy</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Votes are encrypted with authenticated AES-256-GCM. Stored encrypted ballots contain zero references to voter identities, ensuring complete ballot secrecy in full adherence to election standards.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Atomic Double-Voting Proof</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              The server database acts as the single source of truth. A critical backend mutex enforces that checking eligibility, appending the encrypted ballot, and marking the voter as voted happens as an indivisible transaction.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verifiable Receipts & Audit Trail</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every voter receives a unique digital receipt ID and SHA-256 ballot hash to verify inclusion on the public election ledger without ever compromising candidate choice.
            </p>
          </div>
        </div>
      </section>

      {/* Mandatory Prototype Disclaimer Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold text-amber-950">Important Prototype Limitation & Disclaimer</h5>
            <p className="text-amber-800 leading-relaxed">
              This application is an educational prototype. Biometric verification shown in demo mode is simulated and is not a substitute for certified election infrastructure, government identity verification, or legally approved voting systems. No raw biometric templates or raw government identifiers are stored.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
