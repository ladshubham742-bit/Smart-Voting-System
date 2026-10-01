# SecureVote AI — Smart Voting System Web Application

An interactive, responsive, and secure prototype smart voting platform built for university and institutional elections. Features simulated multi-factor biometric authentication, tokenized citizen credentials, atomic double-vote prevention, and AES-256-GCM encrypted balloting with verifiable receipts.

> **Important Prototype Disclaimer:**
> This application is an educational prototype. Biometric verification shown in demo mode is simulated and is not a substitute for certified government election infrastructure or legally approved voting systems. No raw biometric images or raw Aadhaar numbers are persisted.

---

## 1. End-to-End Voting Workflow

```
Voter Registration (KYC & Masking)
        ↓
Aadhaar/College ID Verification (Tokenization)
        ↓
Fingerprint Registration (Minutiae & Template Hash)
        ↓
Face Registration (Mesh Landmark Vector)
        ↓
VOTER LOGIN (Voter ID + Password)
        ↓
Fingerprint Verification (3-Attempt Security Lock)
        ↓
Face Recognition + Anti-Spoof Liveness Check
        ↓
Check: Has this voter already voted?
        ├── YES → Ballot Access Denied (Audit Logged)
        └── NO  → Official Candidate Selection
                    ↓
              Cast Ballot
                    ↓
       AES-256-GCM Encrypted Ballot
                    ↓
    Atomic DB Mutex: voter.hasVoted = true
                    ↓
   Zero-Knowledge Digital Confirmation Receipt
```

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend:** Node.js, Express 4, Native `crypto` module (AES-256-GCM, PBKDF2, SHA-256)
- **Concurrency & State:** In-memory transactional datastore with critical mutex locking to prevent race-condition double voting
- **Dev & Build:** Vite 8, tsx, ESNext

---

## 3. Folder Structure

```
├── .env.example               # Environment variables template
├── metadata.json              # Applet metadata and permissions
├── package.json               # Node packages and full-stack scripts
├── server.ts                  # Express backend & AES-256-GCM cryptographic engine
├── tsconfig.json              # TypeScript compilation rules
├── vite.config.ts             # Vite bundler configuration
├── index.html                 # HTML entry point with fonts & metadata
├── src/
│   ├── main.tsx               # Client React DOM entry point
│   ├── App.tsx                # Master step router & global state
│   ├── index.css              # Tailwind CSS imports
│   ├── types.ts               # TypeScript data models and interfaces
│   ├── services/
│   │   └── api.ts             # Typed REST API client
│   └── components/
│       ├── Navbar.tsx                 # Header with status & prototype alert
│       ├── StepIndicator.tsx          # 8-step visual progress tracker
│       ├── LandingPage.tsx            # Hero, workflow diagram & 1-click test launcher
│       ├── VoterRegistration.tsx      # KYC form with dynamic ID masking
│       ├── FingerprintRegistration.tsx# Biometric optical sensor scan simulator
│       ├── FaceRegistration.tsx       # Viewfinder mockup with multi-stage scan
│       ├── VoterLogin.tsx             # Authentication with test account pills
│       ├── BiometricVerification.tsx  # Dual-factor FP + Liveness check with test failure toggles
│       ├── BallotScreen.tsx           # Server truth status check, candidate selection & AES modal
│       ├── ConfirmationReceipt.tsx    # Digital receipt with SHA-256 digest & secrecy notice
│       ├── AdminDashboard.tsx         # Live tallies, charts, cipher ledger, and audit trail
│       ├── ReceiptVerifierModal.tsx   # Public ledger receipt validator
│       ├── HowItWorksModal.tsx        # Security & encryption architectural guide
│       └── DemoToolbar.tsx            # Floating evaluation console & election resetter
└── README.md
```

---

## 4. Database Schema

### 1. `Voters` Collection
| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique Voter ID (e.g. `DEMO-VOTER-001` or `VOT-2026-9041`) |
| `name` | `string` | Full legal name |
| `dob` | `string` | Date of Birth (validated for 18+ eligibility) |
| `email` | `string` | Official contact email |
| `mobile` | `string` | 10-digit mobile number |
| `idType` | `'Aadhaar' \| 'CollegeID'` | Type of document provided |
| `idNumberMasked` | `string` | Sanitized display (e.g. `XXXX-XXXX-8421`) |
| `identityToken` | `string` | SHA-256 tokenized representation of ID |
| `passwordHash` | `string` | PBKDF2 hashed password (10,000 iterations, 64-byte salt) |
| `salt` | `string` | Cryptographic random 16-byte salt |
| `fingerprintToken` | `string` | Simulated ISO minutiae template hash |
| `faceToken` | `string` | Simulated facial landmark vector token |
| `hasVoted` | `boolean` | **Server Source of Truth** for voting status |
| `votedAt` | `string \| null` | ISO timestamp of vote submission |
| `failedAuthAttempts`| `number` | Counter for brute-force lockouts |
| `role` | `'Voter' \| 'Election Officer' \| 'Administrator'` | RBAC authorization level |

