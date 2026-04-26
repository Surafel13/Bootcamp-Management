import { useMemo } from 'react';

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

interface Props {
  data: AttendanceRecord[];
  weeks?: number;
}

const STATUS_COLORS = {
  present: 'bg-success',
  late: 'bg-warning',
  excused: 'bg-info',
  absent: 'bg-danger',
  none: 'bg-bg-hover',
};

const STATUS_INTENSITY = {
  present: ['bg-success/20', 'bg-success/40', 'bg-success/60', 'bg-success/80', 'bg-success'],
  late: ['bg-warning/20', 'bg-warning/40', 'bg-warning/60', 'bg-warning/80', 'bg-warning'],
  excused: ['bg-info/20', 'bg-info/40', 'bg-info/60', 'bg-info/80', 'bg-info'],
  absent: ['bg-danger/20', 'bg-danger/40', 'bg-danger/60', 'bg-danger/80', 'bg-danger'],
  none: 'bg-bg-hover',
};

export default function AttendanceHeatmap({ data, weeks = 26 }: Props) {
  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * 7));

    // Create a map of dates to attendance records
    const dateMap = new Map<string, AttendanceRecord>();
    data.forEach(record => {
      const date = new Date(record.date).toISOString().split('T')[0];
      dateMap.set(date, record);
    });

    // Generate grid data
    const grid: Array<{ date: Date; record: AttendanceRecord | null }> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      grid.push({
        date: new Date(currentDate),
        record: dateMap.get(dateStr) || null,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Organize into weeks (Sunday to Saturday)
    const weekGrid: Array<Array<{ date: Date; record: AttendanceRecord | null }>> = [];
    let currentWeek: Array<{ date: Date; record: AttendanceRecord | null }> = [];

    // Pad the beginning to start on Sunday
    const firstDayOfWeek = grid[0].date.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: new Date(0), record: null });
    }

    grid.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weekGrid.push(currentWeek);
        currentWeek = [];
      }
    });

    // Pad the end to complete the week
    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push({ date: new Date(0), record: null });
    }
    if (currentWeek.length === 7) {
      weekGrid.push(currentWeek);
    }

    return weekGrid;
  }, [data, weeks]);

  const getColor = (record: AttendanceRecord | null) => {
    if (!record) return STATUS_INTENSITY.none;
    return STATUS_COLORS[record.status];
  };

  const getTooltip = (day: { date: Date; record: AttendanceRecord | null }) => {
    if (day.date.getTime() === 0) return '';
    const dateStr = day.date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    if (!day.record) return `${dateStr}: No session`;
    return `${dateStr}: ${day.record.status.charAt(0).toUpperCase() + day.record.status.slice(1)}`;
  };

  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; col: number }> = [];
    let lastMonth = -1;

    heatmapData.forEach((week, weekIndex) => {
      const firstValidDay = week.find(d => d.date.getTime() !== 0);
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth();
        if (month !== lastMonth) {
          labels.push({
            month: firstValidDay.date.toLocaleDateString(undefined, { month: 'short' }),
            col: weekIndex
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [heatmapData]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-[0.65rem] text-text-muted pt-4">
          {dayLabels.map((day, i) => (
            <div key={i} className="h-3 flex items-center" style={{ lineHeight: '12px' }}>
              {i % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex flex-col gap-1">
            {/* Month labels */}
            <div className="flex gap-1 text-[0.65rem] text-text-muted h-4 relative">
              {monthLabels.map((label, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ left: `${label.col * 14}px` }}
                >
                  {label.month}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-1">
              {heatmapData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${
                        day.date.getTime() === 0 ? 'opacity-0' : getColor(day.record)
                      } hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                      title={getTooltip(day)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-bg-hover" />
          <div className="w-3 h-3 rounded-sm bg-success/20" />
          <div className="w-3 h-3 rounded-sm bg-success/40" />
          <div className="w-3 h-3 rounded-sm bg-success/60" />
          <div className="w-3 h-3 rounded-sm bg-success" />
        </div>
        <span>More</span>
        <div className="flex gap-2 ml-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-success" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-warning" />
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-danger" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-info" />
            <span>Excused</span>
          </div>
        </div>
      </div>
    </div>
  );
}