import { useState } from 'react';
import { Code, FileText, CheckCircle, Clock, RotateCcw } from 'lucide-react';

const SUBS = [
  { id:1, name:'Alex Johnson', initials:'AJ', task:'Build Portfolio Website', type:'Both',   date:'Apr 10, 2026', time:'3:30 PM', score:'95/100', status:'Graded' },
  { id:2, name:'Sarah Davis',  initials:'SD', task:'Build Portfolio Website', type:'Both',   date:'Apr 11, 2026', time:'2:15 PM', score:'-',      status:'Pending' },
  { id:3, name:'Mike Wilson',  initials:'MW', task:'React Component Library', type:'GitHub', date:'Apr 9, 2026',  time:'5:45 PM', score:'88/100', status:'Graded' },
  { id:4, name:'Emma Brown',   initials:'EB', task:'Build Portfolio Website', type:'File',   date:'Apr 12, 2026', time:'1:20 PM', score:'82/100', status:'Returned' },
];

const ST_STYLE = {
  Graded:   { bg: 'rgba(0,184,148,0.12)',   color: '#00b894' },
  Pending:  { bg: 'rgba(9,132,227,0.12)',   color: '#0984e3' },
  Returned: { bg: 'rgba(253,203,110,0.18)', color: '#b7860a' },
};

function Badge({ status }) {
  const s = ST_STYLE[status];
  return <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.75rem', fontWeight:700, background:s?.bg, color:s?.color }}>{status}</span>;
}

export default function InstructorSubmissionsPage() {
  return (
    <div>
      <div className="card-header" style={{ padding: '0 0 20px 0', borderBottom: 'none', display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Student Submissions</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-input" style={{ width: 140 }}><option>All Tasks</option></select>
          <select className="form-input" style={{ width: 120 }}><option>All Status</option></select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Task</th>
                <th>Type</th>
                <th>Submitted</th>
                <th>Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {SUBS.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="table-user">
                      <div className="table-avatar" style={{ background:'var(--primary-glow)', color:'var(--primary)' }}>{s.initials}</div>
                      <span className="table-user-name">{s.name}</span>
                    </div>
                  </td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>
                    <div style={{ maxWidth: 160, whiteSpace:'normal', lineHeight:1.3 }}>{s.task}</div>
                  </td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:'0.82rem' }}>
                      {s.type.includes('File') || s.type==='Both' ? <FileText size={13}/> : null}
                      {s.type.includes('GitHub') || s.type==='Both' ? <Code size={13}/> : null}
                      {s.type}
                    </div>
                  </td>
                  <td>
                    <div style={{ color:'var(--text-secondary)', fontSize:'0.82rem', display:'flex', flexDirection:'column', gap:2 }}>
                      <span>{s.date}</span>
                      <span style={{ fontSize:'0.75rem' }}>{s.time}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight:700, color:'var(--text-primary)' }}>{s.score}</td>
                  <td><Badge status={s.status} /></td>
                  <td>
                    {s.status === 'Pending' ? (
                      <button className="btn btn-primary" style={{ padding:'5px 12px', fontSize:'0.78rem' }}>Grade</button>
                    ) : (
                      <button className="btn btn-secondary" style={{ padding:'5px 12px', fontSize:'0.78rem', background:'var(--primary)', color:'#fff', border:'none' }}>View</button>
                    )}
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
