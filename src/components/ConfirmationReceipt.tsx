import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  Download,
  ExternalLink,
  LogOut,
  Sparkles,
  QrCode,
  FileCheck,
  BarChart3,
  Copy,
  Printer,
  FileText,
  Code,
  Check,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EncryptedReceipt, StepType, Voter } from '../types';
import {
  generateReceiptQrCode,
  downloadReceiptAsHtml,
  downloadReceiptAsTxt,
  downloadReceiptAsJson,
  copyReceiptToClipboard,
} from '../utils/receiptDownloader';

interface ConfirmationReceiptProps {
  receipt: EncryptedReceipt;
  currentUser: Voter | null;
  onLogout: () => void;
  onVerifyReceipt: (receiptId: string) => void;
  onNavigate: (step: StepType) => void;
}

export const ConfirmationReceipt: React.FC<ConfirmationReceiptProps> = ({
  receipt,
  currentUser,
  onLogout,
  onVerifyReceipt,
  onNavigate,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSaveOptions, setShowSaveOptions] = useState<boolean>(false);

  // Trigger celebratory confetti and generate QR code on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#3b82f6', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }

    // Generate dynamic QR Code for the receipt
    generateReceiptQrCode(receipt, currentUser).then((url) => {
      setQrCodeUrl(url);
    });
  }, [receipt, currentUser]);

  const handleDownloadHtml = async () => {
    await downloadReceiptAsHtml(receipt, currentUser, qrCodeUrl);
    showNotice(`Downloaded Official Certificate (SecureVote_Receipt_${receipt.receiptId}.html)`);
  };

  const handleDownloadTxt = () => {
    downloadReceiptAsTxt(receipt, currentUser);
    showNotice(`Downloaded Text Receipt (SecureVote_Receipt_${receipt.receiptId}.txt)`);
  };

  const handleDownloadJson = () => {
    downloadReceiptAsJson(receipt, currentUser);
    showNotice(`Downloaded Cryptographic JSON (SecureVote_Receipt_${receipt.receiptId}.json)`);
  };

  const handleCopy = async () => {
    const success = await copyReceiptToClipboard(receipt, currentUser);
    if (success) {
      setCopied(true);
      showNotice('Receipt & verification hash copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const showNotice = (msg: string) => {
    setDownloadNotification(msg);
    setTimeout(() => {
      setDownloadNotification(null);
    }, 4000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Toast Notification when user downloads or saves */}
      {downloadNotification && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-900 text-emerald-100 px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{downloadNotification}</span>
        </div>
      )}

      {/* Receipt Card */}
      <div className="bg-white rounded-3xl border-2 border-emerald-200 shadow-xl p-6 sm:p-8 space-y-6 text-center relative overflow-hidden">
        {/* Top green accent strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            Ballot Encrypted & Stored
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ✓ Vote Successfully Recorded
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Thank you for participating. Your ballot has been cryptographically sealed and incorporated into the immutable election tally.
          </p>
        </div>

        {/* Digital Receipt Specs with embedded QR Code */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left text-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-3 border-b border-slate-200">
            {/* QR Code Container */}
            <div className="flex flex-col items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex-shrink-0">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Receipt Verification QR Code"
                  className="w-28 h-28 object-contain rounded-lg"
                />
              ) : (
                <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">
                  Generating QR...
                </div>
              )}
              <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase font-bold tracking-wider">
                Scan to Verify
              </span>
            </div>

            {/* Quick Status Info */}
            <div className="space-y-2 flex-1 w-full font-mono">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-sans font-bold">Voter Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                  Voted ✓
                </span>
              </div>

              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-sans font-bold">Cipher Standard:</span>
                <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> AES-256-GCM
                </span>
              </div>

              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-sans font-bold">Voting Time:</span>
                <span className="text-slate-800 font-semibold text-[11px]">
                  {new Date(receipt.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans font-bold">One Person, One Vote:</span>
                <span className="text-emerald-700 font-bold text-[10px]">
                  LOCKED (1 / 1 CAST)
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-sans font-bold">Transaction / Receipt ID:</span>
              <span className="text-indigo-600 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 select-all text-xs break-all">
                {receipt.receiptId}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-sans font-bold">Internal Ballot UUID:</span>
              <span className="text-slate-700 font-semibold bg-white px-2.5 py-0.5 rounded border border-slate-100 select-all text-[11px]">
                {receipt.ballotId}
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans font-bold block">
                  Cryptographic Proof Hash (SHA-256):
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-sans font-semibold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>
              <div className="text-[10px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 break-all select-all font-mono leading-relaxed">
                {receipt.verificationHash}
              </div>
            </div>
          </div>
        </div>

        {/* Ballot Secrecy Constitutional Notice */}
        <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 text-left text-xs text-blue-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[11px] uppercase tracking-wide text-blue-950 block">
              Democratic Ballot Secrecy Preserved
            </span>
            <span className="text-[11px] text-blue-800 leading-relaxed">
              In accordance with election guidelines, the selected candidate is strictly omitted from this public confirmation receipt to prevent voter coercion or ballot buying.
            </span>
          </div>
        </div>

        {/* PRIMARY DOWNLOAD & SAVE RECEIPT ACTION BOX */}
        <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-4 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                  Download and Save Your Receipt
                </h4>
                <p className="text-[11px] text-emerald-700">
                  Save your official tamper-evident voting certificate to your device.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSaveOptions(!showSaveOptions)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              {showSaveOptions ? 'Hide Formats' : 'All Formats'}
            </button>
          </div>

          {/* Quick Download Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Primary HTML / Printable Certificate Download */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <FileCheck className="w-4 h-4" />
              <span>Download Official Certificate (.html)</span>
            </button>

            {/* Quick Text Receipt Download */}
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="py-3 px-4 rounded-xl font-bold text-xs bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Save as Text File (.txt)</span>
            </button>
          </div>

          {/* Expanded formats list */}
          {showSaveOptions && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={handleDownloadJson}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
                title="Download JSON cryptographic audit data"
              >
                <Code className="w-3.5 h-3.5 text-indigo-600" />
                <span>JSON Payload (.json)</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
                title="Copy receipt details and hash to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
                title="Open browser print dialogue"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Print Document</span>
              </button>
            </div>
          )}
        </div>

        {/* Secondary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onVerifyReceipt(receipt.receiptId)}
            className="py-3 px-4 rounded-xl font-bold text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Verify on Public Ledger
          </button>

          <button
            type="button"
            onClick={() => onNavigate('RESULTS')}
            className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center gap-2 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>View Live Election Standings</span>
          </button>
        </div>

        {/* Final Signout */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout & Clear Session
          </button>
        </div>
      </div>
    </div>
  );
};

