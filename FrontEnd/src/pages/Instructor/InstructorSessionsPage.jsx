import { useState, useEffect } from 'react';
import { 
  Plus, Pencil, Trash2, X, CalendarDays, Clock, MapPin, 
  Monitor, Users, TrendingUp, Star, CheckCircle, QrCode,
  AlertCircle
} from 'lucide-react';
import apiFetch from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLE = {
  upcoming:  { bg: 'var(--primary-glow)', color: 'var(--primary)' },
  completed: { bg: 'rgba(0,184,148,0.12)',  color: '#00b894' },
  cancelled: { bg: 'rgba(214,48,49,0.1)',   color: '#d63031' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status.toLowerCase()] || STATUS_STYLE.upcoming;
  return (
    <span style={{ padding:'4px 14px', borderRadius:20, fontSize:'0.75rem', fontWeight:800, background:s.bg, color:s.color, textTransform: 'capitalize' }}>
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

function QRModal({ sessionId, onClose }) {
  const [qrToken, setQrToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(13);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getQR = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch(`/sessions/${sessionId}/generate-qr`, { method: 'POST' });
      setQrToken(data.qrToken);
      setTimeLeft(13);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getQR();
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          getQR(); // Auto-refresh when expires
          return 13;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400, textAlign: 'center', borderRadius: 24 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Attendance QR Code</h2>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{ padding: 20 }}>
          {loading ? (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Generating...</div>
          ) : error ? (
            <div style={{ height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', padding: 20 }}>
               <AlertCircle size={48} style={{ marginBottom: 16 }} />
               <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{error}</p>
               <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={getQR}>Try Again</button>
            </div>
          ) : (
            <>
              <div style={{ background: 'white', padding: 20, borderRadius: 16, display: 'inline-block', marginBottom: 20 }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrToken}`} 
                  alt="Attendance QR" 
                  style={{ width: 200, height: 200 }}
                />
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                Refreshing in {timeLeft}s
              </div>
            </>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 10 }}>
            Students should scan this using their dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InstructorSessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [qrTarget, setQrTarget] = useState(null);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title:'', startTime:'', endTime:'', location:'Room 101', status:'upcoming', division: '', instructor: '' });
  const [stats, setStats] = useState({ assignedStudents: 0, totalSessions: 0, avgAttendance: '0%', recentRating: '0.0' });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/sessions');
      setSessions(data.data.sessions);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiFetch('/reports/dashboard-stats');
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => { 
    setForm({ 
      title:'', 
      startTime: '', 
      endTime: '', 
      location:'Room 101', 
      status:'upcoming',
      division: user.divisions[0]?._id || user.divisions[0] || '',
      instructor: user._id
    }); 
    setEditId(null); 
    setShowModal(true); 
  };

  const openEdit = s => { 
    setForm({ 
      title: s.title, 
      startTime: s.startTime.slice(0, 16), // Format for datetime-local
      endTime: s.endTime.slice(0, 16),
      location: s.location || 'Room 101', 
      status: s.status,
      division: s.division._id || s.division
    }); 
    setEditId(s._id); 
    setShowModal(true); 
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel/delete this session?')) return;
    try {
      await apiFetch(`/sessions/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s._id !== id));
      showToast('Session cancelled.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.startTime || !form.endTime) return;
    try {
      if (editId) {
        const data = await apiFetch(`/sessions/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify(form)
        });
        setSessions(p => p.map(s => s._id === editId ? data.data.session : s));
        showToast('Session updated.');
      } else {
        const data = await apiFetch('/sessions', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        setSessions(p => [...p, data.data.session]);
        showToast('Session created.');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {qrTarget && <QRModal sessionId={qrTarget} onClose={() => setQrTarget(null)} />}

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Assigned Students" value={stats.assignedStudents} sub="Active now" icon={Users} color="#025961"  />
        <StatCard label="Total Sessions" value={stats.totalSessions}  sub="Life-time" icon={CalendarDays} color="#168b96" />
        <StatCard label="Avg Attendance" value={stats.avgAttendance} sub="+5% this week" icon={CheckCircle} color="#00b894" />
        <StatCard label="Recent Rating" value={stats.recentRating} sub="Excellent" icon={Star} color="#fdcb6e" />
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Session Management</h2>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Create Session
          </button>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading sessions...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Session Details</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{s.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.type || 'Technical'}</div>
                    </td>
                    <td>
                      <div style={{ display:'flex', flexDirection:'column' }}>
                        <span style={{ fontWeight: 700 }}>{new Date(s.startTime).toLocaleDateString()}</span>
                        <span style={{ fontSize:'0.75rem' }}>{new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td><Badge text={s.status} colorMap={STATUS_STYLE} /></td>
                    <td>
                      <div className="table-actions">
                        {s.status === 'upcoming' && (
                          <button className="action-btn" onClick={() => setQrTarget(s._id)} title="Show QR" style={{ color: 'var(--primary)', background: 'var(--primary-glow)' }}>
                            <QrCode size={15}/>
                          </button>
                        )}
                        <button className="action-btn action-btn-edit" onClick={() => openEdit(s)}><Pencil size={15}/></button>
                        <button className="action-btn action-btn-delete" onClick={() => handleDelete(s._id)}><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Session' : 'Create New Session'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Session Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Start Time</label>
                  <input className="form-input" type="datetime-local" value={form.startTime} onChange={e => setForm(f=>({...f,startTime:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input className="form-input" type="datetime-local" value={form.endTime} onChange={e => setForm(f=>({...f,endTime:e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input className="form-input" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Save Changes' : 'Create Session'}</button>
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

function Badge({ text, colorMap }) {
  const s = colorMap[text.toLowerCase()] || colorMap.upcoming;
  return (
    <span style={{ padding:'4px 14px', borderRadius:20, fontSize:'0.75rem', fontWeight:800, background:s.bg, color:s.color, textTransform: 'capitalize' }}>
      {text}
    </span>
  );
}
