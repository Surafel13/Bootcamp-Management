import { useState, useMemo, useEffect } from 'react';
import { Search, Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import apiFetch from '../../utils/api';

const STATUS_STYLES = {
  present:  { bg:'rgba(0,184,148,0.12)',   color:'#00b894', icon: CheckCircle },
  absent:   { bg:'rgba(214,48,49,0.1)',    color:'#d63031', icon: XCircle     },
  late:     { bg:'rgba(253,203,110,0.18)', color:'#b7860a', icon: Clock       },
  excused:  { bg:'rgba(9,132,227,0.12)',   color:'#0984e3', icon: AlertCircle },
};

function StatusBadge({ status }) {
  const key = status.toLowerCase();
  const s = STATUS_STYLES[key] || STATUS_STYLES.absent;
  const Icon = s.icon;
  return (
    <span style={{ padding:'4px 10px', borderRadius:999, fontSize:'0.75rem', fontWeight:700,
      background: s.bg, color: s.color, display:'inline-flex', alignItems:'center', gap:5, textTransform: 'capitalize' }}>
      <Icon size={12} /> {status}
    </span>
  );
}

export default function InstructorAttendancePage() {
  const [records, setRecords] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSession, setFilterSession] = useState('All');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attData, sesData] = await Promise.all([
        apiFetch('/attendance'),
        apiFetch('/sessions')
      ]);
      setRecords(attData.data.attendances || attData.data.records || []);
      setSessions(sesData.data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() =>
    records.filter(r => {
      const name = r.student?.name || '';
      const sessionTitle = r.session?.title || '';
      const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
        sessionTitle.toLowerCase().includes(search.toLowerCase());
      const matchSession = filterSession === 'All' || r.session?._id === filterSession;
      return matchSearch && matchSession;
    }), [records, search, filterSession]);

  const counts = { present: 0, absent: 0, late: 0, excused: 0 };
  records.forEach(r => { const k = r.status?.toLowerCase(); if (counts[k] !== undefined) counts[k]++; });

  return (
    <div>
      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {Object.entries(counts).map(([s, v]) => {
          const st = STATUS_STYLES[s];
          return (
            <div key={s} className="stat-card" style={{ borderLeft:`3px solid ${st.color}` }}>
              <p className="stat-label" style={{ textTransform: 'capitalize' }}>{s}</p>
              <div className="stat-value" style={{ fontSize:'1.7rem', color: st.color }}>{v}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>students</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Attendance Records</h2>
          <div className="card-header-actions">
            <div className="search-box">
              <Search size={14} />
              <input placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-input" style={{ padding:'7px 12px', fontSize:'0.83rem', minWidth:170 }}
              value={filterSession} onChange={e => setFilterSession(e.target.value)}>
              <option value="All">All Sessions</option>
              {sessions.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading attendance records...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Session</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No attendance records found.</td></tr>
                ) : filtered.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar">
                          {r.student?.name?.charAt(0) || '?'}
                        </div>
                        <span className="table-user-name">{r.student?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>{r.session?.title || '-'}</td>
                    <td style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>
                      {r.scannedAt ? new Date(r.scannedAt).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>
                      {r.scannedAt ? new Date(r.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
