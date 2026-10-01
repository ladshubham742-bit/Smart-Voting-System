import React from 'react';
import {
  UserPlus,
  ShieldCheck,
  Fingerprint,
  Camera,
  KeyRound,
  ScanFace,
  Vote,
  CheckCircle2,
} from 'lucide-react';
import { StepType } from '../types';

interface StepIndicatorProps {
  currentStep: StepType;
  onStepClick?: (step: StepType) => void;
}

interface StepItem {
  id: StepType;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  stepNum: number;
}

const STEPS: StepItem[] = [
  { id: 'REGISTRATION', label: '1. Registration', shortLabel: 'Reg', icon: UserPlus, stepNum: 1 },
  { id: 'IDENTITY', label: '2. Identity', shortLabel: 'Identity', icon: ShieldCheck, stepNum: 2 },
  { id: 'FINGERPRINT_REG', label: '3. Fingerprint', shortLabel: 'Biometric', icon: Fingerprint, stepNum: 3 },
  { id: 'FACE_REG', label: '4. Face', shortLabel: 'Face', icon: Camera, stepNum: 4 },
  { id: 'LOGIN', label: '5. Login', shortLabel: 'Login', icon: KeyRound, stepNum: 5 },
  { id: 'VERIFICATION_FP', label: '6. Verification', shortLabel: 'Verify', icon: ScanFace, stepNum: 6 },
  { id: 'VOTE_CANDIDATE', label: '7. Vote', shortLabel: 'Ballot', icon: Vote, stepNum: 7 },
  { id: 'CONFIRMATION', label: '8. Confirmation', shortLabel: 'Done', icon: CheckCircle2, stepNum: 8 },
];

function getStepNumber(step: StepType): number {
  switch (step) {
    case 'REGISTRATION':
      return 1;
    case 'IDENTITY':
      return 2;
    case 'FINGERPRINT_REG':
      return 3;
    case 'FACE_REG':
      return 4;
    case 'LOGIN':
      return 5;
    case 'VERIFICATION_FP':
    case 'VERIFICATION_FACE':
      return 6;
    case 'VOTE_CANDIDATE':
      return 7;
    case 'CONFIRMATION':
      return 8;
    default:
      return 0;
  }
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  const currentStepNum = getStepNumber(currentStep);

  // If on landing, admin dashboard, or public results, do not show stepper
  if (currentStep === 'LANDING' || currentStep === 'ADMIN_DASHBOARD' || currentStep === 'RESULTS') {
    return null;
  }

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 shadow-xs sticky top-[73px] z-30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between overflow-x-auto pb-1 scrollbar-none gap-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentStepNum > s.stepNum;
            const isCurrent = currentStepNum === s.stepNum;

            return (
              <React.Fragment key={s.id}>
                {/* Step Item */}
                <div
                  className={`flex items-center gap-2 flex-shrink-0 px-2 py-1 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-blue-50 border border-blue-200 text-blue-800'
                      : isCompleted
                      ? 'text-emerald-700 hover:bg-slate-50 cursor-pointer'
                      : 'text-slate-400 opacity-70'
                  }`}
                  onClick={() => {
                    if (isCompleted && onStepClick) {
                      onStepClick(s.id);
                    }
                  }}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-300'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.stepNum}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        isCurrent
                          ? 'text-blue-900 font-bold'
                          : isCompleted
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-blue-600 font-medium tracking-tight">
                        Current Step
                      </span>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block flex-1 min-w-[12px] h-[2px] rounded ${
                      currentStepNum > s.stepNum ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
