import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface ManagerStatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  iconBg: string;
  link: string;
}

export default function ManagerStatCard({
  title,
  value,
  description,
  icon,
  iconBg,
  link,
}: ManagerStatCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(link)}
      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 text-left w-full group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </button>
  );
}
