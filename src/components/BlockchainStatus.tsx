
import { ExternalLink } from 'lucide-react';

interface BlockchainStatusProps {
  data: {
    status: string;
    network: string;
    latestBlock: string;
    blockTime: string;
    gasPrice: string;
  };
}

export default function BlockchainStatus({ data }: BlockchainStatusProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 mr-2">Blockchain Status</h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
            </div>
            <span className="text-xs font-medium text-emerald-700">{data.status}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Network:</span>
            <span className="font-medium text-slate-900">{data.network}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Latest Block:</span>
            <span className="font-mono font-medium text-slate-900">{data.latestBlock}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Block Time:</span>
            <span className="font-medium text-slate-900">{data.blockTime}</span>
          </div>
          <div className="hidden lg:block w-px h-4 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Gas Price:</span>
            <span className="font-medium text-slate-900">{data.gasPrice}</span>
          </div>
        </div>
        
        <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View on Explorer
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
