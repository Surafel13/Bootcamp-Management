import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { toggleTheme, selectIsDark } from '../../features/ui/uiSlice';
import api from '../../lib/axios';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const isDark = useSelector(selectIsDark);

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark p-5 relative overflow-hidden">
      {/* Background blobs */}
      <div
        className="absolute w-125 h-125 rounded-full blur-[80px] pointer-events-none z-0 -top-25 -left-25"
        style={{ background: 'radial-gradient(circle, rgba(2, 89, 97, 0.25), transparent 70%)' }}
      />
      <div
        className="absolute w-125 h-125 rounded-full blur-[80px] pointer-events-none z-0 -bottom-25 -right-25"
        style={{ background: 'radial-gradient(circle, rgba(22, 139, 150, 0.18), transparent 70%)' }}
      />

      {/* Dark mode toggle button */}
      <button
        className={`fixed top-5 right-5 w-10.5 h-6 rounded-full border-none cursor-pointer transition-all duration-300 shrink-0 ${isDark ? 'bg-primary' : 'bg-border dark:bg-border-dark'
          }`}
        onClick={() => dispatch(toggleTheme())}
        title="Toggle dark mode"
      >
        <span
          className={`absolute top-0.75 left-0.75 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-300 ${isDark ? 'translate-x-4.5' : ''
            }`}
        />
      </button>

      {/* Login card */}
      <div className="bg-bg-card dark:bg-bg-card-dark rounded-xl p-11 w-full max-w-[420px] border border-border dark:border-border-dark shadow-lg relative z-10 animate-slide-up">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-light rounded-lg flex items-center justify-center mx-auto mb-3.5 shadow-primary">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-primary-dark mb-1">
            Reset Password
          </h1>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
            We'll send a recovery link to your inbox
          </p>
        </div>

        {!isSubmitted ? (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div className="px-3.5 py-2.5 bg-danger-light text-danger rounded-lg text-[0.82rem] font-medium mb-1">
                {error}
              </div>
            )}

            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.82rem] font-semibold text-text-secondary dark:text-text-secondary-dark">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-text-muted dark:text-text-muted-dark flex">
                  <Mail size={16} />
                </span>
                <input
                  className="w-full pl-9 pr-3.5 py-2.5 border-[1.5px] border-border dark:border-border-dark rounded-lg bg-bg-input dark:bg-bg-input-dark text-text-primary dark:text-text-primary-dark text-[0.9rem] font-sans outline-none transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_3px_rgba(2,89,97,0.15)] focus:bg-bg-card dark:focus:bg-bg-card-dark placeholder:text-text-muted dark:placeholder:text-text-muted-dark"
                  type="email"
                  required
                  placeholder="you@csec.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              className="w-full py-3.5 bg-linear-to-br from-primary to-primary-dark text-white border-none rounded-lg text-[0.95rem] font-bold cursor-pointer transition-all duration-300 shadow-primary font-sans mt-1 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(2,89,97,0.45)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sending link…' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center py-5">
            <p className="text-text-primary dark:text-text-primary-dark font-medium">
              Check your inbox!
            </p>
            <p className="text-[0.85rem] text-text-muted dark:text-text-muted-dark mt-2 leading-relaxed">
              We've sent a password reset link to<br />
              <strong className="text-primary">{email}</strong>
            </p>
            <button
              className="w-full py-3.5 bg-bg-lighter bg-bg-active dark:bg-bg-input-dark text-text-primary dark:text-text-primary-dark border-none rounded-lg text-[0.95rem] font-bold cursor-pointer transition-all duration-300 font-sans mt-5 hover:bg-bg-hover dark:hover:bg-bg-hover-dark"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
            >
              Try another email
            </button>
          </div>
        )}

        {/* Back to login link */}
        <div className="text-center mt-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 no-underline text-primary text-sm font-medium hover:underline"
          >
            <ArrowLeft size={14} /> Back to Sign in
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-5 text-[0.78rem] text-text-muted dark:text-text-muted-dark">
          © {new Date().getFullYear()} Club Sessions BMS · All rights reserved
        </div>
      </div>
    </div>
  );
}