
import * as Icons from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  growth: string;
  description: string;
  icon: string;
}

export default function StatCard({ title, value, growth, description, icon }: StatCardProps) {
  const IconComponent = (Icons as any)[icon] || Icons.HelpCircle;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          {growth}
        </span>
        <span className="text-xs text-slate-500 truncate">{description}</span>
      </div>
    </div>
  );
}
