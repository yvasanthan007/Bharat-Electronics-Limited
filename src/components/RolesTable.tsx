import { MoreVertical, ShieldCheck, Users, Key } from 'lucide-react';
import { mockRoles, type Role } from '../data/mockData';

export default function RolesTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Roles ({mockRoles.length})</h2>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Users</th>
              <th className="px-5 py-3 font-medium">Permissions</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockRoles.map((role: Role) => (
              <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">{role.name}</div>
                  <div className="text-xs text-slate-500">{role.description}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    {role.usersCount} users
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Key className="w-4 h-4 text-slate-400" />
                    {role.permissionsCount}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {role.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View all roles →
        </button>
      </div>
    </div>
  );
}
