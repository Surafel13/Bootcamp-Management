import { Bell, Shield, Globe, Database, Mail, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function Toggle({ checked, onChange }) {
  return (
    <button
      className={`dark-toggle ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="dark-toggle-thumb" />
    </button>
  );
}

export default function SettingsPage() {
  const { isDark, toggle } = useTheme();

  return (
    <div className="settings-grid">
      {/* Appearance */}
      <div className="settings-card">
        <h3><Monitor size={17} /> Appearance</h3>

        <div className="settings-row">
          <div className="settings-row-label">
            <h4>Dark Mode</h4>
            <p>Switch between light and dark themes</p>
          </div>
          <Toggle checked={isDark} onChange={() => toggle()} />
        </div>

        <div className="settings-row">
          <div className="settings-row-label">
            <h4>Compact Sidebar</h4>
            <p>Collapse sidebar to icon-only mode</p>
          </div>
          <Toggle checked={false} onChange={() => { }} />
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-card">
        <h3><Bell size={17} /> Notifications</h3>

        {[
          { label: 'Email Notifications', desc: 'Receive alerts via email' },
          { label: 'In-App Notifications', desc: 'Show notifications in dashboard' },
          { label: 'Session Reminders', desc: 'Remind me before sessions start' },
          { label: 'Weekly Digest', desc: 'Weekly summary of system activity' },
        ].map((item, i) => (
          <div className="settings-row" key={i}>
            <div className="settings-row-label">
              <h4>{item.label}</h4>
              <p>{item.desc}</p>
            </div>
            <Toggle checked={i < 2} onChange={() => { }} />
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="settings-card">
        <h3><Shield size={17} /> Security</h3>

        {[
          { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security' },
          { label: 'Session Timeout', desc: 'Auto-logout after 30 minutes idle' },
          { label: 'Login Alerts', desc: 'Alert when new device logs in' },
        ].map((item, i) => (
          <div className="settings-row" key={i}>
            <div className="settings-row-label">
              <h4>{item.label}</h4>
              <p>{item.desc}</p>
            </div>
            <Toggle checked={i === 1} onChange={() => { }} />
          </div>
        ))}
      </div>

      {/* System */}
      <div className="settings-card">
        <h3><Database size={17} /> System</h3>

        {[
          { label: 'Automatic Backups', desc: 'Daily database backups at 3 AM' },
          { label: 'Maintenance Mode', desc: 'Restrict access during updates' },
          { label: 'Audit Logs', desc: 'Track all admin actions' },
        ].map((item, i) => (
          <div className="settings-row" key={i}>
            <div className="settings-row-label">
              <h4>{item.label}</h4>
              <p>{item.desc}</p>
            </div>
            <Toggle checked={i !== 1} onChange={() => { }} />
          </div>
        ))}
      </div>
    </div>
  );
}
