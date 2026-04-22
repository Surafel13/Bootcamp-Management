import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, X, CheckCircle, Loader } from 'lucide-react';
import apiFetch from '../../utils/api';

const ROLES = ['Super Admin', 'Division Admin', 'Instructor', 'Student'];
const STATUSES = ['Active', 'Suspended', 'Graduated'];

const DIV_COLOR = {
  'Development':   { bg: 'rgba(162,155,254,0.15)', color: '#7c6ef9' },
  'Cybersecurity': { bg: 'var(--primary-glow)',  color: 'var(--primary)' },
  'Data Science':  { bg: 'rgba(0,184,148,0.12)',   color: '#00b894' },
  'CPD':           { bg: 'rgba(0,206,201,0.12)',   color: '#00cec9' },
  'All':           { bg: 'var(--bg-input)', color: 'var(--text-primary)'}
};

const STATUS_COLOR = {
  'Active':    { bg: 'var(--success-light)', color: 'var(--success)' },
  'Suspended': { bg: 'var(--danger-light)', color: 'var(--danger)' },
  'Graduated': { bg: 'var(--info-light)', color: 'var(--info)' },
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
    }}>
      {text}
    </span>
  );
}

function Toast({ msg }) {
  return (
    <div className="toast-container">
      <div className="toast success">
        <div className="toast-icon"><CheckCircle size={16} /></div>
        <div className="toast-body">
          <h4>Success</h4>
          <p>{msg}</p>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers]         = useState(INITIAL_USERS);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast]         = useState(null);

  const [form, setForm] = useState({ name: '', email: '', role: 'Student', division: 'Data Science', status: 'Active' });

  const filtered = useMemo(() =>
    users.filter(u =>
      (roleFilter === 'All' || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
       u.email.toLowerCase().includes(search.toLowerCase()) ||
       u.division.toLowerCase().includes(search.toLowerCase()))
    ), [users, search, roleFilter]);

  const initials = (name) => name.split(' ').filter(Boolean).slice(0, 3).map(w => w[0].toUpperCase()).join('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const openAdd = () => {
    setForm({ name: '', email: '', role: 'Student', division: 'Data Science', status: 'Active' });
    setEditTarget(null);
    const mappedUsers = uRes.data.users.map(u => {
      const uName = u.name || 'Unknown User';
      return {
        id: u._id,
        name: uName,
        initials: uName.split(' ').filter(Boolean).slice(0, 3).map(w => w[0]?.toUpperCase()).join('') || '?',
        email: u.email || 'No Email',
        role: u.roles && u.roles.length > 0 ? formatRole(u.roles[0]) : 'Student',
        division: u.divisions && u.divisions.length > 0 && u.divisions[0] && u.divisions[0].name ? u.divisions[0].name : 'All',
        status: u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : 'Active',
        rawUser: u
      };
    });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, role: user.role, division: user.division, status: user.status });
    setEditTarget(user.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setUsers(prev => prev.filter(a => a.id !== id));
    showToast('User removed successfully.');
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editTarget) {
      setUsers(prev => prev.map(a => a.id === editTarget ? { ...a, ...form, initials: initials(form.name) } : a));
      showToast('User updated successfully.');
    } else {
      setUsers(prev => [...prev, { id: Date.now(), ...form, initials: initials(form.name) }]);
      showToast('User added successfully.');
    }
    setShowModal(false);
  };

  return (
    <div>
      {toast && <Toast msg={toast} />}

      <div className="card">
        <div className="card-header">
          <h2>User Management</h2>
          <div className="card-header-actions">
            <select className="form-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '8px 12px' }}>
              <option value="All">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
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
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Division</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No users found.</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="table-user">
                      <div className="table-avatar">{user.initials}</div>
                      <div>
                        <div className="table-user-name">{user.name}</div>
                        <div className="table-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{user.role}</td>
                  <td><Badge text={user.division} colorMap={DIV_COLOR} /></td>
                  <td><Badge text={user.status} colorMap={STATUS_COLOR} /></td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn action-btn-edit" onClick={() => openEdit(user)} title="Edit"><Pencil size={14} /></button>
                      <button className="action-btn action-btn-delete" onClick={() => handleDelete(user.id)} title="Delete"><Trash2 size={14} /></button>
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
              <div className="form-group">
                <label>Role</label>
                <select className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Division</label>
                <select className="form-input" value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))}>
                  {DIVISIONS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
                <label>Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
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
