import React from 'react';
import { Mail, Phone, MapPin, Calendar, User, Shield, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>;

  const initials = user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const primaryRole = user.roles[0].replace('_', ' ');
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="page-content" style={{ display: 'flex', justifyContent: 'center' }}>
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
            <Shield size={16} color="var(--primary)" /> {primaryRole}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {user.divisions.map(d => (
              <span key={d._id || d} style={{
                background: 'var(--primary-glow)',
                color: 'var(--primary)',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {d.name || 'Assigned Division'}
              </span>
            ))}
          </div>
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
                <p style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{user.status}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <ProfileIcon icon={MapPin} />
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2px' }}>Organization</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Bootcamp Management System</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <ProfileIcon icon={Calendar} />
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2px' }}>Member Since</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Joined {joinDate}</p>
              </div>
            </div>
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