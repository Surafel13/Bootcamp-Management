import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, Users, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', division: '', status: 'Active' });
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroupsAndDivisions = async () => {
    setLoading(true);
    try {
      const [grpRes, divRes] = await Promise.all([
        api.get('/groups').catch(() => ({ status: 'error', data: { groups: [] } })),
        api.get('/divisions').catch(() => ({ status: 'error', data: { divisions: [] } }))
      ]);

      if (divRes.status === 'success') {
        setDivisions(divRes.data.divisions);
        if (divRes.data.divisions.length > 0) {
          setForm(prev => ({ ...prev, division: divRes.data.divisions[0]._id }));
        }
      }

      if (grpRes.status === 'success') {
        const mapped = grpRes.data.groups.map(g => ({
          id: g._id,
          name: g.name,
          division: g.division?.name || 'Unknown',
          students: g.members?.length || 0,
          leader: g.members?.length > 0 ? g.members[0].name : 'None',
          status: (g.members?.length >= 2 && g.members?.length <= 8) ? 'Active' : 'Warning'
        }));
        setGroups(mapped);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupsAndDivisions();
  }, []);

  const validateGroupSize = (size) => size >= 2 && size <= 8;

  const handleSave = async () => {
    if (!form.name || !form.division) {
      alert("Please enter a group name and select a division.");
      return;
    }
    
    try {
      await api.post('/groups', { name: form.name, division: form.division });
      setShowModal(false);
      fetchGroupsAndDivisions();
    } catch(err) {
      alert(err.data?.message || 'Error creating group');
    }
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
                <th>Leader (First Member)</th>
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
              {groups.length === 0 && !loading && (
                 <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No Groups Found</td></tr>
              )}
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
                <label>Division</label>
                <select className="form-input" value={form.division} onChange={e => setForm({...form, division: e.target.value})}>
                  <option value="">Select Division...</option>
                  {divisions.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
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
