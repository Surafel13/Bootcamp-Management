import { useState } from 'react';
import InstructorSidebar from './InstructorSidebar.jsx';
import InstructorTopbar from './InstructorTopbar.jsx';
import InstructorSessionsPage from './InstructorSessionsPage.jsx';
import InstructorAttendancePage from './InstructorAttendancePage.jsx';
import InstructorResourcesPage from './InstructorResourcesPage.jsx';
import InstructorTasksPage from './InstructorTasksPage.jsx';
import InstructorSubmissionsPage from './InstructorSubmissionsPage.jsx';

// Replace other empty pages with simple placeholders for now
import FeedbackPage from '../FeedbackPage.jsx';
import NotificationsPage from '../NotificationsPage.jsx';
import ProfilePage from '../ProfilePage.jsx';
import SettingsPage from '../SettingsPage.jsx';

function InstructorDashboard() {
  const [activePage, setActivePage] = useState('sessions');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'sessions':      return <InstructorSessionsPage />;
      case 'attendance':    return <InstructorAttendancePage />;
      case 'resources':     return <InstructorResourcesPage />;
      case 'tasks':         return <InstructorTasksPage />;
      case 'submissions':   return <InstructorSubmissionsPage />;
      case 'feedback':      return <FeedbackPage />;
      case 'notifications': return <NotificationsPage />;
      case 'profile':       return <ProfilePage />;
      case 'settings':      return <SettingsPage />;
      default:              return <div className="card"><div className="empty-state"><h3>Coming Soon</h3></div></div>;
    }
  };

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <InstructorSidebar 
        active={activePage} 
        onNavigate={setActivePage} 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="main-wrapper">
        <InstructorTopbar activePage={activePage} />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default InstructorDashboard;
