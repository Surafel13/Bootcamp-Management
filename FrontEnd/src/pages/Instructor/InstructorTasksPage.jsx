import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CalendarDays, Code, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import apiFetch from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function InstructorTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    deadline: '', 
    maxScore: 100, 
    allowedTypes: ['github'],
    division: user.divisions[0]?._id || user.divisions[0] || ''
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/tasks');
      setTasks(data.data.tasks);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setForm({ 
      title: '', 
      description: '', 
      deadline: '', 
      maxScore: 100, 
      allowedTypes: ['github'],
      division: user.divisions[0]?._id || user.divisions[0] || ''
    });
    setEditId(null);
    setShowModal(true);
  };

  const del = async id => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
      setTasks(p => p.filter(t => t._id !== id));
      showToast('Task deleted successfully.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.deadline) return;
    try {
      if (editId) {
        await apiFetch(`/tasks/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify(form)
        });
        showToast('Task updated successfully.');
      } else {
        await apiFetch('/tasks', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        showToast('Task created successfully.');
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      
      <div className="card-header" style={{ padding: '0 0 20px 0', borderBottom: 'none' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Task Management</h2>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Create Task
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No tasks created yet.</div>
        ) : tasks.map(t => {
          const perc = 0; // In real app, we'd fetch submission count for each task
          return (
            <div key={t._id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    {t.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CalendarDays size={13} /> Due: {new Date(t.deadline).toLocaleDateString()}
                    </div>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                    <span>Max Score: {t.maxScore}</span>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {t.allowedTypes.includes('github') && <Code size={13} />}
                      {t.allowedTypes.includes('file') && <FileText size={13} />}
                      {t.allowedTypes.join(' / ')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div className="table-actions">
                    <button className="action-btn action-btn-edit" onClick={() => {
                       setForm({
                         title: t.title,
                         description: t.description || '',
                         deadline: t.deadline.slice(0, 16),
                         maxScore: t.maxScore,
                         allowedTypes: t.allowedTypes,
                         division: t.division._id || t.division
                       });
                       setEditId(t._id);
                       setShowModal(true);
                    }} title="Edit"><Pencil size={14}/></button>
                    <button className="action-btn action-btn-delete" onClick={() => del(t._id)} title="Delete"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>

              {/* Progress bar (Visual placeholder for now) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `0%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: 34, textAlign: 'right' }}>
                  0%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Task' : 'Create New Task'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15}/></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Task Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'none' }} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Deadline</label>
                  <input className="form-input" type="datetime-local" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Max Score</label>
                  <input className="form-input" type="number" value={form.maxScore} onChange={e => setForm(f => ({ ...f, maxScore: parseInt(e.target.value) }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Submission Types</label>
                <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.allowedTypes.includes('github')} onChange={e => {
                      const types = e.target.checked ? [...form.allowedTypes, 'github'] : form.allowedTypes.filter(t => t !== 'github');
                      setForm(f => ({ ...f, allowedTypes: types }));
                    }} /> GitHub Link
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.allowedTypes.includes('file')} onChange={e => {
                      const types = e.target.checked ? [...form.allowedTypes, 'file'] : form.allowedTypes.filter(t => t !== 'file');
                      setForm(f => ({ ...f, allowedTypes: types }));
                    }} /> File Upload
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Save Changes' : 'Create Task'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toast({ msg, type = 'success' }) {
  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        <div className="toast-icon">{type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}</div>
        <div className="toast-body">
          <h4>{type === 'success' ? 'Success' : 'Error'}</h4>
          <p>{msg}</p>
        </div>
      </div>
    </div>
  );
}
