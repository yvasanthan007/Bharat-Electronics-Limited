import { useState, useEffect } from 'react';
import { CheckCircle2, Shield, User, Calendar, Hash, Globe, Download } from 'lucide-react';
import {
  getUserIdentity, getUserCredentials,
  type UserIdentity, type Credential,
} from '../../services/userPortal';

export default function MyIdentity() {
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [id, creds] = await Promise.all([getUserIdentity(), getUserCredentials()]);
      setIdentity(id);
      setCredentials(creds);
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !identity) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const initials = identity.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Identity</h2>
        <p className="text-sm text-slate-500 mt-0.5">Your verified digital identity on the BEL TrustChain.</p>
      </div>

      {/* Identity Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm border border-white/30">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold">{identity.name}</h3>
              <p className="text-blue-200 text-sm">{identity.role} · {identity.department}</p>
              <p className="text-blue-300 text-xs mt-0.5">ID: {identity.employeeId}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
            identity.status === 'Verified' ? 'bg-green-500/20 border-green-400/30' : 'bg-amber-500/20 border-amber-400/30'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold">{identity.status}</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
          <p className="text-blue-200 text-xs font-medium mb-0.5">Decentralized Identity (DID)</p>
          <p className="text-white font-mono text-xs break-all">{identity.did}</p>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm">
          <div>
            <p className="text-blue-200 text-xs">Issued On</p>
            <p className="font-medium">{identity.issuedOn}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs">Valid Until</p>
            <p className="font-medium">{identity.validUntil}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Identity Details</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { icon: User,     label: 'Full Name',   value: identity.name },
            { icon: Shield,   label: 'Role',         value: identity.role },
            { icon: Globe,    label: 'Department',   value: identity.department },
            { icon: Hash,     label: 'Employee ID',  value: identity.employeeId },
            { icon: Calendar, label: 'Valid Until',   value: identity.validUntil },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 px-5 py-3.5">
              <row.icon className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-500 w-32 shrink-0">{row.label}</span>
              <span className="text-sm font-medium text-slate-800">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Credentials */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Verifiable Credentials</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {credentials.map((cred) => (
            <div key={cred.id} className="flex items-center gap-3 px-5 py-4">
              <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{cred.name}</p>
                <p className="text-xs text-slate-400">{cred.id} · {cred.date}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                cred.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {cred.status}
              </span>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