### 2. `Ballots` Collection (Anonymized & Decoupled)
| Field | Type | Description |
|---|---|---|
| `ballotId` | `string` | Internal UUID (e.g. `BLT-7F2A-91C0`) |
| `receiptId` | `string` | Publicly verifiable Receipt ID (e.g. `REC-2026-INIT-ADITYA`) |
| `electionId` | `string` | Election scope identifier |
| `ciphertext` | `string` | Base64 AES-256-GCM encrypted vote payload |
| `iv` | `string` | 96-bit Initialization Vector |
| `authTag` | `string` | 128-bit Galois Authentication Tag |
| `timestamp` | `string` | ISO timestamp |
| `verificationHash` | `string` | SHA-256 checksum of payload |

### 3. `AuditLogs` Collection
| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique log entry ID |
| `voterTokenOrId`| `string` | Masked voter identifier or system token |
| `event` | `string` | E.g. `DOUBLE_VOTE_BLOCKED`, `VOTE_CAST_ENCRYPTED` |
| `detail` | `string` | Detailed contextual description |
| `status` | `'SUCCESS' \| 'WARNING' \| 'ALERT' \| 'BLOCKED'` | Security severity |
| `timestamp` | `string` | Precise timestamp |

---

## 5. Environment Variables (`.env.example`)

```env
# Server Port
PORT=3000

# Server-Side Master Key for AES-256-GCM ballot encryption (never exposed to client)
ELECTION_SECRET="securevote-master-secret-key-salt-2026"

# App URL
APP_URL="http://localhost:3000"
```

---

## 6. Installation & Run Commands

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server (Express backend + Vite frontend middleware)
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

---

## 7. Demo Credentials for Evaluation

| Persona | Voter ID / Username | Password | Status / Testing Objective |
|---|---|---|---|
| **Demo Voter 001** | `DEMO-VOTER-001` | `Demo@123` | **Eligible (Not Voted):** Walk through the complete interactive registration, biometric scan, candidate selection, and vote encryption. |
| **Demo Voter 002** | `DEMO-VOTER-002` | `Demo@123` | **Already Voted:** Tests the double-vote prevention logic. Access to the ballot is immediately rejected and logged in the audit trail. |
| **Demo Voter 003** | `DEMO-VOTER-003` | `Demo@123` | **Eligible (Not Voted):** Secondary student test account. |
| **Administrator** | `admin` | `Admin@123` | **Full Authority:** Real-time tally charts, encrypted cipher ledger inspector, forensic audit logs, and demo database reset. |
| **Election Officer** | `officer` | `Officer@123` | **Monitoring Officer:** View real-time turnout, fraud warning alerts, and election logs. |

---

## 8. API Endpoints

### Authentication & Biometrics
- `POST /api/auth/register-voter`: Register new voter, validate KYC, mask ID, return token
- `POST /api/auth/register-biometrics`: Store simulated template token for fingerprint or face
- `POST /api/auth/login`: Authenticate Voter ID / Password, return session bearer token
- `POST /api/auth/verify-fingerprint`: Simulated 1:1 fingerprint template match with 3-attempt lockout
- `POST /api/auth/verify-face`: Simulated face recognition and liveness check

### Ballots & Voting
- `GET /api/voter/status`: Server source of truth for `hasVoted` and eligibility
- `GET /api/ballot/candidates`: Returns candidate list (strictly blocked if `hasVoted === true`)
- `POST /api/ballot/cast-vote`: Atomic transaction executing AES-256-GCM encryption, double-vote lock, and receipt issuance
- `GET /api/ballot/verify-receipt/:receiptId`: Zero-knowledge proof verification of receipt on public ledger

### Administration & Audit
- `GET /api/admin/stats`: Turnout KPIs, candidate vote counts, and duplicate attempt counters
- `GET /api/admin/audit-logs`: Searchable audit trail
- `GET /api/admin/ballots-ledger`: Inspect anonymized encrypted ciphertext blobs
- `POST /api/admin/reset-election`: Re-seeds clean test data for live demonstrations
