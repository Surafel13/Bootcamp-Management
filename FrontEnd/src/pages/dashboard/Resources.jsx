import React, { useState } from 'react';
import { Search, File, Link as LinkIcon, Download } from 'lucide-react';

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const resourcesList = [
    { id: 1, title: 'React Fundamentals', type: 'file', size: '2.4 MB', date: 'Oct 12, 2023' },
    { id: 2, title: 'Tailwind CSS Cheat Sheet', type: 'link', url: 'https://tailwindcss.com', date: 'Oct 15, 2023' },
    { id: 3, title: 'JavaScript Advanced Concepts', type: 'file', size: '5.1 MB', date: 'Oct 18, 2023' },
    { id: 4, title: 'Design System Guidelines', type: 'file', size: '1.2 MB', date: 'Nov 02, 2023' },
  ];

  const filteredResources = resourcesList.filter(res => res.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-[#F9FAFB]">Resources</h2>
          <p className="text-text-secondary dark:text-[#9CA3AF] text-sm mt-1">Access course materials and helpful links.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-text-secondary dark:text-[#9CA3AF]" />
          </div>
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 text-black dark:text-white border border-gray-300 dark:border-slate-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="card hover:border-primary/30 transition-all cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-primary-soft dark:bg-primary/10 rounded-xl text-primary">
                {resource.type === 'file' ? <File size={24} /> : <LinkIcon size={24} />}
              </div>
              <button className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                <Download size={20} />
              </button>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-text-primary dark:text-[#F9FAFB] line-clamp-1">{resource.title}</h3>
              <p className="text-sm text-text-secondary dark:text-[#9CA3AF] mt-1 flex items-center gap-2">
                {resource.type === 'file' ? resource.size : 'External Link'} • {resource.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
