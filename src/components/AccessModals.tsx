import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { mockPermissions } from '../data/mockData';

interface AccessModalsProps {
  createRoleOpen: boolean;
  setCreateRoleOpen: (val: boolean) => void;
  assignAccessOpen: boolean;
  setAssignAccessOpen: (val: boolean) => void;
}

export default function AccessModals({
  createRoleOpen,
  setCreateRoleOpen,
  assignAccessOpen,
  setAssignAccessOpen
}: AccessModalsProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Role created successfully');
      setStep('success');
      setTimeout(() => {
        setCreateRoleOpen(false);
        setStep('form');
      }, 2000);
    }, 1200);
  };

  const handleAssignAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Access assigned successfully');
      setStep('success');
      setTimeout(() => {
        setAssignAccessOpen(false);
        setStep('form');
      }, 2000);
    }, 1200);
  };

  return (
    <>
      {/* Create Role Modal */}
      {createRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Create Role</h2>
              <button onClick={() => setCreateRoleOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {step === 'success' ? (
                <SuccessView message={successMsg} />
              ) : (
                <form id="create-role-form" onSubmit={handleCreateRole} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Role Name</label>
                    <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Compliance Officer" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Brief description of the role responsibilities" rows={2}></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Permissions</label>
                    <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                      {mockPermissions.map(p => (
                        <label key={p} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          {p}
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              )}
            </div>
            {step === 'form' && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setCreateRoleOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <SubmitButton isLoading={isLoading} label="Create Role" form="create-role-form" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Access Modal */}
      {assignAccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Assign Access</h2>
              <button onClick={() => setAssignAccessOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {step === 'success' ? (
                <SuccessView message={successMsg} />
              ) : (
                <form id="assign-access-form" onSubmit={handleAssignAccess} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">User</label>
                    <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Search by name or email" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Role</label>
                      <select required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                        <option value="">Select Role</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Manager">Manager</option>
                        <option value="Engineer">Engineer</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Resource (Optional)</label>
                      <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Project Atlas" />
                    </div>
                  </div>
                </form>
              )}
            </div>
            {step === 'form' && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setAssignAccessOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <SubmitButton isLoading={isLoading} label="Assign Access" form="assign-access-form" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SuccessView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{message}</h3>
    </div>
  );
}

function SubmitButton({ isLoading, label, form }: { isLoading: boolean, label: string, form: string }) {
  return (
    <button 
      type="submit" 
      form={form}
      disabled={isLoading}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Processing...
        </>
      ) : label}
    </button>
  );
}
