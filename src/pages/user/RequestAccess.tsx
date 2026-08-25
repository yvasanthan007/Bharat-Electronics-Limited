import { useState } from 'react';
import { KeyRound, Send, CheckCircle2 } from 'lucide-react';

const resources = [
  'Project Atlas Repository',
  'R&D Documentation Bundle',
  'BEL Intranet Portal',
  'Classified Data Drive',
  'CAD Tools Suite',
  'Security Module License',
  'HR Management System',
  'Finance Portal',
];

const pendingRequests = [
  { id: 'REQ-001', resource: 'Project Atlas Repository',   submitted: '10 May 2024', status: 'Pending' },
  { id: 'REQ-002', resource: 'Classified Data Drive',      submitted: '02 May 2024', status: 'Approved' },
];

const statusStyle: Record<string, string> = {
  Pending:  'bg-amber-50 text-amber-700 border border-amber-200',
  Approved: 'bg-green-50 text-green-700 border border-green-200',
  Rejected: 'bg-red-50 text-red-700 border border-red-200',
};

export default function RequestAccess() {
  const [resource, setResource] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource || !reason) return;
    setSubmitted(true);
    setResource('');
    setReason('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Request Access</h2>
        <p className="text-sm text-slate-500 mt-0.5">Submit a request to access BEL resources and systems.</p>
      </div>

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-slate-800">New Access Request</h3>
        </div>

        {submitted ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <p className="font-semibold text-slate-800">Request Submitted!</p>
            <p className="text-sm text-slate-500">Your access request has been submitted and is awaiting approval.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Resource</label>
              <select
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">Choose a resource...</option>
                {resources.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Access</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Briefly explain why you need this access..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30"
              >
                <Send className="w-4 h-4" />
                Submit Request
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Existing Requests */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">My Requests</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {pendingRequests.map((req) => (
            <div key={req.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{req.resource}</p>
                <p className="text-xs text-slate-400">{req.id} · Submitted {req.submitted}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[req.status]}`}>
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
