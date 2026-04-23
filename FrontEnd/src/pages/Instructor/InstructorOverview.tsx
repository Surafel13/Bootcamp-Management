import { useState, useEffect } from 'react';
import { Users, CalendarDays, Clock, CheckCircle, TrendingUp, Star, Award } from 'lucide-react';
import apiFetch from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function InstructorOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    avgAttendance: 0,
    pendingGrades: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // We assume the first division is the primary one for the instructor
      const divId = user.divisions[0]?._id || user.divisions[0];
      const membership = user.membership.length > 0 ? user.membership[0].division : user.membership[0].division
      if (!divId) return;

      const [divStats, subData] = await Promise.all([
        apiFetch(`/divisions/${divId}/stats`),
        apiFetch('/submissions')
      ]);

      const pending = subData.data.submissions.filter(s => !s.score).length;

      setStats({
        totalStudents: divStats.data.totalStudents,
        totalSessions: divStats.data.totalSessions,
        avgAttendance: divStats.data.averageAttendance,
        pendingGrades: pending
      });
    } catch (err) {
      console.error('Failed to fetch instructor stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Analyzing your division performance...</div>;

  return (
    <div>
      <div className="stats-grid">
        <StatCard label="Your Students" value={stats.totalStudents} sub="Active in Division" icon={Users} color="#025961" />
        <StatCard label="Total Sessions" value={stats.totalSessions} sub="Completed to date" icon={CalendarDays} color="#168b96" />
        <StatCard label="Avg Attendance" value={`${stats.avgAttendance}%`} sub="Overall rate" icon={CheckCircle} color="#00b894" />
        <StatCard label="Pending Grades" value={stats.pendingGrades} sub="Require review" icon={Award} color="#fdcb6e" />
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 16 }}>Welcome back, {user.name}!</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1rem' }}>
            {/* You are currently managing the <strong>{user.divisions[0]?.name || 'Assigned'} Division</strong>.  */}
            There are currently <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{stats.pendingGrades}</strong> assignments waiting to be reviewed and graded.
            Your division's overall attendance is holding steady at <strong>{stats.avgAttendance}%</strong>.
          </p>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <div style={{ padding: '12px 20px', background: 'var(--primary-glow)', borderRadius: 12, color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              🚀 Division Status: Operational
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ background: `${color}15`, color }}>
        <Icon size={20} />
      </div>
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      <div className="stat-change" style={{ color }}>
        <TrendingUp size={14} style={{ marginRight: 4 }} />
        <span>{sub}</span>
      </div>
    </div>
  );
}
