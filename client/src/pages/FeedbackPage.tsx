import { useState, useEffect } from 'react';
import { MessageSquare, Star, Clock, User, Filter } from 'lucide-react';
import apiFetch from '../utils/api';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('All');

  const fetchAllFeedback = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/feedback');
      setFeedback(data.data.feedback || []);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFeedback();
  }, []);

  const filtered = feedback.filter(f => 
    filterRating === 'All' || f.rating === parseInt(filterRating)
  );

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 10, background: 'var(--primary-glow)', borderRadius: 12, color: 'var(--primary)' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Student Feedback</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Review anonymous student feedback for all sessions</p>
            </div>
          </div>
          <div className="card-header-actions">
            <select 
              className="form-input" 
              value={filterRating} 
              onChange={e => setFilterRating(e.target.value)}
              style={{ padding: '8px 12px' }}
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading feedback...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{f.session?.title || 'Unknown Session'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {f.session?.division?.name || 'General Division'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f1c40f' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < f.rating ? '#f1c40f' : 'none'} stroke={i < f.rating ? '#f1c40f' : 'var(--text-muted)'} />
                        ))}
                        <span style={{ marginLeft: 6, fontWeight: 800, color: 'var(--text-primary)' }}>{f.rating}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: 400 }}>
                      <p style={{ fontSize: '0.9rem', fontStyle: f.comment ? 'normal' : 'italic', color: f.comment ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {f.comment || 'No comment provided.'}
                      </p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Clock size={13} /> {new Date(f.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>No feedback found matching the criteria.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
