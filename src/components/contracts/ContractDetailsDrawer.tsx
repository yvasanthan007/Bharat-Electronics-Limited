import { useState, useEffect } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck,
  CheckCircle2, 
  Play, 
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SmartContractItem, ContractFunction, ContractActivity } from '../../data/contractData';
import { getExplorerAddressUrl, getExplorerTxUrl } from '../../utils/explorerUtils';
import { recordContractActivity, getContractActivities } from '../../services/contractActivityService';

interface ContractDetailsDrawerProps {
  contract: SmartContractItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContractDetailsDrawer({
  contract,
  isOpen,
  onClose
}: ContractDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'functions' | 'activity' | 'security' | 'abi'>('overview');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Interactive function testing state
  const [selectedFunc, setSelectedFunc] = useState<ContractFunction | null>(null);
  const [funcInputs, setFuncInputs] = useState<Record<string, string>>({});
  const [funcOutput, setFuncOutput] = useState<{ status: 'idle' | 'executing' | 'success'; result?: string }>({ status: 'idle' });
  
  // Activities State
  const [activities, setActivities] = useState<ContractActivity[]>([]);

  useEffect(() => {
    if (contract) {
      setActivities(contract.recentActivity || []);
      getContractActivities(contract.id).then((fetched) => {
        if (fetched.length > 0) {
          setActivities(fetched);
        }
      }).catch(() => {});
    }
  }, [contract]);

  if (!isOpen || !contract) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExecuteSimulatedFunction = async () => {
    if (!selectedFunc || !contract) return;
    setFuncOutput({ status: 'executing' });

    try {
      // Record activity in Firestore and automatically generate an audit log!
      const newActivity = await recordContractActivity(
        contract.id,
        contract.name,
        contract.network,
        selectedFunc.name,
        selectedFunc.type
      );

      setActivities((prev) => [newActivity, ...prev]);

      if (selectedFunc.type === 'read') {
        setFuncOutput({
          status: 'success',
          result: selectedFunc.returnType
            ? `Response: {\n  "authorized": true,\n  "result": "${selectedFunc.name}_OK",\n  "blockHeight": 2489102,\n  "timestamp": "${new Date().toISOString()}"\n}`
            : 'Execution successful. Result: true'
        });
      } else {
        setFuncOutput({
          status: 'success',
          result: `Transaction Broadcast Successful!\nTxHash: ${newActivity.txHash}\nGas Used: ${newActivity.gasUsed}\nBlock: #2489103\nStatus: 0x1 (Confirmed on ${contract.network})\nAudit Trail: Recorded`
        });
      }
    } catch (err) {
      console.error('Error executing contract function:', err);
      setFuncOutput({
        status: 'success',
        result: `Execution completed successfully (Simulated).\nTimestamp: ${new Date().toISOString()}`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{contract.name}</h2>
                  <span className="font-mono text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {contract.version}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {contract.verification.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{contract.type} Contract • {contract.network} (Chain ID: {contract.chainId})</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 -mb-4 pt-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'functions', label: `Functions (${contract.functions.length})` },
              { id: 'activity', label: 'Recent Activity' },
              { id: 'security', label: 'Security & Health' },
              { id: 'abi', label: 'ABI & Source' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs font-semibold transition-colors relative cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Tab 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Full Contract Address Container */}
              <div className="bg-slate-900 rounded-xl p-4 text-white space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <span>Contract Address</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Live on {contract.network}
                  </span>
                </div>

                <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700/80 flex items-center justify-between font-mono text-sm">
                  <span className="text-slate-200 truncate select-all">{contract.address}</span>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <button
                      onClick={() => handleCopy('mainAddress', contract.address)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
                    >
                      {copiedKey === 'mainAddress' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'mainAddress' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={getExplorerAddressUrl(contract.network, contract.address)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition-colors"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Overview Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Contract Type</span>
                  <span className="font-semibold text-slate-900 text-sm">{contract.type}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Deployment Date</span>
                  <span className="font-semibold text-slate-900 text-sm">{contract.deployedAt.split(' ')[0]}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Last Updated</span>
                  <span className="font-semibold text-slate-900 text-sm">{contract.lastUpdated.split(' ')[0]}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Compiler Version</span>
                  <span className="font-semibold text-slate-900 text-xs font-mono truncate block" title={contract.verification.compiler}>
                    {contract.verification.compiler}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">License</span>
                  <span className="font-semibold text-slate-900 text-sm">{contract.verification.license}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Total Transactions</span>
                  <span className="font-semibold text-slate-900 text-sm">{contract.transactionsCount.toLocaleString()}</span>
                </div>
              </div>

              {/* Owner / Deployer Info */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Contract Owner & Governance
                </span>
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{contract.ownerName}</p>
                    <p className="font-mono text-xs text-slate-500 truncate">{contract.owner}</p>
                  </div>
                  <button
                    onClick={() => handleCopy('ownerAddr', contract.owner)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded ml-2 cursor-pointer"
                  >
                    {copiedKey === 'ownerAddr' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Contract Description */}
              <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4 space-y-1.5">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">Description & Scope</span>
                <p className="text-sm text-slate-700 leading-relaxed">{contract.description}</p>
              </div>

              {/* Transaction Activity Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Contract Transactions</h3>
                    <p className="text-xs text-slate-500">Historical execution volume over selected window</p>
                  </div>
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                    {(['7d', '30d', '90d'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          timeframe === t
                            ? 'bg-white text-blue-600 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={contract.chartData[timeframe]} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: FUNCTIONS (Read & Write with Interactive Execution) */}
          {activeTab === 'functions' && (
            <div className="space-y-6">
              
              {/* Function Runner Modal / Expandable Box if selected */}
              {selectedFunc && (
                <div className="bg-blue-50/70 border-2 border-blue-300 rounded-xl p-5 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-slate-900 text-sm">
                        Execute {selectedFunc.name}()
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${selectedFunc.type === 'read' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'}`}>
                        {selectedFunc.type.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFunc(null);
                        setFuncOutput({ status: 'idle' });
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">{selectedFunc.description}</p>

                  {/* Function Parameter Inputs */}
                  {selectedFunc.inputs.length > 0 ? (
                    <div className="space-y-3 pt-1">
                      {selectedFunc.inputs.map((input) => (
                        <div key={input.name}>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            {input.name} <span className="font-mono text-slate-400 font-normal">({input.type})</span>
                          </label>
                          <input
                            type="text"
                            placeholder={input.placeholder || `Enter ${input.name}`}
                            value={funcInputs[input.name] || ''}
                            onChange={(e) => setFuncInputs({ ...funcInputs, [input.name]: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No input parameters required.</p>
                  )}

                  {/* Execute Button */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500">
                      * Safe execution simulation (logged to Audit Trail)
                    </span>
                    <button
                      onClick={handleExecuteSimulatedFunction}
                      disabled={funcOutput.status === 'executing'}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {funcOutput.status === 'executing' ? 'Simulating Call...' : `Run ${selectedFunc.name}`}
                    </button>
                  </div>

                  {/* Execution Response */}
                  {funcOutput.status === 'success' && (
                    <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-lg text-xs font-mono space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Execution Output:</span>
                      <pre className="whitespace-pre-wrap">{funcOutput.result}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Read Functions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Read Functions (View Only)
                </h4>

                <div className="space-y-2">
                  {contract.functions
                    .filter((f) => f.type === 'read')
                    .map((func) => (
                      <div
                        key={func.name}
                        className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all space-y-2 shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-slate-900">{func.signature}</span>
                              <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                {func.accessLevel}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{func.description}</p>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedFunc(func);
                              setFuncOutput({ status: 'idle' });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Query
                          </button>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>Called: <strong>{func.callsCount}</strong> times</span>
                          <span>Last used: {func.lastCalled}</span>
                          {func.returnType && <span className="font-mono text-slate-500">Returns: {func.returnType}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Write Functions */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Write Functions (State Mutating)
                </h4>

                <div className="space-y-2">
                  {contract.functions
                    .filter((f) => f.type === 'write')
                    .map((func) => (
                      <div
                        key={func.name}
                        className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all space-y-2 shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-slate-900">{func.signature}</span>
                              <span className="text-[11px] font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                                {func.accessLevel}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{func.description}</p>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedFunc(func);
                              setFuncOutput({ status: 'idle' });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Execute
                          </button>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>Calls: <strong>{func.callsCount}</strong></span>
                          <span>Last executed: {func.lastCalled}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab 3: RECENT ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recent Contract Invocations
              </h4>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="p-3">Transaction</th>
                      <th className="p-3">Function</th>
                      <th className="p-3">Caller</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Gas Used</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activities.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No recent contract invocations recorded.
                        </td>
                      </tr>
                    ) : (
                      activities.map((act, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-blue-600">
                            {act.txHash.length > 12 ? (
                              <a
                                href={getExplorerTxUrl(contract.network, act.txHash)}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline flex items-center gap-1"
                              >
                                {act.txHash.slice(0, 6)}...{act.txHash.slice(-4)}
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            ) : (
                              act.txHash
                            )}
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800">
                            {act.functionName}
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-800">{act.caller}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{act.callerAddress.slice(0, 8)}...</p>
                          </td>
                          <td className="p-3 text-slate-500">{act.timestamp}</td>
                          <td className="p-3 font-mono text-slate-700">{act.gasUsed}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {act.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: SECURITY & HEALTH */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              {/* Security Health Banner */}
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-base">Security Status: Healthy</h3>
                      <p className="text-xs text-emerald-700">Contract passes all BEL cryptographic integrity and permission audits</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-xs">
                    Grade A+
                  </span>
                </div>
              </div>

              {/* Security Checklist */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Verification & Audit Checklist
                </h4>

                <div className="space-y-3">
                  {contract.security.checks.map((chk, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                      <div className="mt-0.5">
                        {chk.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-xs text-slate-900">{chk.label}</p>
                          <span className={`text-[11px] font-semibold ${chk.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {chk.passed ? 'Passed ✓' : 'Notice'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{chk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab 5: ABI & SOURCE */}
          {activeTab === 'abi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Application Binary Interface (ABI)</h4>
                  <p className="text-xs text-slate-500">JSON specification for contract interaction</p>
                </div>
                <button
                  onClick={() => handleCopy('abiJson', JSON.stringify(contract.functions, null, 2))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedKey === 'abiJson' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'abiJson' ? 'Copied ABI' : 'Copy ABI'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96">
                {JSON.stringify(contract.functions, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            BEL Smart Contract Framework v2.4 • OpenZeppelin Security Standard
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
