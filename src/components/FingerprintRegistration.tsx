import React, { useState } from 'react';
import {
  Fingerprint,
  CheckCircle2,
  ArrowRight,
  Info,
  Shield,
  RefreshCw,
  Sparkles,
  Hand,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { StepType, Voter } from '../types';

interface FingerprintRegistrationProps {
  currentUser: Voter | null;
  onSuccess: () => void;
  onNavigate: (step: StepType) => void;
}

export const FingerprintRegistration: React.FC<FingerprintRegistrationProps> = ({
  currentUser,
  onSuccess,
  onNavigate,
}) => {
  // States: 'IDLE' | 'AWAITING_THUMB' | 'SCANNING' | 'COMPLETED'
  const [scanState, setScanState] = useState<'IDLE' | 'AWAITING_THUMB' | 'SCANNING' | 'COMPLETED'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('Optical Sensor Ready');
  const [templateToken, setTemplateToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. User presses the initial button to start fingerprint enrollment
  const handleInitiateEnrollment = () => {
    setError(null);
    setScanState('AWAITING_THUMB');
    setStageText('Scanner active. Please place your thumb on the scanner pad below.');
  };

  // 2. User places thumb on the scanner pad
  const handlePlaceThumb = async () => {
    if (scanState === 'SCANNING' || scanState === 'COMPLETED') return;

    setError(null);
    setScanState('SCANNING');
    setProgress(0);
    setStageText('Thumb detected on sensor. Please hold your thumb still...');

    // Progress: 0% -> 25% -> 50% -> 75% -> 100%
    await new Promise((r) => setTimeout(r, 450));
    setProgress(25);
    setStageText('Extracting ridge flow & minutiae points (25%)...');

    await new Promise((r) => setTimeout(r, 500));
    setProgress(50);
    setStageText('Mapping bifurcation & delta coordinates (50%)...');

    await new Promise((r) => setTimeout(r, 550));
    setProgress(75);
    setStageText('Hashing minutiae into ISO-compliant template vector (75%)...');

    await new Promise((r) => setTimeout(r, 600));
    setProgress(100);
    setStageText('Cryptographic template generation complete (100%)...');

    try {
      const res = await api.registerBiometrics('FINGERPRINT');
      setTemplateToken(res.templateToken || 'FP_TPL_SHA256_A78B9C0012E4');
      setScanState('COMPLETED');
    } catch (err: any) {
      setError(err.message || 'Failed to save simulated fingerprint template.');
      setScanState('AWAITING_THUMB');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-center">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
            Step 3 of 8 • Biometric Enrollment
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fingerprint Registration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Enroll your primary biometric credential. Follow the explicit on-screen instructions to position and scan your thumb.
          </p>
        </div>

        {/* Prototype Biometric Simulation Clear Label */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold uppercase tracking-wider text-[11px] block text-amber-950">
              Prototype Biometric Simulation
            </span>
            <span className="text-[11px] text-amber-800 leading-relaxed">
              This is an educational prototype demonstration. Thumbprint scanning is simulated and does not capture real government-grade biometric data.
            </span>
          </div>
        </div>

        {/* Dynamic User Instruction Box */}
        <div className="p-4 rounded-2xl border transition-all text-xs font-medium">
          {scanState === 'IDLE' && (
            <div className="text-slate-700 space-y-1">
              <span className="font-bold block text-sm text-slate-900">
                1. Press the "Start Fingerprint Registration" button below.
              </span>
              <p className="text-slate-500">
                You will be instructed to place your thumb on the illuminated sensor pad.
              </p>
            </div>
          )}

          {scanState === 'AWAITING_THUMB' && (
            <div className="text-indigo-900 bg-indigo-50/70 p-3 rounded-xl border border-indigo-200 space-y-1 animate-pulse">
              <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-indigo-700">
                <Hand className="w-4 h-4 text-indigo-600 animate-bounce" />
                <span>INSTRUCTION: Place your thumb on the scanner pad below</span>
              </div>
              <p className="text-[11px] text-indigo-800">
                Click or tap directly on the glowing sensor pad to simulate placing your thumb.
              </p>
            </div>
          )}

          {scanState === 'SCANNING' && (
            <div className="text-cyan-900 bg-cyan-50/70 p-3 rounded-xl border border-cyan-200 space-y-1">
              <div className="flex items-center justify-center gap-2 font-bold text-sm text-cyan-800">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" />
                <span>Thumb detected! Hold still while scanning ({progress}%)...</span>
              </div>
              <p className="text-[11px] text-cyan-700">
                Extracting topological ridge flow and minutiae coordinates.
              </p>
            </div>
          )}

          {scanState === 'COMPLETED' && (
            <div className="text-emerald-900 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-1">
              <div className="flex items-center justify-center gap-2 font-bold text-sm text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Fingerprint Registered Successfully ✓</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Simulated biometric template created and bound to your voter record.
              </p>
            </div>
          )}
        </div>

        {/* Visual Scanner Area / Thumb Placement Pad */}
        <div
          onClick={() => {
            if (scanState === 'AWAITING_THUMB') {
              handlePlaceThumb();
            }
          }}
          className={`relative w-60 h-60 mx-auto rounded-3xl bg-slate-950 border-4 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden shadow-2xl select-none ${
            scanState === 'AWAITING_THUMB'
              ? 'border-indigo-400 ring-4 ring-indigo-500/30 cursor-pointer scale-102 hover:border-indigo-300'
              : scanState === 'SCANNING'
              ? 'border-cyan-400 ring-4 ring-cyan-500/20'
              : scanState === 'COMPLETED'
              ? 'border-emerald-400 ring-4 ring-emerald-500/20'
              : 'border-slate-800'
          }`}
        >
          {/* Background grid */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Sonar Pulse when awaiting thumb */}
          {scanState === 'AWAITING_THUMB' && (
            <>
              <div className="absolute inset-6 rounded-full border-2 border-indigo-400/40 animate-ping pointer-events-none" />
              <div className="absolute inset-12 rounded-full border border-indigo-400/60 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Radar scan laser when active */}
          {scanState === 'SCANNING' && (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-pulse pointer-events-none" />
              <div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] transition-all duration-300 pointer-events-none"
                style={{ top: `${progress}%` }}
              />
            </>
          )}

          {/* Central Fingerprint Icon */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <Fingerprint
              className={`w-28 h-28 transition-all duration-300 ${
                scanState === 'COMPLETED'
                  ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.7)]'
                  : scanState === 'SCANNING'
                  ? 'text-cyan-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.7)] animate-pulse'
                  : scanState === 'AWAITING_THUMB'
                  ? 'text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.6)] animate-pulse'
                  : 'text-slate-600'
              }`}
            />

            {/* Placement hint text inside pad */}
            {scanState === 'AWAITING_THUMB' && (
              <span className="mt-2 text-[10px] font-mono font-bold tracking-widest text-indigo-300 uppercase bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-400/40">
                PLACE THUMB HERE
              </span>
            )}
          </div>

          {/* Percentage display */}
          {scanState === 'SCANNING' && (
            <div className="absolute bottom-2 text-xs font-mono text-cyan-300 font-bold">
              {progress}%
            </div>
          )}
        </div>

        {/* Progress Bar & Status Text */}
        <div className="space-y-2 max-w-sm mx-auto">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                scanState === 'COMPLETED'
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-mono text-slate-600 h-5">{stageText}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2">
          {scanState === 'IDLE' && (
            <button
              onClick={handleInitiateEnrollment}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Fingerprint className="w-4 h-4" />
              Scan Fingerprint
            </button>
          )}

          {scanState === 'AWAITING_THUMB' && (
            <button
              onClick={handlePlaceThumb}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all animate-pulse"
            >
              <Hand className="w-4 h-4" />
              Place Thumb on Scanner Pad Now
            </button>
          )}

          {scanState === 'SCANNING' && (
            <button
              disabled
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-700 text-slate-300 flex items-center justify-center gap-2 cursor-wait"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              Simulating Biometric Scan ({progress}%)...
            </button>
          )}

          {scanState === 'COMPLETED' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-left text-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fingerprint registered successfully ✓</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-[11px] font-mono">
                  <span className="text-slate-500 font-sans block">Stored Biometric Token:</span>
                  <span className="font-bold text-slate-800 select-all truncate block">
                    {templateToken || 'FP_TPL_SHA256_A78B9C0012E4'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 font-sans">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Only synthetic mathematical token stored • Raw fingerprint never uploaded</span>
                </div>
              </div>

              <button
                onClick={onSuccess}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Continue to Face Registration
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
