import { useMemo } from 'react';
import { Users, Calendar, CheckCircle, Shield, TrendingUp } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardStats } from '../../features/reports/reportsApi';
import { useDivisions } from '../../features/divisions/divisionApi';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function OverviewPage() {
    const { data: statsData, isLoading: statsLoading } = useDashboardStats();
    const { data: divisions = [], isLoading: divisionsLoading } = useDivisions();

    const overview = statsData?.overview || {};

    // Calculate staff count from divisions
    const activeStaff = useMemo(() => {
        if (!divisions) return 0;
        // Count unique division admins and instructors
        const staffSet = new Set();
        divisions.forEach((div: any) => {
            if (div.admin) staffSet.add(div.admin._id || div.admin);
        });
        return staffSet.size;
    }, [divisions]);

    // Prepare attendance by division data
    const attendanceByDivision = useMemo(() => {
        if (!statsData?.divisionStats) return [];

        return statsData.divisionStats.map((stat: any) => ({
            name: stat.division?.name || 'Unknown',
            attendance: stat.averageAttendance || 0,
        }));
    }, [statsData]);

    // Prepare student distribution data
    const studentDistribution = useMemo(() => {
        if (!statsData?.divisionStats) return [];

        return statsData.divisionStats.map((stat: any) => ({
            name: stat.division?.name || 'Unknown',
            value: stat.totalStudents || 0,
        }));
    }, [statsData]);

    // Division performance data
    const divisionPerformance = useMemo(() => {
        if (!statsData?.divisionStats) return [];

        return statsData.divisionStats.map((stat: any) => ({
            division: stat.division,
            students: stat.totalStudents || 0,
            sessions: stat.totalSessions || 0,
            avgAttendance: stat.averageAttendance || 0,
            status: stat.division?.status || 'active',
        }));
    }, [statsData]);

    if (statsLoading || divisionsLoading) {
        return <div className="py-16 text-center text-text-muted text-sm">Loading overview…</div>;
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Students */}
                <div className="card">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users size={24} className="text-primary" />
                        </div>
                    </div>
                    <div className="text-sm text-text-muted mb-1">Total Students</div>
                    <div className="text-3xl font-black text-text-primary mb-2">{overview.totalStudents || 0}</div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-success">
                        <TrendingUp size={14} />
                        +12% from last month
                    </div>
                </div>

                {/* Total Sessions */}
                <div className="card">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <Calendar size={24} className="text-success" />
                        </div>
                    </div>
                    <div className="text-sm text-text-muted mb-1">Total Sessions</div>
                    <div className="text-3xl font-black text-text-primary mb-2">{overview.totalSessions || 0}</div>
                    <div className="text-xs font-semibold text-info">Baseline maintained</div>
                </div>

                {/* Avg Attendance */}
                <div className="card">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                            <CheckCircle size={24} className="text-info" />
                        </div>
                    </div>
                    <div className="text-sm text-text-muted mb-1">Avg Attendance</div>
                    <div className="text-3xl font-black text-text-primary mb-2">{overview.avgAttendance || '0%'}</div>
                    <div className="text-xs font-semibold text-info">Baseline maintained</div>
                </div>

                {/* Active Staff */}
                <div className="card">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Shield size={24} className="text-warning" />
                        </div>
                    </div>
                    <div className="text-sm text-text-muted mb-1">Active Staff</div>
                    <div className="text-3xl font-black text-text-primary mb-2">{activeStaff}</div>
                    <div className="text-xs font-semibold text-info">Baseline maintained</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Attendance by Division */}
                <div className="card">
                    <h3 className="font-bold text-text-primary mb-4">Attendance by Division</h3>
                    {attendanceByDivision.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={attendanceByDivision}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                    formatter={(value: any) => [`${value}%`, 'Attendance']}
                                />
                                <Bar dataKey="attendance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-text-muted text-sm">
                            No attendance data available
                        </div>
                    )}
                </div>

                {/* Student Distribution */}
                <div className="card">
                    <h3 className="font-bold text-text-primary mb-4">Student Distribution</h3>
                    {studentDistribution.length > 0 && studentDistribution.some((d: any) => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={studentDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {studentDistribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                    formatter={(value: any) => [`${value} students`, 'Count']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl font-black text-text-primary mb-2">
                                    {overview.totalStudents || 0}
                                </div>
                                <div className="text-sm text-text-muted">STUDENTS</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Division Performance Overview */}
            <div className="card">
                <h3 className="font-bold text-text-primary mb-4">Division Performance Overview</h3>
                {divisionPerformance.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Division
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Students
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Sessions
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Avg Attendance
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {divisionPerformance.map((item: any, index: number) => (
                                    <tr key={index} className="border-b border-border hover:bg-bg-hover transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="font-semibold text-sm text-text-primary">
                                                {item.division?.name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-text-secondary">{item.students}</td>
                                        <td className="py-4 px-4 text-sm text-text-secondary">{item.sessions}</td>
                                        <td className="py-4 px-4">
                                            <span className={`text-sm font-semibold ${item.avgAttendance >= 80 ? 'text-success' :
                                                    item.avgAttendance >= 60 ? 'text-warning' :
                                                        'text-danger'
                                                }`}>
                                                {item.avgAttendance}%
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-semibold ${item.status === 'active' ? 'bg-success/10 text-success' :
                                                    'bg-text-muted/10 text-text-muted'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-8 text-center text-text-muted text-sm">
                        No division data available
                    </div>
                )}
            </div>
        </div>
    );
}