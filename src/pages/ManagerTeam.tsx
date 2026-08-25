import { useState } from 'react';
import {
  Search,
  X,
  Mail,
  Shield,
  Database,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type { TeamMember } from '../data/managerMockData';

interface ManagerTeamProps {
  teamMembers: TeamMember[];
}

export default function ManagerTeam({ teamMembers }: ManagerTeamProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const filtered = teamMembers.filter((m: any) => {
    const matchesSearch =
      m.employee?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.employee?.department?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'All' || m.access_status === filter;
    return matchesSearch && matchesStatus;
  });

  const filters = ['All', 'Active', 'Inactive'] as const;

  return (
    <div className="max-w-[1600px] mx-auto pb-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">My Team</h2>
        <p className="text-slate-500 mt-1">Manage your team members and their access</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Employee</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Department</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Access Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Assets</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                        {member.employee?.avatar_url || member.employee?.full_name?.substring(0,2).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-slate-900">{member.employee?.full_name}</p>
                        <p className="text-xs text-slate-500">{member.employee?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-700">{member.employee?.department}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                      member.access_status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {member.access_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Shield className="w-4 h-4 text-slate-400" />
                      {member.assets || 0} Assets
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                    No team members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          Showing {filtered.length} of {teamMembers.length} team members
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedMember(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
              <h3 className="text-lg font-semibold text-slate-900">Employee Details</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-200">
                  {selectedMember.employee?.avatar_url || selectedMember.employee?.full_name?.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedMember.employee?.full_name}</h3>
                  <p className="text-sm text-slate-500">{selectedMember.employee?.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Email</span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedMember.employee?.email}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Status</span>
                  <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {selectedMember.access_status}
                  </span>
                </div>
              </div>
              
              {/* Permissions */}
              <div>
                <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Permissions
                </h5>
                <div className="space-y-1.5">
                  {selectedMember.permissions?.map((perm: any, idx: any) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>

              {/* Assets */}
              <div>
                <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Assets ({selectedMember.assets})
                </h5>
                <div className="text-sm text-slate-500">
                  {selectedMember.assets} digital assets assigned
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Activity
                </h5>
                <div className="space-y-1.5">
                  {selectedMember.recentActivity?.map((act: any, idx: any) => (
                    <div key={idx} className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                      {act}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
