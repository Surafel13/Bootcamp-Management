import React, { useState } from 'react';
import { 
  Lock, 
  LogOut, 
  Bell, 
  Shield, 
  User, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Settings = () => {
  const { logout } = useAuth();
  const { isDark, toggle } = useTheme();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    alert("Password updated successfully! ✅");
    setShowChangePassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* ====================== ACCOUNT SECURITY ====================== */}
        <div className="settings-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} /> Account Security
          </h3>

          <div className="settings-row">
            <div className="settings-row-label">
              <h4>Change Password</h4>
              <p>Update your password to keep your account secure</p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowChangePassword(!showChangePassword)}
            >
              <Lock size={17} />
              Change Password
            </button>
          </div>

          {/* Change Password Panel */}
          {showChangePassword && (
            <div style={{ 
              marginTop: '20px', 
              padding: '28px', 
              background: 'var(--bg-input)', 
              borderRadius: 'var(--radius)', 
              border: '1px solid var(--border)' 
            }}>
              <h4 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Change Your Password</h4>

              <form onSubmit={handleSubmitPassword}>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Current Password</label>
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    name="currentPassword"
                    className="form-input"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    style={{ position: 'absolute', right: '14px', top: '42px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="form-group" style={{ position: 'relative' }}>
                  <label>New Password</label>
                  <input
                    type={showNewPass ? "text" : "password"}
                    name="newPassword"
                    className="form-input"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{ position: 'absolute', right: '14px', top: '42px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Confirm New Password</label>
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    name="confirmPassword"
                    className="form-input"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    style={{ position: 'absolute', right: '14px', top: '42px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowChangePassword(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Logout */}
          <div className="settings-row" style={{ borderBottom: 'none' }}>
            <div className="settings-row-label">
              <h4>Logout</h4>
              <p>Sign out from your current session</p>
            </div>
            <button 
              className="btn btn-danger" 
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>

        {/* ====================== PREFERENCES ====================== */}
        <div className="settings-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} /> Preferences
          </h3>

          <div className="settings-row">
            <div className="settings-row-label">
              <h4>Dark Mode</h4>
              <p>Switch between light and dark theme</p>
            </div>
            <button
              className={`dark-toggle ${isDark ? 'on' : ''}`}
              onClick={toggle}
            >
              <span className="dark-toggle-thumb" />
            </button>
          </div>

          <div className="settings-row">
            <div className="settings-row-label">
              <h4>In-App Notifications</h4>
              <p>Receive notifications inside the dashboard</p>
            </div>
            <input 
              type="checkbox" 
              defaultChecked 
              style={{ width: '42px', height: '24px', accentColor: 'var(--primary)' }} 
            />
          </div>

          <div className="settings-row" style={{ borderBottom: 'none' }}>
            <div className="settings-row-label">
              <h4>Email Notifications</h4>
              <p>Get important updates via email</p>
            </div>
            <input 
              type="checkbox" 
              defaultChecked 
              style={{ width: '42px', height: '24px', accentColor: 'var(--primary)' }} 
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;