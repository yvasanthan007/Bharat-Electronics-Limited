import { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, Award, Loader2 } from 'lucide-react';
import { verifyCredential } from '../../services/credentials';
import type { VerifiableCredential } from '../../lib/did/vcEngine';
import type { FullVerificationResult } from '../../services/credentials';

interface VerifyCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  vc: VerifiableCredential | null;
}

export default function VerifyCredentialModal({ isOpen, onClose, vc }: VerifyCredentialModalProps) {
  const [state, setState] = useState<'idle' | 'verifying' | 'done'>('idle');
  const [result, setResult] = useState<FullVerificationResult | null>(null);

  if (!isOpen || !vc) return null;

  const handleVerify = async () => {
    setState('verifying');
    const res = await verifyCredential(vc.id);
    setResult(res);
    setState('done');
  };

  const handleClose = () => {
    setState('idle');
    setResult(null);
    onClose();
  };

  const credType = vc.type[1] ?? 'VerifiableCredential';

  const checks = result
    ? [
        { label: 'Cryptographic Signature', passed: result.checks.signatureValid, detail: result.checks.signatureValid ? 'Signature verified against issuer DID' : 'Signature mismatch or tampered' },
        { label: 'Expiry Check', passed: result.checks.notExpired, detail: result.checks.notExpired ? `Valid until ${new Date(vc.expirationDate).toLocaleDateString()}` : 'Credential has expired' },
        { label: 'Issuer DID Resolved', passed: result.checks.issuerResolved, detail: result.checks.issuerResolved ? `Issuer: ${vc.issuer.substring(0, 20)}...` : 'Issuer DID could not be resolved' },
        { label: 'Subject Integrity', passed: result.checks.subjectMatches, detail: result.checks.subjectMatches ? `Holder: ${vc.credentialSubject.name}` : 'Subject data mismatch' },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={handleClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Verify Credential</h3>
              <p className="text-xs text-slate-500">{credType.replace('BEL', 'BEL ')}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {/* Credential summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-slate-500">Holder</p>
                <p className="font-medium text-slate-800">{vc.credentialSubject.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Role</p>
                <p className="font-medium text-slate-800">{vc.credentialSubject.role}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Issuer</p>
                <p className="font-medium text-slate-800">BEL Trust Platform</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Type</p>
                <p className="font-medium text-slate-800">{credType.replace('BEL', '')}</p>
              </div>
            </div>
          </div>

          {/* Idle */}
          {state === 'idle' && (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 mb-4">
                Verifies the cryptographic signature, expiry, issuer DID, and subject integrity of this credential.
              </p>
              <button
                onClick={handleVerify}
                className="px-5 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify Credential
              </button>
            </div>
          )}

          {/* Verifying */}
          {state === 'verifying' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-sm font-medium text-slate-700">Verifying credential...</p>
            </div>
          )}

          {/* Done */}
          {state === 'done' && result && (
            <div className="space-y-3">
              {/* Overall result */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                {result.valid
                  ? <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
                  : <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                }
                <div>
                  <p className={`font-bold text-sm ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
                    {result.valid ? '✓ Credential Verified' : '✗ Verification Failed'}
                  </p>
                  <p className={`text-xs ${result.valid ? 'text-green-600' : 'text-red-600'}`}>
                    {result.valid ? 'All 4 checks passed' : 'One or more checks failed'}
                  </p>
                </div>
              </div>

              {/* Individual checks */}
              <div className="space-y-2">
                {checks.map((check, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                    check.passed ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      check.passed ? 'bg-green-500' : 'bg-red-400'
                    }`}>
                      <span className="text-white text-xs font-bold">{check.passed ? '✓' : '✗'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{check.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{check.detail}</p>
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

        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          {state === 'done' && (
            <button onClick={() => { setState('idle'); setResult(null); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
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
