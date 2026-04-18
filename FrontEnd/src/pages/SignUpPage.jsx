import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart2, Eye, EyeOff, Lock, Mail, User
} from 'lucide-react';

export default function SignUpPage() {
  const { login } = useAuth(); // Assume signup might log them in or just redirect
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) { 
      setError('Please fill in all fields.'); 
      return; 
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    
    // Just mock logging them in or redirecting
    const ok = login(email, password);
    if (!ok) {
      // If mock login fails, just redirect to login
      navigate('/login');
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
          <h1>Create Account</h1>
          <p>Sign up to get started</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', display: 'flex' }}>
                <User size={16} />
              </span>
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
          </div>

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
                placeholder="student@bootcamp.edu"
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

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', display: 'flex', zIndex: 1 }}>
                <Lock size={16} />
              </span>
              <input
                className="form-input"
                style={{ paddingLeft: 36, paddingRight: 42, width: '100%' }}
                type={showConfirmPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="eye-btn"
                style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                onClick={() => setShowConfirmPw(v => !v)}
              >
                {showConfirmPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 500,
              marginTop: '10px'
            }}>
              {error}
            </div>
          )}

          <button className="login-btn" type="submit" disabled={loading} style={{ marginTop: '20px' }}>
            {loading ? 'Creating Account…' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Login
          </Link>
        </div>

        <div className="login-footer">
          © 2025 Club Sessions BMS · All rights reserved
        </div>
      </div>
    </div>
  );
}
