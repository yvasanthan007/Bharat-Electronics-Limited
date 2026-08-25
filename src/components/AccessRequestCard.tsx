import type { AccessRequest } from '../data/managerMockData';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
} from 'lucide-react';

interface AccessRequestCardProps {
  request: AccessRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}



export default function AccessRequestCard({ request, onApprove, onReject }: AccessRequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case 'Rejected': return <XCircle className="w-3 h-3 mr-1" />;
      default: return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  // Handle both flat mock data and nested Supabase format
  const requesterName = typeof request.requester === 'string'
    ? request.requester
    : request.requester?.full_name || 'Unknown User';
  const requesterAvatar = request.requesterAvatar
    || (typeof request.requester === 'object' ? request.requester?.avatar_url : null)
    || requesterName.substring(0, 2).toUpperCase();
  const requesterDepartment = request.department
    || (typeof request.requester === 'object' ? request.requester?.department : null)
    || 'Unknown Dept';

  const requestDate = request.date
    || (request.created_at ? new Date(request.created_at).toLocaleDateString() : '—');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
            {requesterAvatar}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{requesterName}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{requesterDepartment}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium ${getStatusColor(request.status)}`}>
          {getStatusIcon(request.status)}
          {request.status}
        </span>
      </div>
      
      <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
        <div className="flex items-center gap-2 mb-1.5">
          <Shield className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-700">{request.resource}</span>
        </div>
        <div className="text-xs text-slate-500 ml-6 flex items-center justify-between">
          <span>Req: {request.permission}</span>
          <span>{requestDate}</span>
        </div>
      </div>

      {request.status === 'Pending' && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onApprove(request.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={() => onReject(request.id)}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
