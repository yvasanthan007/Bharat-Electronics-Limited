import { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  X, 
  Eye, 
  RotateCcw, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  FileText,
  Lock,
  Calendar,
  UserCheck
} from 'lucide-react';
import { mockAccessRequests, type AccessRequest } from '../data/mockData';

interface AccessRequestsProps {
  searchTerm?: string;
}

export default function AccessRequests({ searchTerm = '' }: AccessRequestsProps) {
  const [requestsList, setRequestsList] = useState<AccessRequest[]>(mockAccessRequests);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedDetailsRequest, setSelectedDetailsRequest] = useState<AccessRequest | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApprove = (id: string) => {
    setRequestsList(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    setActiveMenuId(null);
  };

  const handleReject = (id: string) => {
    setRequestsList(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    setActiveMenuId(null);
  };

  const handleReopen = (id: string) => {
    setRequestsList(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'Pending' } : r))
    );
    setActiveMenuId(null);
  };

  const handleDeleteRequest = (id: string) => {
    setRequestsList(prev => prev.filter(r => r.id !== id));
    setActiveMenuId(null);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(`REQ-BEL-2026-${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    setActiveMenuId(null);
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
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden relative" ref={menuRef}>
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Access Requests Ledger ({filteredRequests.length})</h2>
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
              <th className="px-6 py-3.5">User / Identity</th>
              <th className="px-6 py-3.5">Requested Access</th>
              <th className="px-6 py-3.5">Resource / Module</th>
              <th className="px-6 py-3.5">Requested On</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
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
                      <p className="text-[11px] text-slate-400 font-mono">REQ-BEL-#{request.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800">{request.requestedAccess}</td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-600">{request.resource}</td>
                <td className="px-6 py-4 text-xs text-slate-500 font-mono">{request.requestedOn}</td>
                <td className="px-6 py-4">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 text-right relative">
                  <div className="flex items-center justify-end gap-2">
                    {request.status === 'Pending' ? (
                      <>
                        <button 
                          onClick={() => handleReject(request.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 cursor-pointer shadow-2xs"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApprove(request.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      </>
                    ) : null}

                    {/* 3-Dot Action Button */}
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === request.id ? null : request.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Request Actions & Audit Details"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Interactive 3-Dot Popover Menu */}
                  {activeMenuId === request.id && (
                    <div className="absolute right-6 top-10 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-left animate-in fade-in slide-in-from-top-1 duration-100">
                      <button
                        onClick={() => {
                          setSelectedDetailsRequest(request);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        View Cryptographic Proof
                      </button>

                      {request.status === 'Approved' && (
                        <button
                          onClick={() => handleReject(request.id)}
                          className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer font-medium"
                        >
                          <X className="w-3.5 h-3.5 text-rose-500" />
                          Revoke Access
                        </button>
                      )}

                      {request.status === 'Rejected' && (
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="w-full px-3.5 py-2 text-xs text-emerald-600 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer font-medium"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Approve Request
                        </button>
                      )}

                      {request.status !== 'Pending' && (
                        <button
                          onClick={() => handleReopen(request.id)}
                          className="w-full px-3.5 py-2 text-xs text-amber-600 hover:bg-amber-50 flex items-center gap-2.5 cursor-pointer font-medium"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                          Re-open to Pending
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyId(request.id)}
                        className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        {copiedId === request.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied Tracking ID!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            Copy Request Hash ID
                          </>
                        )}
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        Archive / Dismiss Request
                      </button>
                    </div>
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

      {/* Cryptographic Proof Details Modal */}
      {selectedDetailsRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Access Request Proof & Receipt</h3>
                  <p className="text-xs text-slate-500 font-mono">REQ-BEL-2026-#{selectedDetailsRequest.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailsRequest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Requester User</span>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    {selectedDetailsRequest.user}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Current Status</span>
                  <div className="mt-0.5">{getStatusBadge(selectedDetailsRequest.status)}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Requested Scope</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedDetailsRequest.requestedAccess}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Target Resource</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{selectedDetailsRequest.resource}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Blockchain Ledger Verification</span>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Merkle Proof Root:</span>
                    <span className="text-emerald-400">0x7f82c4...e1a2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quorum Verification:</span>
                    <span className="text-blue-400">2-of-3 Multisig Signed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Block Anchor:</span>
                    <span className="text-slate-300">#2,345,678 (BEL Sovereign)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Recorded On: {selectedDetailsRequest.requestedOn}</span>
                <span className="mx-1">•</span>
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Zero-Trust Sealed</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedDetailsRequest(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
