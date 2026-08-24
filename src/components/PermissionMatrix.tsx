import { Check, X } from 'lucide-react';
import { mockPermissions, mockPermissionMatrix, mockRoles } from '../data/mockData';

export default function PermissionMatrix() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Permission Matrix</h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View full matrix →
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="px-5 py-3 font-medium border-r border-slate-200 bg-slate-50/80 sticky left-0 z-10">Permission</th>
              {mockRoles.map(role => (
                <th key={role.name} className="px-3 py-3 font-medium text-center">{role.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockPermissions.map((permission, index) => (
              <tr key={permission} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-slate-700 border-r border-slate-100 bg-white sticky left-0 z-10">
                  {permission}
                </td>
                {mockRoles.map(role => {
                  const hasPermission = mockPermissionMatrix[role.name]?.[index];
                  return (
                    <td key={role.name} className="px-3 py-3 text-center">
                      <div className="flex justify-center">
                        {hasPermission ? (
                          <div className="w-6 h-6 rounded bg-green-50 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded bg-red-50 flex items-center justify-center">
                            <X className="w-4 h-4 text-red-500" />
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
