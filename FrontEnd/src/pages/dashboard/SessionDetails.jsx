import React from 'react';
import { Calendar, MapPin, User, FileText, ChevronLeft, Video, Clock } from 'lucide-react';

const SessionDetails = ({ session, onBack }) => {
  if (!session) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      
      {/* Back Navigation */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft size={16} /> Back to Sessions
      </button>

      {/* Hero / Status Banner */}
      {session.status === 'Ongoing' && (
        <div className="bg-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
              <Video size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">This session is currently live!</h3>
              <p className="text-sm text-purple-100 font-medium">Join immediately to not miss any material.</p>
            </div>
          </div>
          <span className="badge bg-white text-purple-700 font-bold px-4 py-1.5 uppercase tracking-widest text-xs">
            LIVE NOW
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-bold uppercase tracking-widest mb-3">
                  {session.category} Division
                </span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{session.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed">
                  {session.description || "In-depth overview and interactive exercises regarding the aforementioned topic. Students are expected to come prepared with foundational understanding."}
                </p>
              </div>
              <div className="hidden sm:flex h-16 w-16 bg-purple-100 dark:bg-purple-600/20 rounded-2xl items-center justify-center text-purple-600 dark:text-purple-400">
                <Calendar size={32} />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Clock size={18} className="text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{session.date} • {session.time}</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <MapPin size={18} className="text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{session.location || "Main Virtual Room"}</span>
              </div>
            </div>
          </div>

          <div className="card p-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rules & Instructions</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0"></div>
                Join at least 5 minutes early to secure your connection.
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0"></div>
                Keep your microphone muted unless participating in a Q&A.
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0"></div>
                Have your IDE and prerequisite software pre-installed and ready.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Actions / Instructor */}
        <div className="space-y-6">
          <div className="card p-6 border-t-4 border-t-purple-500">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Instructor Profile</h3>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <User size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{session.instructor || "Senior Dev Admin"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Faculty Member</p>
              </div>
            </div>
          </div>

          <div className="card p-6 flex flex-col items-center text-center">
            <div className={`mb-4 w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${
              session.status === 'Ongoing' ? 'bg-purple-100 text-purple-700 dark:bg-purple-600/20 dark:text-purple-400' :
              session.status === 'Upcoming' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
              'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'
            }`}>
              Status: {session.status || 'Upcoming'}
            </div>
            
            <button 
              disabled={session.status !== 'Ongoing'}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex justify-center items-center gap-2 ${
                session.status === 'Ongoing' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02]' 
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-slate-600'
              }`}
            >
              <Video size={18} /> Join Now
            </button>
            {session.status !== 'Ongoing' && (
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 font-medium">Link will activate when session begins.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SessionDetails;
