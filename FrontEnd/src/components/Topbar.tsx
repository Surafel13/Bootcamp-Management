import { useState } from 'react';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const PAGE_TITLES = {
  analytics: { title: 'Super Admin Dashboard', sub: 'System overview and management' },
  users: { title: 'User Management', sub: 'Manage platform users and roles' },
  groups: { title: 'Group Management', sub: 'Manage student project groups' },
  divisions: { title: 'Division Management', sub: 'Manage bootcamp divisions' },
  'master-schedule': { title: 'Master Schedule', sub: 'Global view and attendance overrides' },
  audit: { title: 'Audit Logs', sub: 'System security and action tracking' },
  feedback: { title: 'All Feedback', sub: 'Student feedback and ratings' },
  notifications: { title: 'Notifications', sub: 'Stay updated with system alerts' },
  profile: { title: 'My Profile', sub: 'Manage your account preferences' },
  settings: { title: 'Settings', sub: 'Configure system preferences' },
};

export default function Topbar({ activePage, notifCount = 3 }) {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const info = PAGE_TITLES[activePage] || PAGE_TITLES.analytics;
  const notifyCount = useNotifications.count;

  return (
    <header className="topbar">
      <div style={{ flex: 1, paddingLeft: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          {info.title}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{info.sub}</p>
      </div>

      <div className="topbar-right">
        <div className="topbar-actions" style={{ marginRight: 20 }}>
          {/* Toggle with Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 10 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <button
              id="dark-mode-toggle"
              className={`dark-toggle ${isDark ? 'on' : ''}`}
              onClick={toggle}
              title="Toggle dark mode"
            >
              <span className="dark-toggle-thumb" />
            </button>
          </div>

          <button className="icon-btn" id="notif-btn" title="Notifications">
            <Bell size={18} />
            <span className="notif-badge" style={{ color: notifyCount > 0 ? 'var(--text-on-primary)' : 'var(--text-muted)' }}>{notifyCount > 0 && notifyCount}</span>
          </button>
        </div>

        {/* User with Dropdown */}
        <div className="user-dropdown">
          <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="user-info">
              <h4>{user?.name || 'Admin Root'}</h4>
              <p>{user?.role || 'System Administrator'}</p>
            </div>
            <div className="avatar">
              {user?.initials || 'AR'}
            </div>
          </div>

          {showDropdown && (
            <div className="dropdown-menu">
              <Link className="dropdown-item" to="/profile" style={{ textDecoration: 'none' }} onClick={() => setShowDropdown(false)}>
                <User size={16} />
                <span>My Profile</span>
              </Link>
              <Link className="dropdown-item" to="/settings" style={{ textDecoration: 'none' }} onClick={() => setShowDropdown(false)}>
                <Settings size={16} />
                <span>Account Settings</span>
              </Link>
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
