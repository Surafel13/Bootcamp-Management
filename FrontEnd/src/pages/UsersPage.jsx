import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
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
  const [roles, setRoles] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState(null);

 const [form, setForm] = useState({
  name: '',
  email: '',
  roles: ['student'],
  primaryRole: 'student', // Add this line
  memberships: [],
  status: 'active'
});

  const fetchUsers = async () => {
    try {
      const data = await apiFetch('/users');
      console.log(data);
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
    setForm({ name: '', email: '', memberships: [], status: 'active' });
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (user) => {
  const memberships = user.memberships?.map(m => ({
    division: m.division?._id || m.division,
    role: m.role
  })) || [];

  setForm({
    name: user.name,
    email: user.email,
    memberships: memberships,
    status: user.status,
    roles: user.roles || ['student'],
    primaryRole: user.roles?.[0] || 'student' // Set this from the user data
  });
  setEditTarget(user._id);
  setShowModal(true);
};

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await apiFetch(`/users/${id}`, { method: 'DELETE' });
      if (response && Object.keys(response).length > 0) {
        setUsers(prev => prev.filter(a => a._id !== id));
        showToast('User removed successfully.');
      } else {
        setUsers(prev => prev.filter(a => a._id !== id));
        showToast('User removed successfully.');
      }
    } catch (err) {
      if (err.message.includes('unexpected end of data')) {
        setUsers(prev => prev.filter(a => a._id !== id));
        showToast('User removed successfully.');
      } else {
        showToast(err.message, 'error');
      }
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    if (form.memberships.length === 0) {
      showToast('Please add at least one membership', 'error');
      return;
    }

    try {
      if (editTarget) {
        const data = await apiFetch(`/users/${editTarget}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            memberships: form.memberships,
            status: form.status
          })
        });
        setUsers(prev => prev.map(u => u._id === editTarget ? data.data.user : u));
        showToast('User updated successfully.');
      } else {
        const data = await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            memberships: form.memberships,
            status: form.status
          })
        });
        setUsers(prev => [...prev, data.data.user]);
        showToast('User added successfully. Credentials sent to email.');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const addMembership = () => {
    setForm(f => ({
      ...f,
      memberships: [...f.memberships, { division: '', role: 'student' }]
    }));
  };

// --- PLACE IT HERE ---
  const updateMembership = (index, field, value) => {
    setForm(f => {
      const newMemberships = [...f.memberships];
      // We spread the specific membership object to ensure React 
      // notices the nested change and re-renders the dropdowns.
      newMemberships[index] = { ...newMemberships[index], [field]: value };
      return { ...f, memberships: newMemberships };
    });
  };

  const removeMembership = (index) => {
    const newMemberships = form.memberships.filter((_, i) => i !== index);
    setForm(f => ({ ...f, memberships: newMemberships }));
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
                        {user.roles?.map(r => <Badge key={r} text={r.replace('_', ' ')} colorMap={{}} />)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {user.memberships?.map((m, idx) => (
                          <Badge key={idx} text={m.division?.name || 'Unknown'} colorMap={DIV_COLOR} />
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
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit User' : 'Add New User'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form form-grid">
              <div className="form-group">
                <label>Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input className="form-input" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input className="form-input" type="email" placeholder="email@university.edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>

              {/* Primary Role */}
              <div className="form-group">
                <label>Primary Role</label>
               <select
  className="form-input"
  value={form.primaryRole} // Matches the new state key
  onChange={e => {
    const val = e.target.value;
    setForm(f => ({ 
      ...f, 
      primaryRole: val, 
      roles: [val] // Keep roles array in sync
    }));
  }}
>
  <option value="super_admin">Super Admin</option>
  <option value="division_admin">Division Admin</option>
  <option value="student">Student</option>
</select>
                <small style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4, display: 'block' }}>
                  This will be added to user's global roles
                </small>
              </div>

              {/* Memberships Section */}
              <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
                <label>Memberships</label>
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                  {form.memberships.map((membership, index) => (
                    <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <select
                        className="form-input"
                        value={membership.division}
                        onChange={e => updateMembership(index, 'division', e.target.value)}
                        style={{ flex: 2 }}
                      >
                        <option value="">Select Division</option>
                        {divisions.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                      <select
                        className="form-input"
                        value={membership.role}
                        onChange={e => updateMembership(index, 'role', e.target.value)}
                        style={{ flex: 1 }}
                      >
                        <option value="student">Student</option>
                        <option value="division_admin">Division Admin</option>
                      </select>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => removeMembership(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addMembership}
                  >
                    + Add Membership
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
                <label>Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Auto-generated password notice */}
              {!editTarget && (
                <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
                  <div
                    style={{
                      backgroundColor: 'var(--info-light)',
                      padding: 8,
                      borderRadius: 4,
                      fontSize: 14,
                      color: 'var(--info)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Info />
                    <span>Auto-generated password will be sent to registered email address.</span>
                  </div>
                </div>
              )}
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
