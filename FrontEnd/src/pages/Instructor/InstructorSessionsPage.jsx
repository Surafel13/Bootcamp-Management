import { useState } from 'react';
import { Plus, Pencil, Trash2, X, CalendarDays, Clock, MapPin, Monitor, Users, TrendingUp, Star, CheckCircle } from 'lucide-react';

const SESSIONS = [
  { id: 1, title: 'Advanced React Patterns',   date: 'Apr 12, 2026', time: '2:00 PM', attendees: 24, location: 'Room 101',    status: 'Upcoming'  },
  { id: 2, title: 'Web Development Workshop',  date: 'Apr 8, 2026',  time: '2:00 PM', attendees: 32, location: 'Room 101',    status: 'Completed' },
  { id: 3, title: 'JavaScript Fundamentals',   date: 'Apr 5, 2026',  time: '10:00 AM',attendees: 28, location: 'Online',      status: 'Completed' },
  { id: 4, title: 'Node.js & REST APIs',        date: 'Apr 1, 2026',  time: '3:00 PM', attendees: 30, location: 'Room 202',   status: 'Completed' },
  { id: 5, title: 'CSS Grid & Flexbox Deep Dive',date:'Apr 18, 2026', time: '11:00 AM',attendees: 22, location: 'Online',     status: 'Upcoming'  },
];

const STATUS_STYLE = {
  Upcoming:  { bg: 'var(--primary-glow)', color: 'var(--primary)' },
  Completed: { bg: 'rgba(0,184,148,0.12)',  color: '#00b894' },
  Cancelled: { bg: 'rgba(214,48,49,0.1)',   color: '#d63031' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Upcoming;
  return (
    <span style={{ padding:'4px 14px', borderRadius:20, fontSize:'0.75rem', fontWeight:800, background:s.bg, color:s.color }}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ background: `${color}15`, color }}>
        <Icon size={20} />
      </div>
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      <div className="stat-change" style={{ color: color }}>
        <TrendingUp size={14} style={{ marginRight: 4 }} />
        <span>{sub}</span>
      </div>
    </div>
  );
}

export default function InstructorSessionsPage() {
  const [sessions, setSessions] = useState(SESSIONS);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title:'', date:'', time:'', location:'Room 101', status:'Upcoming' });

  const openAdd  = () => { setForm({ title:'', date:'', time:'', location:'Room 101', status:'Upcoming' }); setEditId(null); setShowModal(true); };
  const openEdit = s  => { setForm({ title:s.title, date:s.date, time:s.time, location:s.location, status:s.status }); setEditId(s.id); setShowModal(true); };
  const del      = id => setSessions(p => p.filter(s => s.id !== id));

  const save = () => {
    if (!form.title || !form.date || !form.time) return;
    if (editId) {
      setSessions(p => p.map(s => s.id === editId ? { ...s, ...form } : s));
    } else {
      setSessions(p => [...p, { id: Date.now(), ...form, attendees: 0 }]);
    }
    setShowModal(false);
  };

  return (
    <div>
      {/* Stats Area */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Total Students" value="156" sub="+12 New" icon={Users} color="#025961"  />
        <StatCard label="Active Sessions" value="24"  sub="8 this week" icon={CalendarDays} color="#168b96" />
        <StatCard label="Avg Attendance" value="87%" sub="+5% increase" icon={CheckCircle} color="#00b894" />
        <StatCard label="Student Rating" value="4.8" sub="Highly rated" icon={Star} color="#fdcb6e" />
      </div>

      <div className="card">
        <div className="card-header" style={{ padding: '24px 24px 12px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Manage Sessions</h2>
          <button className="btn btn-primary" id="create-session-btn" onClick={openAdd} style={{ padding: '8px 18px', borderRadius: 10 }}>
            <Plus size={16} /> Create Session
          </button>
        </div>
        <div className="table-wrap" style={{ padding: '0 12px 12px' }}>
          <table>
            <thead>
              <tr>
                <th>Session Details</th>
                <th>date & Time</th>
                <th>Location</th>
                <th>Attendees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{s.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #BMS-202{s.id}</div>
                  </td>
                  <td>
                    <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.date}</span>
                      <span style={{ fontSize:'0.75rem', color: 'var(--text-secondary)' }}>{s.time}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-secondary)', fontSize:'0.82rem', fontWeight: 600 }}>
                      {s.location === 'Online' ? <Monitor size={14} /> : <MapPin size={14} />} {s.location}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900 }}>
                        {s.attendees}
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Students</span>
                    </div>
                  </td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn action-btn-edit" onClick={() => openEdit(s)} title="Edit"><Pencil size={15}/></button>
                      <button className="action-btn action-btn-delete" onClick={() => del(s.id)} title="Delete"><Trash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ borderRadius: 20 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{editId ? 'Edit Session' : 'Create New Session'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Session Title</label>
                <input className="form-input" placeholder="e.g. Advanced React Patterns"
                  value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>date</label>
                  <input className="form-input" type="date" value={form.date}
                    onChange={e => setForm(f=>({...f,date:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input className="form-input" type="time" value={form.time}
                    onChange={e => setForm(f=>({...f,time:e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label>Location / Online Link</label>
                <input className="form-input" placeholder="Room 101 or https://meet.google.com/..."
                  value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-input" style={{ appearance: 'none' }} value={form.status}
                  onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                  <option>Upcoming</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ borderRadius: 10 }}>Cancel</button>
              <button className="btn btn-primary" onClick={save} style={{ borderRadius: 10 }}>{editId ? 'Save Changes' : 'Create Session'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
