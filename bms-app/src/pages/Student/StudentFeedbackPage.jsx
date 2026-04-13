import { useState } from 'react';
import { Star, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

const ELIGIBLE_SESSIONS = [
  { id: 1, title: 'Advanced React Patterns', date: 'Apr 12, 2026', instructor: 'Dr. Mitchell' },
  { id: 2, title: 'JavaScript Fundamentals',  date: 'Apr 10, 2026', instructor: 'Emily Rodriguez' },
];

export default function StudentFeedbackPage() {
  const [activeSession, setActiveSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a star rating.");
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setActiveSession(null);
      setRating(0);
      setComment('');
    }, 3000);
  };

  return (
    <div className="feedback-page" style={{ maxWidth: 800, margin: '0 auto' }}>
      {!activeSession ? (
        <div className="card">
          <div className="card-header">
            <h2>Session Feedback</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Rate sessions you attended in the last 48 hours. Your feedback is anonymous.
            </p>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>
            {ELIGIBLE_SESSIONS.map(s => (
              <div key={s.id} className="feedback-item" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: 20, 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius)',
                background: 'var(--bg-card)'
              }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>{s.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>With {s.instructor} • {s.date}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setActiveSession(s)}>
                  Rate Session
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <button className="btn btn-secondary" onClick={() => setActiveSession(null)} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              ← Back to List
            </button>
            <h2 style={{ marginTop: 10 }}>Rating: {activeSession.title}</h2>
          </div>
          
          <div style={{ padding: 30, textAlign: 'center' }}>
            {submitted ? (
              <div style={{ padding: '40px 0' }}>
                <CheckCircle2 size={60} color="var(--success)" style={{ margin: '0 auto 20px' }} />
                <h3>Thank You!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Your anonymous feedback has been recorded.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p style={{ marginBottom: 20, color: 'var(--text-primary)' }}>How would you rate this session?</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 30 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                    >
                      <Star 
                        size={40} 
                        color={(hover || rating) >= star ? '#f1c40f' : 'var(--border)'} 
                        fill={(hover || rating) >= star ? '#f1c40f' : 'none'} 
                        style={{ transition: 'transform 0.1s' }}
                      />
                    </button>
                  ))}
                </div>
                
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label>Comments (Optional)</label>
                  <textarea 
                    className="form-input" 
                    rows={4} 
                    placeholder="What did you like? What could be improved?"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
                    Note: Your identity is hidden from the instructor.
                  </p>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 20, gap: 10 }}>
                  <Send size={18} /> Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
