import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { KeyRound, ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { toggleTheme, selectIsDark } from '../../features/ui/uiSlice';
import api from '../../lib/axios';

export default function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = useSelector(selectIsDark);
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(true);
  const [validating, setValidating] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Backend expects token in URL params
        await api.get(`/auth/validate-reset-password-token/${token}`);
        setIsValidToken(true);
      } catch (err: any) {
        setIsValidToken(false);
        setError(err.response?.data?.message || 'Invalid or expired reset link. Please request a new one.');
      } finally {
        setValidating(false);
      }
    };

    if (token) {
      validateToken();
    } else {
      setIsValidToken(false);
      setError('No reset token provided.');
      setValidating(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Backend expects token in URL params and password in body
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      
      // Store tokens if your app uses them
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      setIsSubmitted(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark p-5 relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none z-0 bg-gradient-radial from-primary/25 to-transparent top-[-100px] left-[-100px]" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none z-0 bg-gradient-radial from-[#168b96]/18 to-transparent bottom-[-100px] right-[-100px]" />
        
        <div className="bg-bg-card dark:bg-bg-card-dark rounded-xl p-11 w-full max-w-[420px] border border-border dark:border-border-dark shadow-lg relative z-10">
          <div className="text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center mx-auto mb-3.5 shadow-primary">
              <KeyRound className="w-7 h-7 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-primary-dark mb-2">
              Validating Link...
            </h1>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
              Please wait while we verify your reset link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark p-5 relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none z-0 bg-gradient-radial from-primary/25 to-transparent top-[-100px] left-[-100px]" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none z-0 bg-gradient-radial from-[#168b96]/18 to-transparent bottom-[-100px] right-[-100px]" />
        
        <button
          className={`fixed top-5 right-5 w-[42px] h-6 rounded-full border-none cursor-pointer transition-all duration-300 flex-shrink-0 ${
            isDark ? 'bg-primary' : 'bg-border dark:bg-border-dark'
          }`}
          onClick={() => dispatch(toggleTheme())}
          title="Toggle dark mode"
        >
          <span
            className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all duration-300 ${
              isDark ? 'translate-x-[18px]' : ''
            }`}
          />
        </button>

        <div className="bg-bg-card dark:bg-bg-card-dark rounded-xl p-11 w-full max-w-[420px] border border-border dark:border-border-dark shadow-lg relative z-10">
          <div className="text-center">
            <div className="w-14 h-14 bg-danger/20 rounded-lg flex items-center justify-center mx-auto mb-3.5">
              <KeyRound className="w-7 h-7 text-danger" />
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-primary-dark mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
              {error}
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg text-[0.95rem] font-bold no-underline transition-all duration-300 shadow-primary hover:-translate-y-0.5"
            >
              Request New Reset Link
            </Link>
            <div className="mt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-primary text-sm font-medium no-underline hover:underline"
              >
                <ArrowLeft size={14} /> Back to Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark p-5 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none z-0 bg-gradient-radial from-primary/25 to-transparent top-[-100px] left-[-100px]" />
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none z-0 bg-gradient-radial from-[#168b96]/18 to-transparent bottom-[-100px] right-[-100px]" />

      <button
        className={`fixed top-5 right-5 w-[42px] h-6 rounded-full border-none cursor-pointer transition-all duration-300 flex-shrink-0 ${
          isDark ? 'bg-primary' : 'bg-border dark:bg-border-dark'
        }`}
        onClick={() => dispatch(toggleTheme())}
        title="Toggle dark mode"
      >
        <span
          className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all duration-300 ${
            isDark ? 'translate-x-[18px]' : ''
          }`}
        />
      </button>

      <div className="bg-bg-card dark:bg-bg-card-dark rounded-xl p-11 w-full max-w-[420px] border border-border dark:border-border-dark shadow-lg relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center mx-auto mb-3.5 shadow-primary">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-primary-dark mb-1">
            Create New Password
          </h1>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
            Please enter your new password below
          </p>
        </div>

        {!isSubmitted ? (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <div className="px-3.5 py-2.5 bg-danger-light text-danger rounded-lg text-[0.82rem] font-medium">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.82rem] font-semibold text-text-secondary dark:text-text-secondary-dark">
                New Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-text-muted dark:text-text-muted-dark flex">
                  <KeyRound size={16} />
                </span>
                <input
                  className="w-full pl-9 pr-11 py-2.5 border-[1.5px] border-border dark:border-border-dark rounded-lg bg-bg-input dark:bg-bg-input-dark text-text-primary dark:text-text-primary-dark text-[0.9rem] font-sans outline-none transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_3px_rgba(2,89,97,0.15)] focus:bg-bg-card dark:focus:bg-bg-card-dark placeholder:text-text-muted dark:placeholder:text-text-muted-dark"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 text-text-muted dark:text-text-muted-dark hover:text-primary transition-colors duration-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <p className="text-[0.7rem] text-text-muted dark:text-text-muted-dark mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.82rem] font-semibold text-text-secondary dark:text-text-secondary-dark">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-text-muted dark:text-text-muted-dark flex">
                  <KeyRound size={16} />
                </span>
                <input
                  className="w-full pl-9 pr-11 py-2.5 border-[1.5px] border-border dark:border-border-dark rounded-lg bg-bg-input dark:bg-bg-input-dark text-text-primary dark:text-text-primary-dark text-[0.9rem] font-sans outline-none transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_3px_rgba(2,89,97,0.15)] focus:bg-bg-card dark:focus:bg-bg-card-dark placeholder:text-text-muted dark:placeholder:text-text-muted-dark"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 text-text-muted dark:text-text-muted-dark hover:text-primary transition-colors duration-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              className="w-full py-3.5 bg-gradient-to-br from-primary to-primary-dark text-white border-none rounded-lg text-[0.95rem] font-bold cursor-pointer transition-all duration-300 shadow-primary font-sans mt-1 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(2,89,97,0.45)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="text-center py-5">
            <div className="w-14 h-14 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3.5">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <p className="text-text-primary dark:text-text-primary-dark font-medium text-lg mb-2">
              Password Reset Successful!
            </p>
            <p className="text-[0.85rem] text-text-secondary dark:text-text-secondary-dark leading-relaxed">
              Your password has been successfully reset.<br />
              Redirecting you to the login page...
            </p>
            <div className="mt-5">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </div>
        )}

        {!isSubmitted && (
          <div className="text-center mt-5">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 no-underline text-primary text-sm font-medium hover:underline"
            >
              <ArrowLeft size={14} /> Back to Sign in
            </Link>
          </div>
        )}

        <div className="text-center mt-5 pt-4 border-t border-border dark:border-border-dark text-[0.78rem] text-text-muted dark:text-text-muted-dark">
          © {new Date().getFullYear()} Club Sessions BMS · All rights reserved
        </div>
      </div>
    </div>
  );
}