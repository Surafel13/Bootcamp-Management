import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  BarChart2,
  FileText,
  QrCode,
  MessageSquare,
  Bell,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  Moon,
  Sun,
  BookOpen
} from 'lucide-react';

// Import Pages
import Sessions from './dashboard/Sessions';
import Attendance from './dashboard/Attendance';
import Tasks from './dashboard/Tasks';
import Scanner from './dashboard/Scanner';
import Feedback from './dashboard/Feedback';
import Profile from './dashboard/Profile';
import Settings from './dashboard/Settings';
import Resources from './dashboard/Resources';
import Notifications from './dashboard/Notifications';
const StudentDashboard = ({ onLogout }) => {
  const [activePage, setActivePage] = useState('Sessions');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const sidebarItems = [
    { id: 'Sessions', icon: Calendar, label: 'Sessions' },
    { id: 'Attendance', icon: BarChart2, label: 'Attendance Overview' },
    { id: 'Tasks', icon: FileText, label: 'Task Submissions' },
    { id: 'Scanner', icon: QrCode, label: 'Scanner' },
    { id: 'Resources', icon: BookOpen, label: 'Resources' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Feedback', icon: MessageSquare, label: 'Feedback' },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'Sessions': return <Sessions />;
      case 'Attendance': return <Attendance />;
      case 'Tasks': return <Tasks />;
      case 'Scanner': return <Scanner />;
      case 'Feedback': return <Feedback />;
      case 'Profile': return <Profile />;
      case 'Settings': return <Settings />;
      case 'Resources': return <Resources />;
      case 'Notifications': return <Notifications />;
      default: return <Sessions />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg dark:bg-[#0F172A] flex font-sans text-text-primary dark:text-[#F9FAFB] transition-colors duration-300">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-slate-700 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center gap-3 h-[72px]">
          <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
            <Calendar size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Club Sessions</h1>
            <p className="text-[12px] text-text-secondary dark:text-[#9CA3AF] font-medium uppercase tracking-wide">Student Portal</p>
          </div>
        </div>

        <nav className="px-4 py-6 space-y-2 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group ${activePage === item.id
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-600 dark:text-white font-semibold shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <item.icon size={20} className={activePage === item.id ? 'text-purple-700 dark:text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'} />
              <span className="text-[14px]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-success/10 p-4 rounded-2xl mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-[12px] font-bold text-success uppercase tracking-wider">System Status</span>
            </div>
            <p className="text-[11px] text-text-secondary dark:text-[#9CA3AF]">All Systems Operational</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-[72px] px-8 flex justify-between items-center bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-primary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Student Dashboard</h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-text-secondary dark:text-[#9CA3AF] hover:bg-surface-bg dark:hover:bg-[#1E293B] rounded-xl transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className="p-2.5 text-text-secondary dark:text-[#9CA3AF] hover:bg-surface-bg dark:hover:bg-[#1E293B] rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger border-2 border-white dark:border-[#111827] rounded-full"></span>
            </button>

            <div className="h-[40px] w-px bg-surface-border dark:bg-[#2D3748]"></div>

            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-text-primary dark:text-[#F9FAFB] leading-none">Alex Johnson</p>
                <p className="text-[11px] text-text-secondary dark:text-[#9CA3AF] font-medium mt-1">Student / DevOps</p>
              </div>
              <div
                className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 border-2 border-white dark:border-[#111827] cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                AJ
              </div>
              
              {isProfileDropdownOpen && (
                <div className="absolute top-[120%] right-0 w-48 bg-white dark:bg-slate-800 dark:bg-[#1E293B] border border-surface-border dark:border-[#2D3748] rounded-xl shadow-lg mt-2 py-2 z-50">
                  <button 
                    onClick={() => { setActivePage('Profile'); setIsProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary dark:text-[#F9FAFB] hover:bg-surface-bg dark:hover:bg-[#2D3748] transition-colors flex items-center gap-2"
                  >
                    <UserIcon size={16} /> Profile
                  </button>
                  <button 
                    onClick={() => { setActivePage('Settings'); setIsProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary dark:text-[#F9FAFB] hover:bg-surface-bg dark:hover:bg-[#2D3748] transition-colors flex items-center gap-2"
                  >
                    <SettingsIcon size={16} /> Settings
                  </button>
                  <div className="my-1 border-t border-gray-200 dark:border-slate-700"></div>
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-danger dark:hover:bg-danger/10 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="p-8 flex-1 w-full max-w-7xl mx-auto overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
