import { useState } from 'react';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PAGE_META = {
  sessions:      { title: 'Instructor Dashboard', sub: 'Manage bootcamp sessions and academic activities' },
  attendance:    { title: 'Instructor Dashboard', sub: 'Manage bootcamp sessions and academic activities' },
  resources:     { title: 'Instructor Dashboard', sub: 'Manage bootcamp sessions and academic activities' },
  tasks:         { title: 'Instructor Dashboard', sub: 'Manage bootcamp sessions and academic activities' },
  submissions:   { title: 'Instructor Dashboard', sub: 'Manage bootcamp sessions and academic activities' },
  feedback:      { title: 'Instructor Dashboard', sub: 'Manage bootcamp sessions and academic activities' },
  students:      { title: 'Instructor Dashboard', sub: 'Manage bootcamp sessions and academic activities' },
  groups:        { title: 'Instructor Dashboard', sub: 'Manage bootcamp sessions and academic activities' },
  qrcode:        { title: 'Instructor Dashboard', sub: 'Generate QR codes for session check-in' },
  notifications: { title: 'Notifications',            sub: 'Stay updated with system alerts' },
  profile:       { title: 'My Profile',               sub: 'Manage your account preferences' },
  settings:      { title: 'Settings',                 sub: 'Configure system preferences' },
};

export default function InstructorTopbar({ activePage }) {
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
              id="da-dark-toggle"
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
              <h4>{user?.name || 'Dr. Sarah Mitchell'}</h4>
              <p>{user?.role || 'Lead Instructor'}</p>
            </div>
            <div className="avatar">
              {user?.initials || 'SM'}
            </div>
          </div>

          {showDropdown && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <Settings size={16} />
                <span>Account Settings</span>
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
