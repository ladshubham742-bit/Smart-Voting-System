import React, { useState, useEffect, useRef } from 'react';
import {
  Fingerprint,
  ScanFace,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Info,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Hand,
  Eye,
  Camera,
  Video,
  VideoOff,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { StepType, Voter } from '../types';

interface BiometricVerificationProps {
  currentUser: Voter | null;
  onSuccess: () => void;
  onNavigate: (step: StepType) => void;
}

export const BiometricVerification: React.FC<BiometricVerificationProps> = ({
  currentUser,
  onSuccess,
  onNavigate,
}) => {
  // Sub-stages: 'FP' (Fingerprint) | 'FACE' (Face Recognition + Liveness)
  const [activeStage, setActiveStage] = useState<'FP' | 'FACE'>('FP');

  // Fingerprint State
  const [fpState, setFpState] = useState<'IDLE' | 'AWAITING_THUMB' | 'SCANNING' | 'COMPLETED'>('IDLE');
  const [fpProgress, setFpProgress] = useState<number>(0);
  const [fpStatusText, setFpStatusText] = useState('Fingerprint Sensor Ready');
  const [fpVerified, setFpVerified] = useState(false);
  const [fpError, setFpError] = useState<string | null>(null);
  const [fpAttemptsRemaining, setFpAttemptsRemaining] = useState<number>(3);
  const [simulateFpFailure, setSimulateFpFailure] = useState(false);

  // Face Recognition & Liveness State
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceStep, setFaceStep] = useState<number>(0);
  const [faceStatusText, setFaceStatusText] = useState('Camera Ready • Please look directly at the lens');
  const [faceError, setFaceError] = useState<string | null>(null);
  const [simulateFaceFailure, setSimulateFaceFailure] = useState(false);

  // Camera Live Stream & Snapshot
  const [hasWebcam, setHasWebcam] = useState(false);
  const [webcamRequested, setWebcamRequested] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to initialize and request camera access
  const startCamera = async () => {
    setCameraError(null);
    setWebcamRequested(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasWebcam(false);
      setCameraError('Camera access not supported by this browser environment. Using high-fidelity synthetic camera sensor.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      setHasWebcam(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setHasWebcam(false);
      setCameraError(
        'Camera permission was denied or device is busy. You can still test using the synthetic live sensor.'
      );
    }
  };

  // Attempt camera when entering FACE stage
  useEffect(() => {
    if (activeStage === 'FACE' && !webcamRequested) {
      startCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [activeStage]);

  // Keep video source attached when tab or component updates
  useEffect(() => {
    if (hasWebcam && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [hasWebcam, activeStage]);

  // If user is already restricted, block immediately
  if (currentUser?.isRestricted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl border-2 border-red-300 shadow-xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <div className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
              Voter Credential Restricted
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              One Person, One Vote Enforcement
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your Voter ID has been restricted because you have already cast your ballot in this election. Further biometric authentication and voting access are suspended.
            </p>
          </div>

          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-left text-xs font-mono space-y-1.5 text-red-900">
            <div><strong>Voter ID:</strong> {currentUser.id}</div>
            <div><strong>Voted Timestamp:</strong> {currentUser.votedAt ? new Date(currentUser.votedAt).toLocaleString() : 'Recorded'}</div>
            <div><strong>Restriction Status:</strong> LOCKED / SUSPENDED</div>
            <div><strong>Reason:</strong> {currentUser.restrictedReason || 'Attempted duplicate voting activity'}</div>
          </div>

          <button
            onClick={() => onNavigate('RESULTS')}
            className="w-full py-3 px-6 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-all"
          >
            View Live Public Election Standings
          </button>
        </div>
      </div>
    );
  }

  // 1. Initiate Fingerprint - Prompts user to place thumb
  const handleInitiateFpVerify = () => {
    setFpError(null);
    setFpState('AWAITING_THUMB');
    setFpStatusText('Scanner ready. Please place your thumb on the scanner pad.');
  };

  // 2. User places thumb on scanner pad
  const handlePlaceThumbVerify = async () => {
    if (fpState === 'SCANNING') return;
    setFpError(null);
    setFpState('SCANNING');
    setFpProgress(0);
    setFpStatusText('Thumb placed on scanner. Verifying minutiae template...');

    // Progress animation: 0% -> 30% -> 65% -> 100%
    await new Promise((r) => setTimeout(r, 350));
    setFpProgress(30);
    setFpStatusText('Capturing optical thumbprint image (30%)...');

    await new Promise((r) => setTimeout(r, 400));
    setFpProgress(65);
    setFpStatusText('Matching minutiae coordinates against registered token (65%)...');

    await new Promise((r) => setTimeout(r, 450));
    setFpProgress(100);
    setFpStatusText('Validating cryptographic signature (100%)...');

    try {
      const res = await api.verifyFingerprint(simulateFpFailure);
      if (res.success) {
        setFpVerified(true);
        setFpState('COMPLETED');
        setTimeout(() => {
          setActiveStage('FACE');
        }, 1000);
      }
    } catch (err: any) {
      setFpError(err.message || 'Fingerprint verification failed. Please try again.');
      setFpAttemptsRemaining((prev) => Math.max(0, prev - 1));
      setFpState('AWAITING_THUMB');
    }
  };

  // 3. Handle Live Camera Face Recognition + Liveness Check
  const handleVerifyFace = async () => {
    setFaceError(null);
    setFaceScanning(true);
    setShutterFlash(true);

    // Capture snapshot frame from live camera video into canvas
    if (hasWebcam && videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 480;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setCapturedSnapshot(canvas.toDataURL('image/jpeg', 0.85));
        }
      } catch (e) {
        // fallback to live video
      }
    }

    setTimeout(() => setShutterFlash(false), 200);

    setFaceStep(1);
    setFaceStatusText('1. Live frame captured: Analyzing facial geometry & alignment...');
    await new Promise((r) => setTimeout(r, 650));

    setFaceStep(2);
    setFaceStatusText('2. Scanning 512 facial landmarks against registered biometric token...');
    await new Promise((r) => setTimeout(r, 700));

    setFaceStep(3);
    setFaceStatusText('3. Performing active anti-spoof liveness check (eye gaze & reflectance)...');
    await new Promise((r) => setTimeout(r, 750));

    setFaceStep(4);
    setFaceStatusText('4. Confirming voter identity with central election registry...');
    await new Promise((r) => setTimeout(r, 600));

    try {
      const res = await api.verifyFace(simulateFaceFailure);
      if (res.success) {
        setFaceVerified(true);
        setFaceStatusText('Face verified ✓ • Liveness check passed ✓');
      }
    } catch (err: any) {
      setFaceError(err.message || 'Face verification failed.');
    } finally {
      setFaceScanning(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Hidden canvas for taking instant snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
            Step 6 of 8 • Multi-Factor Biometric Verification
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Voter Biometric Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Enforcing the <strong>One Person, One Vote</strong> security protocol. Verify your thumbprint and camera live facial identity before ballot issuance.
          </p>
        </div>

        {/* Prototype Biometric Simulation Disclaimer */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-amber-950 uppercase tracking-wider text-[11px]">
              Prototype Biometric Simulation
            </strong>
            <span className="text-[11px] text-amber-800">
              Both thumbprint and face checks are educational prototype simulations. Simulation failure toggles below allow testing brute-force lockout rules.
            </span>
          </div>
        </div>

        {/* Sub-step indicator tabs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveStage('FP')}
            className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              activeStage === 'FP'
                ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-100'
                : fpVerified
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 text-slate-500 bg-slate-50'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>1. Fingerprint</span>
            {fpVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
          </button>

          <button
            type="button"
            onClick={() => fpVerified && setActiveStage('FACE')}
            disabled={!fpVerified}
            className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              activeStage === 'FACE'
                ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-100'
                : faceVerified
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 text-slate-400 bg-slate-50 opacity-70 cursor-not-allowed'
            }`}
          >
            <ScanFace className="w-4 h-4" />
            <span>2. Live Camera Face</span>
            {faceVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
          </button>
        </div>

        {/* STAGE 1: FINGERPRINT VERIFICATION */}
        {activeStage === 'FP' && (
          <div className="space-y-5 text-center pt-2">
            {/* Explicit Instruction Callout */}
            <div className="p-3.5 rounded-2xl border text-xs font-medium text-left">
              {fpState === 'IDLE' && (
                <div className="text-slate-700 space-y-1">
                  <span className="font-bold block text-sm text-slate-900">
                    Press "Verify Fingerprint" below to activate the sensor.
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    You will then be prompted to place your thumb on the scanner pad.
                  </p>
                </div>
              )}

              {fpState === 'AWAITING_THUMB' && (
                <div className="text-indigo-900 bg-indigo-50/70 p-3 rounded-xl border border-indigo-200 space-y-1 animate-pulse">
                  <div className="flex items-center gap-2 font-bold text-sm text-indigo-800">
                    <Hand className="w-4 h-4 text-indigo-600 animate-bounce" />
                    <span>INSTRUCTION: Place your thumb on the scanner pad below</span>
                  </div>
                  <p className="text-[11px] text-indigo-700">
                    Press or click directly on the illuminated pad to simulate placing your thumb.
                  </p>
                </div>
              )}

              {fpState === 'SCANNING' && (
                <div className="text-cyan-900 bg-cyan-50/70 p-3 rounded-xl border border-cyan-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-cyan-800">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" />
                    <span>Scanning thumbprint ({fpProgress}%)... Please hold your thumb still</span>
                  </div>
                  <p className="text-[11px] text-cyan-700">
                    Matching ridge delta coordinates against registered template hash.
                  </p>
                </div>
              )}

              {fpVerified && (
                <div className="text-emerald-900 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Fingerprint verified successfully ✓</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Proceeding to live camera facial recognition.
                  </p>
                </div>
              )}
            </div>

            {/* Visual Scanner Pad */}
            <div
              onClick={() => {
                if (fpState === 'AWAITING_THUMB') {
                  handlePlaceThumbVerify();
                }
              }}
              className={`relative w-48 h-48 mx-auto rounded-3xl bg-slate-950 border-4 transition-all duration-300 flex flex-col items-center justify-center shadow-xl overflow-hidden select-none ${
                fpState === 'AWAITING_THUMB'
                  ? 'border-indigo-400 ring-4 ring-indigo-500/30 cursor-pointer scale-102 hover:border-indigo-300'
                  : fpState === 'SCANNING'
                  ? 'border-cyan-400 ring-4 ring-cyan-500/20'
                  : fpVerified
                  ? 'border-emerald-400 ring-4 ring-emerald-500/20'
                  : 'border-slate-800'
              }`}
            >
              {/* Sonar pulses when awaiting thumb */}
              {fpState === 'AWAITING_THUMB' && (
                <div className="absolute inset-4 rounded-full border border-indigo-400/50 animate-ping pointer-events-none" />
              )}

              {/* Laser beam when scanning */}
              {fpState === 'SCANNING' && (
                <>
                  <div className="absolute inset-0 bg-cyan-500/20 animate-pulse pointer-events-none" />
                  <div
                    className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_12px_#38bdf8] transition-all duration-300 pointer-events-none"
                    style={{ top: `${fpProgress}%` }}
                  />
                </>
              )}

              <Fingerprint
                className={`w-24 h-24 transition-all duration-300 ${
                  fpVerified
                    ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.7)]'
                    : fpState === 'SCANNING'
                    ? 'text-cyan-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.7)] animate-pulse'
                    : fpState === 'AWAITING_THUMB'
                    ? 'text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.7)] animate-pulse'
                    : 'text-slate-600'
                }`}
              />

              {fpState === 'AWAITING_THUMB' && (
                <span className="mt-2 text-[9px] font-mono font-bold tracking-widest text-indigo-300 uppercase bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-400/40">
                  PLACE THUMB HERE
                </span>
              )}

              {fpState === 'SCANNING' && (
                <span className="absolute bottom-2 text-xs font-mono text-cyan-300 font-bold">
                  {fpProgress}%
                </span>
              )}
            </div>

            {/* Error & Attempts Info */}
            {fpError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-1">
                <div className="flex items-center justify-center gap-2 font-bold">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>{fpError}</span>
                </div>
                <div className="text-[11px] text-red-600">
                  Remaining attempts allowed: <strong>{fpAttemptsRemaining} of 3</strong>
                </div>
              </div>
            )}

            {!fpError && !fpVerified && (
              <div className="text-xs text-slate-500">
                Attempts remaining: <strong>{fpAttemptsRemaining} of 3</strong>
              </div>
            )}

            {/* Simulated Failure Tester */}
            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium text-[11px]">Simulate Biometric Mismatch:</span>
              <button
                type="button"
                onClick={() => setSimulateFpFailure(!simulateFpFailure)}
                className="flex items-center gap-1 font-bold text-xs"
              >
                {simulateFpFailure ? (
                  <span className="text-red-600 flex items-center gap-1">
                    <ToggleRight className="w-6 h-6 text-red-600" /> FAIL MODE ON
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <ToggleLeft className="w-6 h-6 text-slate-400" /> Normal Match
                  </span>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              {fpVerified ? (
                <button
                  type="button"
                  onClick={() => setActiveStage('FACE')}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Proceed to Live Camera Face Verification
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : fpState === 'IDLE' ? (
                <button
                  type="button"
                  onClick={handleInitiateFpVerify}
                  disabled={fpAttemptsRemaining <= 0}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Fingerprint className="w-4 h-4" />
                  Verify Fingerprint
                </button>
              ) : fpState === 'AWAITING_THUMB' ? (
                <button
                  type="button"
                  onClick={handlePlaceThumbVerify}
                  disabled={fpAttemptsRemaining <= 0}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all animate-pulse"
                >
                  <Hand className="w-4 h-4" />
                  Place Thumb on Scanner Pad Now
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-700 text-slate-300 flex items-center justify-center gap-2 cursor-wait"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Simulating Biometric Verification ({fpProgress}%)...
                </button>
              )}
            </div>
          </div>
        )}

        {/* STAGE 2: LIVE CAMERA FACE RECOGNITION + LIVENESS CHECK */}
        {activeStage === 'FACE' && (
          <div className="space-y-5 text-center pt-2">
            {/* Explicit Instruction Callout */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-left text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>INSTRUCTION: Look directly into your camera</span>
              </div>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Allow camera access below so the live feed can verify your face in real time. Center your face within the guide reticle and press <strong>"Capture & Verify Live Face"</strong>.
              </p>

              {/* Camera Status & Manual Enable Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-200/60">
                <div className="flex items-center gap-1.5 text-[10px] font-medium">
                  <span className={`w-2 h-2 rounded-full ${hasWebcam ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className={hasWebcam ? 'text-emerald-700 font-bold' : 'text-amber-800'}>
                    {hasWebcam ? 'Live Camera Feed Active' : 'Camera permission needed for live video'}
                  </span>
                </div>

                {!hasWebcam && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="py-1 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Video className="w-3 h-3" />
                    Allow / Enable Camera
                  </button>
                )}
              </div>
            </div>

            {/* Camera Viewfinder Box with Live Stream */}
            <div className="relative w-64 h-64 mx-auto rounded-3xl bg-slate-950 border-4 border-slate-800 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
              {/* Shutter flash effect */}
              {shutterFlash && (
                <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
              )}

              {/* 1. Captured Snapshot View (if taken) OR 2. Live Video OR 3. Sensor fallback */}
              {capturedSnapshot ? (
                <img
                  src={capturedSnapshot}
                  alt="Live Face Capture"
                  className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                />
              ) : hasWebcam ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="relative z-0 flex flex-col items-center justify-center">
                  <ScanFace
                    className={`w-28 h-28 transition-all duration-300 ${
                      faceVerified
                        ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.7)]'
                        : faceScanning
                        ? 'text-cyan-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.7)] animate-pulse'
                        : 'text-slate-600'
                    }`}
                  />
                  <span className="text-[10px] font-mono text-slate-400 mt-2">
                    Synthetic Optical Sensor
                  </span>
                </div>
              )}

              {/* Facial alignment bounding reticle */}
              <div className="absolute inset-3 pointer-events-none border border-white/20 rounded-2xl flex flex-col justify-between p-2 z-10">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                </div>
              </div>

              {/* Viewfinder oval guide */}
              <div
                className={`absolute inset-6 rounded-full border-2 border-dashed pointer-events-none z-10 transition-colors ${
                  faceVerified
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : faceScanning
                    ? 'border-cyan-400 bg-cyan-500/10 animate-pulse'
                    : 'border-slate-400/60'
                }`}
              />

              {/* Live Laser Sweep */}
              {faceScanning && (
                <div className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-bounce pointer-events-none z-30" />
              )}

              {/* Camera Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[9px] font-mono flex items-center gap-1 backdrop-blur-xs z-30">
                <span className={`w-1.5 h-1.5 rounded-full ${hasWebcam ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span>{hasWebcam ? 'CAMERA LIVE' : 'SYNTHETIC SENSOR'}</span>
              </div>
            </div>

            {/* 4 Steps Checklist Progress */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono">
              <div
                className={`p-2 rounded-xl border text-center transition-all ${
                  faceStep >= 1
                    ? 'border-blue-300 bg-blue-50 text-blue-900 font-bold'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                1. Detect Face
              </div>
              <div
                className={`p-2 rounded-xl border text-center transition-all ${
                  faceStep >= 2
                    ? 'border-blue-300 bg-blue-50 text-blue-900 font-bold'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                2. Match Vector
              </div>
              <div
                className={`p-2 rounded-xl border text-center transition-all ${
                  faceStep >= 3
                    ? 'border-blue-300 bg-blue-50 text-blue-900 font-bold'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                3. Liveness Check
              </div>
              <div
                className={`p-2 rounded-xl border text-center transition-all ${
                  faceStep >= 4
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                4. Verify Identity
              </div>
            </div>

            {/* Status Feedback */}
            {faceVerified ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Face verified from live camera ✓</span>
                </div>
                <div className="text-xs text-emerald-700 font-medium">
                  Liveness check passed ✓
                </div>
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 font-medium">
                  <strong>Simulated Prototype Biometric Check:</strong> Identity verified against demo template. Not certified government identity verification.
                </div>
              </div>
            ) : faceError ? (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-center gap-2 font-bold">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>{faceError}</span>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-600">{faceStatusText}</div>
            )}

            {/* Failure Simulation Toggle */}
            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium text-[11px]">Simulate Liveness Failure:</span>
              <button
                type="button"
                onClick={() => setSimulateFaceFailure(!simulateFaceFailure)}
                className="flex items-center gap-1 font-bold text-xs"
              >
                {simulateFaceFailure ? (
                  <span className="text-red-600 flex items-center gap-1">
                    <ToggleRight className="w-6 h-6 text-red-600" /> FAIL MODE ON
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <ToggleLeft className="w-6 h-6 text-slate-400" /> Normal Pass
                  </span>
                )}
              </button>
            </div>

            {/* Actions */}
            <div className="pt-2">
              {faceVerified ? (
                <button
                  type="button"
                  onClick={onSuccess}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Proceed to Ballot & Candidate Selection
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyFace}
                  disabled={faceScanning}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {faceScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning Face from Camera & Testing Liveness...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Look at Camera & Verify Live Face
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
