import { useState, useEffect } from 'react';
import { 
  Code, FileText, CheckCircle, Clock, RotateCcw, 
  X, Send, ExternalLink, AlertCircle 
} from 'lucide-react';
import apiFetch from '../../utils/api';

const ST_STYLE = {
  Graded:   { bg: 'rgba(0,184,148,0.12)',   color: '#00b894' },
  Pending:  { bg: 'rgba(9,132,227,0.12)',   color: '#0984e3' },
  Returned: { bg: 'rgba(253,203,110,0.18)', color: '#b7860a' },
};

function Badge({ status }) {
  const s = ST_STYLE[status] || ST_STYLE.Pending;
  return <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.75rem', fontWeight:700, background:s?.bg, color:s?.color }}>{status}</span>;
}

export default function InstructorSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingTarget, setGradingTarget] = useState(null);
  const [scoreForm, setScoreForm] = useState({ score: '', feedback: '' });
  const [toast, setToast] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/submissions');
      setSubmissions(data.data.submissions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGrade = async () => {
    if (!scoreForm.score) return;
    try {
      await apiFetch(`/submissions/${gradingTarget._id}/grade`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          score: parseInt(scoreForm.score),
          feedback: scoreForm.feedback 
        })
      });
      showToast('Grade submitted successfully!');
      setGradingTarget(null);
      fetchSubmissions();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="card-header" style={{ padding: '0 0 20px 0', borderBottom: 'none', display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Student Submissions</h2>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading submissions...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Task</th>
                  <th>Submitted</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No submissions found.</td></tr>
                ) : submissions.map(s => {
                  const status = s.score !== undefined && s.score !== null ? 'Graded' : 'Pending';
                  return (
                    <tr 
                      key={s._id}
                      onClick={() => {
                        setGradingTarget(s);
                        setScoreForm({ score: s.score || '', feedback: s.feedback || '' });
                      }}
                      style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td>
                        <div className="table-user">
                          <div className="table-avatar" style={{ background:'var(--primary-glow)', color:'var(--primary)' }}>
                            {s.student.name.charAt(0)}
                          </div>
                          <span className="table-user-name">{s.student.name}</span>
                        </div>
                      </td>
                      <td style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>
                        <div style={{ maxWidth: 200 }}>{s.task.title}</div>
                      </td>
                      <td>
                        <div style={{ color:'var(--text-secondary)', fontSize:'0.82rem', display:'flex', flexDirection:'column' }}>
                          <span>{new Date(s.submittedAt || s.createdAt).toLocaleDateString()}</span>
                          <span style={{ fontSize:'0.75rem' }}>{new Date(s.submittedAt || s.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight:700, color:'var(--text-primary)' }}>{s.score !== undefined && s.score !== null ? `${s.score}/${s.task.maxScore}` : '-'}</td>
                      <td><Badge status={status} /></td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding:'5px 12px', fontSize:'0.78rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setGradingTarget(s);
                            setScoreForm({ score: s.score || '', feedback: s.feedback || '' });
                          }}
                        >
                          {status === 'Graded' ? 'Update Grade' : 'Grade'}
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

      {gradingTarget && (
        <div className="modal-overlay" onClick={() => setGradingTarget(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Grade Submission: {gradingTarget.student.name}</h2>
              <button className="modal-close" onClick={() => setGradingTarget(null)}><X size={18}/></button>
            </div>
            <div className="modal-form">
              <div style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>Task: {gradingTarget.task.title}</p>
                {gradingTarget.githubLink && (
                  <a href={gradingTarget.githubLink} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'underline', marginBottom: 6 }}>
                    <Code size={14} /> View GitHub Repository <ExternalLink size={12} />
                  </a>
                )}
                {gradingTarget.fileUrl && (
                  <a href={gradingTarget.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'underline', marginBottom: 6 }}>
                    <FileText size={14} /> View Attached File <ExternalLink size={12} />
                  </a>
                )}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 10 }}>
                  <strong>Notes:</strong> {gradingTarget.text || 'No student notes provided.'}
                </div>
              </div>

              <div className="form-group">
                <label>Score (Max: {gradingTarget.task.maxScore})</label>
                <input 
                  className="form-input" 
                  type="number" 
                  max={gradingTarget.task.maxScore}
                  value={scoreForm.score} 
                  onChange={e => setScoreForm({ ...scoreForm, score: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Feedback (Optional)</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  value={scoreForm.feedback} 
                  onChange={e => setScoreForm({ ...scoreForm, feedback: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setGradingTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleGrade}>Submit Grade</button>
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
