import {
  AdminStats,
  AuditLog,
  Candidate,
  EncryptedReceipt,
  LedgerItem,
  PublicElectionResults,
  Voter,
  RegisteredVoterRecord,
  LoginRecord,
  RegistrationRecord,
  VotingRecord,
  DatabaseSummary,
  VoterProfileRecord,
} from '../types';

const TOKEN_KEY = 'securevote_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Server request failed');
    }

    return data as T;
  },

  // Auth / Registration
  async registerVoter(payload: {
    fullName: string;
    dob: string;
    email: string;
    mobile: string;
    idType: string;
    idNumber: string;
    voterId: string;
    password: string;
  }) {
    const res = await this.request<{
      success: boolean;
      message: string;
      voter: Voter;
      sessionToken: string;
    }>('/api/auth/register-voter', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.sessionToken) {
      this.setToken(res.sessionToken);
    }
    return res;
  },

  async registerBiometrics(biometricType: 'FINGERPRINT' | 'FACE') {
    return this.request<{ success: boolean; message: string; templateToken?: string; faceToken?: string }>(
      '/api/auth/register-biometrics',
      {
        method: 'POST',
        body: JSON.stringify({ biometricType, simulationConfirmed: true }),
      }
    );
  },

  async login(voterId: string, password: string) {
    const res = await this.request<{
      success: boolean;
      message: string;
      sessionToken: string;
      voter: Voter;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ voterId, password }),
    });
    if (res.sessionToken) {
      this.setToken(res.sessionToken);
    }
    return res;
  },

  async verifyFingerprint(simulateFailure: boolean = false) {
    return this.request<{ success: boolean; message: string; attemptsRemaining?: number }>(
      '/api/auth/verify-fingerprint',
      {
        method: 'POST',
        body: JSON.stringify({ simulateFailure }),
      }
    );
  },

  async verifyFace(simulateFailure: boolean = false) {
    return this.request<{ success: boolean; message: string; livenessMessage?: string }>(
      '/api/auth/verify-face',
      {
        method: 'POST',
        body: JSON.stringify({ simulateFailure }),
      }
    );
  },

  // Voter Status & Ballot
  async getVoterStatus() {
    return this.request<{
      voterId: string;
      name: string;
      hasVoted: boolean;
      votedAt: string | null;
      receiptId?: string | null;
      isRestricted?: boolean;
      restrictedReason?: string | null;
      restrictedAt?: string | null;
      role: string;
      idNumberMasked: string;
      databaseRecordId?: string;
      bioVerified: boolean;
    }>('/api/voter/status');
  },

  async getVoterProfileRecord() {
    return this.request<VoterProfileRecord>('/api/voter/profile-record');
  },

  // Central Database Transparency Endpoints
  async getDatabaseSummary() {
    return this.request<DatabaseSummary>('/api/database/summary');
  },

  async getDatabaseLogins() {
    return this.request<{ logins: LoginRecord[]; total: number }>('/api/database/logins');
  },

  async getDatabaseRegistrations() {
    return this.request<{ registrations: RegistrationRecord[]; total: number }>('/api/database/registrations');
  },

  async getDatabaseVotingRecords() {
    return this.request<{ votingRecords: VotingRecord[]; total: number }>('/api/database/voting-records');
  },

  async getCandidates() {
    return this.request<{
      candidates: Candidate[];
      electionTitle: string;
      electionId: string;
    }>('/api/ballot/candidates');
  },

  async castVote(candidateId: string) {
    return this.request<{
      success: boolean;
      message: string;
      receipt: EncryptedReceipt;
    }>('/api/ballot/cast-vote', {
      method: 'POST',
      body: JSON.stringify({ candidateId }),
    });
  },

  async verifyReceipt(receiptId: string) {
    return this.request<{
      found: boolean;
      receiptId: string;
      ballotId: string;
      electionId: string;
      timestamp: string;
      verificationHash: string;
      cipherStatus: string;
      authTagVerified: boolean;
    }>(`/api/ballot/verify-receipt/${encodeURIComponent(receiptId)}`);
  },

  // Admin
  async getAdminStats() {
    return this.request<AdminStats>('/api/admin/stats');
  },

  async getAuditLogs() {
    return this.request<{ logs: AuditLog[]; total: number }>('/api/admin/audit-logs');
  },

  async getBallotsLedger() {
    return this.request<{ ledger: LedgerItem[]; total: number }>('/api/admin/ballots-ledger');
  },

  async getRegisteredVoters() {
    return this.request<{ voters: RegisteredVoterRecord[]; total: number }>('/api/admin/voters');
  },

  async resetDemoElection() {
    return this.request<{ success: boolean; message: string }>('/api/admin/reset-election', {
      method: 'POST',
    });
  },

  async unrestrictVoter(voterId: string) {
    return this.request<{ success: boolean; message: string }>('/api/admin/unrestrict-voter', {
      method: 'POST',
      body: JSON.stringify({ voterId }),
    });
  },

  async getDemoAccounts() {
    return this.request<{
      accounts: Array<{
        id: string;
        name: string;
        role: string;
        hasVoted: boolean;
        samplePassword: string;
      }>;
    }>('/api/demo/accounts');
  },

  // Public Results
  async getPublicElectionResults() {
    return this.request<PublicElectionResults>('/api/election/results');
  },
};
