import {
  BarChart2, Users, LayoutGrid, MessageSquare,
  Bell, User, Settings, LogOut, CalendarDays, Shield, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { key: 'analytics',       label: 'System Analytics',    icon: BarChart2 },
  { key: 'users',           label: 'User Management',     icon: Users },
  { key: 'divisions',       label: 'Division Management', icon: LayoutGrid },
  { key: 'master-schedule', label: 'Master Schedule',     icon: CalendarDays },
  { key: 'feedback',        label: 'All Feedback',        icon: MessageSquare },
  { key: 'notifications',   label: 'Notifications',       icon: Bell },
  { key: 'profile',         label: 'Profile',             icon: User },
];

export default function Sidebar({ activePage, onNavigate, isCollapsed, onToggle }) {
  const { logout } = useAuth();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo Area */}
      <div className="sidebar-logo">
        <button className="icon-btn" onClick={onToggle} style={{ border: 'none', background: 'none' }}>
          <Menu size={20} />
        </button>
        {!isCollapsed && (
          <div className="sidebar-logo-text" style={{ marginLeft: 12 }}>
            <h2>Club Sessions</h2>
            <span>Super Admin</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`nav-${key}`}
            className={`nav-item ${activePage === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
            title={isCollapsed ? label : ''}
          >
            <Icon size={18} />
            {!isCollapsed && <span className="nav-item-text">{label}</span>}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button
          className="nav-item"
          onClick={logout}
          style={{ marginTop: 8, color: 'var(--text-secondary)' }}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="nav-item-text">Logout</span>}
        </button>
      </nav>

      {/* Simplified Status */}
      {!isCollapsed && (
        <div className="sidebar-status" style={{ background: 'transparent', border: 'none', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Systems Live</span>
          </div>
        </div>
      )}
    </aside>
  );
}
