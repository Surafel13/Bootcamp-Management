import React from 'react';
import { Calendar, MapPin, User, ChevronLeft, Video, Clock, Bookmark, ShieldCheck } from 'lucide-react';

const SessionDetails = ({ session, onBack }) => {
   if (!session) return null;

   return (
      <div className="space-y-8 animate-fade-in pb-12">

         {/* Back Navigation */}
         <button
            onClick={onBack}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors border-none bg-transparent cursor-pointer"
         >
            <ChevronLeft size={16} /> Back to session list
         </button>

         {/* Status Alert */}
         {session.status === 'Ongoing' && (
            <div className="bg-[var(--primary)] rounded-3xl p-8 text-white shadow-2xl shadow-[var(--primary-glow)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
               <div className="flex items-center gap-6 relative z-10">
                  <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse border border-white/20">
                     <Video size={30} className="text-white" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black uppercase tracking-tight">Active session detected</h3>
                     <p className="text-sm text-white/80 font-medium italic">Streaming initialized. Your presence is requested in the digital theater.</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 bg-red-500/20 border border-red-500/30 px-5 py-2 rounded-full backdrop-blur-md relative z-10">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-white">Live Broadcast</span>
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
               <div className="card !p-10 border-none shadow-sm bg-[var(--bg-card)]">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                           <span className="badge badge-teal px-4 py-1.5 font-black text-[10px] tracking-[0.15em] uppercase border border-[var(--primary)]/10">
                              {session.category} Dept
                           </span>
                           <div className="h-1 w-8 bg-[var(--border)] rounded-full hidden md:block"></div>
                        </div>
                        <h1 className="text-3xl font-black text-[var(--text-primary)] leading-none mb-4 uppercase tracking-tight">{session.title}</h1>
                        <p className="text-[var(--text-secondary)] font-medium text-[15px] leading-relaxed italic border-l-4 border-[var(--primary-glow)] pl-6 py-1">
                           {session.description || "Synthesizing theoretical constructs with practical implementation protocols. Subject matter expertise required for full transmission reception."}
                        </p>
                     </div>
                     <div className="h-24 w-24 bg-[var(--bg-input)] rounded-[32px] flex items-center justify-center text-[var(--primary)] border border-[var(--border)] shrink-0 shadow-inner">
                        <Calendar size={44} strokeWidth={1.5} />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 border-t border-[var(--border)] border-dashed">
                     <div className="flex items-center gap-4 group">
                        <div className="h-10 w-10 bg-[var(--bg-input)] rounded-xl flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                           <Clock size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Time Slot</p>
                           <p className="text-[13px] font-bold text-[var(--text-primary)]">{session.date} • {session.time}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 group">
                        <div className="h-10 w-10 bg-[var(--bg-input)] rounded-xl flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                           <MapPin size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Terminal</p>
                           <p className="text-[13px] font-bold text-[var(--text-primary)]">{session.location || "Central Matrix"}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 group">
                        <div className="h-10 w-10 bg-[var(--bg-input)] rounded-xl flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                           <ShieldCheck size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Authorization</p>
                           <p className="text-[13px] font-bold text-[var(--text-primary)]">Student-Level-01</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="card !p-10 border-none shadow-sm bg-[var(--bg-card)]">
                  <div className="flex items-center gap-3 mb-8">
                     <Bookmark size={20} className="text-[var(--primary)]" />
                     <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Protocol Instructions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px]">
                     <div className="space-y-4">
                        <div className="flex gap-4">
                           <span className="h-5 w-5 bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center rounded text-[10px] font-black shrink-0">01</span>
                           <p className="text-[var(--text-secondary)] font-medium italic">Initialize neural connection 10 minutes prior to transmission launch.</p>
                        </div>
                        <div className="flex gap-4">
                           <span className="h-5 w-5 bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center rounded text-[10px] font-black shrink-0">02</span>
                           <p className="text-[var(--text-secondary)] font-medium italic">Maintain audio silence protocol unless manual override is requested.</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex gap-4">
                           <span className="h-5 w-5 bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center rounded text-[10px] font-black shrink-0">03</span>
                           <p className="text-[var(--text-secondary)] font-medium italic">Ensure compiler environments are primed and assets are mounted.</p>
                        </div>
                        <div className="flex gap-4">
                           <span className="h-5 w-5 bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center rounded text-[10px] font-black shrink-0">04</span>
                           <p className="text-[var(--text-secondary)] font-medium italic">Packet loss over 5% requires immediate network recalibration.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Action Sidebar */}
            <div className="space-y-8">
               <div className="card !p-8 bg-[var(--bg-card)] border-none shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-1.5 w-full bg-[var(--primary)]"></div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6 border-b border-[var(--border)] border-dashed pb-4 text-center">Faculty Dispatch</p>
                  <div className="flex items-center gap-5 mb-8">
                     <div className="h-16 w-16 rounded-3xl bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] shrink-0 overflow-hidden shadow-sm">
                        <User size={36} strokeWidth={1} />
                     </div>
                     <div className="min-w-0">
                        <p className="font-black text-[var(--text-primary)] text-base truncate leading-none mb-1 uppercase tracking-tight">{session.instructor || "Lead Architect"}</p>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></div>
                           <p className="text-[11px] text-[var(--text-muted)] font-black uppercase tracking-wider">Faculty Elite</p>
                        </div>
                     </div>
                  </div>
                  <button className="w-full btn-secondary text-[11px] py-4 rounded-2xl hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] uppercase tracking-widest font-black transition-all">Direct Comm Link</button>
               </div>

               <div className="card !p-8 bg-[var(--bg-card)] border-none shadow-sm flex flex-col items-center text-center">
                  <div className={`mb-8 w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${session.status === 'Ongoing' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-[0_0_15px_var(--primary-glow)]' :
                        session.status === 'Upcoming' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                           'bg-[var(--bg-input)] text-[var(--text-muted)]'
                     }`}>
                     SYSTEM STATUS: {session.status || 'IDLE'}
                  </div>

                  <button
                     disabled={session.status !== 'Ongoing'}
                     className={`w-full py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 flex justify-center items-center gap-3 border-none cursor-pointer ${session.status === 'Ongoing'
                           ? 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white shadow-xl shadow-[var(--primary-glow)] hover:scale-[1.03] active:scale-95'
                           : 'bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border)]'
                        }`}
                  >
                     <Video size={18} /> Join Broadcast
                  </button>
                  {session.status !== 'Ongoing' && (
                     <p className="text-[11px] text-[var(--text-muted)] mt-6 font-bold uppercase tracking-wider italic">Matrix entry locked until transmission</p>
                  )}
               </div>
            </div>

         </div>
      </div>
   );
};

export default SessionDetails;

