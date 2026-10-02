import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CheckCircle2,
  ScanFace,
  ArrowRight,
  Info,
  RefreshCw,
  Video,
  VideoOff,
  Sparkles,
  Shield,
  Eye,
} from 'lucide-react';
import { api } from '../services/api';
import { StepType, Voter } from '../types';

interface FaceRegistrationProps {
  currentUser: Voter | null;
  onSuccess: () => void;
  onNavigate: (step: StepType) => void;
}

export const FaceRegistration: React.FC<FaceRegistrationProps> = ({
  currentUser,
  onSuccess,
  onNavigate,
}) => {
  const [scanning, setScanning] = useState(false);
  const [stage, setStage] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState('Camera Ready • Please look directly at the lens');
  const [isCompleted, setIsCompleted] = useState(false);
  const [faceToken, setFaceToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Camera State
  const [hasWebcam, setHasWebcam] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [shutterFlash, setShutterFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Automatically attempt to access webcam stream on mount
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
        .then((stream) => {
          activeStream = stream;
          setHasWebcam(true);
          setCameraPermission('granted');
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setHasWebcam(false);
          setCameraPermission('denied');
        });
    } else {
      setHasWebcam(false);
      setCameraPermission('denied');
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCaptureFace = async () => {
    setError(null);
    setScanning(true);
    setShutterFlash(true);

    // Trigger visual shutter flash
    setTimeout(() => setShutterFlash(false), 200);

    // Capture snapshot frame from video if available
    if (hasWebcam && videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setCapturedSnapshot(canvas.toDataURL('image/jpeg', 0.8));
        }
      } catch (e) {
        // fallback
      }
    }

    // Step 1: “Detecting face...”
    setStage(1);
    setStatusMessage('Detecting face...');
    await new Promise((r) => setTimeout(r, 700));

    // Step 2: “Checking face position...”
    setStage(2);
    setStatusMessage('Checking face position...');
    await new Promise((r) => setTimeout(r, 700));

    // Step 3: “Creating biometric template...”
    setStage(3);
    setStatusMessage('Creating biometric template...');
    await new Promise((r) => setTimeout(r, 800));

    // Backend Simulated Registration
    try {
      const res = await api.registerBiometrics('FACE');
      setFaceToken(res.faceToken || 'FACE_VEC_SHA256_BOUND_VOTER');
      setStage(4);
      setStatusMessage('Face registered successfully ✓');
      setIsCompleted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to register face template');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Hidden canvas for snapshot capture */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-center">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
            Step 4 of 8 • Facial Biometric Registration
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Face Registration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Position your face inside the camera alignment frame. Follow the on-screen prompt to look straight into the camera lens.
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
              This facial enrollment is an educational prototype simulation and not real government-grade biometric authentication. No facial images are uploaded to any server.
            </span>
          </div>
        </div>

        {/* Explicit Instruction Callout */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-left text-xs space-y-1">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>INSTRUCTION: Look directly at the camera</span>
          </div>
          <p className="text-blue-800 text-[11px] leading-relaxed">
            Align your eyes and nose inside the guide oval. When centered, press <strong>"Register Face"</strong> below to capture your facial landmark template.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-200/60">
            <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-medium">
              <span className={`w-2 h-2 rounded-full ${hasWebcam ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className={hasWebcam ? 'text-emerald-700 font-bold' : 'text-blue-800'}>
                {hasWebcam
                  ? 'Live camera interface active'
                  : 'Synthetic sensor camera active (camera permission optional)'}
              </span>
            </div>

            {!hasWebcam && (
              <button
                type="button"
                onClick={() => {
                  navigator.mediaDevices
                    ?.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
                    .then((stream) => {
                      setHasWebcam(true);
                      if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play().catch(() => {});
                      }
                    })
                    .catch(() => {});
                }}
                className="py-1 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                <Video className="w-3 h-3" />
                Allow / Enable Camera
              </button>
            )}
          </div>
        </div>

        {/* Camera Mockup Container */}
        <div className="relative w-64 h-64 mx-auto rounded-3xl bg-slate-950 border-4 border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
          {/* Shutter Flash Animation */}
          {shutterFlash && (
            <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {/* Real Camera Stream OR Freeze Snapshot OR Synthetic Mockup */}
          {capturedSnapshot ? (
            <img
              src={capturedSnapshot}
              alt="Captured Frame"
              className="absolute inset-0 w-full h-full object-cover mirror"
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
            /* High-tech Face Mesh Graphic Silhouette */
            <div className="relative z-0 flex flex-col items-center justify-center">
              <ScanFace
                className={`w-32 h-32 transition-all duration-300 ${
                  isCompleted
                    ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.7)]'
                    : scanning
                    ? 'text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.7)] animate-pulse'
                    : 'text-slate-600'
                }`}
              />
              <span className="text-[11px] font-mono text-slate-400 mt-2">
                Sensor Viewfinder Feed
              </span>
            </div>
          )}

          {/* Camera Viewfinder Reticle Corners */}
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

          {/* Center Oval Face Guide */}
          <div
            className={`absolute inset-7 rounded-full border-2 border-dashed pointer-events-none z-10 transition-colors duration-300 ${
              isCompleted
                ? 'border-emerald-400 bg-emerald-500/10'
                : scanning
                ? 'border-cyan-400 bg-cyan-500/10 animate-pulse'
                : 'border-slate-400/60'
            }`}
          />

          {/* Active Scanning Laser Line */}
          {scanning && (
            <div className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-bounce pointer-events-none z-20" />
          )}

          {/* Camera Status Badge */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-mono flex items-center gap-1 backdrop-blur-xs z-20">
            <span className={`w-1.5 h-1.5 rounded-full ${hasWebcam ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
            <span>{hasWebcam ? 'LIVE CAMERA' : 'MOCKUP SENSOR'}</span>
          </div>
        </div>

        {/* Dynamic Status Progress Flow */}
        <div className="space-y-3 max-w-sm mx-auto">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-xs font-mono font-bold text-slate-800 flex items-center justify-center gap-2">
              {scanning && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />}
              {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              <span>{statusMessage}</span>
            </div>
          </div>

          {/* Sequential 4-Step Checklist */}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 font-mono">
            <div
              className={`p-2 rounded-xl border text-center transition-all ${
                stage >= 1
                  ? 'border-blue-400 bg-blue-50 text-blue-900 font-bold'
                  : 'border-slate-100 bg-slate-50'
              }`}
            >
              1. Detect Face
            </div>
            <div
              className={`p-2 rounded-xl border text-center transition-all ${
                stage >= 2
                  ? 'border-blue-400 bg-blue-50 text-blue-900 font-bold'
                  : 'border-slate-100 bg-slate-50'
              }`}
            >
              2. Align Angle
            </div>
            <div
              className={`p-2 rounded-xl border text-center transition-all ${
                stage >= 3
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold'
                  : 'border-slate-100 bg-slate-50'
              }`}
            >
              3. Vector Hash
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Action Controls */}
        {isCompleted ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-left text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Face registered successfully ✓</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-[11px] font-mono">
                <span className="text-slate-500 font-sans block">Stored Biometric Vector Token:</span>
                <span className="font-bold text-slate-800 select-all truncate block">
                  {faceToken || 'FACE_VEC_SHA256_BOUND_TO_VOTER'}
                </span>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 font-sans font-medium">
                <strong>Simulated Prototype Biometric Check:</strong> Tokenized template stored for demonstration. Not certified government identity verification.
              </div>
            </div>

            <button
              onClick={onSuccess}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Continue to Voter Login
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={handleCaptureFace}
              disabled={scanning}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Capturing & Extracting Facial Landmarks...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Look at Camera & Register Face
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
