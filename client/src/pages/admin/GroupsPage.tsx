import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, Users, AlertCircle } from 'lucide-react';

const INITIAL_GROUPS = [
  { id: 1, name: 'Group Alpha (Data Science)', division: 'Data Science', students: 4, leader: 'Alex Johnson', status: 'Active' },
  { id: 2, name: 'Cyber Sentinels',            division: 'Cybersecurity', students: 6, leader: 'Sarah Davis',  status: 'Active' },
  { id: 3, name: 'Dev Masters',               division: 'Development',   students: 2, leader: 'James Wilson', status: 'Warning' },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', division: 'Development', students: 2, leader: '', status: 'Active' });

  const validateGroupSize = (size) => size >= 2 && size <= 8;

  const handleSave = () => {
    if (!validateGroupSize(form.students)) {
      alert("SRS Rule: Group size must be between 2 and 8 students.");
      return;
    }
    setGroups(prev => [...prev, { id: Date.now(), ...form }]);
    setShowModal(false);
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Group Management</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Group
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Division</th>
                <th>Size</th>
                <th>Leader</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td>{g.division}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={14} /> {g.students}
                      {!validateGroupSize(g.students) && <AlertCircle size={14} color="var(--danger)" title="Invalid size (SRS: 2-8)" />}
                    </div>
                  </td>
                  <td>{g.leader}</td>
                  <td>
                    <span style={{ 
                      padding: '3px 10px', 
                      borderRadius: 12, 
                      fontSize: '0.75rem', 
                      background: g.status === 'Warning' ? 'var(--danger-light)' : 'var(--success-light)',
                      color: g.status === 'Warning' ? 'var(--danger)' : 'var(--success)'
                    }}>
                      {g.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn action-btn-edit"><Pencil size={14} /></button>
                      <button className="action-btn action-btn-delete"><Trash2 size={14} /></button>
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
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Register New Group</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Group Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Number of Students (SRS Rule: 2-8)</label>
                <input className="form-input" type="number" value={form.students} onChange={e => setForm({...form, students: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Team Leader Name</label>
                <input className="form-input" value={form.leader} onChange={e => setForm({...form, leader: e.target.value})} />
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Create Group</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
