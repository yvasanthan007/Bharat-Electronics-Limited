import { MoreVertical, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { mockAccessRequests, type AccessRequest } from '../data/mockData';

export default function AccessRequests() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <Shield className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Recent Access Requests</h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View all requests →
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Requested Access</th>
              <th className="px-6 py-4 font-medium">Resource/Module</th>
              <th className="px-6 py-4 font-medium">Requested On</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockAccessRequests.map((request: AccessRequest) => (
              <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                      {request.user.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900">{request.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-700">{request.requestedAccess}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{request.resource}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{request.requestedOn}</td>
                <td className="px-6 py-4">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 text-right">
                  {request.status === 'Pending' ? (
                    <div className="flex justify-end gap-2">
                      <button className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-200">
                        Reject
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                        Approve
                      </button>
                    </div>
                  ) : (
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
