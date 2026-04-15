import React, { useState } from 'react';
import { Bell, Check, Clock, Calendar, AlertCircle, Award, X } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Task Assigned',
    message: 'Algorithm Optimization task has been assigned. Due on Apr 18, 2026.',
    time: '2 hours ago',
    read: false,
    type: 'task'
  },
  {
    id: 2,
    title: 'Session Reminder',
    message: 'Cybersecurity Fundamentals session starts tomorrow at 3:00 PM in Virtual Room B.',
    time: '5 hours ago',
    read: false,
    type: 'session'
  },
  {
    id: 3,
    title: 'Feedback Request',
    message: 'Please rate the "Advanced React Patterns" session you attended last week.',
    time: 'Yesterday',
    read: true,
    type: 'feedback'
  },
  {
    id: 4,
    title: 'Schedule Update',
    message: 'Data Analysis with Python session has been moved to April 16 at 1:00 PM.',
    time: '2 days ago',
    read: true,
    type: 'schedule'
  },
  {
    id: 5,
    title: 'Assignment Graded',
    message: 'Your submission for "Web Development Workshop" has been graded. View your score.',
    time: '3 days ago',
    read: true,
    type: 'grade'
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState('All'); // All, Unread

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications
    .filter(n => filter === 'All' || (filter === 'Unread' && !n.read));

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

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
      case 'session': return 'var(--warning)';
      case 'feedback': return 'var(--info)';
      case 'schedule': return 'var(--danger)';
      case 'grade': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell size={28} color="var(--primary)" />
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with important announcements and reminders</p>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilter('All')}
            className={`btn ${filter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '10px 20px' }}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('Unread')}
            className={`btn ${filter === 'Unread' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '10px 20px' }}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="btn btn-secondary"
            style={{ padding: '10px 20px' }}
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredNotifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Bell size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3>No notifications found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="card"
              style={{
                padding: '20px',
                borderLeft: notification.read ? 'none' : `4px solid ${getTypeColor(notification.type)}`,
                background: notification.read ? 'var(--bg-card)' : 'var(--bg-active)',
                transition: 'var(--transition)',
              }}
            >
              <div style={{ display: 'flex', gap: '16px' }}>
                {/* Icon */}
                <div style={{
                  height: '48px',
                  width: '48px',
                  borderRadius: '12px',
                  background: notification.read ? 'var(--bg-hover)' : 'var(--primary-light)',
                  color: notification.read ? 'var(--text-muted)' : getTypeColor(notification.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getTypeIcon(notification.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ 
                      fontWeight: 600, 
                      fontSize: '1.02rem',
                      color: 'var(--text-primary)',
                      marginBottom: '6px'
                    }}>
                      {notification.title}
                    </h4>
                    
                    {!notification.read && (
                      <div 
                        style={{ 
                          width: '9px', 
                          height: '9px', 
                          background: 'var(--primary)', 
                          borderRadius: '50%',
                          marginTop: '6px'
                        }} 
                      />
                    )}
                  </div>

                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.5',
                    marginBottom: '10px'
                  }}>
                    {notification.message}
                  </p>

                  <p style={{ 
                    fontSize: '0.82rem', 
                    color: 'var(--text-muted)' 
                  }}>
                    {notification.time}
                  </p>
                </div>

                {/* Mark as Read Button */}
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="btn btn-secondary"
                    style={{ 
                      padding: '8px 12px', 
                      alignSelf: 'flex-start',
                      height: 'fit-content'
                    }}
                    title="Mark as read"
                  >
                    <Check size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
