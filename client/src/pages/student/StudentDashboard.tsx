import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AttendancePage from './AttendancePage';
import ScannerPage from './ScannerPage';
import BootcampsPage from './BootcampsPage';
import MyBootcampsPage from './MyBootcampsPage';
import EnrolledBootcampDetailPage from './EnrolledBootcampDetailPage';
import StudentSessionDetailPage from './StudentSessionDetailPage';
import StudentTasksPage from './StudentTasksPage';
import NotificationsPage from '../NotificationsPage';
import ProfilePage from '../ProfilePage';
import SettingsPage from '../SettingsPage';

const PAGE_META: Record<string, { title: string; sub: string }> = {
    '/student': { title: 'Browse Bootcamps', sub: 'Discover and enroll in available bootcamps' },
    '/student/bootcamps': { title: 'Browse Bootcamps', sub: 'Discover and enroll in available bootcamps' },
    '/student/my-bootcamps': { title: 'My Bootcamps', sub: 'View your enrolled bootcamps and progress' },
    '/student/tasks': { title: 'My Tasks', sub: 'View and submit your assignments and tasks' },
    '/student/attendance': { title: 'Attendance', sub: 'Track your attendance and participation' },
    '/student/scanner': { title: 'QR Scanner', sub: 'Scan QR codes for session check-in' },
    '/student/notifications': { title: 'Notifications', sub: 'Stay updated with announcements' },
    '/student/profile': { title: 'My Profile', sub: 'View and manage your profile information' },
    '/student/settings': { title: 'Settings', sub: 'Configure your account preferences' },
};

export default function StudentDashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const getActivePage = () => {
        const path = location.pathname;
        if (path.includes('/my-bootcamps')) return 'my-bootcamps';
        if (path.includes('/bootcamps')) return 'bootcamps';
        if (path.includes('/tasks')) return 'tasks';
        if (path.includes('/attendance')) return 'attendance';
        if (path.includes('/scanner')) return 'scanner';
        if (path.includes('/notifications')) return 'notifications';
        if (path.includes('/profile')) return 'profile';
        if (path.includes('/settings')) return 'settings';
        return 'bootcamps';
    };

    const activePage = getActivePage();
    const meta = PAGE_META[location.pathname] ?? PAGE_META['/student/bootcamps'];

    const handleNavigate = (page: string) => {
        navigate(`/student/${page === 'bootcamps' ? '' : page}`);
    };

    return (
        <DashboardLayout
            activePage={activePage}
            onNavigate={handleNavigate}
            title={meta.title}
            subtitle={meta.sub}
            onNotificationClick={() => navigate('/student/notifications')}
        >
            <Routes>
                <Route index element={<BootcampsPage />} />
                <Route path="bootcamps" element={<BootcampsPage />} />
                <Route path="my-bootcamps" element={<MyBootcampsPage />} />
                <Route path="bootcamps/:bootcampId" element={<EnrolledBootcampDetailPage />} />
                <Route path="bootcamps/:bootcampId/sessions/:sessionId" element={<StudentSessionDetailPage />} />
                <Route path="tasks" element={<StudentTasksPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="scanner" element={<ScannerPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<div style={{ padding: 40, color: 'var(--text-muted)' }}>Page coming soon…</div>} />
            </Routes>
        </DashboardLayout>
    );
}