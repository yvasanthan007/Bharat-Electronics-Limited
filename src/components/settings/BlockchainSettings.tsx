import { useState } from 'react';
import { RefreshCw, Save, RotateCcw, Zap, Server } from 'lucide-react';
import { pingBlockchainNode } from '../../services/settings';
import type { BlockchainSettingsData } from '../../services/settings';

interface BlockchainSettingsProps {
  initialData: BlockchainSettingsData;
  onSave: (data: BlockchainSettingsData) => void;
}

export default function BlockchainSettings({ initialData, onSave }: BlockchainSettingsProps) {
  const [formData, setFormData] = useState<BlockchainSettingsData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ latencyMs: number; block: string } | null>(null);

  const handlePing = async () => {
    setIsPinging(true);
    try {
      const res = await pingBlockchainNode();
      setPingResult({ latencyMs: res.latencyMs, block: res.block });
    } finally {
      setIsPinging(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Node Status & Health Indicator Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-xl p-6 shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              {formData.nodeStatus} Node (Quorum IBFT 2.0)
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">{formData.networkName}</h3>
          <p className="text-xs text-slate-300 mt-1">
            Chain ID: <span className="font-mono font-bold text-white">{formData.chainId}</span> • Block Time: <span className="font-bold text-white">{formData.blockTime}</span> • Validators: <span className="font-bold text-white">{formData.activeValidators} Active</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pingResult && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-emerald-400 font-mono font-bold">{pingResult.latencyMs}ms Latency</p>
              <p className="text-[10px] text-slate-400 font-mono">Block {pingResult.block}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handlePing}
            disabled={isPinging}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold text-white backdrop-blur-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            {isPinging ? 'Pinging Node...' : 'Ping Node Connection'}
          </button>
        </div>
      </div>

      {/* Connection & RPC Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">RPC & Consensus Node Configuration</h3>
            <p className="text-xs text-slate-500">
              Gateway endpoints for smart contract execution and ledger queries
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Primary RPC Endpoint URL *
            </label>
            <input
              type="url"
              required
              value={formData.rpcEndpoint}
              onChange={(e) => setFormData({ ...formData, rpcEndpoint: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-xs text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chain ID
            </label>
            <input
              type="number"
              value={formData.chainId}
              onChange={(e) => setFormData({ ...formData, chainId: parseInt(e.target.value) || 0 })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-xs text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Block Explorer URL
            </label>
            <input
              type="url"
              value={formData.blockExplorerUrl}
              onChange={(e) => setFormData({ ...formData, blockExplorerUrl: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-xs text-slate-900 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Gas Strategy & Throughput */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Gas Limit & Execution Policies</h3>
            <p className="text-xs text-slate-500">
              Manage transaction priority, fee estimation, and smart contract gas caps
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Gas Strategy Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Standard', 'Fast', 'Custom'] as const).map((strategy) => (
                <button
                  type="button"
                  key={strategy}
                  onClick={() => setFormData({ ...formData, gasPriceStrategy: strategy })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    formData.gasPriceStrategy === strategy
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {strategy}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Maximum Gas Limit per Block
            </label>
            <input
              type="text"
              value={formData.customGasLimit}
              onChange={(e) => setFormData({ ...formData, customGasLimit: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-xs text-slate-900 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setFormData(initialData)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-xs transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save Blockchain Config'}
        </button>
      </div>
    </form>
  );
}
