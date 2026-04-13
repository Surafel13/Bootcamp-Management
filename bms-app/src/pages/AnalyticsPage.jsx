import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, Users, CalendarDays, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const STATS = [
  { label: 'Total Students', value: '560', change: '+42', icon: Users, color: '#025961' },
  { label: 'Total Sessions', value: '84',  change: '+12', icon: CalendarDays, color: '#168b96' },
  { label: 'Avg Attendance', value: '85%', change: '+3%', icon: CheckCircle, color: '#00b894' },
  { label: 'Active Admins',  value: '4',   change: null,  icon: ShieldCheck, color: '#fdcb6e' },
];

export default function AnalyticsPage() {
  const { isDark } = useTheme();

  const textColor = isDark ? '#9090b0' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';

  const barData = {
    labels: ['Data Science', 'Development', 'CPD', 'Cybersecurity'],
    datasets: [{
      label: 'Attendance %',
      data: [91, 84, 79, 84],
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
        callbacks: { label: ctx => ` ${ctx.raw}%` },
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
    labels: ['Cybersecurity', 'Development', 'Data Science', 'CPD'],
    datasets: [{
      data: [142, 156, 138, 124],
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
            {change ? (
              <div className="stat-change">
                <TrendingUp size={14} />
                <span>{change} this month</span>
              </div>
            ) : (
              <div className="stat-change neutral">
                <span>Baseline maintained</span>
              </div>
            )}
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
                560
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
              {[
                { name: 'Data Science',   students: 138, sessions: 22, attendance: 91 },
                { name: 'Development',    students: 156, sessions: 24, attendance: 87 },
                { name: 'CPD',            students: 124, sessions: 18, attendance: 79 },
                { name: 'Cybersecurity',  students: 142, sessions: 20, attendance: 84 },
              ].map(d => (
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
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>{d.attendance}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ padding: '4px 12px', borderRadius: 20 }}>Operational</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
