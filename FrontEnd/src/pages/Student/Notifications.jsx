import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Clock, Calendar, AlertCircle, Award, PlayCircle } from 'lucide-react';

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
    id: 6,
    type: 'bootcamp',
    title: 'Full-Stack Web Development Bootcamp',
    message: 'Master modern web development with React, Node.js, MongoDB & more. 12-week intensive program.',
    time: '2 hours ago',
    read: false,
    bootcampId: 101,
    isNew: true
  },
  {
    id: 7,
    type: 'bootcamp',
    title: 'Advanced AI & Machine Learning',
    message: 'Deep dive into Neural Networks, NLP and Large Language Models. Join our waitlist now.',
    time: '5 hours ago',
    read: false,
    bootcampId: 102,
    isNew: false
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
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState('All');
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

  const getTypeIcon = (notification) => {
    if (notification.type === 'bootcamp') return <PlayCircle size={22} />;
    switch (notification.type) {
      case 'task': return <Clock size={20} />;
      case 'session': return <Calendar size={20} />;
      case 'feedback': return <Bell size={20} />;
      case 'schedule': return <AlertCircle size={20} />;
      case 'grade': return <Award size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getTypeColor = (notification) => {
    if (notification.type === 'bootcamp') return 'var(--primary)';
    switch (notification.type) {
      case 'task': return 'var(--primary)';
      case 'session': return 'var(--warning)';
      case 'feedback': return 'var(--info)';
      case 'schedule': return 'var(--danger)';
      case 'grade': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  const handleViewDetails = (bootcampId) => {
    navigate(`/bootcamp-detail/${bootcampId}`);
  };

  const handleEnrollNow = (bootcampId) => {
    alert(`Enrolling in bootcamp #${bootcampId}...`);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell size={28} color="var(--primary)" />
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with important announcements and opportunities</p>
          </div>
        </div>
      </div>

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
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('Unread')}
            className={`btn ${filter === 'Unread' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-secondary">
            Mark All as Read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                padding: '24px',
                position: 'relative',
                borderLeft: notification.read ? 'none' : `5px solid ${getTypeColor(notification)}`,
                background: notification.read 
                  ? 'var(--bg-card)' 
                  : notification.type === 'bootcamp' 
                    ? 'var(--primary-light)' 
                    : 'var(--bg-active)',
              }}
            >
              {notification.type === 'bootcamp' && notification.isNew && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'var(--primary)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  padding: '4px 10px',
                  borderRadius: '9999px'
                }}>
                  NEW
                </div>
              )}

              <div style={{ display: 'flex', gap: '18px' }}>
                <div style={{
                  height: '52px',
                  width: '52px',
                  borderRadius: '14px',
                  background: notification.read ? 'var(--bg-hover)' : 'var(--primary-light)',
                  color: notification.read ? 'var(--text-muted)' : getTypeColor(notification),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getTypeIcon(notification)}
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    fontWeight: notification.type === 'bootcamp' ? 700 : 600,
                    fontSize: '1.08rem',
                    marginBottom: '8px'
                  }}>
                    {notification.title}
                  </h4>

                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.55',
                    marginBottom: '12px'
                  }}>
                    {notification.message}
                  </p>

                  <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                    {notification.time}
                  </p>

                  {notification.type === 'bootcamp' && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleEnrollNow(notification.bootcampId)}
                        className="btn btn-primary"
                        style={{ padding: '10px 24px' }}
                      >
                        Enroll Now
                      </button>
                      <button
                        onClick={() => handleViewDetails(notification.bootcampId)}
                        className="btn btn-secondary"
                        style={{ padding: '10px 24px' }}
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>

                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', height: 'fit-content', alignSelf: 'flex-start' }}
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