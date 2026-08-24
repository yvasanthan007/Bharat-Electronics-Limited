import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function FraudWidget() {
  return (
    <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
            Fraud Risk Warning
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">High</span>
          </h3>
          <p className="text-red-700 text-sm mt-1 max-w-md">
            We detected an abnormal spike in withdrawal volume to new, untrusted addresses on the Ethereum network natively.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-medium rounded-lg text-sm transition-colors text-center">
          View Report
        </button>
        <button className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg shadow-sm text-sm transition-colors flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 cursor-pointer" />
          Review Approvals
        </button>
      </div>
    </div>
  );
}
