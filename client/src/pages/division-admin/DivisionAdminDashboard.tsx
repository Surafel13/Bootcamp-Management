import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import OverviewPage from './OverviewPage';
import BootcampsPage from './BootcampsPage';
import BootcampDetailPage from './BootcampDetailPage';
import StudentsPage from './StudentsPage';
import AttendanceDashboardPage from './AttendanceDashboardPage';
import NotificationsPage from '../NotificationsPage';
import ProfilePage from '../ProfilePage';
import SettingsPage from '../SettingsPage';

const PAGE_META: Record<string, { title: string; sub: string }> = {
  overview: { title: 'Overview', sub: 'Division dashboard and statistics' },
  bootcamps: { title: 'Bootcamps', sub: 'Manage your division bootcamps' },
  students: { title: 'Students', sub: 'Manage student accounts in your division' },
  attendance: { title: 'Attendance Analytics', sub: 'Track and analyze attendance across bootcamps' },
  notifications: { title: 'Notifications', sub: 'Stay updated with system alerts' },
  profile: { title: 'My Profile', sub: 'View and manage your profile information' },
  settings: { title: 'Settings', sub: 'Configure your account preferences' },
};

export default function DivisionAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeBootcampId, setActiveBootcampId] = useState<string | null>(null);

  // Extract active page from URL path
  const getActivePage = () => {
    const path = location.pathname.split('/').filter(Boolean);
    return path[1] || 'overview'; // /division-admin/overview -> 'overview'
  };

  const activePage = getActivePage();
  const meta = PAGE_META[activePage] ?? PAGE_META.overview;

  const handleNavigate = (page: string) => {
    navigate(`/division-admin/${page}`);
    setActiveBootcampId(null); // Reset bootcamp drill-down when switching pages
  };

  // Title changes when drilled into a bootcamp
  const title = activeBootcampId ? 'Bootcamp Detail' : meta.title;
  const subtitle = activeBootcampId ? 'Sessions, groups and tasks' : meta.sub;

  return (
    <DashboardLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      title={title}
      subtitle={subtitle}
      onNotificationClick={() => handleNavigate('notifications')}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/division-admin/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route
          path="/bootcamps"
          element={
            activeBootcampId ? (
              <BootcampDetailPage
                bootcampId={activeBootcampId}
                onBack={() => setActiveBootcampId(null)}
              />
            ) : (
              <BootcampsPage onOpenBootcamp={setActiveBootcampId} />
            )
          }
        />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/attendance" element={<AttendanceDashboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/division-admin/overview" replace />} />
      </Routes>
    </DashboardLayout>
  );
}