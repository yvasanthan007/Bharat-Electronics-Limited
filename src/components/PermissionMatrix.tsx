import { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { mockPermissions, mockPermissionMatrix, mockRoles } from '../data/mockData';

interface PermissionMatrixProps {
  onOpenFullMatrix?: () => void;
  searchTerm?: string;
}

export default function PermissionMatrix({ onOpenFullMatrix, searchTerm = '' }: PermissionMatrixProps) {
  const [matrixState, setMatrixState] = useState<Record<string, boolean[]>>(() => ({ ...mockPermissionMatrix }));

  const toggleCell = (roleName: string, index: number) => {
    setMatrixState(prev => {
      const currentList = prev[roleName] ? [...prev[roleName]] : [];
      currentList[index] = !currentList[index];
      return {
        ...prev,
        [roleName]: currentList
      };
    });
  };

  const filteredPermissions = mockPermissions.filter(p =>
    !searchTerm.trim() || p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Permission Matrix</h2>
          <p className="text-xs text-slate-500">Live role-to-resource authorization mapping</p>
        </div>
        <button
          onClick={onOpenFullMatrix}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          View full matrix →
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[600px] text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
              <th className="px-5 py-3.5 border-r border-slate-100 bg-slate-50/80 sticky left-0 z-10">Permission</th>
              {mockRoles.map(role => (
                <th key={role.name} className="px-3 py-3.5 text-center font-bold text-slate-800">{role.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPermissions.map((permission) => {
              const originalIndex = mockPermissions.indexOf(permission);
              return (
                <tr key={permission} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-700 border-r border-slate-100 bg-white sticky left-0 z-10">
                    {permission}
                  </td>
                  {mockRoles.map(role => {
                    const hasPermission = matrixState[role.name]?.[originalIndex] ?? false;
                    return (
                      <td key={role.name} className="px-3 py-3 text-center">
                        <button
                          onClick={() => toggleCell(role.name, originalIndex)}
                          title={`Click to ${hasPermission ? 'Revoke' : 'Grant'} ${permission} for ${role.name}`}
                          className={`w-6 h-6 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            hasPermission
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-rose-50 text-rose-400 hover:bg-rose-100'
                          }`}
                        >
                          {hasPermission ? (
                            <Check className="w-3.5 h-3.5 font-bold" />
                          ) : (
                            <X className="w-3.5 h-3.5 font-bold" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredPermissions.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No permissions matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
