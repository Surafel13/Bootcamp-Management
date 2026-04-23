import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Monitor, Clock } from 'lucide-react';
import SessionDetails from './SessionDetails';
import apiFetch from '../../utils/api';

const Sessions = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await apiFetch('/sessions');
        setSessions(data.data.sessions || []);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const upcoming = sessions.filter(s => s.status === 'upcoming');
  const completed = sessions.filter(s => s.status === 'completed');

  const isOngoing = (s) => {
    const now = new Date();
    return new Date(s.startTime) <= now && new Date(s.endTime) >= now;
  };

  if (selectedSession) {
    return <SessionDetails session={selectedSession} onBack={() => setSelectedSession(null)} />;
  }

  return (
    <div className="page-content">
      <section>
        <div className="page-header">
          <h1>Upcoming Sessions</h1>
          <p>Don't miss your next learning opportunity</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading sessions...</div>
        ) : upcoming.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No upcoming sessions scheduled for your division.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {upcoming.map((session) => {
              const ongoing = isOngoing(session);
              return (
                <div
                  key={session._id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    padding: '24px',
                    background: ongoing ? 'var(--primary)' : 'var(--bg-card)',
                    color: ongoing ? '#fff' : 'var(--text-primary)',
                    border: ongoing ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div style={{
                    width: '64px', height: '64px',
                    borderRadius: 'var(--radius-lg)',
                    background: ongoing ? 'rgba(255,255,255,0.2)' : 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: ongoing ? '#fff' : 'var(--primary)',
                    flexShrink: 0,
                  }}>
                    <Calendar size={32} strokeWidth={2.25} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      {session.title}
                      {ongoing && (
                        <span style={{ width: '9px', height: '9px', background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                      )}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.9rem', color: ongoing ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={13} /> {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {session.location?.toLowerCase().includes('online') ? <Monitor size={13} /> : <MapPin size={13} />}
                        {session.location || 'TBD'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSession(session)}
                    className="btn"
                    style={{
                      padding: '10px 22px',
                      background: ongoing ? 'rgba(255,255,255,0.15)' : 'white',
                      color: ongoing ? '#fff' : 'var(--primary)',
                      border: ongoing ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--primary)',
                      borderRadius: 'var(--radius)',
                      fontWeight: 600,
                    }}
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section style={{ marginTop: '48px' }}>
          <div className="page-header">
            <h1>Recent History</h1>
            <p>Your completion record</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {completed.slice(0, 5).map(session => (
              <div key={session._id} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                  background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--success)', flexShrink: 0,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{session.title}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {session.location || 'TBD'}
                  </div>
                </div>
                <div className="badge badge-success" style={{ padding: '6px 16px', fontSize: '0.78rem', fontWeight: 700 }}>
                  COMPLETED
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};

export default Sessions;