import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Lock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

interface ReceiptVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReceiptId?: string;
}

export const ReceiptVerifierModal: React.FC<ReceiptVerifierModalProps> = ({
  isOpen,
  onClose,
  initialReceiptId = '',
}) => {
  const [receiptId, setReceiptId] = useState(initialReceiptId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialReceiptId) {
      setReceiptId(initialReceiptId);
      handleVerify(initialReceiptId);
    }
  }, [initialReceiptId]);

  if (!isOpen) return null;

  const handleVerify = async (idToVerify?: string) => {
    const target = idToVerify || receiptId;
    if (!target.trim()) {
      setError('Please provide a valid Receipt ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.verifyReceipt(target.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'No ballot receipt found matching this identifier on the ledger.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Public Ledger Ballot Verifier
              </h3>
              <p className="text-[11px] text-slate-500">
                Zero-Knowledge cryptographic inclusion proof
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Enter Digital Receipt / Transaction ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. REC-2026-INIT-ADITYA or REC-2026-..."
              value={receiptId}
              onChange={(e) => setReceiptId(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
            />
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-70"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Verify</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Result Proof Box */}
        {result && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Ballot Cryptographically Verified on Ledger ✓</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-[11px] font-mono space-y-1.5 text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Receipt ID:</span>
                <span className="font-bold text-blue-600">{result.receiptId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Ballot Box UUID:</span>
                <span className="text-slate-700">{result.ballotId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Recorded Timestamp:</span>
                <span className="text-slate-700">{new Date(result.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Cipher Status:</span>
                <span className="font-bold text-emerald-700">{result.cipherStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Auth Tag Validated:</span>
                <span className="font-bold text-emerald-700">128-bit GCM MAC Verified ✓</span>
              </div>
              <div className="pt-1.5 border-t border-slate-100">
                <span className="text-slate-500 font-sans block mb-0.5">Proof Digest:</span>
                <span className="text-[10px] text-slate-600 break-all block">{result.verificationHash}</span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-800 font-medium">
              Ballot is permanently recorded and counted. Candidate choice remains secret.
            </div>
          </div>
        )}

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
