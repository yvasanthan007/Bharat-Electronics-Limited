import { Globe, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function NetworkOverview() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Network Overview</h2>
        <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View on Explorer
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-slate-100">
        <div className="p-6 col-span-2 md:col-span-1">
          <div className="text-sm font-medium text-slate-500 mb-1">Network</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Globe className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-semibold text-slate-900">Polygon Mainnet</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-sm font-medium text-slate-500 mb-1">Status</div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-slate-900">Healthy</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-sm font-medium text-slate-500 mb-1">Block Height</div>
          <div className="font-semibold text-slate-900 font-mono">58,452,198</div>
        </div>
        
        <div className="p-6">
          <div className="text-sm font-medium text-slate-500 mb-1">Gas Price</div>
          <div className="font-semibold text-slate-900">30 Gwei</div>
        </div>
        
        <div className="p-6 col-span-2 md:col-span-1">
          <div className="text-sm font-medium text-slate-500 mb-1">Last Block</div>
          <div className="font-semibold text-slate-900">24 May 2024, 03:22 PM</div>
        </div>
      </div>
    </div>
  );
}
