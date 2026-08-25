import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  Database,
  Calendar,
} from 'lucide-react';
import ManagerStatCard from '../components/ManagerStatCard';
import AccessRequestCard from '../components/AccessRequestCard';
import ActivityTimeline from '../components/ActivityTimeline';
import TeamOverview from '../components/TeamOverview';
import type { AccessRequest, ActivityItem, TeamMember, TeamAsset } from '../data/managerMockData';

interface ManagerDashboardProps {
  accessRequests: AccessRequest[];
  activities: ActivityItem[];
  teamMembers: TeamMember[];
  teamAssets: TeamAsset[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onExport: () => void;
}

export default function ManagerDashboard({
  accessRequests,
  activities,
  teamMembers,
  onApprove,
  onReject,
  onExport,
}: ManagerDashboardProps) {
  const navigate = useNavigate();
  const pendingCount = accessRequests.filter((r) => r.status === 'Pending').length;
  const approvedCount = accessRequests.filter((r) => r.status === 'Approved').length;
  const pendingRequests = accessRequests.filter((r) => r.status === 'Pending').slice(0, 3);
  const todayActivities = activities.filter((a) => a.section === 'Today');
  const activeMembers = teamMembers.filter((m) => m.accessStatus === 'Active').length;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-6">
      {/* Welcome Banner + Date */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="bg-blue-50/50 rounded-2xl p-6 sm:p-8 border border-blue-100 flex-1 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, transparent 45%, #bfdbfe 45%, #bfdbfe 55%, transparent 55%)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Welcome back, Neha! 👋
            </h2>
            <p className="text-slate-600">
              Review requests, manage your team's access and assets.
            </p>
          </div>
        </div>

        {/* Date Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">25 May 2024</p>
            <p className="text-xs text-slate-500">10:30 AM IST</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ManagerStatCard
          title="My Team Members"
          value={48}
          description="Total team members"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
          link="/manager/team"
        />
        <ManagerStatCard
          title="Pending Requests"
          value={pendingCount}
          description="Awaiting your approval"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50"
          link="/manager/access-requests"
        />
        <ManagerStatCard
          title="Approved Requests"
          value={approvedCount}
          description="This month"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          link="/manager/access-requests"
        />
        <ManagerStatCard
          title="Team Assets"
          value={82}
          description="Total assets"
          icon={<Database className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-50"
          link="/manager/assets"
        />
      </div>

      {/* Pending Requests + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Access Requests */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Pending Access Requests</h3>
              <button
                onClick={() => navigate('/manager/access-requests')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View All
              </button>
            </div>
            <div className="p-2">
              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No pending requests
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <AccessRequestCard
                    key={req.id}
                    request={req}
                    onApprove={onApprove}
                    onReject={onReject}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Team Activity */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-semibold text-slate-900">Team Activity (Today)</h3>
              <button
                onClick={() => navigate('/manager/activity')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View All
              </button>
            </div>
            <div className="p-2 flex-1 overflow-y-auto">
              <ActivityTimeline activities={todayActivities} limit={4} />
            </div>
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <TeamOverview
        activeMembers={activeMembers}
        totalMembers={teamMembers.length}
        activeAccess={76}
        assetsOwned={82}
        requestsThisMonth={68}
        onExport={onExport}
      />
    </div>
  );
}
