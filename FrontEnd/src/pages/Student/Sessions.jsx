import React, { useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import SessionDetails from './SessionDetails';

const Sessions = () => {
  const [selectedSession, setSelectedSession] = useState(null);

  const upcomingSessions = [
    {
      title: 'Advanced React Patterns',
      category: 'Developmental',
      date: 'Apr 12, 2026',
      time: '2:00 PM - 4:00 PM',
      location: 'Virtual Room A',
      status: 'Ongoing',
      description: 'Master advanced component composition, custom hooks, and state management techniques necessary for complex React applications.'
    },
    {
      title: 'Cybersecurity Fundamentals',
      category: 'Cyber',
      date: 'Apr 14, 2026',
      time: '3:00 PM - 5:00 PM',
      location: 'Virtual Room B',
      status: 'Upcoming',
      description: 'An intro to network security, cryptography, and defense strategies against common vulnerabilities.'
    },
    {
      title: 'Data Analysis with Python',
      category: 'Data Science',
      date: 'Apr 15, 2026',
      time: '1:00 PM - 3:00 PM',
      location: 'Virtual Room C',
      status: 'Upcoming',
      description: 'Utilize Pandas, NumPy, and Matplotlib to analyze and visualize large datasets effectively.'
    },
  ];

  if (selectedSession) {
    return <SessionDetails session={selectedSession} onBack={() => setSelectedSession(null)} />;
  }

  return (
    <div className="page-content">
      {/* Upcoming Sessions */}
      <section>
        <div className="page-header">
          <h1>Upcoming Sessions</h1>
          <p>Don't miss your next learning opportunity</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {upcomingSessions.map((session, index) => (
            <div 
              key={index}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                padding: '24px',
                background: session.status === 'Ongoing' ? 'var(--primary)' : 'var(--bg-card)',
                color: session.status === 'Ongoing' ? 'var(--text-on-primary)' : 'var(--text-primary)',
                border: session.status === 'Ongoing' ? 'none' : '1px solid var(--border)',
              }}
            >
              {/* Calendar Icon */}
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-lg)',
                  background: session.status === 'Ongoing' 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: session.status === 'Ongoing' ? '#fff' : 'var(--primary)',
                  flexShrink: 0,
                }}
              >
                <Calendar size={32} strokeWidth={2.25} />
              </div>

              {/* Session Info */}
              <div style={{ flex: 1 }}>
                <h4 
                  style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 700, 
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {session.title}
                  {session.status === 'Ongoing' && (
                    <span 
                      style={{
                        width: '9px',
                        height: '9px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'pulse 2s infinite'
                      }}
                    />
                  )}
                </h4>

                <div 
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: '0.95rem',
                    color: session.status === 'Ongoing' ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span 
                      style={{
                        width: '8px',
                        height: '8px',
                        background: session.status === 'Ongoing' ? 'rgba(255,255,255,0.9)' : '#00c4b4',
                        borderRadius: '50%'
                      }}
                    />
                    {session.category}
                  </span>
                  <span>•</span>
                  <span>{session.date}</span>
                  <span>•</span>
                  <span>{session.time}</span>
                  <span>•</span>
                  <span>{session.location}</span>
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => setSelectedSession(session)}
                className="btn"
                style={{
                  padding: '12px 28px',
                  background: session.status === 'Ongoing' ? 'rgba(255,255,255,0.15)' : 'white',
                  color: session.status === 'Ongoing' ? '#fff' : 'var(--primary)',
                  border: session.status === 'Ongoing' 
                    ? '1px solid rgba(255,255,255,0.3)' 
                    : '1px solid var(--primary)',
                  borderRadius: 'var(--radius)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recent History */}
      <section style={{ marginTop: '48px' }}>
        <div className="page-header">
          <h1>Recent History</h1>
          <p>Your completion record</p>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Success Icon */}
          <div 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              flexShrink: 0,
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              Web Development Workshop
            </h4>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.95rem',
                color: 'var(--text-secondary)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }} />
                Developmental
              </span>
              <span>•</span>
              <span>Apr 8, 2026</span>
              <span>•</span>
              <span>2:00 PM - 4:00 PM</span>
            </div>
          </div>

          {/* Completed Badge */}
          <div 
            className="badge badge-success"
            style={{ 
              padding: '10px 20px', 
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}
          >
            COMPLETED
          </div>
        </div>
      </section>

      {/* Pulse Animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};

export default Sessions;