import { CheckCircle2, AlertCircle, ShieldCheck, User, XCircle } from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  status: 'Success' | 'Pending' | 'Failed';
  category: string;
  icon: React.ElementType;
}

const activities: Activity[] = [
  { id: 1,  title: 'User Login',                description: 'Successfully logged in to the platform',          date: '25 May 2024', time: '10:30 AM', status: 'Success', category: 'Auth',    icon: CheckCircle2 },
  { id: 2,  title: 'Access Request Submitted',  description: 'Requested access to "Project Atlas Repository"',  date: '25 May 2024', time: '10:15 AM', status: 'Pending', category: 'Access',  icon: AlertCircle },
  { id: 3,  title: 'Certificate NFT #1024',     description: 'Digital certificate issued to your identity',    date: '24 May 2024', time: '03:00 PM', status: 'Success', category: 'Identity', icon: ShieldCheck },
  { id: 4,  title: 'Role Assignment',           description: 'Role "Engineer" assigned to your identity',      date: '24 May 2024', time: '11:00 AM', status: 'Success', category: 'Identity', icon: User },
  { id: 5,  title: 'Access Granted',            description: 'Access granted to "R&D Documentation"',          date: '24 May 2024', time: '09:45 AM', status: 'Success', category: 'Access',  icon: CheckCircle2 },
  { id: 6,  title: 'Login Failed',              description: 'Failed login attempt from unknown IP',           date: '23 May 2024', time: '8:12 PM',  status: 'Failed',  category: 'Auth',    icon: XCircle },
  { id: 7,  title: 'Asset NFT-2048 Received',   description: 'Received digital asset from BEL Admin',          date: '22 May 2024', time: '02:30 PM', status: 'Success', category: 'Assets',  icon: CheckCircle2 },
  { id: 8,  title: 'Profile Updated',           description: 'Your profile information was updated',           date: '20 May 2024', time: '11:20 AM', status: 'Success', category: 'Profile', icon: User },
];

const statusStyle: Record<string, string> = {
  Success: 'bg-green-50 text-green-700 border border-green-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Failed:  'bg-red-50 text-red-700 border border-red-200',
};

const iconBg: Record<string, string> = {
  Success: 'bg-green-100 text-green-600',
  Pending: 'bg-amber-100 text-amber-600',
  Failed:  'bg-red-100 text-red-600',
};

// Group by date
const grouped = activities.reduce<Record<string, Activity[]>>((acc, act) => {
  if (!acc[act.date]) acc[act.date] = [];
  acc[act.date].push(act);
  return acc;
}, {});

export default function MyActivity() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Activity</h2>
          <p className="text-sm text-slate-500 mt-0.5">A full log of your account activity.</p>
        </div>
        <div className="flex gap-2 text-xs">
          {['All', 'Auth', 'Access', 'Identity', 'Assets'].map(f => (
            <button key={f} className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${f === 'All' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(grouped).map(([date, acts]) => (
        <div key={date} className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{date}</p>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-50">
            {acts.map((act) => (
              <div key={act.id} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg[act.status]}`}>
                  <act.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{act.title}</p>
                  <p className="text-xs text-slate-500 truncate">{act.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-right">
                  <span className="text-xs text-slate-400">{act.time}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[act.status]}`}>
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
