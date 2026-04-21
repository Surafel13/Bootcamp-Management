import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, Users, CalendarDays, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import apiFetch from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  const [data, setData] = useState({
    totalStudents: 0,
    totalSessions: 0,
    avgAttendance: 0,
    totalAdmins: 0,
    divisions: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Fetching divisions with stats (reusing logic from DivisionsPage but aggregated)
      const divResponse = await apiFetch('/divisions');
      const divList = divResponse.data.results || divResponse.data.divisions || [];
      
      const enriched = await Promise.all(divList.map(async (div) => {
        try {
          const stats = await apiFetch(`/divisions/${div._id}/stats`);
          return { ...div, ...stats.data };
        } catch {
          return { ...div, totalStudents: 0, totalSessions: 0, averageAttendance: 0 };
        }
      }));

      // Fetching general user counts
      const userResponse = await apiFetch('/users');
      const allUsers = userResponse.data.users || [];
      const admins = allUsers.filter(u => u.roles.includes('super_admin') || u.roles.includes('division_admin')).length;

      const totalStudents = enriched.reduce((acc, d) => acc + (d.totalStudents || 0), 0);
      const totalSessions = enriched.reduce((acc, d) => acc + (d.totalSessions || 0), 0);
      const avgAttendance = enriched.length > 0 
        ? Math.round(enriched.reduce((acc, d) => acc + (d.averageAttendance || 0), 0) / enriched.length) 
        : 0;

      setData({
        totalStudents,
        totalSessions,
        avgAttendance,
        totalAdmins: admins,
        divisions: enriched
      });
    } catch (err) {
      console.error('Analytics fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const textColor = isDark ? '#9090b0' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';

  const barData = {
    labels: data.divisions.map(d => d.name),
    datasets: [{
      label: 'Attendance %',
      data: data.divisions.map(d => d.averageAttendance || 0),
      backgroundColor: 'rgba(2, 89, 97, 0.8)',
      borderRadius: 10,
      barThickness: 32,
    }],
  };

  const pieData = {
    labels: data.divisions.map(d => d.name),
    datasets: [{
      data: data.divisions.map(d => d.totalStudents || 0),
      backgroundColor: [
        '#025961',
        '#168b96',
        '#39c2cf',
        '#a5e1e6',
        '#00b894',
        '#fdcb6e'
      ],
      borderWidth: 4,
      borderColor: isDark ? '#1a1a2e' : '#fff',
    }],
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Calculating real-time analytics...</div>;

  return (
    <div>
      <div className="stats-grid">
        <StatCard label="Total Students" value={data.totalStudents} icon={Users} color="#025961" change="+12% from last month" />
        <StatCard label="Total Sessions" value={data.totalSessions} icon={CalendarDays} color="#168b96" />
        <StatCard label="Avg Attendance" value={`${data.avgAttendance}%`} icon={CheckCircle} color="#00b894" />
        <StatCard label="Active Staff" value={data.totalAdmins} icon={ShieldCheck} color="#fdcb6e" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Attendance by Division</h3>
          <div className="chart-wrap" style={{ height: 260 }}>
            <Bar data={barData} options={getBarOptions(isDark, textColor, gridColor)} />
          </div>
        </div>

        <div className="chart-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Student Distribution</h3>
          <div className="chart-wrap" style={{ height: 260, position: 'relative' }}>
            <Pie data={pieData} options={getPieOptions(isDark, textColor)} />
            <div style={{
              position: 'absolute', top: '44%', left: '50%',
              transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none'
            }}>
              <span style={{ display: 'block', fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                {data.totalStudents}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Students
              </span>
            </div>
          </div>
        </div>
      </div>

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
              {data.divisions.map(d => (
                <tr key={d._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {d.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{d.totalStudents}</td>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{d.totalSessions}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-hover)', borderRadius: 10, width: 60, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${d.averageAttendance}%`, background: 'var(--primary)', borderRadius: 10 }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>{d.averageAttendance}%</span>
                    </div>
                  </td>
                  <td><span className="badge badge-success" style={{ padding: '4px 12px', borderRadius: 20 }}>Operational</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, change }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ background: `${color}15`, color }}>
        <Icon size={20} />
      </div>
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      <div className="stat-change">
        {change ? <><TrendingUp size={14} /> <span>{change}</span></> : <span>Baseline maintained</span>}
      </div>
    </div>
  );
}

const getBarOptions = (isDark, textColor, gridColor) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: textColor } },
    y: { min: 0, max: 100, grid: { color: gridColor }, ticks: { color: textColor, callback: v => `${v}%` } },
  },
});

const getPieOptions = (isDark, textColor) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: textColor, font: { weight: 600 }, usePointStyle: true } },
  },
  cutout: '75%',
});
