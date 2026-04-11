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
    <div className="flex items-center justify-center py-12 animate-in fade-in duration-700">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm w-full max-w-sm overflow-hidden text-center relative">
        {/* Compact Header */}
        <div className="h-16 bg-indigo-600 relative">
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-indigo-500 opacity-20"></div>
        </div>
        
        <div className="px-6 pb-8 relative">
           <div className="h-16 w-16 rounded-xl bg-white p-1 shadow-md mx-auto -mt-8 mb-4 border border-gray-50 transition-transform duration-500 hover:scale-105">
              <div className="h-full w-full rounded-lg bg-gray-50 flex items-center justify-center text-indigo-600 font-black text-xl border border-gray-100 shadow-inner">
                AJ
              </div>
           </div>
           
           <h3 className="text-sm font-bold text-gray-900 mb-0.5 tracking-tight">{profile.name}</h3>
           <p className="text-[9px] text-indigo-600 font-bold tracking-[0.3em] uppercase mb-8 flex items-center justify-center gap-1.5 px-3 py-1 bg-indigo-50/50 rounded-full w-fit mx-auto">
             <ShieldCheck size={12} className="animate-pulse" /> {profile.division}
           </p>

           <div className="space-y-2 text-left">
              <div className="group flex items-center gap-4 p-3 bg-gray-50/50 rounded-lg border border-gray-50 hover:bg-white hover:border-indigo-100 transition-all duration-300 shadow-inner">
                 <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center text-gray-200 group-hover:text-indigo-600 transition-colors shadow-sm">
                    <Mail size={14} />
                 </div>
                 <div className="flex-1">
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none block mb-1">Electronic Mail</span>
                    <span className="text-[11px] font-bold text-gray-800 leading-tight">{profile.email}</span>
                 </div>
              </div>

              <div className="group flex items-center gap-4 p-3 bg-gray-50/50 rounded-lg border border-gray-50 hover:bg-white hover:border-indigo-100 transition-all duration-300 shadow-inner">
                 <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center text-gray-200 group-hover:text-indigo-600 transition-colors shadow-sm">
                    <Phone size={14} />
                 </div>
                 <div className="flex-1">
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none block mb-1">Direct Liaison</span>
                    <span className="text-[11px] font-bold text-gray-800 leading-tight">{profile.phone}</span>
                 </div>
              </div>

              <div className="group flex items-center gap-4 p-3 bg-gray-50/50 rounded-lg border border-gray-50 hover:bg-white hover:border-indigo-100 transition-all duration-300 shadow-inner">
                 <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center text-gray-200 group-hover:text-indigo-600 transition-colors shadow-sm">
                    <Bookmark size={14} />
                 </div>
                 <div className="flex-1">
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none block mb-1">Registry Code</span>
                    <span className="text-[11px] font-bold text-gray-800 leading-tight">{profile.id}</span>
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-gray-50">
              <p className="text-[9px] text-gray-300 font-bold italic uppercase tracking-[0.2em]">
                Registry updates locked by system admin
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
