import React from 'react';
import { Mail, Phone, MapPin, Calendar, Save } from 'lucide-react';

const Profile = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Panel: Profile Summary Card */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="card text-center relative py-10 px-6">
          <div className="h-28 w-28 mx-auto bg-gradient-to-br from-[#A89CF7] to-[#7C6CF2] rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-purple-500/20 mb-6">
            AJ
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Alex Johnson</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Student / DevOps</p>
          
          <div className="badge badge-purple px-4 py-1.5 font-bold tracking-widest uppercase mb-8">
            Student
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3.5 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
              <Mail size={18} className="text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">alex.johnson@bootcamp.dev</span>
            </div>
            <div className="flex items-center gap-4 p-3.5 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
              <Phone size={18} className="text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">+1 (555) 987-6543</span>
            </div>
            <div className="flex items-center gap-4 p-3.5 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
              <MapPin size={18} className="text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Sector 4, Gateway 1</span>
            </div>
            <div className="flex items-center gap-4 p-3.5 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
              <Calendar size={18} className="text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Joined January 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Settings / Information Forms */}
      <div className="w-full lg:w-2/3 space-y-6">
        <div className="card !p-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">First Name</label>
              <div className="w-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm cursor-not-allowed">Alex</div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Name</label>
              <div className="w-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm cursor-not-allowed">Johnson</div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="w-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm cursor-not-allowed">alex.johnson@bootcamp.dev</div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
              <div className="w-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm cursor-not-allowed">+1 (555) 987-6543</div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</label>
              <div className="w-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm cursor-not-allowed">Sector 4, Gateway 1</div>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 italic">
            * Personal information cannot be edited. Contact admin for changes.
          </div>
        </div>

        <div className="card !p-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Change Password</h3>
          
          <div className="space-y-6">
            <div className="space-y-2 md:w-1/2 md:pr-3">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Password</label>
              <input 
                type="password" 
                defaultValue="********"
                className="w-full bg-white dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all tracking-widest"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
               <button className="btn-primary px-6 py-2.5">
                 Update Password
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
