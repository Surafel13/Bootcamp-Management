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
    <div className="min-h-screen bg-[#fafbfc] flex font-sans text-[#000000]">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 flex items-center gap-2 border-b border-gray-50 h-[64px]">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Calendar size={18} />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-gray-900">Club Sessions</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Student Portal</p>
          </div>
        </div>

        <nav className="p-2 space-y-0.5 mt-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 ${activePage === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#000000]'
                }`}
            >
              <item.icon size={16} className={activePage === item.id ? 'text-white' : 'text-gray-400'} />
              <span className="font-bold text-[11px]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-3">
          <button className="w-full mb-2 flex items-center gap-2.5 px-3 py-2 text-rose-500 font-black text-[10px] uppercase hover:bg-rose-50 rounded-lg transition tracking-widest text-left">
            <LogOut size={14} />
            Termination
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-[64px] px-6 flex justify-between items-center bg-[#fafbfc] border-b border-gray-50">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-indigo-600"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900">{activePage.replace(/([A-Z])/g, ' $1').trim()}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-gray-900 leading-none">Alex Johnson</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5 font-mono">Developmental</p>
              </div>
              <div
                className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm cursor-pointer"
                onClick={() => setActivePage('Profile')}
              >
                AJ
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="p-6 flex-1 w-full max-w-6xl mx-auto overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
