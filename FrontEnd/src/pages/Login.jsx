import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Calendar, Lock, Mail, Sun, Moon } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin(); // Simulate login logic
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gradient-to-br dark:from-[#0F172A] dark:to-[#020617] font-sans transition-colors duration-300 relative">

      {/* Theme Toggler */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-md rounded-xl transition-all shadow-sm border border-gray-200 dark:border-slate-800"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* App Logo */}
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#A89CF7] to-[#7C6CF2] flex items-center justify-center text-white shadow-xl shadow-purple-500/20 mb-4 transform transition hover:scale-105 duration-300">
          <Calendar size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">Club Sessions</h1>
        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em]">Bootcamp Portal</p>
      </div>

      {/* Login Card */}
      <div
        className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl dark:shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-2xl dark:hover:shadow-purple-500/10 hover:border-gray-300 dark:hover:border-slate-600 animate-in fade-in zoom-in-95 duration-500"
      >
        <div className="text-center mb-8">
          <h2 className="text-gray-900 dark:text-white text-2xl font-semibold mb-2">Welcome Back</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Login to your Student Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5 relative group">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 relative group">
              <div className="flex justify-between items-center ml-1 mb-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors hidden sm:block">Forgot Password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium tracking-wide"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="sm:hidden mt-2 text-right">
                <a href="#" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">Forgot Password?</a>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 rounded bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-purple-600 dark:text-purple-500 focus:ring-purple-500/50 cursor-pointer"
            />
            <label htmlFor="remember" className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
              Remember me for 30 days
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] flex justify-center items-center gap-2"
          >
            Access Dashboard
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800 text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Password Forget?{' '}
            <a href="#" className="text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
              Reset Password
            </a>
          </p>
        </div>
      </div>

      {/* Decorative Blur Elements - Only visible subtly in dark mode or lighter in light mode */}
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default Login;
