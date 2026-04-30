import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Settings, Bell, Lock, Eye, Moon, Sun, Monitor, Save, User } from 'lucide-react';
import { selectUser } from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';

type ThemeMode = 'light' | 'dark' | 'system';
type SettingsSection = 'appearance' | 'notifications' | 'security' | 'account';

const SETTINGS_NAV = [
  { key: 'appearance' as SettingsSection, label: 'Appearance', icon: Eye },
  { key: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell },
  { key: 'security' as SettingsSection, label: 'Security', icon: Lock },
  { key: 'account' as SettingsSection, label: 'Account', icon: User },
];

export default function SettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');

  const [theme, setTheme] = useState<ThemeMode>('system');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [sessionNotifications, setSessionNotifications] = useState(true);
  const [taskNotifications, setTaskNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  const handleSavePreferences = () => {
    // TODO: Implement save preferences API
    toast('Preferences saved successfully');
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast('Please fill in all password fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      toast('Password must be at least 8 characters', 'error');
      return;
    }

    // TODO: Implement change password API
    toast('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'appearance':
        return <AppearanceSection theme={theme} setTheme={setTheme} />;
      case 'notifications':
        return (
          <NotificationsSection
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            pushNotifications={pushNotifications}
            setPushNotifications={setPushNotifications}
            sessionNotifications={sessionNotifications}
            setSessionNotifications={setSessionNotifications}
            taskNotifications={taskNotifications}
            setTaskNotifications={setTaskNotifications}
            onSave={handleSavePreferences}
          />
        );
      case 'security':
        return (
          <SecuritySection
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onChangePassword={handleChangePassword}
          />
        );
      case 'account':
        return <AccountSection user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Settings size={24} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-black text-text-primary mb-1">Settings</h2>
          <p className="text-sm text-text-secondary">
            Manage your account preferences and security settings
          </p>
        </div>
      </div>

      {/* Settings Layout with Secondary Sidebar */}
      <div className="flex gap-5">
        {/* Secondary Sidebar */}
        <div className="w-64 shrink-0">
          <div className="card sticky top-5">
            <nav className="flex flex-col gap-1">
              {SETTINGS_NAV.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeSection === key
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-semibold text-sm">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

// Section Components
function AppearanceSection({ theme, setTheme }: { theme: ThemeMode; setTheme: (theme: ThemeMode) => void }) {
  return (
    <div className="card">
      <h3 className="text-lg font-black text-text-primary mb-4">Appearance</h3>
      <div className="form-group">
        <label>Theme Mode</label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          <button
            className={`p-4 rounded-lg border transition-all ${
              theme === 'light'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-bg-hover hover:border-primary/40'
            }`}
            onClick={() => setTheme('light')}
          >
            <Sun size={24} className={`mx-auto mb-2 ${theme === 'light' ? 'text-primary' : 'text-text-muted'}`} />
            <div className={`text-sm font-semibold ${theme === 'light' ? 'text-primary' : 'text-text-secondary'}`}>
              Light
            </div>
          </button>
          <button
            className={`p-4 rounded-lg border transition-all ${
              theme === 'dark'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-bg-hover hover:border-primary/40'
            }`}
            onClick={() => setTheme('dark')}
          >
            <Moon size={24} className={`mx-auto mb-2 ${theme === 'dark' ? 'text-primary' : 'text-text-muted'}`} />
            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-primary' : 'text-text-secondary'}`}>
              Dark
            </div>
          </button>
          <button
            className={`p-4 rounded-lg border transition-all ${
              theme === 'system'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-bg-hover hover:border-primary/40'
            }`}
            onClick={() => setTheme('system')}
          >
            <Monitor size={24} className={`mx-auto mb-2 ${theme === 'system' ? 'text-primary' : 'text-text-muted'}`} />
            <div className={`text-sm font-semibold ${theme === 'system' ? 'text-primary' : 'text-text-secondary'}`}>
              System
            </div>
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Choose how the interface looks. System will match your device settings.
        </p>
      </div>
    </div>
  );
}

function NotificationsSection({
  emailNotifications,
  setEmailNotifications,
  pushNotifications,
  setPushNotifications,
  sessionNotifications,
  setSessionNotifications,
  taskNotifications,
  setTaskNotifications,
  onSave,
}: {
  emailNotifications: boolean;
  setEmailNotifications: (val: boolean) => void;
  pushNotifications: boolean;
  setPushNotifications: (val: boolean) => void;
  sessionNotifications: boolean;
  setSessionNotifications: (val: boolean) => void;
  taskNotifications: boolean;
  setTaskNotifications: (val: boolean) => void;
  onSave: () => void;
}) {
  return (
    <div className="card">
      <h3 className="text-lg font-black text-text-primary mb-4">Notifications</h3>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-text-primary">Email Notifications</div>
            <div className="text-xs text-text-muted">Receive notifications via email</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <div className="w-11 h-6 bg-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-text-primary">Push Notifications</div>
            <div className="text-xs text-text-muted">Receive browser push notifications</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
            />
            <div className="w-11 h-6 bg-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-text-primary">Session Reminders</div>
            <div className="text-xs text-text-muted">Get notified before sessions start</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={sessionNotifications}
              onChange={(e) => setSessionNotifications(e.target.checked)}
            />
            <div className="w-11 h-6 bg-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-text-primary">Task Deadlines</div>
            <div className="text-xs text-text-muted">Get notified about upcoming task deadlines</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={taskNotifications}
              onChange={(e) => setTaskNotifications(e.target.checked)}
            />
            <div className="w-11 h-6 bg-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-border">
        <button className="btn btn-primary flex items-center gap-2" onClick={onSave}>
          <Save size={14} />
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function SecuritySection({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onChangePassword,
}: {
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  onChangePassword: () => void;
}) {
  return (
    <div className="card">
      <h3 className="text-lg font-black text-text-primary mb-4">Security</h3>
      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-text-muted mt-1">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button className="btn btn-primary flex items-center gap-2 w-fit" onClick={onChangePassword}>
          <Lock size={14} />
          Change Password
        </button>
      </div>
    </div>
  );
}

function AccountSection({ user }: { user: any }) {
  return (
    <div className="card">
      <h3 className="text-lg font-black text-text-primary mb-4">Account Information</h3>
      <div className="flex flex-col gap-4 max-w-2xl">
        <div>
          <div className="text-xs font-semibold text-text-muted mb-1.5">Account ID</div>
          <div className="font-mono text-sm text-text-primary bg-bg-hover p-3 rounded-lg">
            {user?._id}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-text-muted mb-1.5">Email</div>
          <div className="font-semibold text-text-primary bg-bg-hover p-3 rounded-lg">
            {user?.email}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-text-muted mb-1.5">Status</div>
          <div className="bg-bg-hover p-3 rounded-lg">
            <span className="font-semibold text-success capitalize">{user?.status}</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-text-muted mb-1.5">Member Since</div>
          <div className="text-sm text-text-primary bg-bg-hover p-3 rounded-lg">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}