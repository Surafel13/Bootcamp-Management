import { useState, useEffect } from 'react';
import { LayoutGrid, Pencil, Trash2, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import apiFetch from '../utils/api';

function AttendanceBadge({ value }) {
  const color = value >= 90 ? 'var(--success)' : value >= 80 ? '#0984e3' : '#fdcb6e';
  const bg    = value >= 90 ? 'rgba(0,184,148,0.12)' : value >= 80 ? 'rgba(9,132,227,0.1)' : 'rgba(253,203,110,0.15)';
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 'var(--radius-full)',
      fontSize: '0.75rem', fontWeight: 700, background: bg, color
    }}>
      {value}%
    </span>
  );
}

function DivIcon() {
  return (
    <div style={{
      width: 34, height: 34,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--primary-glow)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--primary)',
    }}>
      <LayoutGrid size={16} />
    </div>
  );
}

function Toast({ msg, type = 'success' }) {
  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        <div className="toast-icon">{type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}</div>
        <div className="toast-body"><h4>{type === 'success' ? 'Success' : 'Error'}</h4><p>{msg}</p></div>
      </div>
    </div>
  );
}

export default function DivisionsPage() {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchDivisionsWithStats = async () => {
    try {
      setLoading(true);
      // 1. Fetch all divisions
      const divData = await apiFetch('/divisions');
      const divList = divData.data.results || divData.data.divisions || [];
      
      // 2. Fetch stats for each division (Parallel)
      const enriched = await Promise.all(divList.map(async (div) => {
        try {
          const stats = await apiFetch(`/divisions/${div._id}/stats`);
          return { ...div, ...stats.data };
        } catch {
          return { ...div, totalStudents: 0, totalSessions: 0, averageAttendance: 0 };
        }
      }));

      setDivisions(enriched);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisionsWithStats();
  }, []);

  const showToast = (msg, type = 'success') => { 
    setToast({ msg, type }); 
    setTimeout(() => setToast(null), 3000); 
  };

  const openAdd = () => {
    setForm({ name: '', description: '' });
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (div) => {
    setForm({ name: div.name, description: div.description || '' });
    setEditTarget(div._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this division? This may affect assigned users.')) return;
    try {
      await apiFetch(`/divisions/${id}`, { method: 'DELETE' });
      setDivisions(prev => prev.filter(d => d._id !== id));
      showToast('Division removed successfully.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSave = async () => {
    if (!form.name) return;
    try {
      if (editTarget) {
        await apiFetch(`/divisions/${editTarget}`, {
          method: 'PATCH',
          body: JSON.stringify(form)
        });
        showToast('Division updated successfully.');
      } else {
        await apiFetch('/divisions', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        showToast('Division added successfully.');
      }
      setShowModal(false);
      fetchDivisionsWithStats(); // Refresh stats
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="card">
        <div className="card-header">
          <h2>Division Management</h2>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} />
            Add Division
          </button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading divisions & stats...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Division</th>
                  <th>Students</th>
                  <th>Sessions</th>
                  <th>Attendance</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {divisions.map(div => (
                  <tr key={div._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <DivIcon />
                        <div>
                          <div style={{ fontWeight: 600 }}>{div.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{div.description}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{div.totalStudents}</td>
                    <td style={{ color: 'var(--info)', fontWeight: 600 }}>{div.totalSessions}</td>
                    <td><AttendanceBadge value={div.averageAttendance} /></td>
                    <td style={{ fontWeight: 600 }}>⭐ {div.averageRating || 0}</td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn action-btn-edit" onClick={() => openEdit(div)} title="Edit"><Pencil size={14} /></button>
                        <button className="action-btn action-btn-delete" onClick={() => handleDelete(div._id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editTarget ? 'Edit Division' : 'Add New Division'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Division Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Data Science"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Briefly describe this bootcamp track..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'none', padding: '10px' }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editTarget ? 'Save Changes' : 'Add Division'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
