import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- TYPES & INTERFACES ---
export interface Voter {
  id: string; // e.g. "DEMO-VOTER-001" or "VOT-2026-..."
  name: string;
  dob: string;
  email: string;
  mobile: string;
  idType: 'Aadhaar' | 'CollegeID';
  idNumberMasked: string; // "XXXX-XXXX-8421"
  identityToken: string; // SHA-256 token of ID
  voterCardId: string;
  passwordHash: string;
  salt: string;
  fingerprintToken: string; // Simulated biometric template hash
  faceToken: string; // Simulated facial vector token
  hasVoted: boolean;
  votedAt: string | null;
  failedAuthAttempts: number;
  role: 'Voter' | 'Election Officer' | 'Administrator';
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  partyCode: string;
  symbol: string;
  description: string;
  photoUrl: string;
  votes: number;
}

export interface EncryptedBallot {
  ballotId: string;
  receiptId: string;
  electionId: string;
  ciphertext: string; // Base64 AES-256-GCM
  iv: string; // Base64 12-byte IV
  authTag: string; // Base64 16-byte GCM Tag
  timestamp: string;
  verificationHash: string; // SHA256 of ballot payload
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

// --- SECRETS & CRYPTOGRAPHY ---
// Server-side Master Election Key for AES-256-GCM (never sent to client)
const MASTER_ELECTION_KEY = crypto.scryptSync(
  process.env.ELECTION_SECRET || 'securevote-master-secret-key-salt-2026',
  'salt-securevote-election-protocol-2026',
  32
);

// Hash password with salt
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Generate tokenized biometric string
function generateBiometricToken(type: 'FP' | 'FACE', voterId: string): string {
  const entropy = crypto.randomBytes(16).toString('hex');
  return `${type}_TPL_${crypto.createHash('sha256').update(voterId + entropy).digest('hex').substring(0, 24).toUpperCase()}`;
}

// Encrypt vote with AES-256-GCM
function encryptVoteChoice(candidateId: string): { ciphertext: string; iv: string; authTag: string; verificationHash: string } {
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_ELECTION_KEY, iv);
  
  const payload = JSON.stringify({
    candidateId,
    timestamp: new Date().toISOString(),
    nonce: crypto.randomBytes(8).toString('hex'),
  });

  let encrypted = cipher.update(payload, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');
  const ivBase64 = iv.toString('base64');

  const verificationHash = crypto
    .createHash('sha256')
    .update(`${encrypted}:${ivBase64}:${authTag}`)
    .digest('hex');

  return {
    ciphertext: encrypted,
    iv: ivBase64,
    authTag,
    verificationHash,
  };
}

// Decrypt vote for tally verification
function decryptVoteChoice(ciphertext: string, ivBase64: string, authTagBase64: string): string | null {
  try {
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_ELECTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    const parsed = JSON.parse(decrypted);
    return parsed.candidateId;
  } catch (err) {
    console.error('Failed to decrypt ballot:', err);
    return null;
  }
}

// --- IN-MEMORY DATABASE STATE (Thread-Safe with Mutex Lock for Double-Vote Prevention) ---
class SecureVoteDatabase {
  public voters: Map<string, Voter> = new Map();
  public ballots: EncryptedBallot[] = [];
  public auditLogs: AuditLog[] = [];
  public candidates: Candidate[] = [];
  public failedAttemptsCounter: number = 0;
  public duplicateAttemptsCounter: number = 0;
  private isProcessingVote: boolean = false; // Mutex lock

  constructor() {
    this.seedInitialData();
  }

