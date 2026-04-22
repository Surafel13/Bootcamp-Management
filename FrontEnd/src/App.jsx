import React, { useState } from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';

import LoginPage from './pages/LoginPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';

import AnalyticsPage from './pages/AnalyticsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import GroupsPage from './pages/GroupsPage.jsx';
import MasterSchedulePage from './pages/MasterSchedulePage.jsx';
import AuditLogsPage from './pages/AuditLogsPage.jsx';
import DivisionsPage from './pages/DivisionsPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import InstructorDashboard from './pages/Instructor/InstructorDashboard.jsx';
import StudentDashboard from './pages/Student/StudentDashboard.jsx';

function SuperAdminDashboard() {
  const [activePage, setActivePage] = useState('analytics');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'analytics': return <AnalyticsPage />;
      case 'users': return <UsersPage />;
      case 'groups': return <GroupsPage />;
      case 'master-schedule': return <MasterSchedulePage />;
      case 'audit': return <AuditLogsPage />;
      case 'divisions': return <DivisionsPage />;
      case 'feedback': return <FeedbackPage />;
      case 'notifications': return <NotificationsPage />;
      case 'profile': return <ProfilePage />;
      case 'settings': return <SettingsPage />;
      default: return <AnalyticsPage />;
    }
  };

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="main-wrapper">
        <Topbar activePage={activePage} notifCount={3} />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function AppInner() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Handle Multiple Roles - Priority Order
  if (user.roles.includes('super_admin')) {
    return <SuperAdminDashboard />;
  }

  if (user.roles.includes('division_admin')) {
    return <InstructorDashboard />;
  }

  if (user.roles.includes('student')) {
    return <StudentDashboard />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>        {/* ← This fixes the useNavigate error */}
            <AppInner />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
