import { useState } from 'react';
import { ClipboardList, Code, FileText, Send, X, CheckCircle2, History } from 'lucide-react';

const MOCK_TASKS = [
  { id: 1, title: 'React State Management', deadline: 'Apr 15, 2026', type: 'GitHub', score: null, status: 'Pending' },
  { id: 2, title: 'CSS Grid Layout',         deadline: 'Apr 10, 2026', type: 'File',   score: 85,   status: 'Graded' },
  { id: 3, title: 'JS Async & Promises',     deadline: 'Apr 18, 2026', type: 'Both',   score: null, status: 'Active' },
];

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [showModal, setShowModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [submission, setSubmission] = useState({ github: '', file: null });

  const openSubmit = (task) => {
    setActiveTask(task);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Successfully submitted work for: ${activeTask.title}`);
    setShowModal(false);
  };

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
              {tasks.map(task => (
                <tr key={task.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{task.deadline}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {(task.type === 'GitHub' || task.type === 'Both') && <Code size={14} color="var(--primary)" />}
                      {(task.type === 'File' || task.type === 'Both') && <FileText size={14} color="var(--primary)" />}
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{task.type}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '3px 10px', 
                      borderRadius: 12, 
                      fontSize: '0.7rem', 
                      fontWeight: 700,
                      background: task.status === 'Graded' ? 'var(--success-light)' : 'var(--primary-glow)',
                      color: task.status === 'Graded' ? 'var(--success)' : 'var(--primary)'
                    }}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {task.score !== null ? `${task.score}/100` : '-'}
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 14px', fontSize: '0.75rem', gap: 6 }}
                      onClick={() => openSubmit(task)}
                    >
                      <History size={14} /> {task.score !== null ? 'Resubmit' : 'Submit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Submit Work: {activeTask?.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {(activeTask?.type === 'GitHub' || activeTask?.type === 'Both') && (
                <div className="form-group">
                  <label>GitHub Repository Link</label>
                  <div className="search-box" style={{ paddingLeft: 12 }}>
                    <Code size={16} color="var(--text-muted)" />
                    <input 
                      className="form-input" 
                      placeholder="https://github.com/username/repo" 
                      value={submission.github}
                      onChange={e => setSubmission({...submission, github: e.target.value})}
                      required
                    />
                  </div>
                </div>
              )}
              
              {(activeTask?.type === 'File' || activeTask?.type === 'Both') && (
                <div className="form-group">
                  <label>Project Files (ZIP/PDF)</label>
                  <input 
                    className="form-input" 
                    type="file" 
                    onChange={e => setSubmission({...submission, file: e.target.files[0]})}
                    required={activeTask?.type === 'File'}
                  />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Max file size: 25MB. Single ZIP or PDF preferred.
                  </p>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ gap: 8 }}>
                  <Send size={15} /> Submit Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
