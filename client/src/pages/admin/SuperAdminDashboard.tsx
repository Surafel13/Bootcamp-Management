import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import OverviewPage from './OverviewPage';
import UsersPage from './UsersPage';
import DivisionsPage from './DivisionsPage';
import MasterSchedulePage from './MasterSchedulePage';
import FeedbackPage from './FeedbackPage';
import AuditLogsPage from './AuditLogsPage';
import NotificationsPage from '../NotificationsPage';
import ProfilePage from '../ProfilePage';
import SettingsPage from '../SettingsPage';

const PAGE_META: Record<string, { title: string; sub: string }> = {
  overview: { title: 'Overview', sub: 'Platform overview with key metrics and charts' },
  users: { title: 'User Management', sub: 'Manage platform users and roles' },
  divisions: { title: 'Division Management', sub: 'Manage bootcamp divisions' },
  'master-schedule': { title: 'Master Schedule', sub: 'Global view and attendance overrides' },
  feedback: { title: 'All Feedback', sub: 'Student feedback and ratings' },
  notifications: { title: 'Notifications', sub: 'Stay updated with system alerts' },
  audit: { title: 'Audit Logs', sub: 'System security and action tracking' },
  profile: { title: 'My Profile', sub: 'View and manage your profile information' },
  settings: { title: 'Settings', sub: 'Configure your account preferences' },
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active page from URL path
  const getActivePage = () => {
    const path = location.pathname.split('/').filter(Boolean);
    return path[1] || 'overview'; // /admin/overview -> 'overview'
  };

  const activePage = getActivePage();
  const meta = PAGE_META[activePage] ?? PAGE_META.overview;

  const handleNavigate = (page: string) => {
    navigate(`/admin/${page}`);
  };

  return (
    <DashboardLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      title={meta.title}
      subtitle={meta.sub}
      onNotificationClick={() => handleNavigate('notifications')}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/admin/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/divisions" element={<DivisionsPage />} />
        <Route path="/master-schedule" element={<MasterSchedulePage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/audit" element={<AuditLogsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin/overview" replace />} />
      </Routes>
    </DashboardLayout>
  );
}