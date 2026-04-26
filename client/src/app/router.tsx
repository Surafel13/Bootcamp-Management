import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectActiveRole } from '../features/auth/authSlice';

import LoginPage from '../pages/auth/LoginPage.tsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.tsx';
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard.tsx';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.tsx';
// import InstructorDashboard from '../pages/division-admin/InstructorDashboard.tsx';
import DivisionAdminDashboard from '../pages/division-admin/DivisionAdminDashboard.tsx';
import StudentDashboard from '../pages/student/StudentDashboard.tsx';


const ROLE_DASHBOARD = {
  super_admin: '/admin',
  division_admin: '/division-admin',
  student: '/student',
};

function RoleRedirect() {
  const activeRole      = useSelector(selectActiveRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!activeRole) return null;

  const dest = ROLE_DASHBOARD[activeRole] ?? '/login';
  return <Navigate to={dest} replace />;
}

function RequireAuth({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const activeRole = useSelector(selectActiveRole);
  if (isAuthenticated) return <Navigate to={ROLE_DASHBOARD[activeRole] ?? '/'} replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
      <Route path="/reset-password/:token" element={<GuestOnly><ResetPasswordPage /></GuestOnly>} />

      {/* Protected role dashboards */}
      <Route path="/admin/*" element={<RequireAuth><SuperAdminDashboard /></RequireAuth>} />
      <Route path="/division-admin/*" element={<RequireAuth><DivisionAdminDashboard /></RequireAuth>} />
      <Route path="/student/*" element={<RequireAuth><StudentDashboard /></RequireAuth>} />

      {/* Root: redirect to correct dashboard or login */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}