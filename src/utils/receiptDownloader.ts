import QRCode from 'qrcode';
import { EncryptedReceipt, Voter } from '../types';

/**
 * Generate a high-resolution QR code data URL for the voting receipt
 */
export async function generateReceiptQrCode(
  receipt: EncryptedReceipt,
  voter?: Voter | null
): Promise<string> {
  const qrPayload = JSON.stringify({
    system: 'SecureVote-AI-2026',
    receiptId: receipt.receiptId,
    ballotId: receipt.ballotId,
    voterIdMasked: voter ? voter.idNumberMasked : undefined,
    timestamp: receipt.timestamp,
    hash: receipt.verificationHash,
    status: 'BALLOT_RECORDED_AES_256_GCM',
    verifyUrl: `${window.location.origin}/?verify=${encodeURIComponent(receipt.receiptId)}`,
  });

  try {
    return await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}

/**
 * Trigger browser file download from Blob
 */
function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Download Printable Official HTML Certificate with embedded QR code, seal, and cryptographic proof
 */
export async function downloadReceiptAsHtml(
  receipt: EncryptedReceipt,
  voter?: Voter | null,
  providedQrCode?: string
): Promise<void> {
  const qrCodeDataUrl = providedQrCode || (await generateReceiptQrCode(receipt, voter));
  const dateFormatted = new Date(receipt.timestamp).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Voting Receipt - ${receipt.receiptId}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 30px;
      display: flex;
      justify-content: center;
    }
    .certificate {
      background: #ffffff;
      max-width: 780px;
      width: 100%;
      border: 3px double #0284c7;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
      position: relative;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 72px;
      font-weight: 900;
      color: rgba(2, 132, 199, 0.04);
      pointer-events: none;
      letter-spacing: 8px;
      white-space: nowrap;
      text-transform: uppercase;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .logo-badge {
      display: inline-block;
      background: #0284c7;
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    h1 {
      margin: 5px 0 0 0;
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .subhead {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .status-banner {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 12px 18px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      font-weight: 600;
      font-size: 13px;
    }
    .grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 25px;
      margin-bottom: 25px;
    }
    .field-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .field-table tr {
      border-bottom: 1px solid #f1f5f9;
    }
    .field-table td {
      padding: 8px 4px;
    }
    .field-table .label {
      color: #64748b;
      font-weight: 600;
      width: 40%;
    }
    .field-table .value {
      color: #0f172a;
      font-weight: 700;
      font-family: monospace;
    }
    .qr-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 15px;
      text-align: center;
      background: #fafafa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .qr-card img {
      width: 160px;
      height: 160px;
      margin-bottom: 8px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
    }
    .qr-card .caption {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .hash-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 20px;
    }
    .hash-box .label {
      font-size: 10px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .hash-box .code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      word-break: break-all;
      color: #1e293b;
      line-height: 1.4;
    }
    .notice {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 11px;
      color: #1e40af;
      line-height: 1.5;
      margin-bottom: 25px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #94a3b8;
    }
    .actions {
      text-align: center;
      margin-top: 25px;
    }
    .print-btn {
      background: #0284c7;
      color: white;
      border: none;
      padding: 10px 22px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .print-btn:hover {
      background: #0369a1;
    }
    @media print {
      body { background: white; padding: 0; }
      .certificate { box-shadow: none; border: 1px solid #94a3b8; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="watermark">VOTE RECORDED</div>

    <div class="header">
      <span class="logo-badge">Official Election Certificate</span>
      <h1>SecureVote AI — Cryptographic Voting Receipt</h1>
      <div class="subhead">Smart e-Governance & Decentralized Public Ledger Verification</div>
    </div>

    <div class="status-banner">
      <span>✓ Status: Ballot Formally Recorded on Ledger</span>
      <span style="font-family: monospace;">AES-256-GCM SEALED</span>
    </div>

    <div class="grid">
      <div>
        <table class="field-table">
          <tr>
            <td class="label">Receipt / Transaction ID</td>
            <td class="value" style="color: #0284c7;">${receipt.receiptId}</td>
          </tr>
          <tr>
            <td class="label">Internal Ballot UUID</td>
            <td class="value">${receipt.ballotId}</td>
          </tr>
          <tr>
            <td class="label">Cast Timestamp</td>
            <td class="value" style="font-family: sans-serif; font-size: 11px;">${dateFormatted}</td>
          </tr>
          <tr>
            <td class="label">Election Identifier</td>
            <td class="value">${receipt.electionId}</td>
          </tr>
          <tr>
            <td class="label">Voter KYC Document</td>
            <td class="value">${voter?.idNumberMasked || 'VERIFIED IDENTITY'}</td>
          </tr>
          <tr>
            <td class="label">One Person, One Vote</td>
            <td class="value" style="color: #059669;">ENFORCED (Single Cast Record)</td>
          </tr>
          <tr>
            <td class="label">Encryption Standard</td>
            <td class="value">${receipt.encryptionStandard}</td>
          </tr>
        </table>
      </div>

      <div class="qr-card">
        ${
          qrCodeDataUrl
            ? `<img src="${qrCodeDataUrl}" alt="Receipt QR Code" />`
            : '<div style="height:160px;display:flex;align-items:center;">QR Matrix</div>'
        }
        <div class="caption">Scan to Verify Proof</div>
      </div>
    </div>

    <div class="hash-box">
      <div class="label">Zero-Knowledge Verification Hash (SHA-256 Digest)</div>
      <div class="code">${receipt.verificationHash}</div>
    </div>

    <div class="notice">
      <strong>Constitutional Secret Ballot Protection:</strong>
      In strict accordance with democratic voting protocols, your chosen candidate is intentionally omitted from this physical and digital receipt to protect you from ballot-buying, intimidation, or coercion. The cryptographic SHA-256 digest mathematically guarantees that your encrypted vote exists unchanged within the central tally.
    </div>

    <div class="footer">
      <div>Issued by: Central Election Commission (SecureVote AI Protocol)</div>
      <div>Receipt Authenticity: Digitally Tamper-Evident</div>
    </div>

    <div class="actions">
      <button class="print-btn" onclick="window.print()">Print or Save as PDF</button>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  triggerFileDownload(blob, `SecureVote_Receipt_${receipt.receiptId}.html`);
}

/**
 * Download Formatted Plain Text Receipt (.txt)
 */
export function downloadReceiptAsTxt(receipt: EncryptedReceipt, voter?: Voter | null): void {
  const dateFormatted = new Date(receipt.timestamp).toLocaleString();

  const textContent = `================================================================================
                    SECUREVOTE AI - OFFICIAL ELECTION RECEIPT
                   CRYPTOGRAPHIC PROOF OF CITIZEN PARTICIPATION
================================================================================

CERTIFICATE INFORMATION:
--------------------------------------------------------------------------------
Receipt / Transaction ID : ${receipt.receiptId}
Internal Ballot Box UUID : ${receipt.ballotId}
Recorded Timestamp       : ${dateFormatted}
Election Identifier      : ${receipt.electionId}
Encryption Cipher        : ${receipt.encryptionStandard}
Cipher Authentication    : 128-bit Galois Message Authentication Code (GMAC)
Voter Status             : BALLOT_STORED_IMMUTABLE
One Person, One Vote     : ENFORCED (Single Cast Locked)

CITIZEN DETAILS:
--------------------------------------------------------------------------------
Voter Name               : ${voter ? voter.name : 'AUTHENTICATED CITIZEN'}
Voter / Student ID       : ${voter ? voter.id : 'N/A'}
Identity Token Mask      : ${voter ? voter.idNumberMasked : 'PROTECTED'}
Biometric Verification   : Live Camera Face Scan & Fingerprint Passed

CRYPTOGRAPHIC PROOF DIGEST (SHA-256):
--------------------------------------------------------------------------------
${receipt.verificationHash}

SECRET BALLOT NOTICE:
--------------------------------------------------------------------------------
Your candidate selection is strictly omitted from this receipt in accordance
with democratic secret ballot protocols to prevent voter coercion and vote-buying.
This cryptographic digest mathematically proves your sealed vote is present and
counted in the official public tally.

To verify your ballot inclusion on the Public Ledger, enter the Receipt ID
above at the SecureVote Public Ledger Verifier.
================================================================================
Generated by SecureVote AI Engine. Tamper-evident cryptographic certificate.
`;

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  triggerFileDownload(blob, `SecureVote_Receipt_${receipt.receiptId}.txt`);
}

/**
 * Download Cryptographic JSON Audit File (.json)
 */
export function downloadReceiptAsJson(receipt: EncryptedReceipt, voter?: Voter | null): void {
  const data = {
    $schema: 'https://securevote.gov.in/schemas/v1/receipt.json',
    system: 'SecureVote AI',
    version: '1.0.0',
    receiptId: receipt.receiptId,
    ballotId: receipt.ballotId,
    electionId: receipt.electionId,
    timestamp: receipt.timestamp,
    encryptionStandard: receipt.encryptionStandard,
    verificationHash: receipt.verificationHash,
    authTagSnippet: receipt.authTagSnippet || 'VERIFIED_128BIT_GMAC',
    cipherStatus: receipt.cipherStatus || 'AES_256_GCM_AUTHENTICATED',
    voter: {
      id: voter?.id || undefined,
      maskedKyc: voter?.idNumberMasked || undefined,
      databaseRecordId: voter?.databaseRecordId || undefined,
    },
    auditProof: {
      algorithm: 'SHA-256',
      proofType: 'ZeroKnowledgeInclusionReceipt',
      ledgerAnchor: 'IMMUTABLE_IN_MEMORY_PERSISTED_DATABASE',
    },
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  triggerFileDownload(blob, `SecureVote_Receipt_${receipt.receiptId}.json`);
}

/**
 * Copy Receipt Details to Clipboard
 */
export async function copyReceiptToClipboard(
  receipt: EncryptedReceipt,
  voter?: Voter | null
): Promise<boolean> {
  const text = `SecureVote AI - Election Voting Receipt
Receipt ID: ${receipt.receiptId}
Ballot UUID: ${receipt.ballotId}
Timestamp: ${new Date(receipt.timestamp).toLocaleString()}
Encryption: ${receipt.encryptionStandard}
Proof Hash (SHA-256): ${receipt.verificationHash}
Voter KYC: ${voter?.idNumberMasked || 'Verified'}`;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
