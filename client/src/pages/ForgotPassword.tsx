import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const { isDark, toggle } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Replace with your actual API base URL
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // This catches the AppError from your backend controller
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-page ${isDark ? 'dark' : ''}`}>
      {/* Background Blobs */}
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
            <KeyRound />
          </div>
          <h1>Reset Password</h1>
          <p>We'll send a recovery link to your inbox</p>
        </div>

        {!isSubmitted ? (
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 500,
                marginBottom: '15px'
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', display: 'flex' }}>
                  <Mail size={16} />
                </span>
                <input
                  className="form-input"
                  style={{ paddingLeft: 36, width: '100%' }}
                  type="email"
                  required
                  placeholder="admin@bootcamp.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: 'var(--text-main)', fontWeight: 500 }}>Check your inbox!</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
              We've sent a password reset link to <br />
              <strong style={{ color: 'var(--primary)' }}>{email}</strong>
            </p>
            <button 
              className="login-btn" 
              style={{ marginTop: '20px', background: 'var(--bg-lighter)', color: 'var(--text-main)' }}
              onClick={() => setIsSubmitted(false)}
            >
              Try another email
            </button>
          </div>
        )}

        <div className="login-forgot" style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Sign in
          </Link>
        </div>

        <div className="login-footer">
          © 2025 Club Sessions BMS · All rights reserved
        </div>
      </div>
    </div>
  );
}