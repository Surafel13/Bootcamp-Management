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
        ]
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
        lastSubmitted: 'Apr 10, 2:30 PM'
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
        ]
      },
      { 
        id: 4, 
        title: 'Real-time Chat Application', 
        deadline: 'Apr 25', 
        status: 'Late',
        description: 'Build a group chat application with real-time updates and message history.',
        requirements: [
          'WebSocket protocol',
          'State persistence',
          'Typing indicators',
          'Message read receipts'
        ]
      }
    ]
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-text-primary uppercase tracking-tight">Assignment Portal</h3>
          <p className="text-sm text-text-secondary mt-1">Submit and track your academic milestones</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-surface-border shadow-soft w-fit">
          {['Individual', 'Group'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-bg'
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
                  task.status === 'Late' ? 'bg-red-50 text-danger' : 'bg-amber-50 text-amber-600'
                }`}>
                  {task.status.toUpperCase()}
                </span>
             </div>
             <h4 className="font-bold text-lg text-text-primary mb-2 leading-tight group-hover:text-primary transition-colors">{task.title}</h4>
             <p className="text-sm text-text-secondary mb-8 line-clamp-3 font-medium leading-relaxed">{task.description}</p>
             <div className="mt-auto flex items-center justify-between pt-5 border-t border-surface-border">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
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
          <div className="relative w-full max-w-xl bg-white h-screen shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500 flex flex-col">
            {/* Panel Header */}
            <div className="p-8 border-b border-surface-border flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <FileText size={20} />
                 </div>
                 <h3 className="text-lg font-bold text-text-primary tracking-tight">Assignment Details</h3>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-surface-bg rounded-xl text-text-secondary hover:text-text-primary transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-10 space-y-12 flex-1">
              {/* Task Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                   <span className={`badge px-4 py-1.5 font-bold tracking-widest ${
                      selectedTask.status === 'Submitted' ? 'badge-green' : 'bg-amber-50 text-amber-600'
                   }`}>
                      {selectedTask.status.toUpperCase()}
                   </span>
                   <div className="text-sm text-danger font-bold flex items-center gap-2">
                      <Clock size={16} /> Deadline: {selectedTask.deadline}
                   </div>
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-4 leading-tight">{selectedTask.title}</h2>
                <p className="text-sm text-text-secondary font-medium leading-relaxed">{selectedTask.description}</p>
              </div>

              {/* Requirements */}
              <div className="space-y-6">
                 <h4 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em]">Core Requirements</h4>
                 <div className="grid grid-cols-1 gap-3">
                    {selectedTask.requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-surface-bg rounded-2xl border border-surface-border">
                         <div className="p-1 bg-success/10 rounded-full">
                            <CheckCircle2 size={16} className="text-success" />
                         </div>
                         <span className="text-sm font-semibold text-text-primary">{req}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Submission Portal */}
              <div className="space-y-8 pt-8 border-t border-surface-border">
                 <h4 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em]">Submission Portal</h4>
                 
                 {selectedTask.lastSubmitted && (
                    <div className="bg-success text-white p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-success/20">
                       <div className="flex items-center gap-4">
                          <CheckCircle2 size={24} />
                          <div>
                             <p className="text-sm font-bold uppercase tracking-tight">Assignment Submitted</p>
                             <p className="text-xs opacity-90 font-medium">Recorded on {selectedTask.lastSubmitted}</p>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Upload Area */}
                 <div className="border-2 border-dashed border-primary/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-primary/5 hover:border-primary hover:bg-primary/[0.08] transition-all duration-300 cursor-pointer group">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-text-secondary group-hover:text-primary shadow-soft border border-surface-border transition-all mb-4">
                       <Upload size={32} />
                    </div>
                    <span className="text-sm text-text-primary font-bold">Drop your project assets here</span>
                    <span className="text-xs text-text-secondary mt-1 font-medium">PDF, ZIP, IMAGES | MAX 10MB</span>
                 </div>

                 {/* Inputs */}
                 <div className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-text-secondary uppercase tracking-widest px-1">GitHub Repository</label>
                       <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                             <GitBranch size={16} />
                          </div>
                          <input 
                            type="text" 
                            className="w-full bg-surface-bg border border-surface-border rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="https://github.com/..."
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-text-secondary uppercase tracking-widest px-1">Implementation Summary</label>
                       <textarea 
                         rows="4" 
                         className="w-full bg-surface-bg border border-surface-border rounded-xl py-3 px-4 text-sm font-semibold text-text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                         placeholder="Briefly describe your approach..."
                       ></textarea>
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-8 border-t border-surface-border bg-white flex gap-4">
              <button className="flex-1 btn-primary py-4 text-base">
                Submit Milestone
              </button>
              <button className="px-6 py-4 bg-surface-bg text-text-secondary border border-surface-border rounded-xl hover:bg-gray-100 transition flex items-center gap-2 font-bold">
                 <History size={20} /> History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
