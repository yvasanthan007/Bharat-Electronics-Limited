import { useState } from 'react';
import { X, Wallet, Key, CheckCircle2, Copy, AlertCircle, Fingerprint, Loader2 } from 'lucide-react';
import { createDIDIdentity } from '../../services/did';
import type { DIDIdentity } from '../../data/mockDIDData';
import type { GeneratedDID } from '../../lib/did/didEngine';

interface CreateDIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDIDCreated: (identity: DIDIdentity, generated: GeneratedDID) => void;
}

type Step = 'form' | 'generating' | 'review' | 'success';

interface FormData {
  name: string;
  employeeId: string;
  email: string;
  department: string;
  role: string;
}

const initialForm: FormData = {
  name: '',
  employeeId: '',
  email: '',
  department: '',
  role: '',
};

export default function CreateDIDModal({ isOpen, onClose, onDIDCreated }: CreateDIDModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState<FormData>(initialForm);
  const [result, setResult] = useState<{ identity: DIDIdentity; generated: GeneratedDID } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('generating');

    try {
      const res = await createDIDIdentity(form);
      setResult(res);
      setStep('review');
    } catch (err: any) {
      setError(err.message ?? 'Failed to generate DID');
      setStep('form');
    }
  };

  const handleConfirm = () => {
    if (result) {
      onDIDCreated(result.identity, result.generated);
      setStep('success');
      setTimeout(() => {
        handleReset();
      }, 2500);
    }
  };

  const handleReset = () => {
    setStep('form');
    setForm(initialForm);
    setResult(null);
    setError('');
    onClose();
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const truncate = (str: string, n = 20) =>
    str.length > n ? `${str.slice(0, n)}...` : str;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={step === 'form' ? handleReset : undefined} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create DID</h3>
              <p className="text-xs text-slate-500">
                {step === 'form' && 'Enter details to generate a decentralized identity'}
                {step === 'generating' && 'Generating cryptographic key pair...'}
                {step === 'review' && 'Review your generated DID — confirm to anchor it'}
                {step === 'success' && 'DID anchored on blockchain'}
              </p>
            </div>
          </div>
          {(step === 'form' || step === 'review') && (
            <button onClick={handleReset} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {(['form', 'review', 'success'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s ? 'bg-blue-600 text-white' :
                (step === 'review' && s === 'form') || (step === 'success' && s !== 'success')
                  ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {(step === 'review' && s === 'form') || (step === 'success' && s !== 'success') ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium text-slate-500 hidden sm:block">
                {s === 'form' ? 'Details' : s === 'review' ? 'Review DID' : 'Confirmed'}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* Step: Form */}
          {(step === 'form' || step === 'generating') && (
            <form id="create-did-form" onSubmit={handleFormSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Rahul Verma" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Employee ID</label>
                  <input required type="text" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. BEL-1024" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="name@bel.co.in" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Department</label>
                  <select required value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Department</option>
                    <option>IT Security</option>
                    <option>Operations</option>
                    <option>R&D</option>
                    <option>Audit</option>
                    <option>HR</option>
                    <option>Logistics</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <select required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Role</option>
                    <option>Administrator</option>
                    <option>Manager</option>
                    <option>Engineer</option>
                    <option>Auditor</option>
                    <option>User</option>
                  </select>
                </div>
              </div>

              <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex items-start gap-2">
                <Key className="w-4 h-4 shrink-0 mt-0.5" />
                <span>A cryptographic key pair will be generated using the secp256k1 algorithm. The private key is used only during this session and is <strong>never stored</strong>.</span>
              </div>
            </form>
          )}

          {/* Step: Generating */}
          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <p className="text-sm font-medium text-slate-700">Generating key pair and anchoring DID...</p>
              <p className="text-xs text-slate-400">This may take a moment</p>
            </div>
          )}

          {/* Step: Review */}
          {step === 'review' && result && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Save your DID and wallet address before confirming. The private key will be discarded after this step.</span>
              </div>

              {[
                { label: 'DID', value: result.generated.did, icon: <Fingerprint className="w-4 h-4 text-blue-500" /> },
                { label: 'Wallet Address', value: result.generated.walletAddress, icon: <Wallet className="w-4 h-4 text-purple-500" /> },
                { label: 'Public Key', value: result.generated.publicKey, icon: <Key className="w-4 h-4 text-green-500" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="rounded-lg border border-slate-200 p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    {icon}
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-slate-700 break-all flex-1">{label === 'Public Key' ? truncate(value, 42) : value}</code>
                    <button
                      type="button"
                      onClick={() => copy(value, label)}
                      className="shrink-0 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      {copied === label ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 mb-0.5">Name</div>
                  <div className="font-medium text-slate-800">{result.identity.name}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 mb-0.5">Role</div>
                  <div className="font-medium text-slate-800">{result.identity.role}</div>
                </div>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">DID Created Successfully</h4>
              <p className="text-sm text-slate-500 max-w-xs">
                The decentralized identity has been anchored on the blockchain and added to the registry.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={handleReset} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" form="create-did-form" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Key className="w-4 h-4" />
              Generate DID
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={() => setStep('form')} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Back
            </button>
            <button type="button" onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Anchor DID
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
