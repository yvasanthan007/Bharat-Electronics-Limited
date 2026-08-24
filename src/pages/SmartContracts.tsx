import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Rocket,
  AlertCircle 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ContractFilterBar from '../components/contracts/ContractFilterBar';
import ContractTable from '../components/contracts/ContractTable';
import ContractDetailsDrawer from '../components/contracts/ContractDetailsDrawer';
import DeployContractModal from '../components/contracts/DeployContractModal';
import { type SmartContractItem } from '../data/contractData';
import { 
  getSmartContracts, 
  getContractStatistics, 
  subscribeToSmartContracts, 
  type ContractStatsResult 
} from '../services/smartContractService';

export default function SmartContracts() {
  // Data State
  const [contracts, setContracts] = useState<SmartContractItem[]>([]);
  const [stats, setStats] = useState<ContractStatsResult[]>([
    { title: 'Total Contracts', value: '...', growth: '...', description: 'Across 4 supported networks', icon: 'Code2' },
    { title: 'Active Contracts', value: '...', growth: '...', description: 'Operational & responsive', icon: 'CheckCircle2' },
    { title: 'Verified Contracts', value: '...', growth: '...', description: 'Source code & ABI verified', icon: 'ShieldCheck' },
    { title: 'Transactions', value: '...', growth: '...', description: 'Total on-chain contract calls', icon: 'Activity' }
  ]);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const [totalTotalCount, setTotalTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedNetwork, setSelectedNetwork] = useState('All Networks');
  const [selectedVerification, setSelectedVerification] = useState('All Verification');
  const [selectedType, setSelectedType] = useState('All Types');
  
  // View & Modals State
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedContract, setSelectedContract] = useState<SmartContractItem | null>(null);
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
  }, [searchQuery, selectedStatus, selectedNetwork, selectedVerification, selectedType]);

  // Load contracts from Firestore
  const loadContractsData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [contractsRes, statsRes] = await Promise.all([
        getSmartContracts({
          searchQuery,
          status: selectedStatus,
          network: selectedNetwork,
          verification: selectedVerification,
          type: selectedType,
          page: currentPage,
          pageSize,
        }),
        getContractStatistics(),
      ]);

      setContracts(contractsRes.contracts);
      setTotalFilteredCount(contractsRes.totalFilteredCount);
      setTotalTotalCount(contractsRes.totalTotalCount);
      setStats(statsRes);
    } catch (err: any) {
      console.error('Error loading smart contracts:', err);
      setError('Unable to load contracts from database. Showing fallback data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    searchQuery,
    selectedStatus,
    selectedNetwork,
    selectedVerification,
    selectedType,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    loadContractsData();
  }, [loadContractsData]);

  // Real-time updates subscription
  useEffect(() => {
    const unsubscribe = subscribeToSmartContracts(() => {
      getContractStatistics().then(setStats).catch(() => {});
    });
    return () => unsubscribe();
  }, []);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All Statuses');
    setSelectedNetwork('All Networks');
    setSelectedVerification('All Verification');
    setSelectedType('All Types');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadContractsData(true);
  };

  const handleDeploySuccess = (newContract: SmartContractItem) => {
    setContracts((prev) => [newContract, ...prev]);
    setSelectedContract(newContract);
    setIsDrawerOpen(true);
    loadContractsData(true);
  };

  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Contracts</h1>
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
              EVM Compatible
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage, monitor, and verify smart contracts powering the BEL Trust Platform.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors shadow-sm cursor-pointer"
            title="Refresh Smart Contracts"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            Deploy Contract
          </button>
        </div>
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Compact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
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
      {isLoading && !isRefreshing ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="font-semibold text-slate-700">Loading smart contracts from database...</p>
          <p className="text-xs text-slate-400 mt-1">Retrieving deployed contracts, ABI specifications, and security audits</p>
        </div>
      ) : (
        <ContractTable
          contracts={contracts}
          onSelectContract={handleSelectContract}
          selectedContractId={selectedContract?.id}
          viewMode={viewMode}
        />
      )}

      {/* Pagination Bar */}
      <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="font-semibold text-slate-900">{totalFilteredCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong>–
            <strong className="font-semibold text-slate-900">{Math.min(currentPage * pageSize, totalFilteredCount)}</strong> of{' '}
            <strong className="font-semibold text-slate-900">
              {totalFilteredCount < totalTotalCount
                ? `${totalFilteredCount} filtered (${totalTotalCount} total)`
                : `${totalTotalCount}`}
            </strong> contracts
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
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
