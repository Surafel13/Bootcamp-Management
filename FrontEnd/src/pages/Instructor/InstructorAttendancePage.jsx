import { useState, useMemo } from 'react';
import { Search, Filter, Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const RECORDS = [
  { id:1, name:'Alex Johnson',    initials:'AJ', session:'React Advanced',         date:'Apr 8, 2026', time:'2:05 PM', status:'Present' },
  { id:2, name:'Sarah Davis',     initials:'SD', session:'React Advanced',         date:'Apr 8, 2026', time:'2:02 PM', status:'Present' },
  { id:3, name:'Mike Wilson',     initials:'MW', session:'React Advanced',         date:'Apr 8, 2026', time:'-',       status:'Absent' },
  { id:4, name:'Emily Chen',      initials:'EC', session:'Web Dev Workshop',       date:'Apr 8, 2026', time:'2:18 PM', status:'Late' },
  { id:5, name:'James Lee',       initials:'JL', session:'Web Dev Workshop',       date:'Apr 8, 2026', time:'2:01 PM', status:'Present' },
  { id:6, name:'Olivia Brown',    initials:'OB', session:'JavaScript Fundamentals',date:'Apr 5, 2026', time:'-',       status:'Excused' },
  { id:7, name:'Noah Martinez',   initials:'NM', session:'JavaScript Fundamentals',date:'Apr 5, 2026', time:'10:05 AM',status:'Present' },
  { id:8, name:'Sophia Adams',    initials:'SA', session:'Node.js & REST APIs',    date:'Apr 1, 2026', time:'3:15 PM', status:'Late' },
];

const STATUS_STYLES = {
  Present:  { bg:'rgba(0,184,148,0.12)',   color:'#00b894', icon: CheckCircle  },
  Absent:   { bg:'rgba(214,48,49,0.1)',    color:'#d63031', icon: XCircle      },
  Late:     { bg:'rgba(253,203,110,0.18)', color:'#b7860a', icon: Clock        },
  Excused:  { bg:'rgba(9,132,227,0.12)',   color:'#0984e3', icon: AlertCircle  },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status];
  const Icon = s?.icon || CheckCircle;
  return (
    <span style={{ padding:'4px 10px', borderRadius:999, fontSize:'0.75rem', fontWeight:700,
      background: s?.bg, color: s?.color, display:'inline-flex', alignItems:'center', gap:5 }}>
      <Icon size={12} /> {status}
    </span>
  );
}

export default function InstructorAttendancePage() {
  const [records, setRecords] = useState(RECORDS);
  const [search, setSearch] = useState('');
  const [filterSession, setFilterSession] = useState('All');

  const sessions = ['All', ...new Set(RECORDS.map(r => r.session))];

  const filtered = useMemo(() =>
    records.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.session.toLowerCase().includes(search.toLowerCase());
      const matchSession = filterSession === 'All' || r.session === filterSession;
      return matchSearch && matchSession;
    }), [records, search, filterSession]);

  const markStatus = (id, status) => setRecords(p => p.map(r => r.id === id ? {...r, status} : r));

  const counts = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
  records.forEach(r => counts[r.status]++);

  return (
    <div>
      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {Object.entries(counts).map(([s, v]) => {
          const st = STATUS_STYLES[s];
          return (
            <div key={s} className="stat-card" style={{ borderLeft:`3px solid ${st.color}` }}>
              <p className="stat-label">{s}</p>
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
              <input placeholder="Search students…" value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <select className="form-input" style={{ padding:'7px 12px', fontSize:'0.83rem', minWidth:170 }}
              value={filterSession} onChange={e=>setFilterSession(e.target.value)}>
              {sessions.map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-secondary" style={{ gap:6 }}>
              <Download size={15}/> Export
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Session</th>
                <th>date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="table-user">
                      <div className="table-avatar">{r.initials}</div>
                      <span className="table-user-name">{r.name}</span>
                    </div>
                  </td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>{r.session}</td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>{r.date}</td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>{r.time}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <div className="table-actions">
                      {r.status !== 'Present' && (
                        <button className="btn" style={{ padding:'5px 12px', fontSize:'0.78rem',
                          background:'rgba(0,184,148,0.12)', color:'#00b894', border:'none', borderRadius:6 }}
                          onClick={() => markStatus(r.id, 'Present')}>
                          Mark Present
                        </button>
                      )}
                      {r.status !== 'Absent' && (
                        <button className="btn" style={{ padding:'5px 12px', fontSize:'0.78rem',
                          background:'rgba(214,48,49,0.1)', color:'#d63031', border:'none', borderRadius:6 }}
                          onClick={() => markStatus(r.id, 'Absent')}>
                          Mark Absent
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
