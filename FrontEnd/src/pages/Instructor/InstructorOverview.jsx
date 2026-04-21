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

      <div className="charts-grid" style={{ marginTop: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>Welcome back, {user.name}!</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            You are managing the <strong>{user.divisions[0]?.name || 'Assigned'} Division</strong>. 
            Currently, you have {stats.pendingGrades} assignments waiting to be graded. 
            Your division's attendance is holding steady at {stats.avgAttendance}%.
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <div style={{ padding: '10px 16px', background: 'var(--primary-glow)', borderRadius: 12, color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700 }}>
              🚀 Division Status: Operational
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>Send Announcement</button>
            <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>Generate Report</button>
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
