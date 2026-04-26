import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { selectActiveDivisionId } from '../../features/auth/authSlice';
import { useBootcamps, useAllAttendance } from '../../features/bootcamps/bootcampsApi';
import { useAttendanceReport } from '../../features/reports/reportsApi';
import AttendanceHeatmap from '../../components/shared/AttendanceHeatmap';

export default function AttendanceDashboardPage() {
  const divisionId = useSelector(selectActiveDivisionId);
  const { data: bootcamps = [] } = useBootcamps(divisionId);
  const [selectedBootcampId, setSelectedBootcampId] = useState<string>('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Fetch attendance report with filters
  const { data: reportData, isLoading: reportLoading } = useAttendanceReport({
    division: divisionId || undefined,
    bootcamp: selectedBootcampId || undefined,
    from: dateRange.from || undefined,
    to: dateRange.to || undefined,
  });

  // Fetch all attendance records for recent activity
  const { data: attendanceData } = useAllAttendance({
    division: divisionId || undefined,
    bootcamp: selectedBootcampId || undefined,
    fromDate: dateRange.from || undefined,
    toDate: dateRange.to || undefined,
  });

  // Extract stats from report
  const stats = useMemo(() => {
    if (!reportData) {
      return {
        totalSessions: 0,
        totalStudents: 0,
        averageAttendance: 0,
        trend: '0%'
      };
    }

    return {
      totalSessions: reportData.totalSessions || 0,
      totalStudents: reportData.totalStudents || 0,
      averageAttendance: reportData.averageAttendance || 0,
      trend: reportData.trend || '0%'
    };
  }, [reportData]);

  // Transform attendance records for heatmap
  const heatmapData = useMemo(() => {
    if (!attendanceData?.attendance) return [];

    return attendanceData.attendance.map((record: any) => ({
      date: record.markedAt || record.createdAt,
      status: record.status as 'present' | 'late' | 'absent' | 'excused'
    }));
  }, [attendanceData]);

  // Get bootcamp breakdown data
  const bootcampBreakdown = useMemo(() => {
    if (!reportData?.bootcampStats) return [];

    return reportData.bootcampStats.map((stat: any) => ({
      bootcamp: stat.bootcamp,
      sessions: stat.totalSessions || 0,
      students: stat.totalStudents || 0,
      avgAttendance: stat.averageAttendance || 0,
      status: stat.bootcamp?.status || 'unknown'
    }));
  }, [reportData]);

  // Get recent attendance activity
  const recentActivity = useMemo(() => {
    if (!attendanceData?.attendance) return [];

    // Group by session and calculate attendance percentage
    const sessionMap = new Map();

    attendanceData.attendance.forEach((record: any) => {
      const sessionId = record.session?._id;
      if (!sessionId) return;

      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          session: record.session,
          total: 0,
          present: 0,
          timestamp: record.markedAt || record.createdAt
        });
      }

      const sessionData = sessionMap.get(sessionId);
      sessionData.total++;
      if (record.status === 'present' || record.status === 'late') {
        sessionData.present++;
      }
    });

    // Convert to array and sort by timestamp
    return Array.from(sessionMap.values())
      .map(data => ({
        sessionTitle: data.session?.title || 'Unknown Session',
        bootcampName: data.session?.bootcamp?.name || 'Unknown Bootcamp',
        timestamp: data.timestamp,
        attendanceRate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [attendanceData]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="card bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BarChart3 size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black text-text-primary mb-1">Attendance Analytics</h2>
            <p className="text-sm text-text-secondary">
              Comprehensive attendance tracking and analytics for your division
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="font-bold text-text-primary mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="form-group">
            <label>Bootcamp</label>
            <select
              className="form-input"
              value={selectedBootcampId}
              onChange={e => setSelectedBootcampId(e.target.value)}
            >
              <option value="">All Bootcamps</option>
              {bootcamps.map((bootcamp: any) => (
                <option key={bootcamp._id} value={bootcamp._id}>
                  {bootcamp.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>From Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.from}
              onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.to}
              onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {reportLoading ? (
        <div className="py-16 text-center text-text-muted text-sm">Loading attendance data…</div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-xs text-text-muted">Total Sessions</div>
                  <div className="text-2xl font-black text-text-primary">{stats.totalSessions}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Users size={20} className="text-success" />
                </div>
                <div>
                  <div className="text-xs text-text-muted">Total Students</div>
                  <div className="text-2xl font-black text-text-primary">{stats.totalStudents}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <BarChart3 size={20} className="text-info" />
                </div>
                <div>
                  <div className="text-xs text-text-muted">Avg Attendance</div>
                  <div className="text-2xl font-black text-text-primary">{stats.averageAttendance}%</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-warning" />
                </div>
                <div>
                  <div className="text-xs text-text-muted">Trend</div>
                  <div className={`text-2xl font-black ${stats.trend.startsWith('+') ? 'text-success' : stats.trend.startsWith('-') ? 'text-danger' : 'text-text-primary'}`}>
                    {stats.trend}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Heatmap */}
          <div className="card">
            <h3 className="font-bold text-text-primary mb-3">Attendance Activity</h3>
            <p className="text-sm text-text-secondary mb-4">
              Division-wide attendance pattern over the last 26 weeks
            </p>
            {heatmapData.length > 0 ? (
              <AttendanceHeatmap data={heatmapData} weeks={26} />
            ) : (
              <div className="py-8 text-center text-text-muted text-sm">
                No attendance data available for the selected period
              </div>
            )}
          </div>

          {/* Bootcamp Breakdown */}
          <div className="card">
            <h3 className="font-bold text-text-primary mb-4">Bootcamp Breakdown</h3>
            <div className="overflow-x-auto">
              {bootcampBreakdown.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-bold text-text-muted border-b border-border">
                      <th className="py-2 pr-4">Bootcamp</th>
                      <th className="py-2 pr-4">Sessions</th>
                      <th className="py-2 pr-4">Students</th>
                      <th className="py-2 pr-4">Avg Attendance</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bootcampBreakdown.map((item: any) => (
                      <tr key={item.bootcamp?._id} className="border-b border-border/50 hover:bg-bg-hover transition-colors">
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-sm text-text-primary">{item.bootcamp?.name || 'Unknown'}</div>
                          <div className="text-xs text-text-muted">{item.bootcamp?.description || ''}</div>
                        </td>
                        <td className="py-3 pr-4 text-sm text-text-secondary">{item.sessions}</td>
                        <td className="py-3 pr-4 text-sm text-text-secondary">{item.students}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-sm font-semibold ${
                            item.avgAttendance >= 80 ? 'text-success' :
                            item.avgAttendance >= 60 ? 'text-warning' :
                            'text-danger'
                          }`}>
                            {item.avgAttendance}%
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                            item.status === 'ongoing' ? 'bg-success/10 text-success' :
                            item.status === 'upcoming' ? 'bg-primary/10 text-primary' :
                            'bg-text-muted/10 text-text-muted'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-text-muted text-sm">
                  No bootcamp data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="font-bold text-text-primary mb-4">Recent Attendance Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="flex flex-col gap-2">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-3 bg-bg-hover rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-text-primary">Session: {activity.sessionTitle}</div>
                        <div className="text-xs text-text-muted">{activity.bootcampName} • {formatTimeAgo(activity.timestamp)}</div>
                      </div>
                      <div className={`text-sm font-bold ${
                        activity.attendanceRate >= 80 ? 'text-success' :
                        activity.attendanceRate >= 60 ? 'text-warning' :
                        'text-danger'
                      }`}>
                        {activity.attendanceRate}% attendance
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-text-muted text-sm">
                No recent attendance activity
              </div>
            )}
          </div>

          {/* Insights */}
          {reportData?.insights && reportData.insights.length > 0 && (
            <div className="card bg-info/5 border-info/20">
              <h3 className="font-bold text-text-primary mb-3">Insights & Recommendations</h3>
              <ul className="text-sm text-text-secondary space-y-2 list-disc list-inside">
                {reportData.insights.map((insight: string, index: number) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}