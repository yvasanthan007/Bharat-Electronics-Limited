
import StatCard from '../components/StatCard';
import ActivityList from '../components/ActivityList';
import TransactionsChart from '../components/TransactionsChart';
import RoleChart from '../components/RoleChart';
import QuickActions from '../components/QuickActions';
import BlockchainStatus from '../components/BlockchainStatus';
import DIDActivityFeed from '../components/dashboard/DIDActivityFeed';
import { mockData } from '../data/mockData';
import { ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-6">
      {/* Welcome Banner */}
      <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, transparent 45%, #bfdbfe 45%, #bfdbfe 55%, transparent 55%)', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, Rithvik! 👋</h2>
          <p className="text-lg font-medium text-blue-800 mb-2">You are logged in as Administrator</p>
          <p className="text-slate-600">Manage identities, control access, issue digital assets and view tamper-proof audit trails on the blockchain.</p>
        </div>
        <div className="hidden md:flex relative z-10 w-24 h-24 bg-white rounded-2xl shadow-sm border border-blue-100 items-center justify-center transform rotate-3">
          <ShieldCheck className="w-12 h-12 text-blue-600" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockData.kpi.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - 8/12 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[350px]">
            <TransactionsChart data={mockData.transactionsChart} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
            <RoleChart data={mockData.roleDistribution} total="1,248" />
            <QuickActions />
          </div>
        </div>

        {/* Right Column - 4/12 */}
        <div className="lg:col-span-4 h-[694px]">
          <ActivityList activities={mockData.activities} />
        </div>
      </div>

      {/* Live DID / Credential / Access blockchain activity */}
      <DIDActivityFeed />

      {/* Blockchain Status */}
      <BlockchainStatus data={mockData.blockchainStatus} />
    </div>
  );
}
