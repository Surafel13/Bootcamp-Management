import React from 'react';
import { Lock, Bell, LogOut, ChevronRight, Shield, Globe } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="flex flex-col mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your security preferences and application experience</p>
      </div>

      {/* Security */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/30">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                 <Shield size={18} />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Security & Privacy</p>
           </div>
        </div>
        <div className="divide-y divide-surface-border">
           <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:bg-slate-900 transition-all duration-300 group">
              <div className="flex items-center gap-4 text-left">
                 <div className="h-10 w-10 bg-white dark:bg-slate-800 shadow-soft border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                    <Lock size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Password and Auth</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Change your password and manage 2FA settings</p>
                 </div>
              </div>
              <ChevronRight size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-primary transition-all group-hover:translate-x-1" />
           </button>
           <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4 text-left">
                 <div className="h-10 w-10 bg-white dark:bg-slate-800 shadow-soft border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <Shield size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add an extra layer of security to your account</p>
                 </div>
              </div>
              <div className="h-6 w-11 bg-primary rounded-full relative p-1 cursor-pointer shadow-inner shadow-primary/20">
                 <div className="h-4 w-4 bg-white dark:bg-slate-800 rounded-full translate-x-5 shadow-sm transition-transform duration-300"></div>
              </div>
           </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/30">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                 <Bell size={18} />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Application Experience</p>
           </div>
        </div>
        <div className="divide-y divide-surface-border">
           <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 bg-white dark:bg-slate-800 shadow-soft border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <Bell size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Push Notifications</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receive alerts about upcoming sessions</p>
                 </div>
              </div>
              <div className="h-6 w-11 bg-surface-border rounded-full relative p-1 cursor-pointer">
                 <div className="h-4 w-4 bg-white dark:bg-slate-800 rounded-full translate-x-0 shadow-sm transition-transform duration-300"></div>
              </div>
           </div>
           <div className="px-6 py-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 bg-white dark:bg-slate-800 shadow-soft border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                    <Globe size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Language Settings</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Commonly used for international sessions</p>
                 </div>
              </div>
              <span className="badge badge-purple px-3 py-1 font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-primary hover:text-white transition-colors">English (US)</span>
           </div>
        </div>
      </div>

      <button className="w-full card !p-5 border-danger/20 bg-danger/5 flex items-center justify-between text-danger hover:bg-danger/10 transition-all duration-300 group mt-8">
         <div className="flex items-center gap-4 text-left">
            <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-soft text-danger">
               <LogOut size={22} />
            </div>
            <div>
               <span className="text-base font-bold leading-tight block">Terminate Data Session</span>
               <span className="text-xs text-danger/60 font-medium mt-1 block">Immediate session wipe and account logout</span>
            </div>
         </div>
         <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default Settings;
