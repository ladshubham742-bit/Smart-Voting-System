import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StepIndicator } from './components/StepIndicator';
import { LandingPage } from './components/LandingPage';
import { VoterRegistration } from './components/VoterRegistration';
import { FingerprintRegistration } from './components/FingerprintRegistration';
import { FaceRegistration } from './components/FaceRegistration';
import { VoterLogin } from './components/VoterLogin';
import { BiometricVerification } from './components/BiometricVerification';
import { BallotScreen } from './components/BallotScreen';
import { ConfirmationReceipt } from './components/ConfirmationReceipt';
import { AdminDashboard } from './components/AdminDashboard';
import { ElectionResults } from './components/ElectionResults';
import { HowItWorksModal } from './components/HowItWorksModal';
import { ReceiptVerifierModal } from './components/ReceiptVerifierModal';
import { DemoToolbar } from './components/DemoToolbar';
import { api } from './services/api';
import { EncryptedReceipt, StepType, Voter } from './types';

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepType>('LANDING');
  const [currentUser, setCurrentUser] = useState<Voter | null>(null);
  const [latestReceipt, setLatestReceipt] = useState<EncryptedReceipt | null>(null);

  // Quick Preset states
  const [presetLoginId, setPresetLoginId] = useState<string>('');
  const [presetPassword, setPresetPassword] = useState<string>('');

  // Modals
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isDemoSwitcherOpen, setIsDemoSwitcherOpen] = useState(false);
  const [isReceiptVerifierOpen, setIsReceiptVerifierOpen] = useState(false);
  const [verifierReceiptId, setVerifierReceiptId] = useState<string>('');

  // Check existing session on load
  useEffect(() => {
    async function checkSession() {
      const token = api.getToken();
      if (!token) return;

      try {
        const status = await api.getVoterStatus();
        setCurrentUser({
          id: status.voterId,
          name: status.name,
          dob: '',
          email: '',
          mobile: '',
          idType: 'Aadhaar',
          idNumberMasked: status.idNumberMasked,
          identityToken: '',
          hasVoted: status.hasVoted,
          votedAt: status.votedAt,
          role: status.role as any,
        });
      } catch (e) {
        api.clearToken();
      }
    }

    checkSession();
  }, []);

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setLatestReceipt(null);
    setCurrentStep('LANDING');
  };

  const handleQuickLogin = async (id: string, pass: string) => {
    try {
      const res = await api.login(id, pass);
      setCurrentUser(res.voter);

      if (res.voter.role === 'Administrator' || res.voter.role === 'Election Officer') {
        setCurrentStep('ADMIN_DASHBOARD');
      } else {
        // Voter moves to biometric verification
        setCurrentStep('VERIFICATION_FP');
      }
    } catch (e: any) {
      setPresetLoginId(id);
      setPresetPassword(pass);
      setCurrentStep('LOGIN');
    }
  };

  const handleOpenVerifierWithId = (receiptId: string) => {
    setVerifierReceiptId(receiptId);
    setIsReceiptVerifierOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentStep={currentStep}
        onNavigate={(step) => setCurrentStep(step)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenDemoSwitcher={() => setIsDemoSwitcherOpen(true)}
        onOpenReceiptVerifier={() => {
          setVerifierReceiptId('');
          setIsReceiptVerifierOpen(true);
        }}
      />

      {/* Top 8-Step Stepper */}
      <StepIndicator
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {currentStep === 'LANDING' && (
          <LandingPage
            onNavigate={(step) => setCurrentStep(step)}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
            onOpenDemoSwitcher={() => setIsDemoSwitcherOpen(true)}
            onQuickLogin={handleQuickLogin}
          />
        )}

        {currentStep === 'REGISTRATION' && (
          <VoterRegistration
            onSuccess={(voter) => {
              setCurrentUser(voter);
              setCurrentStep('FINGERPRINT_REG');
            }}
            onNavigate={(step) => setCurrentStep(step)}
          />
        )}

        {currentStep === 'FINGERPRINT_REG' && (
          <FingerprintRegistration
            currentUser={currentUser}
            onSuccess={() => setCurrentStep('FACE_REG')}
            onNavigate={(step) => setCurrentStep(step)}
          />
        )}

        {currentStep === 'FACE_REG' && (
          <FaceRegistration
            currentUser={currentUser}
            onSuccess={() => setCurrentStep('LOGIN')}
            onNavigate={(step) => setCurrentStep(step)}
          />
        )}

        {currentStep === 'LOGIN' && (
          <VoterLogin
            presetVoterId={presetLoginId}
            presetPassword={presetPassword}
            onSuccess={(voter) => {
              setCurrentUser(voter);
              if (voter.role === 'Administrator' || voter.role === 'Election Officer') {
                setCurrentStep('ADMIN_DASHBOARD');
              } else {
                setCurrentStep('VERIFICATION_FP');
              }
            }}
            onNavigate={(step) => setCurrentStep(step)}
          />
        )}

        {(currentStep === 'VERIFICATION_FP' || currentStep === 'VERIFICATION_FACE') && (
          <BiometricVerification
            currentUser={currentUser}
            onSuccess={() => setCurrentStep('VOTE_CANDIDATE')}
            onNavigate={(step) => setCurrentStep(step)}
          />
        )}

        {currentStep === 'VOTE_CANDIDATE' && (
          <BallotScreen
            currentUser={currentUser}
            onVoteCastSuccess={(receipt) => {
              setLatestReceipt(receipt);
              if (currentUser) {
                setCurrentUser({ ...currentUser, hasVoted: true, votedAt: receipt.timestamp });
              }
              setCurrentStep('CONFIRMATION');
            }}
            onNavigate={(step) => setCurrentStep(step)}
            onOpenReceiptVerifierWithId={handleOpenVerifierWithId}
          />
        )}

        {currentStep === 'CONFIRMATION' && latestReceipt && (
          <ConfirmationReceipt
            receipt={latestReceipt}
            currentUser={currentUser}
            onLogout={handleLogout}
            onVerifyReceipt={handleOpenVerifierWithId}
            onNavigate={(step) => setCurrentStep(step)}
          />
        )}

        {currentStep === 'ADMIN_DASHBOARD' && (
          <AdminDashboard
            currentUser={currentUser}
            onNavigate={(step) => setCurrentStep(step)}
            onOpenReceiptVerifierWithId={handleOpenVerifierWithId}
          />
        )}

        {currentStep === 'RESULTS' && (
          <ElectionResults
            currentUser={currentUser}
            onNavigate={(step) => setCurrentStep(step)}
            onOpenReceiptVerifier={() => {
              setVerifierReceiptId('');
              setIsReceiptVerifierOpen(true);
            }}
          />
        )}
      </main>

      {/* Floating Demo Mode Launcher (Always accessible at bottom-right) */}
      <aside aria-label="Demo Mode Controls" className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsDemoSwitcherOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-2xl border-2 border-indigo-400/50 hover:scale-105 transition-all text-xs font-bold"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>DEMO SANDBOX</span>
        </button>
      </aside>

      {/* Modals */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      <ReceiptVerifierModal
        isOpen={isReceiptVerifierOpen}
        initialReceiptId={verifierReceiptId}
        onClose={() => {
          setIsReceiptVerifierOpen(false);
          setVerifierReceiptId('');
        }}
      />

      <DemoToolbar
        isOpen={isDemoSwitcherOpen}
        onClose={() => setIsDemoSwitcherOpen(false)}
        onQuickLogin={handleQuickLogin}
        onNavigateStep={(step) => setCurrentStep(step)}
        onResetComplete={() => {
          handleLogout();
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-300">
            SecureVote AI • Smart Electronic Voting System Prototype
          </p>
          <p className="text-slate-500 max-w-xl mx-auto">
            Developed for educational and academic project demonstration. Features simulated multi-factor biometric authentication, tokenized citizen credentials, and AES-256-GCM encrypted balloting with atomic double-vote prevention.
          </p>
        </div>
      </footer>
    </div>
  );
}
