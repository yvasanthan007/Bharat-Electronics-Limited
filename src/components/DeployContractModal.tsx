import { useState } from 'react';
import { X, CheckCircle2, Loader2, FileCode2 } from 'lucide-react';

interface DeployContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeployContractModal({ isOpen, onClose }: DeployContractModalProps) {
  const [step, setStep] = useState<'form' | 'deploying' | 'success'>('form');

  if (!isOpen) return null;

  const handleDeploy = () => {
    setStep('deploying');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  const handleClose = () => {
    setStep('form');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-blue-600" />
            Deploy New Contract
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contract Name</label>
                <input
                  type="text"
                  placeholder="e.g. AssetRegistry_V2"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contract Type</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option>Identity</option>
                  <option>Access Control</option>
                  <option>Asset Management</option>
                  <option>Audit</option>
                  <option>Verification</option>
                  <option>Marketplace</option>
                  <option>Compliance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Network</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option>Polygon Mainnet</option>
                  <option>Ethereum Mainnet</option>
                  <option>Sepolia Testnet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source Code / Bytecode</label>
                <div className="w-full h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-500 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="text-sm">Click to upload or drag and drop</span>
                </div>
              </div>
            </div>
          )}

          {step === 'deploying' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Deploying Contract</h3>
              <p className="text-sm text-slate-500">Please wait while your transaction is confirmed on the network...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Contract Deployed!</h3>
              <p className="text-sm text-slate-500 mb-4">Your contract has been successfully deployed to Polygon Mainnet.</p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-2">
                <span className="text-xs text-slate-500">Address:</span>
                <span className="text-sm font-mono text-slate-900">0x2a9d...f7c4b</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          {step === 'form' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Deploy Contract
              </button>
            </>
          )}
          {step === 'success' && (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors w-full"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
