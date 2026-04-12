import React, { useState } from 'react';
import { Calendar, ChevronRight, Video } from 'lucide-react';
import SessionDetails from './SessionDetails';

const Sessions = () => {
  const [selectedSession, setSelectedSession] = useState(null);

  const upcomingSessions = [
    {
      title: 'Advanced React Patterns',
      category: 'Developmental',
      date: 'Apr 12, 2026',
      time: '2:00 PM - 4:00 PM',
      color: 'bg-teal-400',
      location: 'Virtual Room A',
      instructor: 'S. Anderson',
      status: 'Ongoing',
      description: 'Master advanced component composition, custom hooks, and state management techniques necessary for complex React applications.'
    },
    {
      title: 'Cybersecurity Fundamentals',
      category: 'Cyber',
      date: 'Apr 14, 2026',
      time: '3:00 PM - 5:00 PM',
      color: 'bg-teal-400',
      location: 'Virtual Room B',
      instructor: 'M. Peterson',
      status: 'Upcoming',
      description: 'An intro to network security, cryptography, and defense strategies against common vulnerabilities.'
    },
    {
      title: 'Data Analysis with Python',
      category: 'Data Science',
      date: 'Apr 15, 2026',
      time: '1:00 PM - 3:00 PM',
      color: 'bg-teal-400',
      location: 'Virtual Room C',
      instructor: 'Dr. R. Lin',
      status: 'Upcoming',
      description: 'Utilize Pandas, NumPy, and Matplotlib to analyze and visualize large datasets effectively.'
    },
  ];

  if (selectedSession) {
    return <SessionDetails session={selectedSession} onBack={() => setSelectedSession(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Sessions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Don't miss your next learning opportunity</p>
          </div>
          <button className="text-purple-600 dark:text-purple-400 text-sm font-semibold hover:underline flex items-center gap-1 transition-all">
            View all schedule <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="grid gap-4">
          {upcomingSessions.map((session, index) => (
            <div key={index} className="card flex flex-col md:flex-row md:items-center justify-between hover:border-purple-300 dark:hover:border-slate-600 transition-all cursor-default group gap-4">
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-600/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                     {session.title}
                     {session.status === 'Ongoing' && (
                       <span className="w-2 h-2 rounded-full bg-danger animate-pulse" title="Live Now"></span>
                     )}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${session.color}`}></span>
                      {session.category}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-slate-700 hidden sm:block"></span>
                    <span>{session.date}</span>
                    <span className="text-gray-300 dark:text-slate-600">•</span>
                    <span>{session.time}</span>
                    <span className="text-gray-300 dark:text-slate-600 hidden sm:block">•</span>
                    <span className="hidden sm:block">{session.location}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSession(session)}
                className="self-start md:self-auto px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:text-purple-400 dark:hover:bg-purple-600/10 border border-gray-200 dark:border-slate-700 transition-colors whitespace-nowrap"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent History</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your completion record</p>
        </div>
        
        <div className="grid gap-4">
          <div className="card flex flex-col md:flex-row md:items-center justify-between hover:border-green-200 dark:hover:border-green-900/50 transition-all cursor-default gap-4">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center text-success border border-success/20 shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <h4 className="font-bold text-base text-gray-900 dark:text-white mb-1">Web Development Workshop</h4>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    Developmental
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-slate-700"></span>
                  <span>Apr 8, 2026</span>
                  <span className="text-gray-300 dark:text-slate-600">•</span>
                  <span>2:00 PM - 4:00 PM</span>
                </div>
              </div>
            </div>
            <span className="self-start md:self-auto badge bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 font-bold px-3 py-1 text-xs uppercase tracking-widest whitespace-nowrap">
              COMPLETED
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sessions;
