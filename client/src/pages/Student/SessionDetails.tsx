import React from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  AlertCircle
} from 'lucide-react';

const SessionDetails = ({ session, onBack }) => {
  if (!session) return null;

  const isOngoing = session.status === 'Ongoing';
  const isUpcoming = session.status === 'Upcoming';
  const isEnded = !isOngoing && !isUpcoming;

  return (
    <div className="page-content" style={{ maxWidth: '1280px', margin: '0 auto' }}>

      {/* Back Button */}
      <button
        onClick={onBack}
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          marginBottom: '24px', fontSize: '0.875rem', fontWeight: '500',
          color: 'var(--text-secondary)', background: 'none', border: 'none',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={18} />
        <span>Back to Sessions</span>
      </button>

      <div className="card" style={{ overflow: 'hidden', borderRadius: '24px' }}>

        {/* HEADER */}
        <div style={{ padding: '36px 40px', background: 'var(--primary)', color: 'white' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Top badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <span style={{
                padding: '4px 14px', fontSize: '0.75rem', fontWeight: '500', 
                letterSpacing: '0.025em', borderRadius: '9999px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)'
              }}>
                {session.category || 'Data Science'}
              </span>

              <span style={{
                padding: '4px 14px', fontSize: '0.75rem', fontWeight: '600', 
                borderRadius: '9999px', border: '1px solid',
                background: isOngoing ? 'rgba(239, 68, 68, 0.2)' : isUpcoming ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.1)',
                color: isOngoing ? '#fca5a5' : isUpcoming ? '#fde68a' : '#e5e7eb',
                borderColor: isOngoing ? 'rgba(239, 68, 68, 0.5)' : isUpcoming ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255,255,255,0.2)'
              }}>
                {isOngoing ? '● Live Now' : session.status || 'Upcoming'}
              </span>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: '2rem', fontWeight: '700', lineHeight: '1.3', margin: 0 }}>
              {session.title}
            </h1>

            {/* Meta Info */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} />
                <span>{session.instructor || 'Lead Instructor'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} />
                <span>{session.date}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                <span>{session.time}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} />
                <span>{session.location || 'Virtual Room'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* BODY */}
        <div style={{ 
          padding: '36px 40px', 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '32px',
          alignItems: 'flex-start'
        }}>

          {/* LEFT (Content) */}
          <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Description */}
            <div className="card" style={{ padding: '28px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>
                Description
              </h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {session.description ||
                  "Utilize Pandas, NumPy, and Matplotlib to analyze and visualize datasets. Learn data cleaning, exploration, and visualization techniques."}
              </p>
            </div>

            {/* Guidelines */}
            <div className="card" style={{ padding: '28px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '20px', color: 'var(--text-primary)' }}>
                Session Guidelines
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  "Join 5–10 minutes early for setup.",
                  "Keep your microphone muted unless speaking.",
                  "Prepare questions in advance.",
                  "Use chat for support or questions."
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', 
                      backgroundColor: 'var(--primary-glow)', padding: '4px 8px', borderRadius: '6px'
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT (Action Panel) */}
          <div style={{ flex: '1 1 300px', position: 'sticky', top: '24px' }}>
            <div className="card" style={{ padding: '28px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Status Indicator */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px', 
                  padding: '8px 16px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600',
                  color: isOngoing ? 'var(--primary)' : isUpcoming ? '#d97706' : 'var(--text-secondary)',
                  backgroundColor: isOngoing ? 'var(--primary-glow)' : isUpcoming ? '#fef3c7' : 'var(--bg-hover)'
                }}>
                  {isOngoing ? 'Live Now' : session.status || 'Upcoming'}
                </div>
              </div>

              {/* ACTION */}
              {isOngoing && (
                <button className="btn btn-primary" style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.95rem' }}>
                  <Video size={20} />
                  Join Session
                </button>
              )}

              {isUpcoming && (
                <div style={{
                  borderRadius: '12px', border: '1px solid #fde68a', backgroundColor: '#fffbeb', 
                  padding: '24px', textAlign: 'center'
                }}>
                  <AlertCircle size={28} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#b45309' }}>
                    Session not started yet
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '6px' }}>
                    Join 10 minutes before start time
                  </p>
                </div>
              )}

              {isEnded && (
                <div style={{
                  borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-hover)', 
                  padding: '24px', textAlign: 'center'
                }}>
                  <AlertCircle size={28} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Session has ended
                  </p>
                </div>
              )}

              {/* Divider & Quick Info */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.875rem' }}>
                <h4 style={{ fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Quick Info</h4>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Duration</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>2h</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Platform</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Virtual</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Capacity</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>50</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SessionDetails;