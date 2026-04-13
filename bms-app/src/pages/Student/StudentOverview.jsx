import { BarChart2, CalendarDays, ClipboardList, Star, UsersRound } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p className="stat-label">{label}</p>
        <div className="stat-value" style={{ color }}>{value}</div>
      </div>
      <div style={{ padding: 10, borderRadius: 12, background: 'var(--bg-input)' }}>
        <Icon size={20} color={color} />
      </div>
    </div>
  </div>
);

export default function StudentOverview() {
  return (
    <div className="student-overview">
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30 }}>
        <StatCard label="Attendance" value="92%" icon={CalendarDays} color="var(--primary)" />
        <StatCard label="Completed Tasks" value="12/15" icon={ClipboardList} color="var(--success)" />
        <StatCard label="Avg. Score" value="88.5" icon={BarChart2} color="var(--info)" />
        <StatCard label="Session Reviews" value="8" icon={Star} color="#f1c40f" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 25 }}>
        <div className="card">
          <div className="card-header">
            <h3>Upcoming Sessions</h3>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ padding: 15, borderRadius: 'var(--radius)', background: 'var(--bg-input)', borderLeft: '4px solid var(--primary)' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Advanced React Patterns</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Today, 2:00 PM • Room 101</p>
              </div>
              <div style={{ padding: 15, borderRadius: 'var(--radius)', background: 'var(--bg-input)', borderLeft: '4px solid var(--primary)' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Web Development Workshop</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Apr 15, 10:00 AM • Online</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Task Deadlines</h3>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 5px' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>React State Management</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Due in 2 days</p>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>GitHub</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 5px' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>JS Async & Promises</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Due in 5 days</p>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>ZIP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: 25, background: 'var(--primary-glow)', border: '1px solid var(--primary)' }}>
        <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 15 }}>
          <UsersRound size={30} color="var(--primary)" />
          <div>
            <h4 style={{ color: 'var(--primary)', fontWeight: 800 }}>Weekly Group Progress Reminder</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Don't forget to submit your group's weekly update before Friday midnight!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
