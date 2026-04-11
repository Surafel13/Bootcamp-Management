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
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Internal Navigation Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm w-fit mx-auto">
        {['Individual', 'Group'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'
            }`}
          >
            {tab} Tasks
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] px-1">{activeTab} Nodes</h3>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks[activeTab].map((task) => (
          <div 
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm group hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-100/10 transition-all duration-500 cursor-pointer"
          >
             <div className="flex justify-between items-start mb-4">
                <div className={`h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors`}>
                  <FileText size={20} />
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                  task.status === 'Submitted' ? 'bg-teal-50 text-teal-700 border-teal-100' : 
                  task.status === 'Late' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {task.status}
                </span>
             </div>
             <h4 className="font-bold text-[11px] text-gray-900 mb-2 uppercase tracking-tight leading-tight">{task.title}</h4>
             <p className="text-[10px] text-gray-400 mb-5 line-clamp-2 leading-relaxed font-bold">{task.description}</p>
             <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-300 uppercase tracking-tighter">
                  <Clock size={12} /> {task.deadline}
                </div>
                <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  Open <ArrowRight size={12} />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Task Detailed View (Side Panel/Modal-like over main content) */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTask(null)}></div>
          <div className="relative w-full max-w-xl bg-white h-screen shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Panel Header */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                 <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                    <FileText size={18} />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900">Task Detailed Node</h3>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-10">
              {/* Task Header Information */}
              <div>
                <div className="flex items-center justify-between mb-2">
                   <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.3em] ${
                      selectedTask.status === 'Submitted' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                   }`}>
                      {selectedTask.status} Entry
                   </span>
                   <div className="text-[10px] text-rose-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={14} /> Deadline: {selectedTask.deadline}
                   </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight">{selectedTask.title}</h2>
                <p className="text-xs text-gray-500 font-bold leading-relaxed">{selectedTask.description}</p>
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Core Requirements</h4>
                 <div className="grid grid-cols-1 gap-2">
                    {selectedTask.requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                         <CheckCircle2 size={14} className="text-indigo-600" />
                         <span className="text-[11px] font-bold text-gray-700">{req}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Submission Portal */}
              <div className="space-y-6 pt-6 border-t border-gray-50">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Submission Portal</h4>
                 
                 {/* Submission Status */}
                 {selectedTask.lastSubmitted && (
                    <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <CheckCircle2 size={16} className="text-teal-600" />
                          <div>
                             <p className="text-[10px] font-black text-teal-900 uppercase tracking-tight">Active Submission Detected</p>
                             <p className="text-[9px] text-teal-600 uppercase font-bold tracking-tighter mt-0.5">Time: {selectedTask.lastSubmitted}</p>
                          </div>
                       </div>
                       <button className="text-[9px] font-black text-teal-700 uppercase tracking-widest hover:underline">Revise</button>
                    </div>
                 )}

                 {/* Upload Area */}
                 <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all duration-300 cursor-pointer group shadow-inner">
                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-gray-200 group-hover:text-indigo-600 shadow-sm border border-gray-100 transition-colors mb-4">
                       <Upload size={24} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Drop System Assets</span>
                    <span className="text-[8px] text-gray-300 mt-1 uppercase tracking-tighter font-bold">PDF, ZIP, IMAGES | MAX 10MB</span>
                 </div>

                 {/* External Inputs */}
                 <div className="space-y-3">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">GitHub Registry Link</label>
                       <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300">
                             <GitBranch size={14} />
                          </div>
                          <input 
                            type="text" 
                            className="w-full bg-white border border-gray-100 rounded-lg py-2 pl-9 pr-3 text-[11px] font-bold text-gray-900 outline-none focus:border-indigo-600 transition-all duration-300 shadow-sm"
                            placeholder="https://github.com/alexjohnson/project-node"
                          />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">External Deployment URL</label>
                       <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300">
                             <LinkIcon size={14} />
                          </div>
                          <input 
                            type="text" 
                            className="w-full bg-white border border-gray-100 rounded-lg py-2 pl-9 pr-3 text-[11px] font-bold text-gray-900 outline-none focus:border-indigo-600 transition-all duration-300 shadow-sm"
                            placeholder="https://project-deployment.vercel.app"
                          />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Summary / Text Response</label>
                       <textarea 
                         rows="3" 
                         className="w-full bg-white border border-gray-100 rounded-lg py-2 px-3 text-[11px] font-bold text-gray-900 outline-none focus:border-indigo-600 transition-all duration-300 shadow-sm resize-none"
                         placeholder="Implementation overview or text-based answers..."
                       ></textarea>
                    </div>
                 </div>

                 <div className="flex gap-3 pt-6 border-t border-gray-50 sticky bottom-0 bg-white py-4 mt-10">
                    <button className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-xl shadow-indigo-100 active:scale-95">
                       Broadcast Submission
                    </button>
                    <button className="px-6 py-3.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition flex items-center gap-2">
                       <History size={16} /> History
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
