import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  Save,
  Upload,
  History,
  CheckCircle2,
  GitBranch,
  Link as LinkIcon,
  X,
  FileImage,
  ArrowRight
} from 'lucide-react';

const Tasks = () => {
const [activeTab, setActiveTab] = useState('Individual');
const [selectedTask, setSelectedTask] = useState(null);

  const tasks = {
    Individual: [
      { 
        id: 1, 
        title: 'Responsive Portfolio Website', 
        deadline: 'Apr 20', 
        status: 'Pending',
        description: 'Create a professional portfolio website that showcases your skills and projects. The site must be fully responsive across mobile, tablet, and desktop devices.',
        requirements: [
          'Use Semantic HTML5',
          'Implement CSS Grid/Flexbox',
          'Include a contact form with validation',
          'Ensure 90+ Lighthouse accessibility score'
        ],
        adminNotes: 'Please ensure your code is well-commented. Host the live site on Vercel or Netlify and provide the final URL in the external link field.',
        allowedFormats: ['GitHub Link', 'External Link', 'ZIP']
      },
      { 
        id: 2, 
        title: 'Algorithm Optimization', 
        deadline: 'Apr 18', 
        status: 'Submitted',
        description: 'Analyze the time and space complexity of the provided sorting algorithms and implement optimized versions.',
        requirements: [
          'Big O analysis for all functions',
          'Optimize QuickSort pivot selection',
          'Implement MergeSort in-place',
          'Benchmark results comparison'
        ],
        lastSubmitted: 'Apr 10, 2:30 PM',
        updatedVersion: true,
        adminNotes: 'Your implementation summary must include the benchmark charts.',
        allowedFormats: ['PDF', 'GitHub Link', 'Text Answer']
      },
    ],
    Group: [
      { 
        id: 3, 
        title: 'E-commerce API Infrastructure', 
        deadline: 'May 05', 
        status: 'Pending',
        description: 'Design and implement a robust RESTful API for a multi-vendor e-commerce platform.',
        requirements: [
          'Microservices architecture',
          'JWT authentication',
          'Redis caching layer',
          'Docker containerization'
        ],
        adminNotes: 'Upload your Postman collection as a ZIP file or link your public Swagger documentation.',
        allowedFormats: ['ZIP', 'GitHub Link', 'External Link']
      },
      { 
        id: 4, 
        title: 'Real-time Chat Application', 
        deadline: 'Apr 05', 
        status: 'Closed',
        description: 'Build a group chat application with real-time updates and message history.',
        requirements: [
          'WebSocket protocol',
          'State persistence',
          'Typing indicators',
          'Message read receipts'
        ],
        adminNotes: 'No late submissions accepted for this milestone.',
        allowedFormats: ['GitHub Link', 'ZIP']
      }
    ]
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Assignment Portal</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Submit and track your academic milestones</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-soft w-fit">
          {['Individual', 'Group'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:bg-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks[activeTab].map((task) => (
          <div 
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="card group hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer flex flex-col h-full"
          >
             <div className="flex justify-between items-start mb-6">
                <div className={`h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300`}>
                  <FileText size={24} />
                </div>
                <span className={`badge px-3 py-1 font-bold tracking-wider ${
                  task.status === 'Submitted' ? 'badge-green' : 
                  (task.status === 'Closed' || task.status === 'Late') ? 'bg-red-50 text-danger dark:bg-red-900/20 dark:text-red-400' : 'bg-amber-50 text-amber-600'
                }`}>
                  {task.status.toUpperCase()}
                </span>
             </div>
             <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">{task.title}</h4>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 line-clamp-3 font-medium leading-relaxed">{task.description}</p>
             <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <Clock size={16} className="text-primary/60" /> 
                  <span>Due {task.deadline}</span>
                </div>
                <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Review <ArrowRight size={14} />
                </span>
             </div>
          </div>
        ))}
      </div>

      {/* Task Detailed View Side Panel */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setSelectedTask(null)}></div>
          <div className="relative w-full max-w-5xl bg-gray-50 dark:bg-slate-900 h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            {/* Panel Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <FileText size={20} />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Assignment Submission</h3>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden flex-col-reverse md:flex-row">
              {/* Main Area: Submission Portal */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50 dark:bg-slate-900">
                 {/* Warning Message if Closed */}
                 {(selectedTask.status === 'Closed' || selectedTask.status === 'Late') && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
                       <X size={20} />
                       <span className="text-sm font-bold">Submission closed – deadline passed</span>
                    </div>
                 )}

                 {selectedTask.lastSubmitted && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl flex flex-col gap-4 border border-gray-200 dark:border-slate-700 shadow-sm">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3 text-success">
                            <CheckCircle2 size={24} />
                            <h4 className="font-bold text-gray-900 dark:text-white">Submission Recorded</h4>
                         </div>
                         {selectedTask.updatedVersion && (
                           <span className="badge bg-primary/10 text-primary uppercase font-bold px-3 py-1 text-xs">Updated Version</span>
                         )}
                       </div>
                       <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          Last submitted on <strong className="text-gray-900 dark:text-white">{selectedTask.lastSubmitted}</strong>
                       </p>
                    </div>
                 )}

                 <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-8">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4">Provide Your Work</h4>
                    
                    {/* Upload Area */}
                    <div className="space-y-3">
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">File Upload</label>
                       <div className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                         (selectedTask.status === 'Closed' || selectedTask.status === 'Late') 
                           ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                           : 'border-primary/20 bg-primary/5 hover:border-primary hover:bg-primary/[0.08] cursor-pointer group'
                       }`}>
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-soft border mb-3 transition-all ${
                            (selectedTask.status === 'Closed' || selectedTask.status === 'Late')
                              ? 'bg-gray-100 border-gray-200 text-gray-400'
                              : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 group-hover:text-primary border-gray-200 dark:border-slate-700'
                          }`}>
                             <Upload size={28} />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white font-bold">Drag & drop your files here</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">PDF, ZIP, IMAGES | MAX 10MB</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* GitHub Link */}
                       <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">GitHub Link</label>
                          <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                                <GitBranch size={16} />
                             </div>
                             <input 
                               type="text" 
                               disabled={selectedTask.status === 'Closed' || selectedTask.status === 'Late'}
                               className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                               placeholder="https://github.com/..."
                             />
                          </div>
                       </div>

                       {/* External Link */}
                       <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">External Link</label>
                          <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                                <LinkIcon size={16} />
                             </div>
                             <input 
                               type="text" 
                               disabled={selectedTask.status === 'Closed' || selectedTask.status === 'Late'}
                               className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                               placeholder="https://..."
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1 flex justify-between">
                         <span>Text Answer</span>
                         <span className="text-gray-400">(Optional)</span>
                       </label>
                       <textarea 
                         rows="4" 
                         disabled={selectedTask.status === 'Closed' || selectedTask.status === 'Late'}
                         className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none disabled:opacity-50 disabled:bg-gray-100"
                         placeholder="Add any additional context, answers, or implementation summaries..."
                       ></textarea>
                    </div>
                 </div>
                 
                 <div className="flex gap-4 pt-4">
                    <button 
                      disabled={selectedTask.status === 'Closed' || selectedTask.status === 'Late'}
                      className="flex-1 btn-primary py-4 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {selectedTask.lastSubmitted ? 'Update Submission' : 'Submit Milestone'}
                    </button>
                    <button className="px-6 py-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-2 font-bold shadow-sm">
                       <History size={20} /> History
                    </button>
                 </div>
              </div>

              {/* Sidebar: Task Details */}
              <div className="w-full md:w-[380px] bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 overflow-y-auto p-6 md:p-8 space-y-8 flex-shrink-0">
                 <div>
                   <div className="flex items-center justify-between mb-4">
                      <span className={`badge px-3 py-1 font-bold tracking-wider ${
                        selectedTask.status === 'Submitted' ? 'badge-green' : 
                        (selectedTask.status === 'Closed' || selectedTask.status === 'Late') ? 'bg-red-50 text-danger dark:bg-red-900/20 dark:text-red-400' : 'bg-amber-50 text-amber-600'
                      }`}>
                         {selectedTask.status.toUpperCase()}
                      </span>
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{selectedTask.title}</h2>
                   <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 shadow-sm ${
                     (selectedTask.status === 'Closed' || selectedTask.status === 'Late') 
                       ? 'bg-red-50 text-danger border border-red-100' 
                       : 'bg-amber-50 text-amber-700 border border-amber-100'
                   }`}>
                      <Clock size={20} /> 
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-80">Deadline</p>
                        <p className="font-bold text-sm">{selectedTask.deadline}</p>
                      </div>
                   </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-700 pb-2">Description</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{selectedTask.description}</p>
                 </div>

                 {selectedTask.adminNotes && (
                   <div className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14} /> Admin Notes
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{selectedTask.adminNotes}</p>
                   </div>
                 )}

                 {selectedTask.allowedFormats && (
                   <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-700 pb-2">Allowed Formats</h4>
                      <div className="flex flex-wrap gap-2">
                         {selectedTask.allowedFormats.map((format, i) => (
                           <span key={i} className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300">
                             {format}
                           </span>
                         ))}
                      </div>
                   </div>
                 )}

                 {selectedTask.requirements && selectedTask.requirements.length > 0 && (
                 <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-700 pb-2">Requirements</h4>
                    <ul className="space-y-3">
                       {selectedTask.requirements.map((req, i) => (
                         <li key={i} className="flex items-start gap-3">
                            <div className="mt-0.5 min-w-[16px] text-primary">
                               <CheckCircle2 size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{req}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
