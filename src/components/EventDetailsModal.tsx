import { X, CheckCircle2, XCircle, Shield, User, Clock, Globe, Hash, FileText, Layers } from 'lucide-react';
import { type AuditEvent } from '../data/mockAuditData';

interface EventDetailsModalProps {
  event: AuditEvent | null;
  onClose: () => void;
}

export default function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  if (!event) return null;

  const rows = [
    { label: 'Event ID', value: event.id, icon: Hash },
    { label: 'Timestamp', value: event.time, icon: Clock },
    { label: 'User', value: event.user, icon: User },
    { label: 'Action', value: event.action, icon: FileText },
    { label: 'Module', value: event.module, icon: Layers },
    { label: 'Resource', value: event.resource, icon: Shield },
    { label: 'IP Address', value: event.ip, icon: Globe },
    { label: 'Transaction Hash', value: event.txHash, icon: Hash },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Event Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                {event.userInitials}
              </div>
              <div>
                <p className="font-medium text-slate-900">{event.user}</p>
                <p className="text-xs text-slate-500">{event.action}</p>
              </div>
            </div>
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
              event.status === 'Success'
                ? 'text-green-700 bg-green-50 border-green-200'
                : 'text-red-700 bg-red-50 border-red-200'
            }`}>
              {event.status === 'Success'
                ? <CheckCircle2 className="w-3.5 h-3.5" />
                : <XCircle className="w-3.5 h-3.5" />
              }
              {event.status}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl divide-y divide-slate-100 border border-slate-100">
            {rows.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-500 w-36 flex-shrink-0">{label}</span>
                <span className="text-sm text-slate-900 font-mono truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
