import { Users, Calendar, CheckCircle, Shield, TrendingUp, BookOpen, ClipboardList, Star } from 'lucide-react';
import { useDashboardStats } from '../../features/reports/reportsApi';

export default function AnalyticsPage() {
    const { data: statsData, isLoading } = useDashboardStats();

    if (isLoading) {
        return <div className="py-16 text-center text-text-muted text-sm">Loading analytics…</div>;
    }

    const overview = statsData?.overview || {};
    const recentActivity = statsData?.recentActivity || {};

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
                    <div className="text-xs font-semibold text-info">Active enrollments</div>
                </div>

                {/* Total Bootcamps */}
                <div className="card">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <BookOpen size={24} className="text-success" />
                        </div>
                    </div>
                    <div className="text-sm text-text-muted mb-1">Total Bootcamps</div>
                    <div className="text-3xl font-black text-text-primary mb-2">{overview.totalBootcamps || 0}</div>
                    <div className="text-xs font-semibold text-info">Across all divisions</div>
                </div>

                {/* Total Sessions */}
                <div className="card">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                            <Calendar size={24} className="text-info" />
                        </div>
                    </div>
                    <div className="text-sm text-text-muted mb-1">Total Sessions</div>
                    <div className="text-3xl font-black text-text-primary mb-2">{overview.totalSessions || 0}</div>
                    <div className="text-xs font-semibold text-info">Scheduled sessions</div>
                </div>

                {/* Avg Attendance */}
                <div className="card">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <CheckCircle size={24} className="text-warning" />
                        </div>
                    </div>
                    <div className="text-sm text-text-muted mb-1">Avg Attendance</div>
                    <div className="text-3xl font-black text-text-primary mb-2">{overview.avgAttendance || '0%'}</div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${parseInt(overview.avgAttendance) >= 80 ? 'text-success' : 'text-warning'
                        }`}>
                        {parseInt(overview.avgAttendance) >= 80 ? <TrendingUp size={14} /> : null}
                        {parseInt(overview.avgAttendance) >= 80 ? 'Good performance' : 'Needs improvement'}
                    </div>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
                            <ClipboardList size={18} className="text-danger" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-text-primary">{overview.pendingSubmissions || 0}</div>
                            <div className="text-xs text-text-muted">Pending Submissions</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ClipboardList size={18} className="text-primary" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-text-primary">{overview.activeTasks || 0}</div>
                            <div className="text-xs text-text-muted">Active Tasks</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Star size={18} className="text-warning" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-text-primary">{overview.avgRating || '0.0'}</div>
                            <div className="text-xs text-text-muted">Average Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Submissions */}
                <div className="card">
                    <h3 className="font-bold text-text-primary mb-4">Recent Submissions</h3>
                    <div className="flex flex-col gap-2">
                        {recentActivity.submissions?.length === 0 || !recentActivity.submissions ? (
                            <div className="py-8 text-center text-text-muted text-sm">
                                <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                                No recent submissions
                            </div>
                        ) : (
                            recentActivity.submissions.slice(0, 5).map((submission: any) => (
                                <div key={submission._id} className="p-3 bg-bg-hover rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm text-text-primary">
                                                {submission.student?.name || 'Unknown Student'}
                                            </div>
                                            <div className="text-xs text-text-secondary mt-1">
                                                {submission.task?.title || 'Task'}
                                            </div>
                                        </div>
                                        <div className="text-xs text-text-muted">
                                            {new Date(submission.submittedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Feedback */}
                <div className="card">
                    <h3 className="font-bold text-text-primary mb-4">Recent Feedback</h3>
                    <div className="flex flex-col gap-2">
                        {recentActivity.feedback?.length === 0 || !recentActivity.feedback ? (
                            <div className="py-8 text-center text-text-muted text-sm">
                                <Star size={32} className="mx-auto mb-2 opacity-30" />
                                No recent feedback
                            </div>
                        ) : (
                            recentActivity.feedback.slice(0, 5).map((feedback: any) => (
                                <div key={feedback._id} className="p-3 bg-bg-hover rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm text-text-primary">
                                                {feedback.student?.name || 'Unknown Student'}
                                            </div>
                                            <div className="text-xs text-text-secondary mt-1">
                                                {feedback.session?.title || 'Session'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star size={12} className="text-warning fill-warning" />
                                            <span className="text-xs font-semibold text-text-primary">
                                                {feedback.rating || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-primary/5 border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users size={20} className="text-primary" />
                        </div>
                        <div>
                            <div className="font-bold text-text-primary">Create Division</div>
                            <div className="text-xs text-text-muted">Set up a new bootcamp division</div>
                        </div>
                    </div>
                </div>

                <div className="card bg-success/5 border-success/20 hover:border-success/40 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                            <Shield size={20} className="text-success" />
                        </div>
                        <div>
                            <div className="font-bold text-text-primary">Manage Users</div>
                            <div className="text-xs text-text-muted">Add or modify user accounts</div>
                        </div>
                    </div>
                </div>

                <div className="card bg-info/5 border-info/20 hover:border-info/40 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                            <Calendar size={20} className="text-info" />
                        </div>
                        <div>
                            <div className="font-bold text-text-primary">View Reports</div>
                            <div className="text-xs text-text-muted">Detailed analytics and reports</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}