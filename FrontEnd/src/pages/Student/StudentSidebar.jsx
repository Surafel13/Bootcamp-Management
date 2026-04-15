import {
  CalendarDays, Users, ClipboardList,
  MessageSquare, QrCode, User,
  Settings, LogOut, Menu, BookOpen, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
        <button className="icon-btn" onClick={onToggle} style={{ border: 'none', background: 'none' }}>
          <Menu size={20} />
        </button>
        {!isCollapsed && (
          <div className="sidebar-logo-text" style={{ marginLeft: 12 }}>
            <h2>Bootcamp MS</h2>
            <span>Student Portal</span>
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
          >
            <item.icon size={20} />
            <span className="nav-item-text">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Status */}
      <div className="sidebar-status">
        <p>Student Status</p>
        <span>Active</span>
      </div>

      {/* Logout */}
      {!isCollapsed && (
        <div style={{ padding: '10px' }}>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', gap: 8 }}
            onClick={logout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