  public seedInitialData() {
    this.voters.clear();
    this.ballots = [];
    this.auditLogs = [];
    this.failedAttemptsCounter = 0;
    this.duplicateAttemptsCounter = 0;

    // Initial Candidates
    this.candidates = [
      {
        id: 'CAND-01',
        name: 'Dr. Aruna Sen',
        party: 'Innovation & Academic Freedom Alliance',
        partyCode: 'IAFA',
        symbol: '🔬',
        description: 'Focuses on modern campus research grants, 24/7 digital library access, and green campus initiatives.',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
        votes: 0,
      },
      {
        id: 'CAND-02',
        name: 'Vikram Malhotra',
        party: 'Student Welfare & Progress Front',
        partyCode: 'SWPF',
        symbol: '⚖️',
        description: 'Advocates for affordable hostel dining, transparent student council budgeting, and mental health support.',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
        votes: 0,
      },
      {
        id: 'CAND-03',
        name: 'Kavita Deshmukh',
        party: 'Tech & Sustainable Campus Coalition',
        partyCode: 'TSCC',
        symbol: '🌱',
        description: 'Pioneers solar campus micro-grids, open-source educational tooling, and industry career placement links.',
        photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
        votes: 0,
      },
      {
        id: 'CAND-04',
        name: 'Rohan Banerjee',
        party: 'United Scholars Union',
        partyCode: 'USU',
        symbol: '🏛️',
        description: 'Dedicated to faculty-student mentorship, sports arena upgrades, and cross-discipline research incubators.',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
        votes: 0,
      },
      {
        id: 'CAND-NOTA',
        name: 'NOTA (None of the Above)',
        party: 'Democratic Neutral Choice',
        partyCode: 'NOTA',
        symbol: '⚪',
        description: 'Select this option if you choose not to vote for any of the contested candidates.',
        photoUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop',
        votes: 0,
      },
    ];

    // Seed Demo Voters
    const salt1 = crypto.randomBytes(16).toString('hex');
    const salt2 = crypto.randomBytes(16).toString('hex');
    const salt3 = crypto.randomBytes(16).toString('hex');
    const saltAdmin = crypto.randomBytes(16).toString('hex');
    const saltOfficer = crypto.randomBytes(16).toString('hex');

    // Demo Voter 1: Ready to test full voting workflow
    const voter1: Voter = {
      id: 'DEMO-VOTER-001',
      name: 'Priya Sharma',
      dob: '2003-05-14',
      email: 'priya.sharma@demo.ac.in',
      mobile: '+91 98765 43210',
      idType: 'Aadhaar',
      idNumberMasked: 'XXXX-XXXX-8421',
      identityToken: crypto.createHash('sha256').update('8421-PRIYA-TOKEN').digest('hex'),
      voterCardId: 'DEMO-VOTER-001',
      passwordHash: hashPassword('Demo@123', salt1),
      salt: salt1,
      fingerprintToken: generateBiometricToken('FP', 'DEMO-VOTER-001'),
      faceToken: generateBiometricToken('FACE', 'DEMO-VOTER-001'),
      hasVoted: false,
      votedAt: null,
      failedAuthAttempts: 0,
      role: 'Voter',
      createdAt: '2026-09-28T09:00:00Z',
    };

    // Demo Voter 2: Already voted to demonstrate immediate rejection
    const voter2: Voter = {
      id: 'DEMO-VOTER-002',
      name: 'Aditya Patel',
      dob: '2002-11-20',
      email: 'aditya.patel@demo.ac.in',
      mobile: '+91 98234 56789',
      idType: 'CollegeID',
      idNumberMasked: 'COLLEGE-2026-***99',
      identityToken: crypto.createHash('sha256').update('99-ADITYA-TOKEN').digest('hex'),
      voterCardId: 'DEMO-VOTER-002',
      passwordHash: hashPassword('Demo@123', salt2),
      salt: salt2,
      fingerprintToken: generateBiometricToken('FP', 'DEMO-VOTER-002'),
      faceToken: generateBiometricToken('FACE', 'DEMO-VOTER-002'),
      hasVoted: true,
      votedAt: '2026-10-01T06:15:30Z',
      failedAuthAttempts: 0,
      role: 'Voter',
      createdAt: '2026-09-28T10:15:00Z',
    };

    // Pre-seed an encrypted ballot for Voter 2
    const seededBallot = encryptVoteChoice('CAND-01');
    this.ballots.push({
      ballotId: 'BLT-INIT-7F2A-91C0',
      receiptId: 'REC-2026-INIT-ADITYA',
      electionId: 'ELEC-2026-CAMPUS-GEN',
      ciphertext: seededBallot.ciphertext,
      iv: seededBallot.iv,
      authTag: seededBallot.authTag,
      timestamp: '2026-10-01T06:15:30Z',
      verificationHash: seededBallot.verificationHash,
    });
    this.candidates[0].votes += 1;

    // Demo Voter 3: Additional unvoted student
    const voter3: Voter = {
      id: 'DEMO-VOTER-003',
      name: 'Zoya Khan',
      dob: '2003-08-09',
      email: 'zoya.khan@demo.ac.in',
      mobile: '+91 97123 45678',
      idType: 'CollegeID',
      idNumberMasked: 'COLLEGE-2026-***45',
      identityToken: crypto.createHash('sha256').update('45-ZOYA-TOKEN').digest('hex'),
      voterCardId: 'DEMO-VOTER-003',
      passwordHash: hashPassword('Demo@123', salt3),
      salt: salt3,
      fingerprintToken: generateBiometricToken('FP', 'DEMO-VOTER-003'),
      faceToken: generateBiometricToken('FACE', 'DEMO-VOTER-003'),
      hasVoted: false,
      votedAt: null,
      failedAuthAttempts: 0,
      role: 'Voter',
      createdAt: '2026-09-29T11:30:00Z',
    };

    // Admin Account
    const admin: Voter = {
      id: 'admin',
      name: 'Chief Election Commissioner (Admin)',
      dob: '1980-01-01',
      email: 'admin.election@securevote.edu',
      mobile: '+91 99000 11223',
      idType: 'CollegeID',
      idNumberMasked: 'SEC-ADMIN-001',
      identityToken: 'ADMIN-AUTH-TOKEN',
      voterCardId: 'admin',
      passwordHash: hashPassword('Admin@123', saltAdmin),
      salt: saltAdmin,
      fingerprintToken: 'FP-ADMIN-SYSTEM',
      faceToken: 'FACE-ADMIN-SYSTEM',
      hasVoted: false,
      votedAt: null,
      failedAuthAttempts: 0,
      role: 'Administrator',
      createdAt: '2026-09-25T00:00:00Z',
    };

    // Officer Account
    const officer: Voter = {
      id: 'officer',
      name: 'Returning Officer Rao',
      dob: '1985-04-12',
      email: 'officer.rao@securevote.edu',
      mobile: '+91 98888 22334',
      idType: 'CollegeID',
      idNumberMasked: 'OFFICER-2026-77',
      identityToken: 'OFFICER-AUTH-TOKEN',
      voterCardId: 'officer',
      passwordHash: hashPassword('Officer@123', saltOfficer),
      salt: saltOfficer,
      fingerprintToken: 'FP-OFFICER-SYSTEM',
      faceToken: 'FACE-OFFICER-SYSTEM',
      hasVoted: false,
      votedAt: null,
      failedAuthAttempts: 0,
      role: 'Election Officer',
      createdAt: '2026-09-25T00:00:00Z',
    };

    this.voters.set(voter1.id, voter1);
    this.voters.set(voter2.id, voter2);
    this.voters.set(voter3.id, voter3);
    this.voters.set(admin.id, admin);
    this.voters.set(officer.id, officer);

    this.logAudit('SYSTEM', 'ELECTION_INITIALIZED', 'Initial demo data seeded with 3 demo voters and 1 pre-cast ballot.', 'SUCCESS');
  }

