import { CheckCircle2, Shield, User, Calendar, Hash, Globe, Download } from 'lucide-react';

const identity = {
  name: 'Rahul Verma',
  role: 'Engineer',
  department: 'R&D Systems',
  employeeId: 'BEL-2024-1024',
  did: 'did:bel:0x7f82a1b3c9d4e5f6a7b8c9d0e1f2a3b4',
  status: 'Verified',
  issuedOn: '15 Jan 2024',
  validUntil: '14 Jan 2025',
  credentials: [
    { name: 'Employee Certificate',    id: 'NFT-1024', date: '15 Jan 2024', status: 'Active' },
    { name: 'Security Clearance - L2', id: 'NFT-1087', date: '20 Feb 2024', status: 'Active' },
    { name: 'Project Atlas Access',    id: 'NFT-1132', date: '01 Mar 2024', status: 'Pending' },
  ],
};

export default function MyIdentity() {
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
              RV
            </div>
            <div>
              <h3 className="text-lg font-bold">{identity.name}</h3>
              <p className="text-blue-200 text-sm">{identity.role} · {identity.department}</p>
              <p className="text-blue-300 text-xs mt-0.5">ID: {identity.employeeId}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/20 px-3 py-1 rounded-full border border-green-400/30">
            <CheckCircle2 className="w-4 h-4 text-green-300" />
            <span className="text-xs font-semibold text-green-200">{identity.status}</span>
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
            { icon: User,     label: 'Full Name',     value: identity.name },
            { icon: Shield,   label: 'Role',          value: identity.role },
            { icon: Globe,    label: 'Department',    value: identity.department },
            { icon: Hash,     label: 'Employee ID',   value: identity.employeeId },
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
          {identity.credentials.map((cred) => (
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
