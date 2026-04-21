import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Code, FileText, Send, X, CheckCircle2, 
  History, Link as LinkIcon, Upload, AlertTriangle, CheckCircle 
} from 'lucide-react';
import apiFetch from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [submissionForm, setSubmissionForm] = useState({
    githubLink: '',
    externalLink: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, subsData] = await Promise.all([
        apiFetch('/tasks'),
        apiFetch('/submissions/me')
      ]);
      console.log('Student Tasks Received:', tasksData.data.tasks);
      setTasks(tasksData.data.tasks || []);
      setSubmissions(subsData.data.submissions || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getTaskSubmission = (taskId) => {
    return submissions.find(s => s.task._id === taskId || s.task === taskId);
  };

  const openSubmitModal = (task) => {
    const existing = getTaskSubmission(task._id);
    setActiveTask(task);
    setSubmissionForm({
      githubLink: existing?.githubLink || '',
      externalLink: existing?.externalLink || '',
      notes: existing?.notes || '',
    });
    setShowModal(true);
  };

  const isDeadlinePassed = (task) => {
    if (task.allowLateSubmission) return false;
    return new Date(task.deadline) < new Date();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const existing = getTaskSubmission(activeTask._id);
      const method = existing ? 'PATCH' : 'POST';
      const endpoint = existing ? `/submissions/${existing._id}` : '/submissions';
      
      const response = await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          task: activeTask._id,
          ...submissionForm
        })
      });

      showToast(`Successfully ${existing ? 'updated' : 'submitted'} work!`);
      setShowModal(false);
      fetchData(); // Refresh to show "Submitted" status
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="tasks-page">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="card">
        <div className="card-header">
          <h2>Assignments & Tasks</h2>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading tasks...</div>
          ) : (
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
                {tasks.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No tasks found for your division.</td></tr>
                ) : tasks.map(task => {
                  const deadlinePassed = isDeadlinePassed(task);
                  const sub = getTaskSubmission(task._id);
                  const status = sub ? (sub.score !== undefined && sub.score !== null ? 'Graded' : 'Submitted') : 'Pending';

                  return (
                    <tr key={task._id}>
                      <td style={{ fontWeight: 600 }}>{task.title}</td>
                      <td style={{ color: deadlinePassed && status === 'Pending' ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {new Date(task.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <Code size={15} color="var(--primary)" />
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>{task.allowedTypes.join(' / ')}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: status === 'Graded' ? 'var(--success-light)' : 
                                      status === 'Submitted' ? 'var(--primary-glow)' : 'var(--bg-hover)',
                          color: status === 'Graded' ? 'var(--success)' : 
                                 status === 'Submitted' ? 'var(--primary)' : 'var(--text-secondary)'
                        }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {status === 'Graded' ? `${sub.score}/${task.maxScore}` : '-'}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                          onClick={() => openSubmitModal(task)}
                          disabled={deadlinePassed}
                        >
                          {deadlinePassed ? 'Closed' : sub ? 'Update' : 'Submit'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && activeTask && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '900px', display: 'flex', gap: '24px' }}>
            <div style={{ flex: '1' }}>
              <div className="modal-header">
                <h2>{getTaskSubmission(activeTask._id) ? 'Update' : 'Submit'} Work: {activeTask.title}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>GitHub Repository Link</label>
                  <div className="search-box">
                    <Code size={18} color="var(--text-muted)" />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://github.com/username/repo"
                      value={submissionForm.githubLink}
                      onChange={(e) => setSubmissionForm({ ...submissionForm, githubLink: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>External Resource Link (Optional)</label>
                  <div className="search-box">
                    <LinkIcon size={18} color="var(--text-muted)" />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://drive.google.com/..."
                      value={submissionForm.externalLink}
                      onChange={(e) => setSubmissionForm({ ...submissionForm, externalLink: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Additional Notes</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Notes for the instructor..."
                    value={submissionForm.notes}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, notes: e.target.value })}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ gap: 8 }}>
                    <Send size={18} />
                    {getTaskSubmission(activeTask._id) ? 'Update Submission' : 'Submit Assignment'}
                  </button>
                </div>
              </form>
            </div>

            <div style={{ width: '300px', background: 'var(--bg-input)', padding: '24px', borderRadius: 'var(--radius)' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: 12 }}>Task Details</h3>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 20 }}>
                {activeTask.description || 'No description provided.'}
              </p>
              <div style={{ fontSize: '0.8rem' }}>
                <div style={{ marginBottom: 10 }}><strong>Deadline:</strong><br/>{new Date(activeTask.deadline).toLocaleString()}</div>
                <div><strong>Max Score:</strong><br/>{activeTask.maxScore} points</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toast({ msg, type = 'success' }) {
  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        <div className="toast-icon">{type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}</div>
        <div className="toast-body">
          <h4>{type === 'success' ? 'Success' : 'Error'}</h4>
          <p>{msg}</p>
        </div>
      </div>
    </div>
  );
}