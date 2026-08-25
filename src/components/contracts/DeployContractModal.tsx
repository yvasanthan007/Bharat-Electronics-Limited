import { useState } from 'react';
import { X, Rocket, CheckCircle2 } from 'lucide-react';
import type { SmartContractItem } from '../../data/contractData';
import { createContractRecord } from '../../services/smartContractService';
import { validateContractPayload } from '../../utils/validation';

interface DeployContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (newContract: SmartContractItem) => void;
}

export default function DeployContractModal({
  isOpen,
  onClose,
  onDeploy
}: DeployContractModalProps) {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState<SmartContractItem['type']>('Identity');
  const [network, setNetwork] = useState<SmartContractItem['network']>('BEL Testnet');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('0x7f824589d1b09872e45210c4391a82f3a3b910cd');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedSuccess, setDeployedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validation = validateContractPayload({ name, type, network, owner });
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid input');
      return;
    }

    setIsDeploying(true);

    try {
      const newContract = await createContractRecord({
        name,
        symbol,
        type,
        network,
        description,
        owner,
      });

      setIsDeploying(false);
      setDeployedSuccess(true);
      onDeploy(newContract);

      setTimeout(() => {
        setDeployedSuccess(false);
        // Reset form
        setName('');
        setSymbol('');
        setDescription('');
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error creating contract record:', err);
      setIsDeploying(false);
      setValidationError('Failed to save contract record. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Deploy Smart Contract</h3>
              <p className="text-xs text-slate-500">Register and deploy contract to BEL Trust Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation error if any */}
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {validationError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Contract Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AssetEscrowVault or PersonnelRegistry"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Symbol / Tag
              </label>
              <input
                type="text"
                placeholder="e.g. BEL-AEV"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contract Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="Identity">Identity</option>
                <option value="Access Control">Access Control</option>
                <option value="Digital Asset">Digital Asset</option>
                <option value="Certificate">Certificate</option>
                <option value="Governance">Governance</option>
                <option value="Transaction">Transaction</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Network
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="BEL Testnet">BEL Testnet (Gas-Free)</option>
                <option value="Ethereum">Ethereum Mainnet</option>
                <option value="Polygon">Polygon POS</option>
                <option value="BNB Chain">BNB Chain</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Compiler
              </label>
              <input
                type="text"
                disabled
                value="Solidity v0.8.24"
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Initial Admin / Owner Address
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Describe the contract's scope and role in BEL platform..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isDeploying || deployedSuccess}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {deployedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Contract Record Created!
                </>
              ) : isDeploying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering Contract...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Deploy Contract
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
