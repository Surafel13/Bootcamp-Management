import React, { useState, useEffect } from 'react';
import { Users, User, Shield } from 'lucide-react';
import apiFetch from '../../utils/api';

export default function StudentGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await apiFetch('/groups');
        setGroups(response.data.groups || []);
      } catch (err) {
        console.error('Failed to load groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Division Groups</h1>
        <p>Connect with your teammates and explore other project groups</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No groups have been registered for your division yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {groups.map((group) => (
            <div key={group._id} className="card" style={{ padding: '24px', transition: 'transform 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '10px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}>
                  <Users size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{group.name}</h3>
              </div>

              {group.leader && (
                <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--bg-input)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={16} color="var(--primary)" />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Team Leader</p>
                    <p style={{ fontWeight: 600 }}>{group.leader}</p>
                  </div>
                </div>
              )}

              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 700 }}>Members</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {group.memberNames && group.memberNames.length > 0 ? (
                  group.memberNames.map((name, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', opacity: 0.6 }} />
                      <span style={{ fontSize: '0.95rem' }}>{name}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No members listed</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
