import { useState } from 'react';
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
import Notifications from './Notifications';

function StudentDashboard() {
  const [activePage, setActivePage] = useState('sessions');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'sessions': return <Sessions />;
      case 'attendance': return <Attendance />;
      case 'tasks': return <Tasks />;
      case 'scanner': return <Scanner />;
      case 'feedback': return <Feedback />;
      case 'profile': return <Profile />;
      case 'settings': return <Settings />;
      case 'resources': return <Resources />;
      case 'notifications': return <Notifications />;
      default: return <Sessions />;
    }
  };

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <StudentSidebar
        active={activePage}
        onNavigate={setActivePage}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="main-wrapper">
        <StudentTopbar activePage={activePage} />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
