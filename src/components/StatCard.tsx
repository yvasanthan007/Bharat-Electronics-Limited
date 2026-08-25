import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string;
  growth: string;
  description: string;
  icon: string;
}

const routeMap: Record<string, string> = {
  'Total Identities': '/identities',
  'Active Roles': '/access-control',
  'Digital Assets (NFTs)': '/digital-assets',
  'Transactions': '/transactions',
};

export default function StatCard({ title, value, growth, description, icon }: StatCardProps) {
  const IconComponent = (Icons as any)[icon] || Icons.HelpCircle;
  const navigate = useNavigate();
  const targetPath = routeMap[title] || '/bel';

  return (
    <div
      onClick={() => navigate(targetPath)}
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold text-slate-500 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-blue-600 transition-colors shadow-2xs">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          {growth}
        </span>
        <span className="text-xs text-slate-400 group-hover:text-slate-600 truncate font-medium">
          {description} &rarr;
        </span>
      </div>
    </div>
  );
}
