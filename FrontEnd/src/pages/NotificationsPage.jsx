import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, MessageSquare, ClipboardList, BookOpen } from 'lucide-react';
import { api } from '../services/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.status === 'success') {
        const mapped = res.data.notifications.map(n => {
          let Icon = Bell;
          if (n.type === 'submission') Icon = ClipboardList;
          else if (n.type === 'feedback') Icon = MessageSquare;
          else if (n.type === 'progress') Icon = CheckCircle;

          return {
            id: n._id,
            type: n.type === 'progress' ? 'success' : n.type === 'alert' ? 'warning' : 'primary',
            unread: !n.isRead,
            title: n.title,
            body: n.message,
            time: new Date(n.createdAt).toLocaleDateString(),
            icon: Icon
          };
        });
        setNotifications(mapped);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({...n, unread: false})));
    } catch(err) {
      console.error('Failed to mark all as read');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Notifications</h2>
          <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '7px 14px' }} onClick={markAllRead}>
            Mark all as read
          </button>
        </div>

        <div className="notif-list">
          {notifications.map(({ id, type, unread, title, body, time, icon: Icon }) => (
            <div key={id} className={`notif-item ${unread ? 'unread' : ''}`}>
              <div className={`notif-icon ${type}`}>
                <Icon size={17} />
              </div>
              <div className="notif-body">
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
              <div className="notif-time">{time}</div>
            </div>
          ))}
          {notifications.length === 0 && !loading && (
             <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No notifications</div>
          )}
        </div>
      </div>
    </div>
  );
}
