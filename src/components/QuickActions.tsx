
import { UserPlus, Key, Tag, ArrowRightLeft, FileText, ChevronRight } from 'lucide-react';

const actions = [
  { name: 'Create Identity', icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'Assign Role', icon: Key, color: 'text-orange-600', bg: 'bg-orange-50' },
  { name: 'Mint Asset (NFT)', icon: Tag, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Transfer Asset', icon: ArrowRightLeft, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'View Audit Trail', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' }
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 shrink-0">
        <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-slate-100">
          {actions.map((action, index) => (
            <button 
              key={index}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bg} ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  {action.name}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
