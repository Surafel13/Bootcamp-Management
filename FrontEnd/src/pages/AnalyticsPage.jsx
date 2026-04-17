import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, Users, CalendarDays, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  const [analytics, setAnalytics] = useState({ divisions: [], totalStudents: 0, totalSessions: 0, avgAttendance: 0, activeAdmins: 0 });
  const [loading, setLoading] = useState(true);

  const textColor = isDark ? '#9090b0' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [divRes, usersRes] = await Promise.all([
          api.get('/divisions'),
          api.get('/users').catch(() => ({ data: { users: [] } }))
        ]);
        
        let divisionStats = [];
        if (divRes.status === 'success') {
          divisionStats = await Promise.all(divRes.data.divisions.map(async (d) => {
            try {
              const statRes = await api.get(`/divisions/${d._id}/stats`);
              const stats = statRes.data.stats;
              return {
                name: d.name,
                students: stats.totalStudents || 0,
                sessions: stats.totalSessions || 0,
                attendance: stats.averageAttendance || 0,
              };
            } catch (e) {
              return { name: d.name, students: 0, sessions: 0, attendance: 0 };
            }
          }));
        }

        const totalStudents = divisionStats.reduce((sum, d) => sum + d.students, 0);
        const totalSessions = divisionStats.reduce((sum, d) => sum + d.sessions, 0);
        const avgAttendance = divisionStats.length > 0 
          ? (divisionStats.reduce((sum, d) => sum + d.attendance, 0) / divisionStats.length)
          : 0;

        // Count active admins
        let activeAdmins = 0;
        if (usersRes?.data?.users) {
          activeAdmins = usersRes.data.users.filter(u => 
            (u.role === 'super_admin' || u.role === 'division_admin') && u.status === 'active'
          ).length;
        }

        setAnalytics({ divisions: divisionStats, totalStudents, totalSessions, avgAttendance, activeAdmins });
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const STATS = [
    { label: 'Total Students', value: loading ? '...' : analytics.totalStudents, change: null, icon: Users, color: '#025961' },
    { label: 'Total Sessions', value: loading ? '...' : analytics.totalSessions, change: null, icon: CalendarDays, color: '#168b96' },
    { label: 'Avg Attendance', value: loading ? '...' : `${analytics.avgAttendance.toFixed(1)}%`, change: null, icon: CheckCircle, color: '#00b894' },
    { label: 'Active Admins',  value: loading ? '...' : analytics.activeAdmins, change: null, icon: ShieldCheck, color: '#fdcb6e' },
  ];

  const labels = analytics.divisions.map(d => d.name);
  
  const barData = {
    labels: labels.length ? labels : ['No Data'],
    datasets: [{
      label: 'Attendance %',
      data: analytics.divisions.length ? analytics.divisions.map(d => d.attendance) : [0],
      backgroundColor: [
        'rgba(2, 89, 97, 1)',
        'rgba(2, 89, 97, 0.85)',
        'rgba(2, 89, 97, 0.7)',
        'rgba(2, 89, 97, 0.55)',
      ],
      borderRadius: 10,
      borderSkipped: false,
      barThickness: 32,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1a1a2e' : '#fff',
        titleColor: isDark ? '#e8e8f5' : '#1a1a2e',
        bodyColor: isDark ? '#9090b0' : '#6b7280',
        borderColor: isDark ? '#2a2a42' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: { label: ctx => ` ${ctx.raw.toFixed(1)}%` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 11, weight: 600 } },
        border: { display: false },
      },
      y: {
        min: 0, max: 100,
        grid: { color: gridColor, borderDash: [5, 5] },
        ticks: { color: textColor, font: { size: 11 }, callback: v => `${v}%` },
        border: { display: false },
      },
    },
  };

  const pieData = {
    labels: labels.length ? labels : ['No Data'],
    datasets: [{
      data: analytics.divisions.length ? analytics.divisions.map(d => d.students) : [1],
      backgroundColor: [
        '#025961',
        '#168b96',
        '#39c2cf',
        '#a5e1e6',
      ],
      borderWidth: 4,
      borderColor: isDark ? '#1a1a2e' : '#fff',
      hoverOffset: 15,
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { size: 11, weight: 600 },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
    cutout: '75%',
  };

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        {STATS.map(({ label, value, change, icon: Icon, color }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon-wrapper" style={{ background: `${color}15`, color }}>
              <Icon size={20} />
            </div>
            <p className="stat-label">{label}</p>
            <div className="stat-value">{value}</div>
            <div className="stat-change neutral">
              <span>Current Term Active Data</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Attendance by Division</h3>
          <div className="chart-wrap" style={{ height: 260 }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Student Distribution</h3>
          <div className="chart-wrap" style={{ height: 260, position: 'relative' }}>
            <Pie data={pieData} options={pieOptions} />
            {/* Center Text for Donut */}
            <div style={{
              position: 'absolute',
              top: '44%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ display: 'block', fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                {loading ? '...' : analytics.totalStudents}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Total Students
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Division Summary Table */}
      <div className="card">
        <div className="card-header" style={{ padding: '24px 24px 12px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Division Performance Overview</h2>
        </div>
        <div className="table-wrap" style={{ padding: '0 12px 12px' }}>
          <table>
            <thead>
              <tr>
                <th>Division</th>
                <th>Students</th>
                <th>Sessions</th>
                <th>Avg Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.divisions.map(d => (
                <tr key={d.name}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36,
                        borderRadius: '10px',
                        background: 'var(--primary-glow)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                      }}>
                        {d.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{d.students}</td>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{d.sessions}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-hover)', borderRadius: 10, width: 60, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${d.attendance}%`, background: 'var(--primary)', borderRadius: 10 }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>{d.attendance.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ padding: '4px 12px', borderRadius: 20 }}>Operational</span>
                  </td>
                </tr>
              ))}
              {analytics.divisions.length === 0 && !loading && (
                 <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No Division Data Available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
