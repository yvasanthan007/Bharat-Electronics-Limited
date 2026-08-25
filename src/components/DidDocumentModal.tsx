import { useState } from 'react';
import { X, ShieldCheck, Key, Copy, Check, FileJson, Award } from 'lucide-react';
import type { Identity } from '../services/identities';

interface DidDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: Identity | null;
}

export default function DidDocumentModal({ isOpen, onClose, identity }: DidDocumentModalProps) {
  const [activeTab, setActiveTab] = useState<'document' | 'credentials' | 'keys'>('document');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen || !identity) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const didDocument = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1",
      "https://schema.bel.co.in/identity/v2"
    ],
    "id": identity.did,
    "controller": "did:bel:sov:root-authority",
    "verificationMethod": [
      {
        "id": `${identity.did}#key-1`,
        "type": identity.keyType === 'Ed25519' ? "Ed25519VerificationKey2020" : "EcdsaSecp256k1VerificationKey2019",
        "controller": identity.did,
        "publicKeyMultibase": identity.publicKey,
        "ethereumAddress": identity.walletAddress
      }
    ],
    "authentication": [
      `${identity.did}#key-1`
    ],
    "assertionMethod": [
      `${identity.did}#key-1`
    ],
    "service": [
      {
        "id": `${identity.did}#bel-credential-hub`,
        "type": "DefenseCredentialRepository",
        "serviceEndpoint": "https://identity.bel.co.in/api/v1/credentials"
      }
    ],
    "defenseMetadata": {
      "employeeId": identity.employeeId,
      "securityClearance": identity.securityClearance,
      "department": identity.department,
      "role": identity.role,
      "verificationStatus": identity.status,
      "registeredOnChain": "BEL Sovereign Testnet (Chain ID 98234)"
    }
  };

  const verifiableCredentials = [
    {
      title: 'BEL Security Clearance Credential',
      issuer: 'Ministry of Defence & BEL Sovereign Trust Node',
      issuedOn: identity.createdOn,
      level: identity.securityClearance,
      status: identity.status,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Cryptographic Key Signing Authorization',
      issuer: 'BEL Strategic Cyber Command Vault',
      issuedOn: identity.createdOn,
      level: `Key: ${identity.keyType}`,
      status: 'Verified',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Smart Contract Transfer Authorization Token',
      issuer: 'BEL Defense RBAC Engine',
      issuedOn: identity.createdOn,
      level: `Role: ${identity.role}`,
      status: identity.status,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            {identity.avatar ? (
              <img
                src={identity.avatar}
                alt={identity.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {identity.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{identity.name}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  identity.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {identity.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{identity.did}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/30 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('document')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'document'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileJson className="w-4 h-4" />
            W3C DID Document
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            Verifiable Credentials ({verifiableCredentials.length})
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'keys'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            Cryptographic Keys
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeTab === 'document' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Standard JSON-LD Representation</span>
                <button
                  onClick={() => handleCopy(JSON.stringify(didDocument, null, 2), 'doc')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {copied === 'doc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === 'doc' ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed shadow-inner">
                {JSON.stringify(didDocument, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'credentials' && (
            <div className="space-y-3">
              {verifiableCredentials.map((vc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{vc.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Issuer: {vc.issuer}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${vc.badgeColor}`}>
                      {vc.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="font-mono text-slate-700 font-semibold">{vc.level}</span>
                    <span className="text-slate-400 font-mono">Issued: {vc.issuedOn}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Primary Public Key ({identity.keyType})
                  </label>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 mt-1 font-mono text-[11px]">
                    <span className="truncate max-w-[400px] text-slate-800">{identity.publicKey}</span>
                    <button
                      onClick={() => handleCopy(identity.publicKey, 'pk')}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {copied === 'pk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    On-Chain Vault Address
                  </label>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 mt-1 font-mono text-[11px]">
                    <span className="truncate max-w-[400px] text-slate-800">{identity.walletAddress}</span>
                    <button
                      onClick={() => handleCopy(identity.walletAddress, 'wa')}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {copied === 'wa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Cryptographic Proof Status</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Merkle Root Validated
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
