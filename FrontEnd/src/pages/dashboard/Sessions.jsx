import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

const Sessions = () => {
  const upcomingSessions = [
    {
      title: 'Advanced React Patterns',
      category: 'Developmental',
      date: 'Apr 12, 2026',
      time: '2:00 PM - 4:00 PM',
      color: 'bg-teal-400',
    },
    {
      title: 'Cybersecurity Fundamentals',
      category: 'Cyber',
      date: 'Apr 14, 2026',
      time: '3:00 PM - 5:00 PM',
      color: 'bg-teal-400',
    },
    {
      title: 'Data Analysis with Python',
      category: 'Data Science',
      date: 'Apr 15, 2026',
      time: '1:00 PM - 3:00 PM',
      color: 'bg-teal-400',
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-900">Upcoming Sessions</h3>
          <button className="text-indigo-600 text-[11px] font-black uppercase tracking-widest hover:underline flex items-center gap-1 transition">
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {upcomingSessions.map((session, index) => (
            <div key={index} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:bg-gray-50/50 transition cursor-default">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-100">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 leading-tight mb-0.5">{session.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${session.color}`}></span>
                      {session.category}
                    </span>
                    <span>•</span>
                    <span>{session.date}</span>
                    <span>•</span>
                    <span>{session.time}</span>
                  </div>
                </div>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition active:scale-95 shadow-sm">
                Details
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-900">Recent Sessions</h3>
        </div>
        <div className="space-y-2">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:bg-gray-50/50 transition cursor-default">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900 leading-tight mb-0.5">Web Development Workshop</h4>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    Developmental
                  </span>
                  <span>•</span>
                  <span>Apr 8, 2026</span>
                  <span>•</span>
                  <span>2:00 PM - 4:00 PM</span>
                </div>
              </div>
            </div>
            <div className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-[0.2em] border border-teal-100">
              Attended
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sessions;
