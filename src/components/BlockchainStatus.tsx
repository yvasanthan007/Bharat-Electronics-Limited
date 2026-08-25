import { ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
  const navigate = useNavigate();
  const [isPinging, setIsPinging] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(data.latestBlock);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      const randomNum = 2345678 + Math.floor(Math.random() * 50);
      setCurrentBlock(`#${randomNum.toLocaleString()}`);
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
            </div>
            <span className="text-xs font-bold text-emerald-700">{data.status}</span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Blockchain Ledger Node</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Network:</span>
            <span className="font-bold text-slate-800">{data.network}</span>
          </div>
          <div className="hidden sm:block w-px h-3.5 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Latest Block:</span>
            <span className="font-mono font-bold text-blue-600">{currentBlock}</span>
            <button
              onClick={handleRefresh}
              title="Ping latest block"
              className={`p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors ${
                isPinging ? 'animate-spin text-blue-600' : ''
              }`}
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <div className="hidden sm:block w-px h-3.5 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Block Time:</span>
            <span className="font-mono font-bold text-slate-800">{data.blockTime}</span>
          </div>
          <div className="hidden lg:block w-px h-3.5 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Gas Price:</span>
            <span className="font-mono font-bold text-slate-800">{data.gasPrice}</span>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/audit-trail')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer self-start md:self-auto"
        >
          View On-Chain Explorer
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
