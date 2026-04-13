import {
  BarChart2, CalendarDays, ClipboardList, MessageSquare, 
  UsersRound, Bell, User, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'My Dashboard', icon: BarChart2 },
  { key: 'sessions',  label: 'My Sessions',  icon: CalendarDays },
  { key: 'tasks',     label: 'My Tasks',     icon: ClipboardList },
  { key: 'feedback',  label: 'Give Feedback', icon: MessageSquare },
  { key: 'progress',  label: 'Group Progress', icon: UsersRound },
];

export default function StudentSidebar({ activePage, onNavigate }) {
  const { logout } = useAuth();

  return (
    <aside className="sidebar student-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #007bff, #00d2ff)' }}>
          <User size={20} />
        </div>
        <div className="sidebar-logo-text">
          <h2>BMS Student</h2>
          <span>Bootcamp Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`student-nav-${key}`}
            className={`nav-item ${activePage === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button className="nav-item" onClick={logout} style={{ color: 'var(--danger)', marginTop: 8 }}>
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <div className="sidebar-status" style={{ background: 'rgba(0,123,255,0.1)' }}>
        <p>Current Division</p>
        <span style={{ color: '#007bff', fontWeight: 700 }}>Development</span>
      </div>
    </aside>
  );
}
