import { User, Mail, Phone, Calendar, MapPin, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: 'Admin',
    lastName: 'Root',
    email: user?.email || 'admin@bootcamp.edu',
    phone: '+1 (555) 000-0000',
    location: 'New York, USA',
    joined: 'January 2024',
  });

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="profile-grid">
      {/* Left card */}
      <div className="profile-card">
        <div className="profile-avatar-lg">AR</div>
        <h2>Admin Root</h2>
        <p>System Administrator</p>
        <span className="profile-badge">Super Admin</span>

        <div className="profile-meta">
          <div className="profile-meta-item">
            <Mail size={15} />
            <span>{form.email}</span>
          </div>
          <div className="profile-meta-item">
            <Phone size={15} />
            <span>{form.phone}</span>
          </div>
          <div className="profile-meta-item">
            <MapPin size={15} />
            <span>{form.location}</span>
          </div>
          <div className="profile-meta-item">
            <Calendar size={15} />
            <span>Joined {form.joined}</span>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="profile-form-card">
          <h3>Personal Information</h3>
          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label>First Name</label>
              <input className="form-input" value={form.firstName}
                onChange={e => handleChange('firstName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input className="form-input" value={form.lastName}
                onChange={e => handleChange('lastName', e.target.value)} />
            </div>
          </div>
          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label>Email Address</label>
              <input className="form-input" type="email" value={form.email}
                onChange={e => handleChange('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input className="form-input" value={form.phone}
                onChange={e => handleChange('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input className="form-input" value={form.location}
              onChange={e => handleChange('location', e.target.value)} />
          </div>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" id="save-profile-btn">
              <Save size={15} />
              Save Changes
            </button>
          </div>
        </div>

        <div className="profile-form-card">
          <h3>Change Password</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Current Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>New Password</label>
                <input className="form-input" type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input className="form-input" type="password" placeholder="••••••••" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" id="change-password-btn">
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
