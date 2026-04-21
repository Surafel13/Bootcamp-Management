import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart2, Eye, EyeOff, Moon, Sun, Lock, Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const { isDark, toggle } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message || 'Invalid credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg-blob login-bg-blob-1" />
      <div className="login-bg-blob login-bg-blob-2" />

      {/* Dark mode toggle */}
      <button
        className={`dark-toggle ${isDark ? 'on' : ''}`}
        onClick={toggle}
        style={{ position: 'fixed', top: 20, right: 20 }}
        title="Toggle dark mode"
      >
        <span className="dark-toggle-thumb" />
      </button>

      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <BarChart2 />
          </div>
          <h1>Club Sessions</h1>
          <p>Bootcamp Management System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', display: 'flex' }}>
                <Mail size={16} />
              </span>
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                type="email"
                placeholder="admin@bootcamp.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', display: 'flex', zIndex: 1 }}>
                <Lock size={16} />
              </span>
              <input
                className="form-input"
                style={{ paddingLeft: 36, paddingRight: 42, width: '100%' }}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="eye-btn"
                style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                onClick={() => setShowPw(v => !v)}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="login-forgot">Forgot password?</div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in to Dashboard'}
          </button>
        </form>

        <div className="login-footer">
          © 2025 Club Sessions BMS · All rights reserved
        </div>
      </div>
    </div>
  );
}
