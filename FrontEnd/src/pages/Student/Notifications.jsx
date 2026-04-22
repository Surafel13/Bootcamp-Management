import React, { useState, } from 'react';
import { Bell, Check, Clock, Calendar, AlertCircle, Award, RefreshCcw } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function Notifications() {
  const [filter, setFilter] = useState('All');
  const { notifications, loading, count: unreadCount, refetch, markAsRead, markAllAsRead } = useNotifications();

  const filtered = notifications.filter(n => filter === 'All' || (filter === 'Unread' && !n.read));

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task': return <Clock size={20} />;
      case 'session': return <Calendar size={20} />;
      case 'feedback': return <Bell size={20} />;
      case 'schedule': return <AlertCircle size={20} />;
      case 'grade': return <Award size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'task': return 'var(--primary)';
      case 'session': return '#f0a500';
      case 'feedback': return '#0984e3';
      case 'schedule': return 'var(--danger)';
      case 'grade': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell size={28} color="var(--primary)" />
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with important announcements</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setFilter('All')} className={`btn ${filter === 'All' ? 'btn-primary' : 'btn-secondary'}`}>
            All ({notifications.length})
          </button>
          <button onClick={() => setFilter('Unread')} className={`btn ${filter === 'Unread' ? 'btn-primary' : 'btn-secondary'}`}>
            Unread ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-secondary">Mark All as Read</button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Loading notifications...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '80px 20px' }}>
              <Bell size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
              <h3>No notifications</h3>
              <p style={{ color: 'var(--text-secondary)' }}>You're all caught up!</p>
            </div>
          ) : filtered.map(n => (
            <div key={n._id} className="card" style={{
              padding: '24px', position: 'relative',
              borderLeft: n.read ? 'none' : `5px solid ${getTypeColor(n.type)}`,
              background: n.read ? 'var(--bg-card)' : 'var(--bg-active)',
            }}>
              <div style={{ display: 'flex', gap: '18px' }}>
                <div style={{
                  height: '52px', width: '52px', borderRadius: '14px',
                  background: n.read ? 'var(--bg-hover)' : 'var(--primary-light)',
                  color: n.read ? 'var(--text-muted)' : getTypeColor(n.type),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {getTypeIcon(n.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '8px' }}>{n.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: '8px' }}>{n.message}</p>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markAsRead(n._id)} className="btn btn-secondary"
                    style={{ padding: '8px 12px', height: 'fit-content', alignSelf: 'flex-start' }} title="Mark as read">
                    <Check size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
