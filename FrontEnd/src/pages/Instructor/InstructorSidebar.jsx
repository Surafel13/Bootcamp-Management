import {
  CalendarDays, Users, BookOpen, ClipboardList, FileBadge,
  MessageSquare, UserCog, UsersRound, QrCode, Bell, User,
  Settings, LogOut, BarChart2, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { key: 'overview',   label: 'Dashboard',        icon: BarChart2 },
  { key: 'sessions',   label: 'Sessions',        icon: CalendarDays },
  { key: 'attendance', label: 'Attendance',       icon: Users },
  { key: 'resources',  label: 'Resources',        icon: BookOpen },
  { key: 'tasks',      label: 'Tasks',            icon: ClipboardList },
  { key: 'submissions',label: 'Submissions',      icon: FileBadge },
  { key: 'feedback',   label: 'Feedback',         icon: MessageSquare },
  { key: 'students',   label: 'Manage Students',  icon: UserCog },
  { key: 'groups',     label: 'Groups',           icon: UsersRound },
  { key: 'qrcode',     label: 'QR Code',          icon: QrCode },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'profile',    label: 'Profile',          icon: User },
  { key: 'settings',   label: 'Settings',         icon: Settings },
];

export default function InstructorSidebar({ active, onNavigate, isCollapsed, onToggle }) {
  const { logout, user } = useAuth();
  const divisionName = user?.divisions?.[0]?.name || 'Division';

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo Area */}
      <div className="sidebar-logo">
        <button className="icon-btn" onClick={onToggle} style={{ border: 'none', background: 'none' }}>
          <Menu size={20} />
        </button>
        {!isCollapsed && (
          <div className="sidebar-logo-text" style={{ marginLeft: 12 }}>
            <h2 style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{divisionName} Portal</h2>
            <span>Bootcamp MS</span>
          </div>
        )}
      </div>

      {/* ... (rest of nav) */}
      <nav className="sidebar-nav">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`da-nav-${key}`}
            className={`nav-item ${active === key ? 'active' : ''}`}
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

      {/* Dynamic Division Box */}
      {!isCollapsed && (
        <div className="sidebar-status" style={{ background: 'transparent', border: 'none', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>{divisionName} Live</span>
          </div>
        </div>
      )}
    </aside>
  );
}
