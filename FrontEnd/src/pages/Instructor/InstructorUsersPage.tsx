import { useState, useEffect } from 'react';
import { Search, User, Mail, Shield, UserCheck } from 'lucide-react';
import apiFetch from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function InstructorUsersPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const divId = user.divisions[0]?._id || user.divisions[0];
      // Fetch users filtered by division and role
      const data = await apiFetch(`/users?division=${divId}&role=student`);
      setStudents(data.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>My Students</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enrolled in {user.divisions[0]?.name || 'your division'}</p>
        </div>
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading student list...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email Address</th>
                <th>Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id}>
                  <td>
                    <div className="table-user">
                      <div className="table-avatar" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{s.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {s._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                      <Mail size={14} color="var(--text-muted)" /> {s.email}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                      background: s.status === 'active' ? 'var(--success-light)' : 'var(--danger-light)',
                      color: s.status === 'active' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ width: 100, height: 6, background: 'var(--bg-input)', borderRadius: 3 }}>
                      <div style={{ width: '65%', height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No students found in this division.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
