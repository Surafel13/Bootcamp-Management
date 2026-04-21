import { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, Monitor, Filter, ShieldAlert } from 'lucide-react';
import apiFetch from '../utils/api';

export default function MasterSchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDiv, setFilterDiv] = useState('All');

  const fetchAllSessions = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/sessions');
      setSessions(data.data.sessions || []);
    } catch (err) {
      console.error('Failed to fetch master schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  const filtered = sessions.filter(s => 
    filterDiv === 'All' || s.division?.name === filterDiv
  );

  const divisions = [...new Set(sessions.map(s => s.division?.name).filter(Boolean))];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 10, background: 'var(--primary-glow)', borderRadius: 12, color: 'var(--primary)' }}>
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Master Schedule</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Centralized bootcamp events across all divisions</p>
            </div>
          </div>
          <div className="card-header-actions">
            <select 
              className="form-input" 
              value={filterDiv} 
              onChange={e => setFilterDiv(e.target.value)} 
              style={{ padding: '8px 12px', minWidth: 160 }}
            >
              <option value="All">All Divisions</option>
              {divisions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading master schedule...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Session Title</th>
                  <th>Division</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {s._id.slice(-6)}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {s.division?.name || 'General'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{new Date(s.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                        {s.location?.toLowerCase().includes('online') ? <Monitor size={14} /> : <MapPin size={14} />} 
                        {s.location || 'TBD'}
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: 20, 
                        fontSize: '0.7rem', 
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: s.status === 'completed' ? 'var(--success-light)' : 'var(--primary-glow)',
                        color: s.status === 'completed' ? 'var(--success)' : 'var(--primary)'
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', gap: 6 }}>
                        <ShieldAlert size={14} /> Audit
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>No sessions scheduled for this division.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
