import { useState } from 'react';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PAGE_META = {
  sessions: { title: 'Student Dashboard', sub: 'View and manage your bootcamp sessions' },
  attendance: { title: 'Student Dashboard', sub: 'Track your attendance and participation' },
  tasks: { title: 'Student Dashboard', sub: 'Complete assignments and tasks' },
  scanner: { title: 'QR Scanner', sub: 'Scan QR codes for session check-in' },
  feedback: { title: 'Student Dashboard', sub: 'Provide feedback on sessions' },
  resources: { title: 'Learning Resources', sub: 'Access learning materials and resources' },
  notifications: { title: 'Notifications', sub: 'Stay updated with important announcements' },
  profile: { title: 'My Profile', sub: 'Manage your personal information' },
  settings: { title: 'Settings', sub: 'Configure your preferences' },
};

export default function StudentTopbar({ activePage, onNavigate }) {
  const { isDark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const meta = PAGE_META[activePage] || PAGE_META.sessions;

  return (
    <header className="topbar">
      <div style={{ flex: 1, paddingLeft: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          {meta.title}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{meta.sub}</p>
      </div>

      <div className="topbar-right">
        <div className="topbar-actions" style={{ marginRight: 20 }}>
          {/* Toggle with Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 10 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <button
              className={`dark-toggle ${isDark ? 'on' : ''}`}
              onClick={toggle}
              title="Toggle dark mode"
              id="st-dark-toggle"
            >
              <span className="dark-toggle-thumb" />
            </button>
          </div>

          {/* Bell */}
          <button className="icon-btn" title="Notifications">
            <Bell size={18} />
            <span className="notif-badge" />
          </button>
        </div>

        {/* User with Dropdown */}
        <div className="user-dropdown">
          <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="user-info">
              <h4>{user?.name || 'John Doe'}</h4>
              <p>{user?.role || 'Student'}</p>
            </div>
            <div className="avatar">
              {user?.initials || 'JD'}
            </div>
          </div>

          {showDropdown && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => { setShowDropdown(false); onNavigate('profile'); }}>
                <User size={16} />
                <span>My Profile</span>
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={logout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
