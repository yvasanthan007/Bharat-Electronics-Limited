
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RoleData {
  name: string;
  value: number;
  color: string;
}

interface RoleChartProps {
  data: RoleData[];
  total: string;
}

export default function RoleChart({ data, total }: RoleChartProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <h3 className="text-base font-semibold text-slate-900 mb-6 shrink-0">Role Distribution</h3>
      
      <div className="flex-1 flex items-center justify-between">
        <div className="relative h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0f172a' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900">{total}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</span>
          </div>
        </div>
        
        <div className="flex-1 ml-6 space-y-3 shrink-0">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-slate-600">{item.name}</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {Math.round((item.value / parseInt(total.replace(',', ''))) * 100)}% <span className="text-slate-400 font-normal">({item.value})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
