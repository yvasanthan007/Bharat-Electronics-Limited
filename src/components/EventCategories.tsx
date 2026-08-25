import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { eventCategoryData } from '../data/mockAuditData';

export default function EventCategories() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-6">Events by Category</h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-44 h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={eventCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={2}
                stroke="#fff"
              >
                {eventCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, '']}
                contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900">12,456</span>
            <span className="text-xs text-slate-500">Total</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5 w-full">
          {eventCategoryData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
              <span className="text-xs font-medium text-slate-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
