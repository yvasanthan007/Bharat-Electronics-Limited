import { useState } from 'react';
import { Clock, Calendar, Mail, Plus, Play } from 'lucide-react';
import type { ScheduledReport } from '../../services/reports';
import Badge from '../common/Badge';

interface ScheduledReportsSectionProps {
  schedules: ScheduledReport[];
  onToggleSchedule: (id: string) => void;
  onAddSchedule?: () => void;
}

export default function ScheduledReportsSection({
  schedules,
  onToggleSchedule,
  onAddSchedule,
}: ScheduledReportsSectionProps) {
  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  const handleTriggerInstant = (id: string) => {
    setRunningJobId(id);
    setTimeout(() => {
      setRunningJobId(null);
      alert(`Automated report job ${id} executed successfully and dispatched to configured recipients.`);
    }, 800);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Automated Recurring Schedules</h3>
            <Badge variant="purple" size="sm">
              {schedules.filter((s) => s.active).length} Active Jobs
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generate and email tamper-proof reports to defense stakeholders & auditors
          </p>
        </div>

        {onAddSchedule && (
          <button
            onClick={onAddSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Schedule
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className={`p-4 rounded-xl border transition-all ${
              schedule.active
                ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                : 'bg-slate-50/30 border-slate-200/60 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {schedule.id}
                  </span>
                  <Badge
                    variant={
                      schedule.frequency === 'Daily'
                        ? 'info'
                        : schedule.frequency === 'Weekly'
                        ? 'purple'
                        : 'indigo'
                    }
                    size="sm"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {schedule.frequency}
                  </Badge>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {schedule.format}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                  {schedule.title}
                </h4>
              </div>

              {/* Active Toggle */}
              <button
                type="button"
                onClick={() => onToggleSchedule(schedule.id)}
                title={schedule.active ? 'Disable Schedule' : 'Enable Schedule'}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  schedule.active ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ${
                    schedule.active ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Recipient tags */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[280px]">
                  {schedule.recipients.join(', ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Next: {schedule.nextRun}
                </span>

                <button
                  disabled={runningJobId === schedule.id}
                  onClick={() => handleTriggerInstant(schedule.id)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition-colors disabled:opacity-50"
                >
                  {runningJobId === schedule.id ? (
                    'Executing...'
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      Run Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
