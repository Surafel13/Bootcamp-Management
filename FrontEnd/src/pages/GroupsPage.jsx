import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, Users, AlertCircle, CheckCircle } from 'lucide-react';
import apiFetch from '../utils/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', division: '', leader: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gData, dData] = await Promise.all([
        apiFetch('/groups'),
        apiFetch('/divisions')
      ]);
      setGroups(gData.data.groups || []);
      setDivisions(dData.data.divisions || dData.data.results || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!form.name || !form.division) return;
    try {
      const data = await apiFetch('/groups', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setGroups(prev => [...prev, data.data.group]);
      setShowModal(false);
      showToast('Group registered successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await apiFetch(`/groups/${id}`, { method: 'DELETE' });
      setGroups(prev => prev.filter(g => g._id !== id));
      showToast('Group removed.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <div className="toast-icon">{toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}</div>
            <div className="toast-body">
              <h4>{toast.type === 'success' ? 'Success' : 'Error'}</h4>
              <p>{toast.msg}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 10, background: 'var(--primary-glow)', borderRadius: 12, color: 'var(--primary)' }}>
              <Users size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Group Management</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Project teams and study groups</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Group
          </button>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading groups...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Division</th>
                  <th>Leader</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(g => (
                  <tr key={g._id}>
                    <td style={{ fontWeight: 700 }}>{g.name}</td>
                    <td>{g.division?.name || 'General'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{g.leader || 'Not assigned'}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                        background: 'var(--success-light)', color: 'var(--success)'
                      }}>
                        Active
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn action-btn-delete" onClick={() => handleDelete(g._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {groups.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No groups registered yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Register New Group</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Group Name</label>
                <input className="form-input" placeholder="e.g. Cyber Sentinels" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Division</label>
                <select className="form-input" value={form.division} onChange={e => setForm({...form, division: e.target.value})}>
                  <option value="">Select Division</option>
                  {divisions.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Team Leader Name</label>
                <input className="form-input" placeholder="Student Name" value={form.leader} onChange={e => setForm({...form, leader: e.target.value})} />
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
