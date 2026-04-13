import { Bell, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PAGE_TITLES = {
  dashboard: { title: 'Student Overview', sub: 'Your bootcamp progress at a glance' },
  sessions:  { title: 'My Sessions',     sub: 'Schedule, materials, and check-in' },
  tasks:     { title: 'My Tasks',        sub: 'Submit and track your assignments' },
  feedback:  { title: 'Give Feedback',   sub: 'Help us improve your learning experience' },
  progress:  { title: 'Group Progress',  sub: 'Submit your weekly team update' },
};

const ROLES = ['Student', 'Instructor', 'Super Admin'];

export default function StudentTopbar({ activePage, setRole }) {
  const { user, role, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  
  const info = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="role-switcher">
          {ROLES.map(r => (
            <button
              key={r}
              className={`role-btn ${role === r ? 'active' : ''}`}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, paddingLeft: 24 }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {info.title}
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{info.sub}</p>
      </div>

      <div className="topbar-right">
        <div className="topbar-actions">
          <button className={`dark-toggle ${isDark ? 'on' : ''}`} onClick={toggle} title="Toggle dark mode">
            <span className="dark-toggle-thumb" />
          </button>
          <button className="icon-btn" title="Notifications">
            <Bell size={18} />
            <span className="notif-badge" />
          </button>
        </div>

        <div className="user-profile">
          <div className="user-info">
            <h4>{user?.name || 'Student Candidate'}</h4>
            <p>Student - Development</p>
          </div>
          <div className="avatar" style={{ background: 'linear-gradient(135deg, #007bff, #00d2ff)' }}>
            SC
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
