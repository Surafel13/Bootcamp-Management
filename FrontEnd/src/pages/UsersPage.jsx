import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import apiFetch from '../utils/api';

const ROLES = ['super_admin', 'division_admin', 'student'];
const STATUSES = ['active', 'suspended', 'graduated'];

const DIV_COLOR = {
  'Development': { bg: 'rgba(162,155,254,0.15)', color: '#7c6ef9' },
  'Cybersecurity': { bg: 'var(--primary-glow)', color: 'var(--primary)' },
  'Data Science': { bg: 'rgba(0,184,148,0.12)', color: '#00b894' },
  'CPD': { bg: 'rgba(0,206,201,0.12)', color: '#00cec9' },
  'All': { bg: 'var(--bg-input)', color: 'var(--text-primary)' }
};

const STATUS_COLOR = {
  'active': { bg: 'var(--success-light)', color: 'var(--success)' },
  'suspended': { bg: 'var(--danger-light)', color: 'var(--danger)' },
  'graduated': { bg: 'var(--info-light)', color: 'var(--info)' },
}

function Badge({ text, colorMap }) {
  const style = colorMap[text] || { bg: 'var(--primary-glow)', color: 'var(--primary)' };
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: style.bg,
      color: style.color,
      textTransform: 'capitalize'
    }}>
      {text}
    </span>
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', roles: ['student'], divisions: [], status: 'active' });

  const fetchUsers = async () => {
    try {
      const data = await apiFetch('/users');
      setUsers(data.data.users);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const data = await apiFetch('/divisions');
      setDivisions(data.data.results || data.data.divisions || []);
    } catch (err) {
      console.error('Failed to fetch divisions:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDivisions();
  }, []);

  const filtered = useMemo(() =>
    users.filter(u =>
      (roleFilter === 'All' || u.roles.includes(roleFilter)) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
    ), [users, search, roleFilter]);

  const initials = (name) => name.split(' ').filter(Boolean).slice(0, 3).map(w => w[0].toUpperCase()).join('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openAdd = () => {
    setForm({ name: '', email: '', password: '', roles: ['student'], divisions: [], status: 'active' });
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setForm({ 
      name: user.name, 
      email: user.email, 
      roles: user.roles, 
      divisions: user.divisions.map(d => d._id || d), 
      status: user.status 
    });
    setEditTarget(user._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(a => a._id !== id));
      showToast('User removed successfully.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    
    try {
      if (editTarget) {
        const data = await apiFetch(`/users/${editTarget}`, {
          method: 'PATCH',
          body: JSON.stringify(form)
        });
        setUsers(prev => prev.map(u => u._id === editTarget ? data.data.user : u));
        showToast('User updated successfully.');
      } else {
        const data = await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        setUsers(prev => [...prev, data.data.user]);
        showToast('User added successfully.');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="card">
        <div className="card-header">
          <h2>User Management</h2>
          <div className="card-header-actions">
            <select className="form-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '8px 12px' }}>
              <option value="All">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
            <div className="search-box">
              <Search size={15} />
              <input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Roles</th>
                  <th>Divisions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No users found.</td></tr>
                ) : filtered.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar">{initials(user.name)}</div>
                        <div>
                          <div className="table-user-name">{user.name}</div>
                          <div className="table-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {user.roles.map(r => <Badge key={r} text={r.replace('_', ' ')} colorMap={{}} />)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {user.divisions.map(d => (
                          <Badge key={d._id || d} text={d.name || 'Unknown'} colorMap={DIV_COLOR} />
                        ))}
                      </div>
                    </td>
                    <td><Badge text={user.status} colorMap={STATUS_COLOR} /></td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn action-btn-edit" onClick={() => openEdit(user)} title="Edit"><Pencil size={14} /></button>
                        <button className="action-btn action-btn-delete" onClick={() => handleDelete(user._id)} title="Delete"><Trash2 size={14} /></button>
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
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit User' : 'Add New User'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-input" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input className="form-input" type="email" placeholder="email@university.edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              {!editTarget && (
                <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
                  <label>Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              )}
              <div className="form-group">
                <label>Primary Role</label>
                <select className="form-input" value={form.roles[0]} onChange={e => setForm(f => ({ ...f, roles: [e.target.value] }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Division</label>
                <select className="form-input" value={form.divisions[0] || ''} onChange={e => setForm(f => ({ ...f, divisions: [e.target.value] }))}>
                  <option value="">Select Division</option>
                  {divisions.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
                <label>Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editTarget ? 'Save Changes' : 'Add User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
