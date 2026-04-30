import { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { useMyAttendance } from '../../features/bootcamps/bootcampsApi';
import AttendanceHeatmap from '../../components/shared/AttendanceHeatmap';

const STATUS_STYLES = {
  present: 'bg-success/10 text-success',
  absent: 'bg-danger/10 text-danger',
  late: 'bg-warning/10 text-warning',
  excused: 'bg-info/10 text-info',
};

const STATUS_ICONS = {
  present: CheckCircle,
  absent: XCircle,
  late: Clock,
  excused: AlertCircle,
};

export default function AttendancePage() {
  const { data, isLoading } = useMyAttendance();
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'excused'>('all');

  if (isLoading) {
    return <div className="py-16 text-center text-text-muted text-sm">Loading attendance records…</div>;
  }

  const attendance = data?.attendance || [];
  const stats = data?.stats || { total: 0, present: 0, absent: 0, late: 0, excused: 0 };

  const filteredAttendance = filter === 'all'
    ? attendance
    : attendance.filter((a: any) => a.status === filter);

  const attendanceRate = stats.total > 0
    ? Math.round(((stats.present + stats.late) / stats.total) * 100)
    : 0;

  // Transform data for heatmap
  const heatmapData = attendance.map((record: any) => ({
    date: record.session.startTime,
    status: record.status
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* Stats Overview */}
      <div className="card">
        <h2 className="text-lg font-black text-text-primary mb-4">Attendance Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-bg-hover rounded-lg p-3">
            <div className="text-xs text-text-muted mb-1">Total Sessions</div>
            <div className="text-2xl font-black text-text-primary">{stats.total}</div>
          </div>
          <div className="bg-success/10 rounded-lg p-3">
            <div className="text-xs text-success mb-1">Present</div>
            <div className="text-2xl font-black text-success">{stats.present}</div>
          </div>
          <div className="bg-danger/10 rounded-lg p-3">
            <div className="text-xs text-danger mb-1">Absent</div>
            <div className="text-2xl font-black text-danger">{stats.absent}</div>
          </div>
          <div className="bg-warning/10 rounded-lg p-3">
            <div className="text-xs text-warning mb-1">Late</div>
            <div className="text-2xl font-black text-warning">{stats.late}</div>
          </div>
          <div className="bg-info/10 rounded-lg p-3">
            <div className="text-xs text-info mb-1">Excused</div>
            <div className="text-2xl font-black text-info">{stats.excused}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-3xl font-black text-primary">{attendanceRate}%</div>
          <div className="text-sm text-text-secondary">Overall Attendance Rate</div>
        </div>
      </div>

      {/* Attendance Heatmap */}
      <div className="card">
        <h2 className="text-lg font-black text-text-primary mb-4">Attendance Activity</h2>
        <p className="text-sm text-text-secondary mb-4">Your attendance pattern over the last 26 weeks</p>
        <AttendanceHeatmap data={heatmapData} weeks={26} />
      </div>

      {/* Filter & Records */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text-primary">Attendance Records</h3>
          <select
            className="form-input text-sm"
            style={{ width: 'auto', minWidth: 140 }}
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
          >
            <option value="all">All ({attendance.length})</option>
            <option value="present">Present ({stats.present})</option>
            <option value="absent">Absent ({stats.absent})</option>
            <option value="late">Late ({stats.late})</option>
            <option value="excused">Excused ({stats.excused})</option>
          </select>
        </div>

        {filteredAttendance.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-sm">
            {filter === 'all' ? 'No attendance records yet.' : `No ${filter} records.`}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredAttendance.map((record: any) => {
              const Icon = STATUS_ICONS[record.status as keyof typeof STATUS_ICONS];
              return (
                <div key={record._id} className="flex items-start gap-3 p-3 bg-bg-hover rounded-lg hover:border-primary/20 border border-transparent transition-all">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${STATUS_STYLES[record.status as keyof typeof STATUS_STYLES]}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-text-primary">{record.session.title}</span>
                      <span className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_STYLES[record.status as keyof typeof STATUS_STYLES]}`}>
                        {record.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(record.session.startTime).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {record.markedAt && (
                        <span>
                          Marked: {new Date(record.markedAt).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      )}
                    </div>
                    {record.note && (
                      <p className="text-xs text-text-secondary mt-2 italic">Note: {record.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}