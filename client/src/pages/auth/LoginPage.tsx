import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Eye, EyeOff, Lock, Mail, Moon, Sun } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { setCredentials } from '../../features/auth/authSlice';
import { toggleTheme, selectIsDark } from '../../features/ui/uiSlice';
import api from '../../lib/axios';

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin: '/admin',
  division_admin: '/division-admin',
  student: '/student',
};

const loginSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

// Reusable inline error message
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="text-danger text-xs font-medium mt-1 flex items-center gap-1">
      <span className="inline-block w-1 h-1 rounded-full bg-danger shrink-0" />
      {message}
    </div>
  );
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = useSelector(selectIsDark);

  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState('');

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        const { data } = await api.post('/auth/login', {
          email: values.email,
          password: values.password,
        });

        if (data.status === 'success') {
          const user = {
            ...data.data.user,
            activeRole: data.data.user.activeRole,
            activeDivisionId: data.data.user.activeDivision ?? null,
          };
          dispatch(setCredentials({
            user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }));
          navigate(ROLE_DASHBOARD[user.activeRole] ?? '/login', { replace: true });
        }
      } catch (err: any) {
        setServerError(err.response?.data?.message ?? 'Invalid credentials. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const inputClass = (hasError: boolean) =>
    `w-full py-3 pl-9 pr-3 border-[1.5px] rounded-sm bg-bg-input text-text-primary text-sm
     outline-none transition-all duration-300 focus:ring-4 focus:bg-bg-card placeholder:text-text-muted
     ${hasError
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-border focus:border-primary focus:ring-primary/15'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-5 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute w-125 h-125 rounded-full blur-[80px] pointer-events-none z-0
        bg-[radial-gradient(circle,rgba(2,89,97,0.25),transparent_70%)] -top-25 -left-25" />
      <div className="absolute w-125 h-125 rounded-full blur-[80px] pointer-events-none z-0
        bg-[radial-gradient(circle,rgba(22,139,150,0.18),transparent_70%)] -bottom-25 -right-25" />

      <button
        className={`
          fixed top-5 right-5 w-10.5 h-6 rounded-full 
          transition-all duration-300 cursor-pointer border-none
          ${isDark ? 'bg-primary' : 'bg-border'}
        `}
        onClick={() => dispatch(toggleTheme())}
        title="Toggle dark mode"
        aria-label="Toggle dark mode"
      >
        <span
          className={`
            absolute top-0.75 w-4.5 h-4.5 bg-white rounded-full shadow-sm
            transition-all duration-300 flex items-center justify-center
            ${isDark ? 'translate-x-4.5' : 'translate-x-0.75'}
          `}
        >
          {isDark
            ? <Moon size={11} className="text-primary" />
            : <Sun size={11} className="text-primary" />
          }
        </span>
      </button>

      {/* Login card */}
      <div className="bg-bg-card rounded-2xl p-11 w-full max-w-[420px] border border-border shadow-shadow-lg relative z-10 animate-slide-up">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-light rounded flex items-center justify-center mx-auto mb-3.5 shadow-shadow-primary">
            <BarChart2 className="w-7 h-7 text-text-on-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary mb-1">Club Sessions</h1>
          <p className="text-sm text-text-secondary">Bootcamp Management System</p>
        </div>

        {/* Form */}
        <form
          className="flex flex-col gap-4"
          onSubmit={formik.handleSubmit}
          noValidate
        >

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[0.82rem] font-semibold text-text-secondary">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@csec.edu"
                autoComplete="email"
                disabled={formik.isSubmitting}
                className={inputClass(!!(formik.touched.email && formik.errors.email))}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            <FieldError message={formik.touched.email ? formik.errors.email : undefined} />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[0.82rem] font-semibold text-text-secondary">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={formik.isSubmitting}
                className={inputClass(!!(formik.touched.password && formik.errors.password)).replace('pr-3', 'pr-11')}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors duration-300"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <FieldError message={formik.touched.password ? formik.errors.password : undefined} />
          </div>

          {/* Forgot password */}
          <div className="text-right -mt-1">
            <Link to="/forgot-password" className="text-xs text-primary font-medium hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="py-2.5 px-3.5 bg-danger/5 text-danger rounded-lg text-xs font-medium border border-danger/20 flex items-start gap-2">
              <span className="inline-block w-1 h-1 rounded-full bg-danger mt-1 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Submit — FIX: removed broken `<div className="text-">` wrapper */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full py-3 bg-linear-to-br from-primary to-primary-dark text-text-on-primary
              rounded-lg text-sm font-bold cursor-pointer transition-all duration-300
              shadow-shadow-primary mt-1
              hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(2,89,97,0.45)]
              active:translate-y-0
              disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {formik.isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </span>
            ) : (
              'Sign in to Dashboard'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-5 text-xs text-text-muted">
          © {new Date().getFullYear()} Club Sessions BMS · All rights reserved
        </p>
      </div>
    </div>
  );
}