import React from 'react';
import { Mail, Phone, Bookmark, ShieldCheck, MapPin } from 'lucide-react';

const Profile = () => {
  const profile = {
    name: 'Alex Johnson',
    email: 'alex.johnson@bootcamp.dev',
    phone: '+1 (555) 987-6543',
    division: 'Adaptive Behavioral',
    id: 'BC-2026-FT-67',
    location: 'Sector 4, Gateway 1'
  };

  return (
    <div className="flex items-center justify-center py-10">
      <div className="card w-full max-w-md !p-0 overflow-hidden text-center relative">
        {/* Banner */}
        <div className="h-32 bg-primary relative">
           <div className="absolute inset-0 bg-gradient-to-br from-primary-hover to-primary opacity-90"></div>
           <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        </div>
        
        <div className="px-8 pb-10 relative">
           <div className="h-24 w-24 rounded-3xl bg-white p-1.5 shadow-xl mx-auto -mt-12 mb-6 border-4 border-white transition-transform duration-500 hover:scale-105">
              <div className="h-full w-full rounded-[20px] bg-primary-soft flex items-center justify-center text-primary font-bold text-3xl shadow-inner uppercase tracking-tighter">
                AJ
              </div>
           </div>
           
           <h3 className="text-2xl font-bold text-text-primary mb-1">{profile.name}</h3>
           <div className="badge badge-purple px-4 py-1.5 font-bold tracking-widest uppercase mb-10">
             {profile.division}
           </div>

           <div className="space-y-4 text-left">
              <div className="group flex items-center gap-5 p-4 bg-surface-bg rounded-2xl border border-surface-border hover:bg-white hover:border-primary/30 transition-all duration-300">
                 <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors shadow-soft">
                    <Mail size={18} />
                 </div>
                 <div className="flex-1">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-0.5">Contact Email</span>
                    <span className="text-sm font-semibold text-text-primary">{profile.email}</span>
                 </div>
              </div>

              <div className="group flex items-center gap-5 p-4 bg-surface-bg rounded-2xl border border-surface-border hover:bg-white hover:border-primary/30 transition-all duration-300">
                 <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors shadow-soft">
                    <Phone size={18} />
                 </div>
                 <div className="flex-1">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-0.5">Mobile Liaison</span>
                    <span className="text-sm font-semibold text-text-primary">{profile.phone}</span>
                 </div>
              </div>

              <div className="group flex items-center gap-5 p-4 bg-surface-bg rounded-2xl border border-surface-border hover:bg-white hover:border-primary/30 transition-all duration-300">
                 <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors shadow-soft">
                    <Bookmark size={18} />
                 </div>
                 <div className="flex-1">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-0.5">Registry ID</span>
                    <span className="text-sm font-semibold text-text-primary uppercase">{profile.id}</span>
                 </div>
              </div>
           </div>

           <div className="mt-10 pt-8 border-t border-surface-border">
              <p className="text-xs text-text-secondary font-medium italic">
                Registry updates are restricted to administration personnel only. Contact support for changes.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
