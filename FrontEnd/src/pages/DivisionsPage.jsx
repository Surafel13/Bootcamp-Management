import { useState, useEffect } from 'react';
import { LayoutGrid, Pencil, Trash2, Plus, X, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

function AttendanceBadge({ value }) {
  const color = value >= 90 ? 'var(--success)' : value >= 80 ? '#0984e3' : '#fdcb6e';
  const bg    = value >= 90 ? 'rgba(0,184,148,0.12)' : value >= 80 ? 'rgba(9,132,227,0.1)' : 'rgba(253,203,110,0.15)';
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 'var(--radius-full)',
      fontSize: '0.75rem', fontWeight: 700, background: bg, color
    }}>
      {value.toFixed(1)}%
    </span>
  );
}

function DivIcon({ name }) {
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

function Toast({ msg }) {
  return (
    <div className="toast-container">
      <div className="toast success">
        <div className="toast-icon"><CheckCircle size={16} /></div>
        <div className="toast-body"><h4>Success</h4><p>{msg}</p></div>
      </div>
    </div>
  );
}

export default function DivisionsPage() {
  const [divisions, setDivisions]   = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast]           = useState(null);
  const [form, setForm]             = useState({ name: '', description: '' });
  const [loading, setLoading]       = useState(true);

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/divisions');
      if (res.status === 'success') {
        // Fetch stats for each division independently, since backend gives basic list here
        // or we use the basic list then fetch stats based on the backend model.
        // The backend GET /api/divisions doesn't return full stats, but GET /api/divisions/:id/stats does.
        // Let's assume we map the simple info for now until stats are added to the list route.
        const mapped = await Promise.all(res.data.divisions.map(async (d) => {
          try {
            const statRes = await api.get(`/divisions/${d._id}/stats`);
            const stats = statRes.data.stats;
            return {
              id: d._id,
              name: d.name,
              description: d.description,
              students: stats.totalStudents,
              sessions: stats.totalSessions,
              attendance: stats.averageAttendance,
            };
          } catch(e) {
             return { id: d._id, name: d.name, description: d.description, students: 0, sessions: 0, attendance: 0 };
          }
        }));
        setDivisions(mapped);
      }
    } catch(err) {
      console.error(err);
      showToast('Error fetching divisions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const openAdd = () => {
    setForm({ name: '', description: '' });
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (div) => {
    setForm({ name: div.name, description: div.description });
    setEditTarget(div.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this division?')) return;
    try {
      await api.delete(`/divisions/${id}`);
      setDivisions(prev => prev.filter(d => d.id !== id));
      showToast('Division removed successfully.');
    } catch(err) {
      showToast('Failed to delete division.');
    }
  };

  const handleSave = async () => {
    if (!form.name) return;
    try {
      if (editTarget) {
        await api.patch(`/divisions/${editTarget}`, { name: form.name, description: form.description });
        showToast('Division updated successfully.');
      } else {
        await api.post('/divisions', { name: form.name, description: form.description });
        showToast('Division added successfully.');
      }
      setShowModal(false);
      fetchDivisions();
    } catch(err) {
       showToast(err.data?.message || 'Error saving division');
    }
  };

  return (
    <div>
      {toast && <Toast msg={toast} />}

      <div className="card">
        <div className="card-header">
          <h2>Division Management</h2>
          <button className="btn btn-primary" id="add-division-btn" onClick={openAdd}>
            <Plus size={16} />
            Add Division
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Division</th>
                <th>Students</th>
                <th>Sessions</th>
                <th>Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {divisions.map(div => (
                <tr key={div.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <DivIcon name={div.name} />
                      <span style={{ fontWeight: 600 }}>{div.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{div.students}</td>
                  <td style={{ color: 'var(--info)', fontWeight: 600 }}>{div.sessions}</td>
                  <td><AttendanceBadge value={div.attendance} /></td>
                  <td>
                    <div className="table-actions">
                      <button
                        id={`edit-div-${div.id}`}
                        className="action-btn action-btn-edit"
                        onClick={() => openEdit(div)}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        id={`delete-div-${div.id}`}
                        className="action-btn action-btn-delete"
                        onClick={() => handleDelete(div.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
                  id="div-name-input"
                  className="form-input"
                  placeholder="e.g. Data Science"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  id="div-description-input"
                  className="form-input"
                  placeholder="Division details..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" id="save-div-btn" onClick={handleSave}>
                {editTarget ? 'Save Changes' : 'Add Division'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
