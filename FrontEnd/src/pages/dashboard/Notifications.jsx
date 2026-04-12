import React from 'react';
import { Bell } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary dark:text-[#F9FAFB]">Notifications</h2>
        <p className="text-text-secondary dark:text-[#9CA3AF] text-sm mt-1">Stay updated with the latest alerts.</p>
      </div>
      
      <div className="card">
        <div className="flex items-center gap-4 py-4 border-b border-surface-border dark:border-[#2D3748] last:border-0">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Bell size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-text-primary dark:text-[#F9FAFB]">New assignment posted</h4>
            <p className="text-sm text-text-secondary dark:text-[#9CA3AF]">A new assignment for "React Hooks" is available.</p>
          </div>
          <span className="ml-auto text-xs text-text-secondary dark:text-[#9CA3AF]">2 hours ago</span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
