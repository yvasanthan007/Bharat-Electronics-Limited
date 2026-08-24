import { useState, useMemo } from 'react';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Rocket,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ContractFilterBar from '../components/contracts/ContractFilterBar';
import ContractTable from '../components/contracts/ContractTable';
import ContractDetailsDrawer from '../components/contracts/ContractDetailsDrawer';
import DeployContractModal from '../components/contracts/DeployContractModal';

import {
  contractStats,
  contractsMock,
  type SmartContractItem,
} from '../data/contractData';

export default function SmartContracts() {
  const [contracts, setContracts] =
    useState<SmartContractItem[]>(contractsMock);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedNetwork, setSelectedNetwork] = useState('All Networks');
  const [selectedVerification, setSelectedVerification] =
    useState('All Verification');
  const [selectedType, setSelectedType] = useState('All Types');

  // View & Modals State
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedContract, setSelectedContract] =
    useState<SmartContractItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (searchQuery.trim()) count++;
    if (selectedStatus !== 'All Statuses') count++;
    if (selectedNetwork !== 'All Networks') count++;
    if (selectedVerification !== 'All Verification') count++;
    if (selectedType !== 'All Types') count++;

    return count;
  }, [
    searchQuery,
    selectedStatus,
    selectedNetwork,
    selectedVerification,
    selectedType,
  ]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All Statuses');
    setSelectedNetwork('All Networks');
    setSelectedVerification('All Verification');
    setSelectedType('All Types');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleDeploySuccess = (newContract: SmartContractItem) => {
    setContracts((prev) => [newContract, ...prev]);
    setSelectedContract(newContract);
    setIsDrawerOpen(true);
  };

  // Filter Logic
  const filteredContracts = useMemo(() => {
    return contracts.filter((item) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();

        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAddress = item.address.toLowerCase().includes(q);
        const matchesSymbol = item.symbol.toLowerCase().includes(q);
        const matchesNetwork = item.network.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesType = item.type.toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesAddress &&
          !matchesSymbol &&
          !matchesNetwork &&
          !matchesDesc &&
          !matchesType
        ) {
          return false;
        }
      }

      // Status
      if (
        selectedStatus !== 'All Statuses' &&
        item.status !== selectedStatus
      ) {
        return false;
      }

      // Network
      if (
        selectedNetwork !== 'All Networks' &&
        item.network !== selectedNetwork
      ) {
        return false;
      }

      // Verification
      if (
        selectedVerification !== 'All Verification' &&
        item.verification.status !== selectedVerification
      ) {
        return false;
      }

      // Contract Type
      if (selectedType !== 'All Types' && item.type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [
    contracts,
    searchQuery,
    selectedStatus,
    selectedNetwork,
    selectedVerification,
    selectedType,
  ]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredContracts.length / pageSize)
  );

  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredContracts.slice(start, start + pageSize);
  }, [filteredContracts, currentPage, pageSize]);

  const handleSelectContract = (contract: SmartContractItem) => {
    setSelectedContract(contract);
    setIsDrawerOpen(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Smart Contracts
            </h1>

            <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
              EVM Compatible
            </span>
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Manage, monitor, and verify smart contracts powering the BEL Trust
            Platform.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors shadow-sm"
            title="Refresh Smart Contracts"
          >
            <RotateCw
              className={`w-4 h-4 ${
                isRefreshing ? 'animate-spin text-blue-600' : ''
              }`}
            />
          </button>

          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Rocket className="w-4 h-4" />
            Deploy Contract
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {contractStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Filter and Search Bar */}
      <ContractFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        selectedNetwork={selectedNetwork}
        onNetworkChange={(val) => {
          setSelectedNetwork(val);
          setCurrentPage(1);
        }}
        selectedVerification={selectedVerification}
        onVerificationChange={(val) => {
          setSelectedVerification(val);
          setCurrentPage(1);
        }}
        selectedType={selectedType}
        onTypeChange={(val) => {
          setSelectedType(val);
          setCurrentPage(1);
        }}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Contracts Table / Card Grid */}
      <ContractTable
        contracts={paginatedContracts}
        onSelectContract={handleSelectContract}
        selectedContractId={selectedContract?.id}
        viewMode={viewMode}
      />

      {/* Pagination */}
      <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Showing{' '}
            <strong className="font-semibold text-slate-900">
              {filteredContracts.length > 0
                ? (currentPage - 1) * pageSize + 1
                : 0}
            </strong>
            –
            <strong className="font-semibold text-slate-900">
              {Math.min(
                currentPage * pageSize,
                filteredContracts.length
              )}
            </strong>{' '}
            of{' '}
            <strong className="font-semibold text-slate-900">
              {filteredContracts.length < contracts.length
                ? `${filteredContracts.length} filtered (${contracts.length} total)`
                : `${contracts.length}`}
            </strong>{' '}
            contracts
          </span>

          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            <span className="text-slate-400">Rows per page:</span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setCurrentPage((p) => Math.max(1, p - 1))
            }
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contract Details Drawer */}
      <ContractDetailsDrawer
        contract={selectedContract}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedContract(null);
        }}
      />

      {/* Deploy Contract Modal */}
      <DeployContractModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onDeploy={handleDeploySuccess}
      />
    </div>
  );
}