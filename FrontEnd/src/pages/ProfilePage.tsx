import React from 'react';
import { Mail, Phone, MapPin, Calendar, User, Shield, Briefcase, Pencil, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiFetch from '../utils/api';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [showEdit, setShowEdit] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', password: '', confirmPassword: '' });
  const [updating, setUpdating] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    if (user) setForm(f => ({ ...f, name: user.name }));
  }, [user]);

  if (!user) return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdate = async () => {
    if (!form.name) return;
    if (form.password && form.password !== form.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      setUpdating(true);
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;

      await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      showToast('Profile updated successfully!');
      setShowEdit(false);
      // Reload or update context if needed, but since we're using useAuth, 
      // the user might need a refresh or we just manually update the local display if possible.
      // For now, a simple reload is safest or just assume success.
      window.location.reload(); 
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const initials = user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const primaryRole = user.roles?.[0]?.replace('_', ' ') || 'Student';
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

  // Get unique division names from memberships
  const userDivisions = user.memberships?.map(m => m.division?.name || 'Unknown') || [];

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
      <div className="card" style={{ maxWidth: '680px', width: '100%' }}>
        
        {/* Profile Header */}
        <div style={{ 
          padding: '40px 40px 30px', 
          textAlign: 'center',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '2.8rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow-primary)'
          }}>
            {initials}
          </div>

          <h1 style={{ 
            fontSize: '1.85rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            marginBottom: '6px'
          }}>
            {user.name}
          </h1>
          
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.05rem',
            marginBottom: '12px',
            textTransform: 'capitalize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            {user.roles.includes('super_admin') && <><Shield size={16} color="var(--danger)" /> {primaryRole}</> }
            {user.roles.includes('division_admin') && <><Shield size={16} color="var(--info)" /> {primaryRole}</> }
            {user.roles.includes('student') && <><User size={16} color="var(--primary)" /> {primaryRole}</> }
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {userDivisions.map((divisionName, idx) => (
              <span key={idx} style={{
                background: 'var(--primary-glow)',
                color: 'var(--primary)',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {divisionName}
              </span>
            ))}
          </div>

          {(user.roles.includes('super_admin') || user.roles.includes('division_admin')) && (
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowEdit(true)}
              style={{ marginTop: '20px', gap: 8 }}
            >
              <Pencil size={14} /> Edit Profile
            </button>
          )}
        </div>

        {/* Profile Details */}
        <div style={{ padding: '32px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <ProfileIcon icon={Mail} />
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2px' }}>Email Address</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <ProfileIcon icon={Briefcase} />
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2px' }}>Account Status</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{user.status || 'Active'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <ProfileIcon icon={MapPin} />
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2px' }}>Organization</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Bootcamp Management System</p>
              </div>
            </div>

            {!user.roles.includes('super_admin') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <ProfileIcon icon={Calendar} />
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2px' }}>Member Since</p>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Joined {joinDate}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ 
          padding: '20px 40px', 
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-input)',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          This profile information is retrieved from your official BMS account.
        </div>
      </div>

      {showEdit && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={() => setShowEdit(false)}><X size={16} /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  className="form-input" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                />
              </div>
              <div style={{ padding: '15px', background: 'var(--bg-input)', borderRadius: '10px', marginTop: '10px' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', color: 'var(--primary)' }}>Change Password</p>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Leave blank to keep current" 
                    value={form.password} 
                    onChange={e => setForm({...form, password: e.target.value})} 
                  />
                </div>
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Confirm new password" 
                    value={form.confirmPassword} 
                    onChange={e => setForm({...form, confirmPassword: e.target.value})} 
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
                {updating ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileIcon({ icon: Icon }) {
  return (
    <div style={{ 
      width: '48px', 
      height: '48px', 
      borderRadius: '12px',
      background: 'rgba(2, 89, 97, 0.08)',
      color: 'var(--primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={22} />
    </div>
  );
}
