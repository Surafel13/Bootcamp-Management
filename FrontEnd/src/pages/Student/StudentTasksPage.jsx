import React, { useState } from 'react';
import { 
  ClipboardList, Code, FileText, Send, X, CheckCircle2, 
  History, Link as LinkIcon, Upload, AlertTriangle 
} from 'lucide-react';

const MOCK_TASKS = [
  { 
    id: 1, 
    title: 'React State Management', 
    deadline: '2026-04-15', 
    deadlineDisplay: 'Apr 15, 2026',
    description: 'Implement a complex todo application using Redux Toolkit and Context API with proper state management patterns.',
    type: 'Both',
    instructions: 'Submit your GitHub repo and a ZIP file containing the complete project.',
    allowedFormats: 'ZIP, PDF, GitHub Link',
    status: 'Pending',
    score: null
  },
  { 
    id: 2, 
    title: 'CSS Grid Layout', 
    deadline: '2026-04-10', 
    deadlineDisplay: 'Apr 10, 2026',
    description: 'Create a responsive dashboard layout using only CSS Grid and Flexbox.',
    type: 'File',
    instructions: 'Upload your complete project as a ZIP file.',
    allowedFormats: 'ZIP, PDF',
    status: 'Graded',
    score: 85
  },
  { 
    id: 3, 
    title: 'JavaScript Advanced Patterns', 
    deadline: '2026-04-20', 
    deadlineDisplay: 'Apr 20, 2026',
    description: 'Implement Singleton, Observer, and Factory patterns in a real project.',
    type: 'Both',
    instructions: 'Submit GitHub repository link and a detailed PDF report.',
    allowedFormats: 'ZIP, PDF, GitHub Link',
    status: 'Submitted',           // ← This one is already submitted
    score: null,
    lastSubmitted: 'Apr 12, 2026 at 3:45 PM'
  },
];

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [showModal, setShowModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  
  const [submission, setSubmission] = useState({
    github: '',
    externalLink: '',
    textAnswer: '',
    file: null,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);

  const openSubmitModal = (task) => {
    setActiveTask(task);
    setSubmission({ github: '', externalLink: '', textAnswer: '', file: null });
    setIsSubmitted(task.status === 'Submitted');
    setLastSubmitted(task.lastSubmitted || null);
    setShowModal(true);
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setSubmission(prev => ({ ...prev, file }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSubmission(prev => ({ ...prev, file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isDeadlinePassed(activeTask.deadline)) {
      alert("Submission closed – deadline has passed.");
      return;
    }

    // Simulate submission / update
    setIsSubmitted(true);
    setLastSubmitted(new Date().toLocaleString());

    alert(`Successfully ${isSubmitted ? 'updated' : 'submitted'} work for: ${activeTask.title}`);

    // In real app → send to backend here
  };

  const currentTaskDeadlinePassed = activeTask ? isDeadlinePassed(activeTask.deadline) : false;

  return (
    <div className="tasks-page">
      <div className="card">
        <div className="card-header">
          <h2>Assignments & Tasks</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Deadline</th>
                <th>Requirement</th>
                <th>Status</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const deadlinePassed = isDeadlinePassed(task.deadline);
                return (
                  <tr key={task.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</td>
                    <td style={{ color: deadlinePassed ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      {task.deadlineDisplay}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Code size={15} color="var(--primary)" />
                        <FileText size={15} color="var(--primary)" />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{task.type}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: task.status === 'Graded' ? 'var(--success-light)' : 
                                    task.status === 'Submitted' ? 'var(--primary-glow)' : 'var(--bg-hover)',
                        color: task.status === 'Graded' ? 'var(--success)' : 
                               task.status === 'Submitted' ? 'var(--primary)' : 'var(--text-secondary)'
                      }}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {task.score !== null ? `${task.score}/100` : '-'}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        onClick={() => openSubmitModal(task)}
                        disabled={deadlinePassed}
                      >
                        {deadlinePassed ? 'Closed' : task.status === 'Submitted' ? 'Update Submission' : 'Submit'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================== SUBMISSION MODAL ====================== */}
      {showModal && activeTask && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '1100px', display: 'flex', gap: '24px' }}>
            
            {/* Left: Submission Form */}
            <div style={{ flex: '1' }}>
              <div className="modal-header">
                <h2>Submit Work: {activeTask.title}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <X size={18} />
                </button>
              </div>

              {currentTaskDeadlinePassed && (
                <div className="bg-[var(--danger-light)] text-[var(--danger)] p-4 rounded-xl mb-6 flex items-center gap-3">
                  <AlertTriangle size={22} />
                  <strong>Submission closed – deadline has passed.</strong>
                </div>
              )}

              <form onSubmit={handleSubmit} className="modal-form">
                
                <div className="form-group">
                  <label>GitHub Repository Link <span style={{color: 'var(--text-muted)'}}>(optional)</span></label>
                  <div className="search-box">
                    <Code size={18} color="var(--text-muted)" />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://github.com/username/repo"
                      value={submission.github}
                      onChange={(e) => setSubmission({ ...submission, github: e.target.value })}
                      disabled={currentTaskDeadlinePassed}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>External Resource Link <span style={{color: 'var(--text-muted)'}}>(optional)</span></label>
                  <div className="search-box">
                    <LinkIcon size={18} color="var(--text-muted)" />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://drive.google.com/..."
                      value={submission.externalLink}
                      onChange={(e) => setSubmission({ ...submission, externalLink: e.target.value })}
                      disabled={currentTaskDeadlinePassed}
                    />
                  </div>
                </div>

                {/* Drag & Drop File Upload */}
                <div className="form-group">
                  <label>Upload File (PDF, ZIP, Images)</label>
                  <div
                    className="drag-drop-area"
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '48px 20px',
                      textAlign: 'center',
                      background: 'var(--bg-input)',
                      cursor: currentTaskDeadlinePassed ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Upload size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Drag & drop your file here
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      or <span style={{ color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer' }}>browse files</span>
                    </p>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      id="file-upload"
                      disabled={currentTaskDeadlinePassed}
                    />
                    <label htmlFor="file-upload" style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}>
                      Choose File
                    </label>

                    {submission.file && (
                      <p style={{ marginTop: '16px', color: 'var(--success)', fontWeight: 500 }}>
                        ✓ Selected: {submission.file.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Additional Notes / Text Answer <span style={{color: 'var(--text-muted)'}}>(optional)</span></label>
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Write any additional explanation, challenges faced, or notes here..."
                    value={submission.textAnswer}
                    onChange={(e) => setSubmission({ ...submission, textAnswer: e.target.value })}
                    disabled={currentTaskDeadlinePassed}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={currentTaskDeadlinePassed}
                    style={{ gap: 8 }}
                  >
                    <Send size={18} />
                    {isSubmitted ? 'Update Submission' : 'Submit Assignment'}
                  </button>
                </div>
              </form>

              {lastSubmitted && (
                <p style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Last submitted: {lastSubmitted}
                </p>
              )}
            </div>

            {/* Right Sidebar: Task Details */}
            <div style={{ 
              width: '380px', 
              background: 'var(--bg-card)', 
              borderLeft: '1px solid var(--border)',
              padding: '32px',
              borderRadius: '0 var(--radius-lg) var(--radius-lg) 0'
            }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>{activeTask.title}</h3>
              
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Deadline</p>
                <p style={{ 
                  color: currentTaskDeadlinePassed ? 'var(--danger)' : 'var(--text-primary)',
                  fontWeight: 700 
                }}>
                  {activeTask.deadlineDisplay}
                </p>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Description</p>
                <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {activeTask.description}
                </p>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Instructions</p>
                <p style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>{activeTask.instructions}</p>
              </div>

              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Allowed Formats</p>
                <p style={{ color: 'var(--primary)', fontWeight: 500 }}>{activeTask.allowedFormats}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}