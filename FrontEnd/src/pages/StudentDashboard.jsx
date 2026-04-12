import React, { useState } from 'react';
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
} from 'lucide-react';

// Import Pages
import Sessions from './dashboard/Sessions';
import Attendance from './dashboard/Attendance';
import Tasks from './dashboard/Tasks';
import Scanner from './dashboard/Scanner';
import Feedback from './dashboard/Feedback';
import Profile from './dashboard/Profile';
import Settings from './dashboard/Settings';

const StudentDashboard = () => {
  const [activePage, setActivePage] = useState('Sessions');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarItems = [
    { id: 'Sessions', icon: Calendar, label: 'Sessions' },
    { id: 'Attendance', icon: BarChart2, label: 'Attendance Overview' },
    { id: 'Tasks', icon: FileText, label: 'Task Submissions' },
    { id: 'Scanner', icon: QrCode, label: 'Scanner' },
    { id: 'Feedback', icon: MessageSquare, label: 'Feedback' },
    { id: 'Profile', icon: UserIcon, label: 'Profile' },
    { id: 'Settings', icon: SettingsIcon, label: 'Settings' },
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
      default: return <Sessions />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex font-sans text-text-primary">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white flex flex-col z-50 transition-transform duration-300 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center gap-3 h-[72px]">
          <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
            <Calendar size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Club Sessions</h1>
            <p className="text-[12px] text-text-secondary font-medium uppercase tracking-wide">Student Portal</p>
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
                  ? 'bg-primary-soft text-primary font-semibold'
                  : 'text-text-secondary hover:bg-surface-bg hover:text-text-primary'
                }`}
            >
              <item.icon size={20} className={activePage === item.id ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'} />
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
            <p className="text-[11px] text-text-secondary">All Systems Operational</p>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-danger font-semibold text-[14px] hover:bg-danger/5 rounded-xl transition duration-200">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-[72px] px-8 flex justify-between items-center bg-white border-b border-surface-border sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-primary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary font-medium">Pages / {activePage.replace(/([A-Z])/g, ' $1').trim()}</span>
              <h2 className="text-xl font-bold tracking-tight text-text-primary">{activePage.replace(/([A-Z])/g, ' $1').trim()}</h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Menu size={18} className="text-text-secondary group-hover:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-surface-bg border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
              />
            </div>
            
            <button className="p-2.5 text-text-secondary hover:bg-surface-bg rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger border-2 border-white rounded-full"></span>
            </button>

            <div className="h-[40px] w-px bg-surface-border"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-text-primary leading-none">Alex Johnson</p>
                <p className="text-[11px] text-text-secondary font-medium mt-1">Student / DevOps</p>
              </div>
              <div
                className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 border-2 border-white cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setActivePage('Profile')}
              >
                AJ
              </div>
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
