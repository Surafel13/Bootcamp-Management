import { useState } from 'react';
import { LayoutGrid, Pencil, Trash2, Plus, X, CheckCircle } from 'lucide-react';

const INITIAL_DIVISIONS = [
  { id: 1, name: 'Development',   students: 156, sessions: 24, attendance: 87, status: 'Active' },
  { id: 2, name: 'Cybersecurity', students: 142, sessions: 20, attendance: 84, status: 'Active' },
  { id: 3, name: 'Data Science',  students: 138, sessions: 22, attendance: 91, status: 'Active' },
  { id: 4, name: 'CPD',           students: 124, sessions: 18, attendance: 79, status: 'Active' },
];

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
  const [divisions, setDivisions]   = useState(INITIAL_DIVISIONS);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast]           = useState(null);
  const [form, setForm]             = useState({ name: '', students: 0, sessions: 0, attendance: 80 });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const openAdd = () => {
    setForm({ name: '', students: 0, sessions: 0, attendance: 80 });
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (div) => {
    setForm({ name: div.name, students: div.students, sessions: div.sessions, attendance: div.attendance });
    setEditTarget(div.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDivisions(prev => prev.filter(d => d.id !== id));
    showToast('Division removed successfully.');
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editTarget) {
      setDivisions(prev => prev.map(d => d.id === editTarget ? { ...d, ...form } : d));
      showToast('Division updated successfully.');
    } else {
      setDivisions(prev => [...prev, { id: Date.now(), ...form, status: 'Active' }]);
      showToast('Division added successfully.');
    }
    setShowModal(false);
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
              <div className="form-grid">
                <div className="form-group">
                  <label>Total Students</label>
                  <input
                    id="div-students-input"
                    className="form-input"
                    type="number"
                    min={0}
                    value={form.students}
                    onChange={e => setForm(f => ({ ...f, students: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="form-group">
                  <label>Total Sessions</label>
                  <input
                    id="div-sessions-input"
                    className="form-input"
                    type="number"
                    min={0}
                    value={form.sessions}
                    onChange={e => setForm(f => ({ ...f, sessions: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Avg Attendance (%)</label>
                <input
                  id="div-attendance-input"
                  className="form-input"
                  type="number"
                  min={0} max={100}
                  value={form.attendance}
                  onChange={e => setForm(f => ({ ...f, attendance: parseInt(e.target.value) || 0 }))}
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
