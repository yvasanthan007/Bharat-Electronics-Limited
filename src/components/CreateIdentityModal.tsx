import { useState } from 'react';
import {
  X, CheckCircle2, Wand2, Sparkles, UserCheck
} from 'lucide-react';
import {
  generateDid,
  type Identity,
  type SecurityClearance,
  type IdentityStatus
} from '../services/identities';
import { registerExternalDIDIdentity } from '../services/did';

interface CreateIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIdentity: (newIdentity: Identity) => void;
}

interface IdentityPreset {
  name: string;
  role: string;
  department: string;
  securityClearance: SecurityClearance;
  keyType: 'Ed25519' | 'Secp256k1' | 'RSA-4096';
  avatar: string;
}

const PRESETS: IdentityPreset[] = [
  {
    name: 'Dr. V. K. Saraswat',
    role: 'Administrator',
    department: 'Strategic Defence',
    securityClearance: 'Top Secret (SCI)',
    keyType: 'Ed25519',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    name: 'Wing Commander Ananya Sen',
    role: 'Manager',
    department: 'R&D Avionics',
    securityClearance: 'Top Secret (SCI)',
    keyType: 'Ed25519',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  },
  {
    name: 'Major Sandeep Unnikrishnan',
    role: 'Security Officer',
    department: 'IT Security',
    securityClearance: 'Secret',
    keyType: 'Secp256k1',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    name: 'Pooja Hegde',
    role: 'Auditor',
    department: 'Audit & Compliance',
    securityClearance: 'Secret',
    keyType: 'RSA-4096',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  },
];

export default function CreateIdentityModal({
  isOpen,
  onClose,
  onAddIdentity,
}: CreateIdentityModalProps) {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState(`BEL-DEF-${Math.floor(1000 + Math.random() * 9000)}`);
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('IT Security');
  const [role, setRole] = useState('Engineer');
  const [securityClearance, setSecurityClearance] = useState<SecurityClearance>('Secret');
  const [keyType, setKeyType] = useState<'Ed25519' | 'Secp256k1' | 'RSA-4096'>('Ed25519');
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState<IdentityStatus>('Verified');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [createdDid, setCreatedDid] = useState<string>('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: IdentityPreset) => {
    setName(preset.name);
    setRole(preset.role);
    setDepartment(preset.department);
    setSecurityClearance(preset.securityClearance);
    setKeyType(preset.keyType);
    setAvatarUrl(preset.avatar);

    const formattedEmail = preset.name
      .toLowerCase()
      .replace(/dr\.|wing commander|major/g, '')
      .trim()
      .replace(/\s+/g, '.') + '@bel.co.in';
    setEmail(formattedEmail);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const id = `bel-id-${Date.now()}`;
      const generatedDidStr = generateDid();
      const generatedWallet = walletAddress || '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const generatedPubKey = '0x04' + Array.from({ length: 42 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const newIdentity: Identity = {
        id,
        name: name || 'Defense Engineer',
        did: generatedDidStr,
        employeeId: employeeId || `BEL-DEF-${Math.floor(1000 + Math.random() * 9000)}`,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@bel.co.in`,
        role,
        department,
        status,
        securityClearance,
        walletAddress: generatedWallet,
        publicKey: generatedPubKey,
        keyType,
        avatar: avatarUrl,
        createdOn: new Date().toISOString().split('T')[0],
        lastActive: 'Just registered',
        verifiableCredentialsCount: securityClearance === 'Top Secret (SCI)' ? 6 : 3,
      };

      setCreatedDid(generatedDidStr);
      onAddIdentity(newIdentity);

      // Register with DID subsystem & backend database
      registerExternalDIDIdentity({
        name: newIdentity.name,
        employeeId: newIdentity.employeeId,
        department: newIdentity.department,
        role: newIdentity.role,
        walletAddress: newIdentity.walletAddress,
        publicKey: newIdentity.publicKey,
        did: newIdentity.did,
        email: newIdentity.email,
      }).catch(() => {});

      setIsLoading(false);
      setStep('success');
    }, 700);
  };

  const handleResetAndClose = () => {
    setStep('form');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Register Decentralized Identity (DID)
              </h2>
              <p className="text-xs text-slate-500">
                Issue verifiable credential & cryptographic keypair on BEL Sovereign Trust Node
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Identity Registered On-Chain!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Decentralized Identifier (DID) and cryptographic assertion keys have been verified and anchored to BEL Sovereign Testnet.
                </p>
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Personnel:</span>
                  <span className="font-bold text-slate-800">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Issued DID:</span>
                  <span className="font-bold text-blue-600">{createdDid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Clearance:</span>
                  <span className="font-bold text-emerald-700">{securityClearance}</span>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Done & View in Directory
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Fill Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                  Quick Fill from Defense Personnel Roster
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {preset.name.split(' ').slice(0, 2).join(' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!email) {
                        setEmail(e.target.value.toLowerCase().replace(/\s+/g, '.') + '@bel.co.in');
                      }
                    }}
                    placeholder="e.g. Dr. Rajesh Verma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Employee ID</label>
                  <input
                    required
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="BEL-RD-1049"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Official Defense Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh.verma@bel.co.in"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="IT Security">IT Security</option>
                    <option value="Operations">Operations</option>
                    <option value="R&D Avionics">R&D Avionics</option>
                    <option value="Radar Systems">Radar Systems</option>
                    <option value="Audit & Compliance">Audit & Compliance</option>
                    <option value="Strategic Defence">Strategic Defence</option>
                    <option value="Logistics & Supply">Logistics & Supply</option>
                    <option value="HR & Personnel">HR & Personnel</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Platform Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Auditor">Auditor</option>
                    <option value="Security Officer">Security Officer</option>
                    <option value="User">User</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Security Clearance</label>
                  <select
                    value={securityClearance}
                    onChange={(e) => setSecurityClearance(e.target.value as SecurityClearance)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Top Secret (SCI)">Top Secret (SCI)</option>
                    <option value="Secret">Secret</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Restricted">Restricted</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cryptographic Key Type</label>
                  <select
                    value={keyType}
                    onChange={(e) => setKeyType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-mono"
                  >
                    <option value="Ed25519">Ed25519 (Fast & Sovereign)</option>
                    <option value="Secp256k1">Secp256k1 (EVM Standard)</option>
                    <option value="RSA-4096">RSA-4096 (Enterprise PKI)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Initial Verification Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as IdentityStatus)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Verified">Verified (Active Anchor)</option>
                    <option value="Pending">Pending (Clearance Review)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Custom Wallet Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x... (Auto-generated if empty)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  A verifiable Decentralized Identifier (DID) will be automatically created with key pair and anchored onto <strong>BEL Sovereign Testnet</strong>.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Anchoring DID...
                    </>
                  ) : (
                    'Register Identity'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
