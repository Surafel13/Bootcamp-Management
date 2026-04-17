import { useState } from 'react';
import { CalendarDays, Clock, MapPin, Monitor, Filter, ShieldAlert } from 'lucide-react';

const SCHEDULE = [
  { id: 1, title: 'Advanced React Patterns', division: 'Development', instructor: 'Dr. Mitchell', date: 'Apr 12, 2026', time: '2:00 PM', location: 'Room 101', attendance: 88 },
  { id: 2, title: 'Network Security Basics', division: 'Cybersecurity', instructor: 'Prof. Chen', date: 'Apr 12, 2026', time: '10:00 AM', location: 'Room 202', attendance: 95 },
  { id: 3, title: 'Data Cleaning Workshop', division: 'Data Science', instructor: 'Emily Rodriguez', date: 'Apr 11, 2026', time: '9:00 AM', location: 'Online', attendance: 72 },
];

export default function MasterSchedulePage() {
  const [filterDiv, setFilterDiv] = useState('All');

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
              {SCHEDULE.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.title}</td>
                  <td>{s.division}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.instructor}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>{s.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.time}</div>
                  </td>
                  <td>
                    {s.location === 'Online' ? <Monitor size={14} /> : <MapPin size={14} />} {s.location}
                  </td>
                  <td>{s.attendance}%</td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.7rem', gap: 5 }}>
                      <ShieldAlert size={14} /> Override
                    </button>
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
