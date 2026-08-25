import { Award, CheckCircle2, XCircle, Calendar, User, Building2 } from 'lucide-react';
import type { VerifiableCredential } from '../../lib/did/vcEngine';

interface CredentialCardProps {
  vc: VerifiableCredential;
  onVerify?: (vcId: string) => void;
  compact?: boolean;
}

const credentialColors: Record<string, { bg: string; border: string; text: string }> = {
  BELAdminCredential: { bg: 'from-red-600 to-rose-700', border: 'border-red-200', text: 'red' },
  BELManagerCredential: { bg: 'from-purple-600 to-violet-700', border: 'border-purple-200', text: 'purple' },
  BELEngineerCredential: { bg: 'from-blue-600 to-indigo-700', border: 'border-blue-200', text: 'blue' },
  BELAuditorCredential: { bg: 'from-amber-500 to-orange-600', border: 'border-amber-200', text: 'amber' },
  BELEmployeeCredential: { bg: 'from-slate-600 to-slate-700', border: 'border-slate-200', text: 'slate' },
};

export default function CredentialCard({ vc, onVerify, compact = false }: CredentialCardProps) {
  const credType = vc.type[1] ?? 'VerifiableCredential';
  const colors = credentialColors[credType] ?? credentialColors['BELEmployeeCredential'];
  const isExpired = new Date(vc.expirationDate) < new Date();

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center shrink-0`}>
          <Award className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{credType.replace('BEL', 'BEL ')}</p>
          <p className="text-xs text-slate-500">Expires {formatDate(vc.expirationDate)}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isExpired ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
        }`}>
          {isExpired ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
          {isExpired ? 'Expired' : 'Active'}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Card header */}
      <div className={`bg-gradient-to-br ${colors.bg} p-5 text-white`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold opacity-70 uppercase tracking-wider mb-1">Verifiable Credential</p>
            <p className="text-base font-bold leading-tight">{credType.replace('BEL', 'BEL ')}</p>
          </div>
          <Award className="w-6 h-6 opacity-80" />
        </div>
        <p className="text-sm opacity-80 font-mono truncate">{vc.credentialSubject.id.substring(0, 30)}...</p>
      </div>

      {/* Card body */}
      <div className="bg-white p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Holder</p>
              <p className="font-medium text-slate-800">{vc.credentialSubject.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Department</p>
              <p className="font-medium text-slate-800">{vc.credentialSubject.department}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Issued</p>
              <p className="font-medium text-slate-800">{formatDate(vc.issuanceDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Expires</p>
              <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-slate-800'}`}>{formatDate(vc.expirationDate)}</p>
            </div>
          </div>
        </div>

        {/* Status and verify */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isExpired ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {isExpired ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {isExpired ? 'Expired' : 'Active'}
          </span>
          {onVerify && !isExpired && (
            <button
              onClick={() => onVerify(vc.id)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              Verify ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
