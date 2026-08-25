import { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { verifyDID } from '../../services/did';
import type { DIDIdentity } from '../../data/mockDIDData';
import type { DIDVerificationResult } from '../../services/did';

interface VerifyDIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: DIDIdentity | null;
}

export default function VerifyDIDModal({ isOpen, onClose, identity }: VerifyDIDModalProps) {
  const [state, setState] = useState<'idle' | 'verifying' | 'done'>('idle');
  const [result, setResult] = useState<DIDVerificationResult | null>(null);

  if (!isOpen || !identity) return null;

  const handleVerify = async () => {
    setState('verifying');
    const res = await verifyDID(identity.fullDID);
    setResult(res);
    setState('done');
  };

  const handleClose = () => {
    setState('idle');
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={handleClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Verify DID</h3>
              <p className="text-xs text-slate-500 font-mono truncate max-w-[200px]">{identity.did}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {/* Identity info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
              {identity.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{identity.name}</p>
              <p className="text-xs text-slate-500">{identity.role} · {identity.department}</p>
            </div>
            <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${identity.status === 'Verified' ? 'bg-green-50 text-green-700 border border-green-200' :
                identity.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-red-50 text-red-700 border border-red-200'
              }`}>
              {identity.status}
            </span>
          </div>

          {/* Idle */}
          {state === 'idle' && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500 mb-4">
                This will resolve the DID, validate the DID Document structure, and confirm blockchain anchoring.
              </p>
              <button
                onClick={handleVerify}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <ShieldCheck className="w-4 h-4" />
                Start Verification
              </button>
            </div>
          )}

          {/* Verifying */}
          {state === 'verifying' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-slate-700">Running verification checks...</p>
            </div>
          )}

          {/* Done */}
          {state === 'done' && result && (
            <div className="space-y-3">
              {/* Overall result */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${result.valid
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
                }`}>
                {result.valid
                  ? <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
                  : <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                }
                <div>
                  <p className={`font-bold text-sm ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
                    {result.valid ? '✓ DID Verified' : '✗ Verification Failed'}
                  </p>
                  <p className={`text-xs ${result.valid ? 'text-green-600' : 'text-red-600'}`}>
                    {result.valid ? 'All checks passed successfully' : 'One or more checks failed'}
                  </p>
                </div>
              </div>

              {/* Step results */}
              <div className="space-y-2">
                {result.steps.map((step, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${step.passed ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'
                    }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.passed ? 'bg-green-500' : 'bg-red-400'
                      }`}>
                      <span className="text-white text-xs font-bold">{step.passed ? '✓' : '✗'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{step.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tx hash */}
              {result.txHash && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Blockchain Tx Hash</p>
                  <p className="font-mono text-xs text-slate-700 break-all">{result.txHash}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          {state === 'done' && (
            <button onClick={handleVerify} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Re-verify
            </button>
          )}
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
