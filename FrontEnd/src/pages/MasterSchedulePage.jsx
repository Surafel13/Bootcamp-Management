import { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, Monitor, Filter, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function MasterSchedulePage() {
  const [filterDiv, setFilterDiv] = useState('All Divisions');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/sessions');
        if (res.status === 'success') {
          const mapped = res.data.sessions.map(s => {
            const dateObj = new Date(s.date);
            return {
              id: s._id,
              title: s.title,
              division: s.division?.name || 'All',
              instructor: s.instructor?.name || 'Unknown',
              date: dateObj.toLocaleDateString(),
              time: `${s.startTime} - ${s.endTime}`,
              location: s.location || 'Online',
              attendance: s.attendance || 0
            };
          });
          setSchedule(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const filteredSchedule = schedule.filter(s => 
    filterDiv === 'All Divisions' ? true : s.division === filterDiv
  );

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Master Schedule</h2>
          <div className="card-header-actions">
            <select className="form-input" value={filterDiv} onChange={e => setFilterDiv(e.target.value)} style={{ padding: '8px 12px' }}>
              <option>All Divisions</option>
              <option>Development</option>
              <option>Cybersecurity</option>
              <option>Data Science</option>
              <option>CPD</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Session</th>
                <th>Division</th>
                <th>Instructor</th>
                <th>Date / Time</th>
                <th>Location</th>
                <th>Attendance</th>
                <th>Admin Override</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.title}</td>
                  <td>{s.division}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.instructor}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>{s.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.time}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {s.location?.toLowerCase().includes('online') ? <Monitor size={14} /> : <MapPin size={14} />} {s.location}
                    </div>
                  </td>
                  <td>{s.attendance}%</td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.7rem', gap: 5 }}>
                      <ShieldAlert size={14} /> Override
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSchedule.length === 0 && !loading && (
                 <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No Sessions Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
