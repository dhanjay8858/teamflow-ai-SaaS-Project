import React, { useState, useEffect } from 'react';
import { useRichTasks } from '../hooks/useRichTasks';
import { Clock, Save, RefreshCw } from 'lucide-react';

interface TimeTrackingWidgetProps {
  taskId: string;
  estimateMinutes: number;
  spentMinutes: number;
}

export const TimeTrackingWidget: React.FC<TimeTrackingWidgetProps> = ({
  taskId,
  estimateMinutes,
  spentMinutes,
}) => {
  const { updateTimeTracking, isUpdatingTime } = useRichTasks();

  const [estimateHours, setEstimateHours] = useState(Math.round(estimateMinutes / 60));
  const [spentHours, setSpentHours] = useState(Math.round(spentMinutes / 60));

  useEffect(() => {
    setEstimateHours(Math.round(estimateMinutes / 60));
    setSpentHours(Math.round(spentMinutes / 60));
  }, [estimateMinutes, spentMinutes]);

  const totalEstimateMin = estimateHours * 60;
  const totalSpentMin = spentHours * 60;
  const remainingMin = Math.max(0, totalEstimateMin - totalSpentMin);
  const remainingHours = (remainingMin / 60).toFixed(1);

  const percentSpent = totalEstimateMin > 0 ? Math.min(100, Math.round((totalSpentMin / totalEstimateMin) * 100)) : 0;

  const handleSave = async () => {
    try {
      await updateTimeTracking({
        taskId,
        estimateMinutes: totalEstimateMin,
        spentMinutes: totalSpentMin,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to update time tracking');
    }
  };

  return (
    <div className="space-y-3 text-xs p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-sky-400" />
          <span>Time Tracking</span>
        </h4>
        <span className="text-[11px] text-zinc-400 font-mono">
          Remaining: <strong className="text-emerald-400">{remainingHours}h</strong>
        </span>
      </div>

      {/* Time Inputs Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 font-medium">Estimated (Hours)</label>
          <input
            type="number"
            min="0"
            value={estimateHours}
            onChange={(e) => setEstimateHours(Number(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 font-medium">Spent Time (Hours)</label>
          <input
            type="number"
            min="0"
            value={spentHours}
            onChange={(e) => setSpentHours(Number(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Progress Bar */}
      {totalEstimateMin > 0 && (
        <div className="space-y-1 pt-1">
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className={`h-full transition-all duration-300 ${
                percentSpent >= 100 ? 'bg-rose-500' : 'bg-sky-500'
              }`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 text-right font-mono">{percentSpent}% of estimate spent</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isUpdatingTime}
        className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-zinc-800 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
      >
        {isUpdatingTime ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        <span>Save Time Tracking</span>
      </button>
    </div>
  );
};
