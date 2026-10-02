export interface Voter {
  id: string;
  name: string;
  dob: string;
  email: string;
  mobile: string;
  idType: 'Aadhaar' | 'CollegeID';
  idNumberMasked: string;
  identityToken: string;
  hasVoted: boolean;
  votedAt: string | null;
  receiptId?: string | null;
  role: 'Voter' | 'Election Officer' | 'Administrator';
  hasRegisteredFingerprint?: boolean;
  hasRegisteredFace?: boolean;
  isRestricted?: boolean;
  restrictedReason?: string | null;
  restrictedAt?: string | null;
  createdAt?: string;
  lastLoginAt?: string | null;
  loginCount?: number;
  databaseRecordId?: string;
}

export interface RegisteredVoterRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  idType: string;
  idNumberMasked: string;
  identityTokenSnippet: string;
  hasVoted: boolean;
  votedAt: string | null;
  receiptId?: string | null;
  isRestricted: boolean;
  restrictedReason?: string | null;
  restrictedAt?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
  loginCount: number;
  hasRegisteredFingerprint: boolean;
  hasRegisteredFace: boolean;
  databaseRecordId?: string;
}

export interface LoginRecord {
  id: string;
  voterId: string;
  name: string;
  role: string;
  timestamp: string;
  ip: string;
  status: 'SUCCESS' | 'FAILED';
  failureReason?: string;
}

export interface RegistrationRecord {
  id: string;
  voterId: string;
  name: string;
  email: string;
  mobile: string;
  dob: string;
  idType: string;
  idNumberMasked: string;
  identityToken: string;
  registeredAt: string;
  ip: string;
  databaseRecordNumber: number;
}

export interface VotingRecord {
  id: string;
  voterId: string;
  receiptId: string;
  ballotId: string;
  timestamp: string;
  verificationHash: string;
  status: 'VOTE_CONFIRMED' | 'RESTRICTED';
}

export interface DatabaseSummary {
  totalRegistered: number;
  totalLogins: number;
  totalVotesCast: number;
  totalRestricted: number;
  databaseType: string;
  storageFile: string;
  lastUpdated: string;
}

export interface VoterProfileRecord {
  voterId: string;
  name: string;
  dob: string;
  email: string;
  mobile: string;
  idType: string;
  idNumberMasked: string;
  identityToken: string;
  databaseRecordId: string;
  createdAt: string;
  lastLoginAt: string | null;
  loginCount: number;
  hasRegisteredFingerprint: boolean;
  hasRegisteredFace: boolean;
  hasVoted: boolean;
  votedAt: string | null;
  receiptId: string | null;
  verificationHash?: string | null;
  isRestricted: boolean;
  restrictedReason: string | null;
  restrictedAt: string | null;
  role: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  partyCode: string;
  symbol: string;
  description: string;
  photoUrl: string;
}

export interface CandidateTally extends Candidate {
  votes: number;
  percentage: string;
}

export interface EncryptedReceipt {
  receiptId: string;
  ballotId: string;
  timestamp: string;
  electionId: string;
  encryptionStandard: string;
  verificationHash: string;
  voterStatus: string;
}

export interface AuditLog {
  id: string;
  voterTokenOrId: string;
  event: string;
  detail: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT' | 'BLOCKED';
  timestamp: string;
  ip: string;
}

export interface AdminStats {
  totalRegistered: number;
  totalVotesCast: number;
  pendingVoters: number;
  votingPercentage: string;
  candidateTallies: CandidateTally[];
  failedAttemptsCounter: number;
  duplicateAttemptsCounter: number;
  restrictedVotersCount: number;
  restrictedVoters?: Array<{ id: string; name: string; restrictedAt: string; reason: string; email: string }>;
  totalEncryptedBallots: number;
  electionStatus: string;
  encryptionStandard: string;
}

export interface LedgerItem {
  ballotId: string;
  receiptId: string;
  ciphertextSnippet: string;
  iv: string;
  authTag: string;
  timestamp: string;
  verificationHash: string;
}

export interface PublicElectionResults {
  electionTitle: string;
  electionId: string;
  status: string;
  totalRegistered: number;
  totalVotesCast: number;
  pendingVoters: number;
  turnoutPercentage: string;
  lastUpdated: string;
  encryptionStandard: string;
  leadingCandidate: {
    id: string;
    name: string;
    party: string;
    symbol: string;
    votes: number;
    percentage: string;
    leadMargin: number;
    photoUrl: string;
  } | null;
  candidates: Array<{
    id: string;
    name: string;
    party: string;
    partyCode: string;
    symbol: string;
    description: string;
    photoUrl: string;
    votes: number;
    percentage: string;
    rank: number;
  }>;
}

export type StepType =
  | 'LANDING'
  | 'REGISTRATION'
  | 'IDENTITY'
  | 'FINGERPRINT_REG'
  | 'FACE_REG'
  | 'LOGIN'
  | 'VERIFICATION_FP'
  | 'VERIFICATION_FACE'
  | 'VOTE_CANDIDATE'
  | 'CONFIRMATION'
  | 'ADMIN_DASHBOARD'
  | 'RESULTS';

export type DashboardTab = 'OVERVIEW' | 'TALLIES' | 'VOTERS' | 'LEDGER' | 'AUDIT' | 'RESTRICTED';

