import { useState } from 'react';
import { X, Award, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { issueCredential } from '../../services/credentials';
import type { CredentialType } from '../../lib/did/vcEngine';
import type { DIDIdentity } from '../../data/mockDIDData';
import type { VerifiableCredential } from '../../lib/did/vcEngine';

interface IssueCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: DIDIdentity | null;
  onIssued: (vc: VerifiableCredential) => void;
}

const credentialTypeMap: Record<string, CredentialType> = {
  Administrator: 'BELAdminCredential',
  Manager: 'BELManagerCredential',
  Engineer: 'BELEngineerCredential',
  Auditor: 'BELAuditorCredential',
  User: 'BELEmployeeCredential',
};

export default function IssueCredentialModal({
  isOpen,
  onClose,
  identity,
  onIssued,
}: IssueCredentialModalProps) {
  const [state, setState] = useState<'form' | 'issuing' | 'success' | 'error'>('form');
  const [expiryMonths, setExpiryMonths] = useState(12);
  const [errorMsg, setErrorMsg] = useState('');
  const [issuedVC, setIssuedVC] = useState<VerifiableCredential | null>(null);

  if (!isOpen || !identity) return null;

  const credentialType = credentialTypeMap[identity.role] ?? 'BELEmployeeCredential';

  const handleIssue = async () => {
    setState('issuing');
    try {
      const vc = await issueCredential({
        holderDID: identity.fullDID,
        credentialType,
        role: identity.role,
        department: identity.department,
        employeeId: identity.id,
        holderName: identity.name,
        expiryMonths,
      });
      setIssuedVC(vc);
      setState('success');
      onIssued(vc);
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Failed to issue credential');
      setState('error');
    }
  };

  const handleClose = () => {
    setState('form');
    setErrorMsg('');
    setIssuedVC(null);
    onClose();
  };

  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

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
              <h3 className="text-lg font-bold text-slate-900">Issue Credential</h3>
              <p className="text-xs text-slate-500">BEL Trust Platform</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {state === 'form' && (
            <>
              {/* Credential preview card */}
              <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">Verifiable Credential</span>
                  <Award className="w-5 h-5 opacity-80" />
                </div>
                <p className="text-lg font-bold mb-1">{credentialType.replace('BEL', 'BEL ')}</p>
                <p className="text-sm opacity-80 mb-4">{identity.name}</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="opacity-60">Role</p>
                    <p className="font-semibold">{identity.role}</p>
                  </div>
                  <div>
                    <p className="opacity-60">Department</p>
                    <p className="font-semibold">{identity.department}</p>
                  </div>
                  <div>
                    <p className="opacity-60">Issuer</p>
                    <p className="font-semibold">BEL Trust Platform</p>
                  </div>
                  <div>
                    <p className="opacity-60">Expires</p>
                    <p className="font-semibold">{expiryDate.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Holder DID */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Holder DID</p>
                <code className="text-xs font-mono text-slate-700 break-all">{identity.fullDID}</code>
              </div>

              {/* Expiry */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Credential Validity</label>
                <select
                  value={expiryMonths}
                  onChange={(e) => setExpiryMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                  <option value={24}>24 months</option>
                  <option value={36}>36 months</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                This credential will be cryptographically signed by the BEL Issuer DID and recorded on the blockchain audit trail.
              </div>
            </>
          )}

          {state === 'issuing' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-slate-700">Signing and issuing credential...</p>
            </div>
          )}

          {state === 'success' && issuedVC && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Credential Issued!</h4>
                <p className="text-sm text-slate-500">{credentialType} has been issued to {identity.name} and recorded on the blockchain.</p>
              </div>
              <div className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 text-left">
                <p className="text-xs text-slate-500 mb-1">Credential ID</p>
                <code className="text-xs font-mono text-slate-700 break-all">{issuedVC.id}</code>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            {state === 'success' ? 'Close' : 'Cancel'}
          </button>
          {state === 'form' && (
            <button onClick={handleIssue} className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-2">
              <Award className="w-4 h-4" />
              Issue Credential
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
