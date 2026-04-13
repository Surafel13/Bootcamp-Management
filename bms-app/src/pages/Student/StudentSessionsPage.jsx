import { useState, useMemo } from 'react';
import { CalendarDays, Clock, MapPin, Monitor, Download, CheckCircle2 } from 'lucide-react';

const MOCK_SESSIONS = [
  { id: 1, title: 'Advanced React Patterns', date: 'Apr 12, 2026', time: '2:00 PM', location: 'Room 101', status: 'Upcoming', resource: 'react_patterns.pdf' },
  { id: 2, title: 'Web Development Workshop', date: 'Apr 15, 2026', time: '10:00 AM', location: 'Online',  status: 'Upcoming', resource: 'workshop_notes.zip' },
  { id: 3, title: 'JavaScript Fundamentals',  date: 'Apr 10, 2026', time: '9:00 AM',  location: 'Room 202', status: 'Completed', resource: 'js_basics.pdf' },
];

export default function StudentSessionsPage() {
  const [checkedIn, setCheckedIn] = useState({});

  const handleCheckIn = (id) => {
    setCheckedIn(prev => ({ ...prev, [id]: true }));
    alert("Attendance recorded! You are marked as PRESENT for this session.");
  };

  return (
    <div className="sessions-page">
      <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
        {MOCK_SESSIONS.map(s => (
          <div key={s.id} className="card session-card" style={{ padding: 20, borderTop: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 5 }}>{s.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <CalendarDays size={14} /> {s.date}
                  <Clock size={14} /> {s.time}
                </div>
              </div>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: 20, 
                fontSize: '0.7rem', 
                fontWeight: 700,
                background: s.status === 'Upcoming' ? 'var(--primary-glow)' : 'var(--bg-input)',
                color: s.status === 'Upcoming' ? 'var(--primary)' : 'var(--text-muted)'
              }}>
                {s.status}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {s.location === 'Online' ? <Monitor size={16} color="var(--primary)" /> : <MapPin size={16} color="var(--primary)" />}
              {s.location}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 15, display: 'flex', gap: 10 }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, gap: 8, fontSize: '0.8rem' }}
                onClick={() => alert(`Downloading ${s.resource}...`)}
              >
                <Download size={15} /> Materials
              </button>
              
              {s.status === 'Upcoming' && (
                <button 
                  className={`btn ${checkedIn[s.id] ? 'btn-secondary' : 'btn-primary'}`} 
                  style={{ flex: 1, gap: 8, fontSize: '0.8rem' }}
                  onClick={() => !checkedIn[s.id] && handleCheckIn(s.id)}
                  disabled={checkedIn[s.id]}
                >
                  {checkedIn[s.id] ? <><CheckCircle2 size={15} /> Checked-in</> : 'Check-in'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
