import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams(); // Grabs the token from the URL /reset-password/:token
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/api/auth/reset-password/${token}`, {
        method: 'PATCH', // Your backend controller likely uses PATCH or POST
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Reset failed. Token may be expired.');
      }

      setIsSuccess(true);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-page ${isDark ? 'dark' : ''}`}>
      <div className="login-bg-blob login-bg-blob-1" />
      <div className="login-bg-blob login-bg-blob-2" />

      <button className={`dark-toggle ${isDark ? 'on' : ''}`} onClick={toggle} style={{ position: 'fixed', top: 20, right: 20 }}>
        <span className="dark-toggle-thumb" />
      </button>

      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon" style={{ background: isSuccess ? '#10b981' : 'var(--primary)' }}>
            {isSuccess ? <CheckCircle2 /> : <Lock />}
          </div>
          <h1>{isSuccess ? 'Password Reset' : 'New Password'}</h1>
          <p>{isSuccess ? 'Your password has been updated successfully.' : 'Please enter your new secure password.'}</p>
        </div>

        {!isSuccess ? (
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: '10px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '15px' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>New Password</label>
              <div className="input-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', display: 'flex' }}>
                  <Lock size={16} />
                </span>
                <input
                  className="form-input"
                  style={{ paddingLeft: 36, paddingRight: 40, width: '100%' }}
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)} 
                  style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                className="form-input"
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Redirecting you to login...</p>
            <Link to="/login" className="login-btn" style={{ display: 'block', marginTop: '20px', textDecoration: 'none' }}>
              Sign In Now
            </Link>
          </div>
        )}

        <div className="login-footer">
          © 2025 Club Sessions BMS · All rights reserved
        </div>
      </div>
    </div>
  );
}