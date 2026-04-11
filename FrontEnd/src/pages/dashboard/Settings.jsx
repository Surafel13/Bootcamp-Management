import React from 'react';
import { Lock, Bell, LogOut, ChevronRight, Shield, Globe } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-xl mx-auto space-y-4 py-4">
      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:border-indigo-100 transition-all duration-300">
        <div className="p-3 border-b border-gray-50 flex items-center gap-3">
           <div className="h-7 w-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <Shield size={14} />
           </div>
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Security Layer</h3>
        </div>
        <div className="divide-y divide-gray-50">
           <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-300 group/item">
              <div className="flex items-center gap-4 text-left">
                 <div className="h-9 w-9 bg-white shadow-sm border border-gray-50 rounded-lg flex items-center justify-center text-gray-200 group-hover/item:text-indigo-600 transition-colors">
                    <Lock size={14} />
                 </div>
                 <div>
                    <p className="text-[11px] font-black text-gray-900 leading-tight uppercase tracking-tight">Access Registry Crypt</p>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5 tracking-tighter uppercase">Last rotation: 12 days ago</p>
                 </div>
              </div>
              <ChevronRight size={14} className="text-gray-200 group-hover/item:text-indigo-600 transition-all group-hover/item:translate-x-1" />
           </button>
           <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-300">
              <div className="flex items-center gap-4 text-left font-black">
                 <div className="h-9 w-9 bg-white shadow-sm border border-gray-50 rounded-lg flex items-center justify-center text-gray-200">
                    <Shield size={14} />
                 </div>
                 <div>
                    <p className="text-[11px] font-black text-gray-900 leading-tight uppercase tracking-tight">Active Biometric Node</p>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5 tracking-tighter uppercase">Secondary verification</p>
                 </div>
              </div>
              <div className="h-4 w-9 bg-indigo-600 rounded-full relative p-0.5 shadow-inner">
                 <div className="h-3 w-3 bg-white rounded-full translate-x-5 shadow-sm transition-transform duration-300"></div>
              </div>
           </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:border-indigo-100 transition-all duration-300">
        <div className="p-3 border-b border-gray-50 flex items-center gap-3">
           <div className="h-7 w-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <Bell size={14} />
           </div>
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Experience</h3>
        </div>
        <div className="divide-y divide-gray-50 text-left">
           <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                 <div className="h-9 w-9 bg-white shadow-sm border border-gray-50 rounded-lg flex items-center justify-center text-gray-200">
                    <Bell size={14} />
                 </div>
                 <div>
                    <p className="text-[11px] font-black text-gray-900 leading-tight uppercase tracking-tight">Telemetric Pings</p>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5 tracking-tighter uppercase">Direct-to-OS signaling</p>
                 </div>
              </div>
              <div className="h-4 w-9 bg-gray-100 rounded-full relative p-0.5 shadow-inner">
                 <div className="h-3 w-3 bg-white rounded-full translate-x-0 shadow-sm transition-transform duration-300"></div>
              </div>
           </div>
           <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-300 group/item">
              <div className="flex items-center gap-4">
                 <div className="h-9 w-9 bg-white shadow-sm border border-gray-50 rounded-lg flex items-center justify-center text-gray-200 group-hover/item:text-indigo-600 transition-colors">
                    <Globe size={14} />
                 </div>
                 <div>
                    <p className="text-[11px] font-black text-gray-900 leading-tight uppercase tracking-tight">Locale Translation</p>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5 tracking-tighter uppercase">Auto-detection active</p>
                 </div>
              </div>
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest cursor-pointer hover:underline px-2 py-1 bg-indigo-50 rounded">English (US)</span>
           </div>
        </div>
      </div>

      <button className="w-full p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-rose-500 hover:bg-rose-100 transition-all duration-300 group mt-12 shadow-sm shadow-rose-100/30">
         <div className="flex items-center gap-4 text-left">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-inner">
               <LogOut size={16} />
            </div>
            <div>
               <span className="text-[11px] font-black leading-tight block uppercase tracking-tight">Terminate Data Link</span>
               <span className="text-[9px] text-rose-300 font-bold uppercase tracking-tighter">Immediate session wipe</span>
            </div>
         </div>
         <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform opacity-30" />
      </button>
    </div>
  );
};

export default Settings;
