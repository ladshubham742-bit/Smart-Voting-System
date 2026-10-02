import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Building2,
  CreditCard,
} from 'lucide-react';
import { api } from '../services/api';
import { Voter, StepType } from '../types';

interface VoterRegistrationProps {
  onSuccess: (voter: Voter) => void;
  onNavigate: (step: StepType) => void;
}

export const VoterRegistration: React.FC<VoterRegistrationProps> = ({ onSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    email: '',
    mobile: '',
    idType: 'Aadhaar' as 'Aadhaar' | 'CollegeID',
    idNumber: '',
    voterId: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [registeredVoter, setRegisteredVoter] = useState<Voter | null>(null);

  // Compute live masked identifier preview
  const getMaskedPreview = () => {
    const raw = formData.idNumber.replace(/\s+/g, '');
    if (!raw) return 'Not entered yet';
    if (formData.idType === 'Aadhaar') {
      const last4 = raw.slice(-4);
      return `XXXX-XXXX-${last4.padStart(4, 'X')}`;
    } else {
      return `COLLEGE-${raw.slice(0, 4)}-***${raw.slice(-3)}`;
    }
  };

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!formData.fullName.trim()) {
      setError('Please provide your legal full name.');
      return;
    }

    if (!formData.dob) {
      setError('Please select your Date of Birth.');
      return;
    }

    const age = calculateAge(formData.dob);
    if (age < 18) {
      setError(`Voter is ${age} years old. Must be at least 18 years of age to register for elections.`);
      return;
    }

    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!formData.mobile || formData.mobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!formData.idNumber.trim()) {
      setError(`Please enter your valid ${formData.idType} number.`);
      return;
    }

    if (formData.idType === 'Aadhaar' && formData.idNumber.replace(/\s+/g, '').length !== 12) {
      setError('Aadhaar number must contain exactly 12 numerical digits.');
      return;
    }

    if (!formData.voterId.trim()) {
      setError('Please provide a unique Voter ID or Student ID.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      // Call registration API
      const res = await api.registerVoter({
        fullName: formData.fullName,
        dob: formData.dob,
        email: formData.email,
        mobile: formData.mobile,
        idType: formData.idType,
        idNumber: formData.idNumber,
        voterId: formData.voterId,
        password: formData.password,
      });

      setVerificationSuccess(true);
      setVerifiedToken(res.voter.identityToken);
      setRegisteredVoter(res.voter);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      fullName: 'Aarav Singhania',
      dob: '2002-04-18',
      email: `aarav.${randomSuffix}@campus.edu`,
      mobile: '9876543210',
      idType: 'Aadhaar',
      idNumber: '554433221199',
      voterId: `VOT-2026-${randomSuffix}`,
      password: 'Demo@123',
      confirmPassword: 'Demo@123',
    });
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Top Card Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Step 1 of 8
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Voter Registration & Identity Verification
            </h2>
            <p className="text-sm text-slate-500">
              Provide your official KYC credentials. Your sensitive government identity is masked and tokenized before database persistence.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex-shrink-0"
          >
            Autofill Sample
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Identity Verification Success Screen */}
        {verificationSuccess && registeredVoter ? (
          <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block mb-1">
                DATABASE RECORD STORED & INDEXED ✓
              </span>
              <h3 className="text-xl font-extrabold text-emerald-950">
                Citizen Registration Successful
              </h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Your credentials have been authenticated and securely persisted in the election database.
              </p>
            </div>

            {/* Official Stored Database Record Card */}
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 text-left space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Central Database Record ID
                  </span>
                  <span className="font-mono font-black text-sm text-indigo-700">
                    {registeredVoter.databaseRecordId || 'REG-DB-2026-PENDING'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Registration Timestamp
                  </span>
                  <span className="font-mono text-xs text-slate-700 font-bold">
                    {new Date(registeredVoter.createdAt || Date.now()).toLocaleTimeString()} • {new Date(registeredVoter.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Registered Citizen Name</span>
                  <span className="font-bold text-slate-900 text-sm">{registeredVoter.name}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Voter / Student Registry ID</span>
                  <span className="font-mono font-bold text-blue-600 text-sm">{registeredVoter.id}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">KYC Document & Masked ID</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      {registeredVoter.idType}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {registeredVoter.idNumberMasked}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Voting Eligibility Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Eligible (One Ballot Allotted)
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-500 block text-[10px]">Stored Cryptographic Identity Token (SHA-256)</span>
                <span className="font-mono text-[10px] text-slate-700 truncate block mt-0.5" title={verifiedToken || ''}>
                  {verifiedToken || registeredVoter.identityToken}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center justify-between">
                <span>Database File Sync:</span>
                <span className="font-mono font-bold text-indigo-700">data/election_database.json</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('LOGIN')}
                className="py-3 px-4 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all flex items-center justify-center gap-1.5"
              >
                Go to Login
              </button>
              <button
                type="button"
                onClick={() => onSuccess(registeredVoter)}
                className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
              >
                Proceed to Fingerprint Registration (Step 2)
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name (as per ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Date of Birth (18+) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  max="2008-01-01"
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                />
              </div>

              {/* Voter ID */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Desired Voter / Student ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VOT-2026-1049"
                  value={formData.voterId}
                  onChange={(e) => setFormData({ ...formData, voterId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@demo.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                />
              </div>

              {/* Mobile */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                />
              </div>

              {/* ID Type Choice */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Identity Document Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, idType: 'Aadhaar' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      formData.idType === 'Aadhaar'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Aadhaar (12 Digits)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, idType: 'CollegeID' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      formData.idType === 'CollegeID'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    College ID Card
                  </button>
                </div>
              </div>

              {/* ID Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {formData.idType === 'Aadhaar' ? 'Aadhaar Number' : 'College Registry ID'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={formData.idType === 'Aadhaar' ? '12-digit number (e.g. 554433221199)' : 'College ID (e.g. CS2026-908)'}
                  value={formData.idNumber}
                  maxLength={formData.idType === 'Aadhaar' ? 14 : 20}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Privacy Masking Live Preview Note */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Masked representation in DB:</span>
              </span>
              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {getMaskedPreview()}
              </span>
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Action Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying Identity Records with UIDAI/College DB...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Submit & Verify Identity
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('LOGIN')}
            className="text-blue-600 font-bold hover:underline"
          >
            Proceed directly to Voter Login
          </button>
        </p>
      </div>
    </div>
  );
};
