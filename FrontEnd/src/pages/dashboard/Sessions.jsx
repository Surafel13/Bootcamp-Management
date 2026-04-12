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
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xl font-bold text-text-primary">Upcoming Sessions</h3>
            <p className="text-sm text-text-secondary mt-1">Don't miss your next learning opportunity</p>
          </div>
          <button className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 transition-all">
            View all sessions <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="grid gap-4">
          {upcomingSessions.map((session, index) => (
            <div key={index} className="card flex items-center justify-between hover:border-primary/30 transition-all cursor-default group">
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-text-primary mb-1">{session.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-text-secondary font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${session.color}`}></span>
                      {session.category}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-surface-border"></span>
                    <span>{session.date}</span>
                    <span className="w-1 h-1 rounded-full bg-surface-border"></span>
                    <span>{session.time}</span>
                  </div>
                </div>
              </div>
              <button className="btn-primary">
                Join Session
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-text-primary">Recent History</h3>
          <p className="text-sm text-text-secondary mt-1">Your completion record</p>
        </div>
        
        <div className="grid gap-4">
          <div className="card flex items-center justify-between hover:border-green-200 transition-all cursor-default">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center text-success border border-success/20 shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <h4 className="font-bold text-base text-text-primary mb-1">Web Development Workshop</h4>
                <div className="flex items-center gap-4 text-xs text-text-secondary font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    Developmental
                  </span>
                  <span className="w-1 h-1 rounded-full bg-surface-border"></span>
                  <span>Apr 8, 2026</span>
                  <span className="w-1 h-1 rounded-full bg-surface-border"></span>
                  <span>2:00 PM - 4:00 PM</span>
                </div>
              </div>
            </div>
            <span className="badge badge-green">
              COMPLETED
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sessions;
