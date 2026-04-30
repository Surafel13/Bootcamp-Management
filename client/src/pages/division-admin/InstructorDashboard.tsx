import { useState, type JSX } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import MySessionsPage from '../instructor/MySessionsPage';
import AttendanceManagementPage from '../instructor/AttendanceManagementPage';
import NotificationsPage from '../NotificationsPage';

const PAGE_META: Record<string, { title: string; sub: string }> = {
  sessions: { title: 'My Sessions', sub: 'Manage your assigned sessions' },
  attendance: { title: 'Attendance Management', sub: 'Track and manage student attendance' },
  bootcamps: { title: 'My Bootcamps', sub: 'View bootcamps you are assigned to' },
  students: { title: 'Students', sub: 'View and manage students in your sessions' },
  resources: { title: 'Resources', sub: 'Manage session resources and materials' },
  feedback: { title: 'Feedback', sub: 'View student feedback' },
  notifications: { title: 'Notifications', sub: 'Stay updated with announcements' },
  profile: { title: 'My Profile', sub: 'Manage your personal information' },
  settings: { title: 'Settings', sub: 'Configure your preferences' },
};

const PAGES: Record<string, JSX.Element> = {
  sessions: <MySessionsPage />,
  attendance: <AttendanceManagementPage />,
  notifications: <NotificationsPage />,
};

export default function InstructorDashboard() {
  const [activePage, setActivePage] = useState('sessions');
  const meta = PAGE_META[activePage] ?? PAGE_META.sessions;

  return (
    <DashboardLayout
      activePage={activePage}
      onNavigate={setActivePage}
      title={meta.title}
      subtitle={meta.sub}
      onNotificationClick={() => setActivePage('notifications')}
    >
      {PAGES[activePage] ?? <div style={{ padding: 40, color: 'var(--text-muted)' }}>Page coming soon…</div>}
    </DashboardLayout>
  );
}