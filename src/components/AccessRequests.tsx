import { useState } from 'react';
import { MoreVertical, Shield, ShieldAlert, ShieldCheck, Check, X } from 'lucide-react';
import { mockAccessRequests, type AccessRequest } from '../data/mockData';

interface AccessRequestsProps {
  searchTerm?: string;
}

export default function AccessRequests({ searchTerm = '' }: AccessRequestsProps) {
  const [requestsList, setRequestsList] = useState<AccessRequest[]>(mockAccessRequests);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  const handleApprove = (id: string) => {
    setRequestsList(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
  };

  const handleReject = (id: string) => {
    setRequestsList(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
  };

  const filteredRequests = requestsList.filter(req => {
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesSearch = !searchTerm.trim() ||
      req.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestedAccess.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.resource.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const pendingCount = requestsList.filter(r => r.status === 'Pending').length;

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Access Requests Ledger</h2>
          <p className="text-xs text-slate-500">Real-time Zero-Trust role elevation requests requiring administrator quorum approval</p>
        </div>
        <div className="flex items-center gap-2">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab} {tab === 'Pending' ? `(${pendingCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse text-xs min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-3.5">User</th>
              <th className="px-6 py-3.5">Requested Access</th>
              <th className="px-6 py-3.5">Resource / Module</th>
              <th className="px-6 py-3.5">Requested On</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.map((request: AccessRequest) => (
              <tr key={request.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                      {request.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{request.user}</p>
                      <p className="text-[11px] text-slate-400 font-mono">ID: #{request.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800">{request.requestedAccess}</td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-600">{request.resource}</td>
                <td className="px-6 py-4 text-xs text-slate-500 font-mono">{request.requestedOn}</td>
                <td className="px-6 py-4">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 text-right">
                  {request.status === 'Pending' ? (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleReject(request.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 cursor-pointer shadow-2xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(request.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                    </div>
                  ) : (
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRequests.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No access requests matching current status and search filters.
          </div>
        )}
      </div>
    </div>
  );
}
