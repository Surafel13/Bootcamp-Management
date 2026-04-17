import React from 'react';
import { Mail, Phone, MapPin, Calendar, User } from 'lucide-react';

export default function ProfilePage() {
  // Mock student data (in real app, this would come from useAuth or context)
  const student = {
    fullName: "Abebe Tadesse",
    email: "abebe.tadesse@bootcamp.edu",
    phone: "+251 911 234 567",
    location: "Addis Ababa, Ethiopia",
    department: "Software Engineering",
    joined: "March 2025",
    avatarInitials: "AT",
    role: "Student"
  };

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
            {student.avatarInitials}
          </div>

          <h1 style={{ 
            fontSize: '1.85rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            marginBottom: '6px'
          }}>
            {student.fullName}
          </h1>
          
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.05rem',
            marginBottom: '8px'
          }}>
            {student.role}
          </p>

          <span style={{
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            padding: '6px 18px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            {student.department}
          </span>
        </div>

        {/* Profile Details */}
        <div style={{ padding: '32px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Mail size={22} />
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2px' }}>Email Address</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{student.email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Phone size={22} />
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2px' }}>Phone Number</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{student.phone}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MapPin size={22} />
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2px' }}>Location</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{student.location}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Calendar size={22} />
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2px' }}>Member Since</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Joined {student.joined}</p>
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
          This information is managed by the administration. Contact support for any updates.
        </div>
      </div>
    </div>
  );
}