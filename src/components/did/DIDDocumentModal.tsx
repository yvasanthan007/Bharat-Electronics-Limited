import { useState } from 'react';
import { X, Copy, CheckCircle2, FileText } from 'lucide-react';
import { resolveDID } from '../../services/did';
import type { DIDIdentity } from '../../data/mockDIDData';

interface DIDDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: DIDIdentity | null;
}

export default function DIDDocumentModal({ isOpen, onClose, identity }: DIDDocumentModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !identity) return null;

  const didDoc = resolveDID(identity.fullDID);

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(didDoc, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlight = (json: string) => {
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"([^"]+)":/g, '<span class="text-blue-700 font-semibold">"$1":</span>')
      .replace(/: "([^"]+)"/g, ': <span class="text-green-700">"$1"</span>')
      .replace(/: (true|false|null)/g, ': <span class="text-purple-600">$1</span>');
  };

  const docJson = JSON.stringify(didDoc, null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">DID Document</h3>
              <p className="text-xs text-slate-500 font-mono">{identity.did}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-slate-100">
          {[
            { label: 'DID Method', value: 'did:ethr' },
            { label: 'Key Type', value: 'secp256k1' },
            { label: 'Auth Methods', value: '1' },
            { label: 'Created', value: identity.createdAt.split('T')[0] },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
              <div className="text-xs text-slate-500 mb-0.5">{label}</div>
              <div className="text-sm font-semibold text-slate-800">{value}</div>
            </div>
          ))}
        </div>

        {/* JSON viewer */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-slate-900 rounded-xl overflow-auto">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-slate-400 font-mono">did-document.json</span>
            </div>
            <pre
              className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlight(docJson) }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            W3C DID Core Specification compliant
          </div>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
