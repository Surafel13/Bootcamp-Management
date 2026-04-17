import {
  CalendarDays, Users, ClipboardList,
  MessageSquare, QrCode, User,
  Settings, LogOut, Menu, BookOpen, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/image.png';

const NAV = [
  { key: 'sessions', label: 'Sessions', icon: CalendarDays },
  { key: 'attendance', label: 'Attendance', icon: Users },
  { key: 'tasks', label: 'Tasks', icon: ClipboardList },
  { key: 'scanner', label: 'QR Scanner', icon: QrCode },
  { key: 'feedback', label: 'Feedback', icon: MessageSquare },
  { key: 'resources', label: 'Resources', icon: BookOpen },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function StudentSidebar({ active, onNavigate, isCollapsed, onToggle }) {
  const { logout } = useAuth();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo Area */}
      <div className="sidebar-logo">
        <button className="icon-btn" onClick={onToggle} style={{ border: 'none', background: 'none', padding: 0 }}>
          <Menu size={20} />
        </button>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
            <img src={logo} alt="BMS Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <div className="sidebar-logo-text">
              <h2>Bootcamp MS</h2>
              <span>Student Portal</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${active === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon size={18} />
            {!isCollapsed && <span className="nav-item-text">{item.label}</span>}
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

      {/* Status */}
      {!isCollapsed && (
        <div className="sidebar-status" style={{ background: 'transparent', border: 'none', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status: Active</span>
          </div>
        </div>
      )}
    </aside>
  );
}
