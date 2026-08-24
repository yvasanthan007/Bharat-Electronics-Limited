import { useState } from 'react';
import { Plus } from 'lucide-react';
import ContractStats from '../components/ContractStats';
import ContractTable from '../components/ContractTable';
import RecentDeployments from '../components/RecentDeployments';
import ContractMetrics from '../components/ContractMetrics';
import NetworkOverview from '../components/NetworkOverview';
import DeployContractModal from '../components/DeployContractModal';

export default function SmartContracts() {
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Smart Contracts</h1>
          <p className="text-sm text-slate-500">Deploy, manage and monitor smart contracts on the blockchain</p>
        </div>
        
        <button
          onClick={() => setIsDeployModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Deploy New Contract
        </button>
      </div>

      <ContractStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContractTable />
        </div>
        <div className="space-y-6">
          <RecentDeployments />
          <ContractMetrics />
        </div>
      </div>

      <NetworkOverview />

      <DeployContractModal 
        isOpen={isDeployModalOpen} 
        onClose={() => setIsDeployModalOpen(false)} 
      />
    </div>
  );
}
