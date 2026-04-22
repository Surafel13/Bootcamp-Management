import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentTopbar from './StudentTopbar';
import Sessions from './Sessions';
import Attendance from './Attendance';
import Tasks from './Tasks';
import Scanner from './Scanner';
import Feedback from './Feedback';
import Profile from './Profile';
import Settings from './Settings';
import Resources from './Resources';
import StudentGroupsPage from './StudentGroupsPage';
import Notifications from './Notifications';
import BootcampDetail from './BootcampDetail';

function StudentDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine which page is active based on the URL
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/') return 'sessions';
    if (path.startsWith('/bootcamp-detail')) return 'notifications'; // Keep notifications highlighted or none
    return path.substring(1);
  };

  const activePage = getActivePage();

  const handleNavigate = (key) => {
    if (key === 'sessions') {
      navigate('/');
    } else {
      navigate(`/${key}`);
    }
  };

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <StudentSidebar
        active={activePage}
        onNavigate={handleNavigate}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="main-wrapper">
        <StudentTopbar activePage={activePage} />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Sessions />} />
            <Route path="/sessions" element={<Navigate to="/" replace />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/groups" element={<StudentGroupsPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/bootcamp-detail/:id" element={<BootcampDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
