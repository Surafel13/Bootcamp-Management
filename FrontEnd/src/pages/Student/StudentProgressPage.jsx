import { useState } from 'react';
import { UsersRound, FilePlus, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function StudentProgressPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isDescriptionValid = description.length >= 50;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isDescriptionValid) return;
    setSubmitted(true);
    // Reset after some time
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setDescription('');
      setLink('');
    }, 4000);
  };

  return (
    <div className="progress-page" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <UsersRound size={24} color="var(--primary)" />
            <h2>Weekly Group Progress</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            Required: One submission per group, every week. Detail your team's achievements and hurdles.
          </p>
        </div>

        <div style={{ padding: 30 }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle2 size={60} color="var(--success)" style={{ margin: '0 auto 20px' }} />
              <h3>Progress Submitted!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Your weekly update has been recorded for the **Development Track - Group A**.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Update Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Week 4: Finalizing React Component Library"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Detailed Description (Min. 50 characters)</label>
                <textarea
                  className="form-input"
                  rows={6}
                  placeholder="What did your group accomplish this week? Any blockers encountered?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 6,
                  fontSize: '0.75rem',
                  color: isDescriptionValid ? 'var(--success)' : 'var(--danger)'
                }}>
                  <span>{description.length} characters</span>
                  <span>{isDescriptionValid ? 'Minimum length met' : `Need ${50 - description.length} more characters`}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Optional: Project Link or Resource</label>
                <input
                  className="form-input"
                  placeholder="https://your-project-link.com"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                />
              </div>

              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: 15,
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  gap: 12,
                  marginBottom: 25,
                  border: '1px solid var(--border)'
                }}
              >
                <AlertCircle size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  <strong>SRS Enforcement:</strong> Submissions are tracked weekly. Ensure the description is substantive (≥ 50 chars) to avoid "Missing Progress" alerts.
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', gap: 10 }}
                disabled={!isDescriptionValid}
              >
                <Send size={18} /> Submit Weekly Progress
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