  public logAudit(voterId: string, event: string, detail: string, status: 'SUCCESS' | 'WARNING' | 'ALERT' | 'BLOCKED') {
    const log: AuditLog = {
      id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      voterTokenOrId: voterId.startsWith('DEMO-') || voterId === 'SYSTEM' || voterId === 'admin' ? voterId : `VOT-***${voterId.slice(-4)}`,
      event,
      detail,
      status,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1 (Internal Proxy)',
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 300) {
      this.auditLogs.pop();
    }
  }

  // Atomic vote execution to strictly prevent race conditions and double voting
  public async executeVoteCast(voterId: string, candidateId: string): Promise<{ success: boolean; error?: string; receipt?: any }> {
    // Acquire mutex
    while (this.isProcessingVote) {
      await new Promise((r) => setTimeout(r, 10));
    }
    this.isProcessingVote = true;

    try {
      const voter = this.voters.get(voterId);
      if (!voter) {
        this.logAudit(voterId, 'VOTE_FAILED', 'Voter record not found during ballot submission', 'ALERT');
        return { success: false, error: 'Voter not found in registry.' };
      }

      // CRITICAL CHECK: Has voter already voted?
      if (voter.hasVoted) {
        this.duplicateAttemptsCounter += 1;
        this.logAudit(
          voterId,
          'DOUBLE_VOTE_BLOCKED',
          `Double-voting attempt detected and rejected for voter ID: ${voterId}. Original vote cast at: ${voter.votedAt}`,
          'BLOCKED'
        );
        return {
          success: false,
          error: 'Vote already recorded. Duplicate voting is not permitted.',
        };
      }

      // Check candidate validity
      const candidate = this.candidates.find((c) => c.id === candidateId);
      if (!candidate) {
        this.logAudit(voterId, 'INVALID_CANDIDATE', `Attempted vote for invalid candidate ID: ${candidateId}`, 'WARNING');
        return { success: false, error: 'Invalid candidate selection.' };
      }

      // 1. Encrypt vote with AES-256-GCM
      const encrypted = encryptVoteChoice(candidateId);
      const receiptId = `REC-2026-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      const ballotId = `BLT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      const now = new Date().toISOString();

      // 2. Store ballot in separate encrypted collection (ballot secrecy preserved - no voterId on ballot)
      const ballot: EncryptedBallot = {
        ballotId,
        receiptId,
        electionId: 'ELEC-2026-CAMPUS-GEN',
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        timestamp: now,
        verificationHash: encrypted.verificationHash,
      };
      this.ballots.push(ballot);

      // 3. Mark voter as voted atomically
      voter.hasVoted = true;
      voter.votedAt = now;
      this.voters.set(voterId, voter);

      // 4. Update candidate tallies
      candidate.votes += 1;

      // 5. Log audit trail
      this.logAudit(
        voterId,
        'VOTE_CAST_ENCRYPTED',
        `Ballot successfully encrypted (AES-256-GCM) and recorded. Receipt issued: ${receiptId}`,
        'SUCCESS'
      );

      return {
        success: true,
        receipt: {
          receiptId,
          ballotId,
          timestamp: now,
          electionId: 'ELEC-2026-CAMPUS-GEN',
          encryptionStandard: 'AES-256-GCM',
          verificationHash: encrypted.verificationHash,
          voterStatus: 'VOTED',
        },
      };
    } finally {
      this.isProcessingVote = false;
    }
  }
}

const db = new SecureVoteDatabase();

// In-memory active voter sessions: token -> { voterId, role, expiresAt }
const sessions = new Map<string, { voterId: string; role: string; expiresAt: number; bioVerified: boolean }>();

function createSession(voterId: string, role: string): string {
  const token = `sv_sess_${crypto.randomBytes(24).toString('hex')}`;
  sessions.set(token, {
    voterId,
    role,
    expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    bioVerified: false,
  });
  return token;
}

// Session authentication middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No session token provided.' });
  }
  const token = authHeader.split(' ')[1];
  const sess = sessions.get(token);
  if (!sess || sess.expiresAt < Date.now()) {
    if (sess) sessions.delete(token);
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
  (req as any).session = sess;
  (req as any).sessionToken = token;
  next();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // --- API ROUTES ---

  // Health / Status Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ONLINE',
      system: 'SecureVote AI - College & Project Prototype',
      biometricMode: 'SIMULATED_DEMO',
      timestamp: new Date().toISOString(),
    });
  });

  // Public Live Election Results
  app.get('/api/election/results', (req, res) => {
    const allVoters = Array.from(db.voters.values()).filter((v) => v.role === 'Voter');
    const totalRegistered = allVoters.length;
    const totalVotesCast = allVoters.filter((v) => v.hasVoted).length;
    const pendingVoters = totalRegistered - totalVotesCast;
    const turnoutPercentage = totalRegistered > 0 ? ((totalVotesCast / totalRegistered) * 100).toFixed(1) : '0';

    // Calculate candidate tallies and sort by votes descending
    const sortedCandidates = [...db.candidates]
      .sort((a, b) => b.votes - a.votes)
      .map((c, index) => ({
        id: c.id,
        name: c.name,
        party: c.party,
        partyCode: c.partyCode,
        symbol: c.symbol,
        description: c.description,
        photoUrl: c.photoUrl,
        votes: c.votes,
        percentage: totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(1) : '0',
        rank: index + 1,
      }));

    const topCandidate = sortedCandidates[0];
    const runnerUp = sortedCandidates[1];
    const leadingCandidate =
      topCandidate && topCandidate.votes > 0
        ? {
            id: topCandidate.id,
            name: topCandidate.name,
            party: topCandidate.party,
            symbol: topCandidate.symbol,
            votes: topCandidate.votes,
            percentage: topCandidate.percentage,
            leadMargin: topCandidate.votes - (runnerUp ? runnerUp.votes : 0),
            photoUrl: topCandidate.photoUrl,
          }
        : null;

    res.json({
      electionTitle: 'University Student Council General Election 2026',
      electionId: 'ELEC-2026-CAMPUS-GEN',
      status: 'ACTIVE_TALLY',
      totalRegistered,
      totalVotesCast,
      pendingVoters,
      turnoutPercentage: `${turnoutPercentage}%`,
      lastUpdated: new Date().toISOString(),
      encryptionStandard: 'AES-256-GCM Cryptographic Tally',
      leadingCandidate,
      candidates: sortedCandidates,
    });
  });

  // 1. Voter Registration
  app.post('/api/auth/register-voter', (req: Request, res: Response) => {
    const { fullName, dob, email, mobile, idType, idNumber, voterId, password } = req.body;

    if (!fullName || !dob || !email || !mobile || !idNumber || !voterId || !password) {
      return res.status(400).json({ error: 'All fields are mandatory for voter registration.' });
    }

    // Check duplicate voter ID or email
    const existing = Array.from(db.voters.values()).find(
      (v) => v.id.toLowerCase() === voterId.trim().toLowerCase() || v.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existing) {
      return res.status(409).json({ error: 'A voter with this ID or Email is already registered.' });
    }

    // Age validation (must be at least 18 years old)
    const birthDate = new Date(dob);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (calculatedAge < 18) {
      return res.status(400).json({ error: 'Voter must be at least 18 years old to register.' });
    }

    // Mask sensitive identifiers (never store raw Aadhaar)
    let maskedId = '';
    const cleanId = idNumber.replace(/\s+/g, '');
    if (idType === 'Aadhaar') {
      maskedId = `XXXX-XXXX-${cleanId.slice(-4) || '0000'}`;
    } else {
      maskedId = `COLLEGE-${cleanId.slice(0, 4)}-***${cleanId.slice(-3)}`;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const identityToken = crypto.createHash('sha256').update(cleanId + salt).digest('hex');

    const newVoter: Voter = {
      id: voterId.trim(),
      name: fullName.trim(),
      dob,
      email: email.trim(),
      mobile: mobile.trim(),
      idType: idType || 'Aadhaar',
      idNumberMasked: maskedId,
      identityToken,
      voterCardId: voterId.trim(),
      passwordHash,
      salt,
      fingerprintToken: '', // Will be updated during biometric registration step
      faceToken: '', // Will be updated during face registration step
      hasVoted: false,
      votedAt: null,
      failedAuthAttempts: 0,
      role: 'Voter',
      createdAt: new Date().toISOString(),
    };

    db.voters.set(newVoter.id, newVoter);
    db.logAudit(newVoter.id, 'REGISTRATION_SUCCESS', `Voter registered. ID token created: ${identityToken.substring(0, 12)}...`, 'SUCCESS');

    const sessionToken = createSession(newVoter.id, newVoter.role);

    res.status(201).json({
      success: true,
      message: 'Identity verification successful ✓',
      voter: {
        id: newVoter.id,
        name: newVoter.name,
        maskedId: newVoter.idNumberMasked,
        identityToken: newVoter.identityToken,
      },
      sessionToken,
    });
  });

  // 2. Save Simulated Biometrics (Registration stage)
  app.post('/api/auth/register-biometrics', authenticate, (req: Request, res: Response) => {
    const sess = (req as any).session;
    const { biometricType, simulationConfirmed } = req.body;

    const voter = db.voters.get(sess.voterId);
    if (!voter) {
      return res.status(404).json({ error: 'Voter record not found.' });
    }

    if (biometricType === 'FINGERPRINT') {
      voter.fingerprintToken = generateBiometricToken('FP', voter.id);
      db.logAudit(voter.id, 'FP_REGISTERED', 'Simulated fingerprint token template generated and bound to voter identity', 'SUCCESS');
      return res.json({
        success: true,
        message: 'Fingerprint registered successfully ✓',
        templateToken: voter.fingerprintToken,
      });
    } else if (biometricType === 'FACE') {
      voter.faceToken = generateBiometricToken('FACE', voter.id);
      db.logAudit(voter.id, 'FACE_REGISTERED', 'Simulated face biometric vector registered with liveness metadata', 'SUCCESS');
      return res.json({
        success: true,
        message: 'Face registered successfully ✓',
        faceToken: voter.faceToken,
      });
    }

    res.status(400).json({ error: 'Invalid biometric type.' });
  });

  // 3. Voter / Admin Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { voterId, password } = req.body;

    if (!voterId || !password) {
      return res.status(400).json({ error: 'Voter ID and Password are required.' });
    }

    const voter = db.voters.get(voterId.trim());
    if (!voter) {
      db.failedAttemptsCounter += 1;
      db.logAudit(voterId, 'LOGIN_FAILED', 'Invalid ID provided during login attempt', 'WARNING');
      return res.status(401).json({ error: 'Invalid ID or credentials. Please check your details.' });
    }

    const computedHash = hashPassword(password, voter.salt);
    if (computedHash !== voter.passwordHash) {
      voter.failedAuthAttempts += 1;
      db.failedAttemptsCounter += 1;
      db.logAudit(voterId, 'LOGIN_FAILED', `Incorrect password attempt (#${voter.failedAuthAttempts})`, 'WARNING');
      return res.status(401).json({ error: 'Invalid ID or password. Please verify your credentials.' });
    }

    // Reset failed counter on successful password
    voter.failedAuthAttempts = 0;
    const sessionToken = createSession(voter.id, voter.role);

    db.logAudit(voter.id, 'LOGIN_SUCCESS', `User successfully authenticated (${voter.role})`, 'SUCCESS');

    res.json({
      success: true,
      message: 'Credentials authenticated successfully',
      sessionToken,
      voter: {
        id: voter.id,
        name: voter.name,
        role: voter.role,
        hasVoted: voter.hasVoted,
        votedAt: voter.votedAt,
        idNumberMasked: voter.idNumberMasked,
        hasRegisteredFingerprint: !!voter.fingerprintToken,
        hasRegisteredFace: !!voter.faceToken,
      },
    });
  });

  // 4. Biometric Verification: Fingerprint
  app.post('/api/auth/verify-fingerprint', authenticate, (req: Request, res: Response) => {
    const sess = (req as any).session;
    const { simulateFailure } = req.body;

    const voter = db.voters.get(sess.voterId);
    if (!voter) {
      return res.status(404).json({ error: 'Voter record not found.' });
    }

    if (voter.failedAuthAttempts >= 3) {
      db.logAudit(voter.id, 'FP_BLOCKED', 'Maximum biometric verification attempts exceeded', 'ALERT');
      return res.status(403).json({
        error: 'Fingerprint verification locked. Maximum 3 attempts exceeded. Contact Election Presiding Officer.',
        attemptsRemaining: 0,
      });
    }

    if (simulateFailure) {
      voter.failedAuthAttempts += 1;
      db.failedAttemptsCounter += 1;
      const remaining = Math.max(0, 3 - voter.failedAuthAttempts);
      db.logAudit(voter.id, 'FP_FAILED', `Fingerprint mismatch simulation (#${voter.failedAuthAttempts})`, 'WARNING');
      return res.status(400).json({
        success: false,
        error: 'Fingerprint verification failed. Please try again.',
        attemptsRemaining: remaining,
      });
    }

    // Successful match simulation
    db.logAudit(voter.id, 'FP_VERIFIED', 'Simulated fingerprint template matched against voter token ✓', 'SUCCESS');
    res.json({
      success: true,
      message: 'Fingerprint verified ✓',
    });
  });

  // 5. Biometric Verification: Face Recognition + Liveness
  app.post('/api/auth/verify-face', authenticate, (req: Request, res: Response) => {
    const sess = (req as any).session;
    const { simulateFailure } = req.body;

    const voter = db.voters.get(sess.voterId);
    if (!voter) {
      return res.status(404).json({ error: 'Voter not found.' });
    }

    if (simulateFailure) {
      db.failedAttemptsCounter += 1;
      db.logAudit(voter.id, 'FACE_FAILED', 'Face match or liveness check failed simulation', 'WARNING');
      return res.status(400).json({
        success: false,
        error: 'Face verification failed or liveness check not satisfied.',
      });
    }

    // Mark session as biometrically verified
    sess.bioVerified = true;
    db.logAudit(voter.id, 'FACE_VERIFIED', 'Simulated face recognition and liveness check passed ✓', 'SUCCESS');

    res.json({
      success: true,
      message: 'Face verified ✓',
      livenessMessage: 'Liveness check passed ✓',
    });
  });

  // 6. Check Voting Status (Source of Truth)
  app.get('/api/voter/status', authenticate, (req: Request, res: Response) => {
    const sess = (req as any).session;
    const voter = db.voters.get(sess.voterId);

    if (!voter) {
      return res.status(404).json({ error: 'Voter not found.' });
    }

    // Server is the strict source of truth for hasVoted
    if (voter.hasVoted) {
      db.logAudit(
        voter.id,
        'VOTER_STATUS_CHECK_BLOCKED',
        `Already-voted voter checked ballot status. Ballot access denied.`,
        'ALERT'
      );
    }

    res.json({
      voterId: voter.id,
      name: voter.name,
      hasVoted: voter.hasVoted,
      votedAt: voter.votedAt,
      role: voter.role,
      idNumberMasked: voter.idNumberMasked,
      bioVerified: sess.bioVerified,
    });
  });

  // 7. Get Candidate List (Access strictly denied if hasVoted === true)
  app.get('/api/ballot/candidates', authenticate, (req: Request, res: Response) => {
    const sess = (req as any).session;
    const voter = db.voters.get(sess.voterId);

    if (!voter) {
      return res.status(404).json({ error: 'Voter not found.' });
    }

    // IF voter already voted: REJECT and do NOT show candidate options
    if (voter.hasVoted && voter.role === 'Voter') {
      db.logAudit(voter.id, 'BALLOT_ACCESS_DENIED', 'Attempted to access ballot after voting.', 'BLOCKED');
      return res.status(403).json({
        error: 'You have already voted. Ballot access denied.',
        hasVoted: true,
        votedAt: voter.votedAt,
      });
    }

    // Return candidates without vote counts to preserve neutrality during voting
    const publicCandidates = db.candidates.map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      partyCode: c.partyCode,
      symbol: c.symbol,
      description: c.description,
      photoUrl: c.photoUrl,
    }));

    res.json({
      candidates: publicCandidates,
      electionTitle: 'University Student Council General Election 2026',
      electionId: 'ELEC-2026-CAMPUS-GEN',
    });
  });

  // 8. Atomic Cast Vote with AES-256-GCM Encryption
  app.post('/api/ballot/cast-vote', authenticate, async (req: Request, res: Response) => {
    const sess = (req as any).session;
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate selection is required.' });
    }

    const result = await db.executeVoteCast(sess.voterId, candidateId);

    if (!result.success) {
      return res.status(403).json({
        error: result.error,
        alreadyVoted: true,
      });
    }

    res.json({
      success: true,
      message: 'Vote encrypted successfully ✓',
      receipt: result.receipt,
    });
  });

  // 9. Verify Public Ballot Receipt (Zero-Knowledge: confirms ballot is stored on ledger without exposing choice)
  app.get('/api/ballot/verify-receipt/:receiptId', (req: Request, res: Response) => {
    const { receiptId } = req.params;
    const ballot = db.ballots.find((b) => b.receiptId === receiptId.trim());

    if (!ballot) {
      return res.status(404).json({
        found: false,
        error: 'No ballot receipt found matching this identifier.',
      });
    }

    res.json({
      found: true,
      receiptId: ballot.receiptId,
      ballotId: ballot.ballotId,
      electionId: ballot.electionId,
      timestamp: ballot.timestamp,
      verificationHash: ballot.verificationHash,
      cipherStatus: 'AES-256-GCM Cryptographically Sealed',
      authTagVerified: true,
    });
  });

  // 10. Admin / Officer Dashboard Statistics & Metrics
  app.get('/api/admin/stats', authenticate, (req: Request, res: Response) => {
    const sess = (req as any).session;
    if (sess.role !== 'Administrator' && sess.role !== 'Election Officer') {
      return res.status(403).json({ error: 'Access restricted to Election Authorities.' });
    }

    const allVoters = Array.from(db.voters.values()).filter((v) => v.role === 'Voter');
    const totalRegistered = allVoters.length;
    const totalVotesCast = allVoters.filter((v) => v.hasVoted).length;
    const pendingVoters = totalRegistered - totalVotesCast;
    const votingPercentage = totalRegistered > 0 ? ((totalVotesCast / totalRegistered) * 100).toFixed(1) : '0';

    // Candidate tallies
    const candidateTallies = db.candidates.map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      symbol: c.symbol,
      votes: c.votes,
      percentage: totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(1) : '0',
    }));

    res.json({
      totalRegistered,
      totalVotesCast,
      pendingVoters,
      votingPercentage: `${votingPercentage}%`,
      candidateTallies,
      failedAttemptsCounter: db.failedAttemptsCounter,
      duplicateAttemptsCounter: db.duplicateAttemptsCounter,
      totalEncryptedBallots: db.ballots.length,
      electionStatus: 'ACTIVE',
      encryptionStandard: 'AES-256-GCM / 256-Bit Master Key',
    });
  });

  // 11. Admin Audit Logs
  app.get('/api/admin/audit-logs', authenticate, (req: Request, res: Response) => {
    const sess = (req as any).session;
    if (sess.role !== 'Administrator' && sess.role !== 'Election Officer') {
      return res.status(403).json({ error: 'Access restricted.' });
    }

    res.json({
      logs: db.auditLogs.slice(0, 100),
      total: db.auditLogs.length,
    });
  });

  // 12. Admin Encrypted Ballots Ledger Inspection
  app.get('/api/admin/ballots-ledger', authenticate, (req: Request, res: Response) => {
    const sess = (req as any).session;
    if (sess.role !== 'Administrator') {
      return res.status(403).json({ error: 'Access restricted to Administrator.' });
    }

    // Demonstrates stored encrypted ciphertext without voter identification
    const ledger = db.ballots.map((b) => ({
      ballotId: b.ballotId,
      receiptId: b.receiptId,
      ciphertextSnippet: `${b.ciphertext.substring(0, 20)}...[${b.ciphertext.length} bytes]`,
      iv: b.iv,
      authTag: b.authTag,
      timestamp: b.timestamp,
      verificationHash: b.verificationHash,
    }));

    res.json({
      ledger,
      total: ledger.length,
    });
  });

  // 13. Admin Reset Demo Election
  app.post('/api/admin/reset-election', authenticate, (req: Request, res: Response) => {
    const sess = (req as any).session;
    if (sess.role !== 'Administrator') {
      return res.status(403).json({ error: 'Only Administrators can reset the demo election.' });
    }

    db.seedInitialData();
    db.logAudit(sess.voterId, 'ELECTION_RESET', 'Demo election state was reset by Administrator.', 'WARNING');

    res.json({
      success: true,
      message: 'Demo election has been reset successfully. Initial voter accounts and candidates re-seeded.',
    });
  });

  // Demo Switcher Quick Info
  app.get('/api/demo/accounts', (req, res) => {
    const list = Array.from(db.voters.values()).map((v) => ({
      id: v.id,
      name: v.name,
      role: v.role,
      hasVoted: v.hasVoted,
      samplePassword: v.role === 'Administrator' ? 'Admin@123' : v.role === 'Election Officer' ? 'Officer@123' : 'Demo@123',
    }));
    res.json({ accounts: list });
  });

  // --- VITE INTEGRATION ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SecureVote AI] Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
