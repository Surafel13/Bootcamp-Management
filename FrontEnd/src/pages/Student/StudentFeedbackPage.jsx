import React, { useState } from 'react';
import { Star, Send, Clock, CheckCircle2 } from 'lucide-react';

const ELIGIBLE_SESSIONS = [
  { id: 1, title: 'Advanced React Patterns', date: 'Apr 12, 2026', instructor: 'Dr. Mitchell' },
  { id: 2, title: 'JavaScript Fundamentals', date: 'Apr 10, 2026', instructor: 'Emily Rodriguez' },
  { id: 3, title: 'Data Analysis with Python', date: 'Apr 15, 2026', instructor: 'Dr. R. Lin' },
];

const PAST_FEEDBACK = [
  {
    id: 101,
    sessionTitle: 'Cybersecurity Fundamentals',
    rating: 5,
    comment: "Excellent session! The instructor explained complex topics very clearly with great real-world examples.",
    date: "Apr 8, 2026"
  },
  {
    id: 102,
    sessionTitle: 'Web Development Workshop',
    rating: 4,
    comment: "Very practical and hands-on. Would have liked more time for the group project.",
    date: "Apr 5, 2026"
  },
];

export default function StudentFeedbackPage() {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'past'
  
  // Submit Form State
  const [selectedSession, setSelectedSession] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSession || rating === 0) {
      alert("Please select a session and provide a rating.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedSession('');
        setRating(0);
        setComment('');
      }, 2500);
    }, 1200);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Session Feedback</h1>
        <p>Share your thoughts and help us improve our sessions</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '1px solid var(--border)' }}>
        <button
          className={`tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
          style={{
            padding: '12px 24px',
            fontWeight: 600,
            background: activeTab === 'submit' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'submit' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: 'var(--radius) var(--radius) 0 0',
            cursor: 'pointer'
          }}
        >
          Submit New Feedback
        </button>
        <button
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
          style={{
            padding: '12px 24px',
            fontWeight: 600,
            background: activeTab === 'past' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'past' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: 'var(--radius) var(--radius) 0 0',
            cursor: 'pointer'
          }}
        >
          Past Feedback
        </button>
      </div>

      {/* Submit Feedback Section */}
      {activeTab === 'submit' && (
        <div className="card">
          <div className="card-header">
            <h3>Rate a Recent Session</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Your feedback is completely anonymous</p>
          </div>

          <div style={{ padding: '32px' }}>
            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <CheckCircle2 size={72} color="var(--success)" style={{ marginBottom: '20px' }} />
                <h3 style={{ color: 'var(--success)' }}>Thank You!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                  Your feedback has been submitted successfully.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Session Selection */}
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}>Select Session</label>
                  <select
                    className="form-input"
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    required
                  >
                    <option value="">Choose a session you attended...</option>
                    {ELIGIBLE_SESSIONS.map(session => (
                      <option key={session.id} value={session.id}>
                        {session.title} — {session.date} • {session.instructor}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Star Rating */}
                <div className="form-group" style={{ marginBottom: '28px' }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                    How would you rate this session?
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Star
                          size={48}
                          color={(hover || rating) >= star ? '#f1c40f' : 'var(--border)'}
                          fill={(hover || rating) >= star ? '#f1c40f' : 'none'}
                          style={{ transition: 'all 0.2s' }}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p style={{ textAlign: 'center', marginTop: '8px', color: 'var(--text-secondary)' }}>
                      {rating} out of 5 stars
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}>Comments (Optional)</label>
                  <textarea
                    className="form-input"
                    rows={5}
                    placeholder="What did you like most? What could be improved? Any suggestions?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '20px' }}
                >
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      <Send size={18} /> Submit Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Past Feedback Section */}
      {activeTab === 'past' && (
        <div>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Your Previous Feedback</h3>
          
          {PAST_FEEDBACK.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No feedback submitted yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {PAST_FEEDBACK.map(feedback => (
                <div key={feedback.id} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ marginBottom: '6px' }}>{feedback.sessionTitle}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Submitted on {feedback.date}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={22}
                          color={star <= feedback.rating ? '#f1c40f' : 'var(--border)'}
                          fill={star <= feedback.rating ? '#f1c40f' : 'none'}
                        />
                      ))}
                    </div>
                  </div>

                  <p style={{ 
                    color: 'var(--text-primary)', 
                    lineHeight: '1.6',
                    fontSize: '0.98rem'
                  }}>
                    {feedback.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}