import { useState } from 'react';
import StudentSidebar from './StudentSidebar.jsx';
import StudentTopbar from './StudentTopbar.jsx';

import StudentOverview from './StudentOverview.jsx';
import StudentSessionsPage from './StudentSessionsPage.jsx';
import StudentTasksPage from './StudentTasksPage.jsx';
import StudentFeedbackPage from './StudentFeedbackPage.jsx';
import StudentProgressPage from './StudentProgressPage.jsx';

export default function StudentDashboard({ setRole }) {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <StudentOverview />;
      case 'sessions':  return <StudentSessionsPage />;
      case 'tasks':     return <StudentTasksPage />;
      case 'feedback':  return <StudentFeedbackPage />;
      case 'progress':  return <StudentProgressPage />;
      default:          return <StudentOverview />;
    }
  };

  return (
    <div className="app-layout">
      <StudentSidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-wrapper">
        <StudentTopbar activePage={activePage} setRole={setRole} />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
