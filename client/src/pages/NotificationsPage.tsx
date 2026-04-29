import { Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1, type: 'primary', unread: true,
    title: 'New task submission',
    body: 'Dr. Sarah Mitchell submitted 12 new assignments in Development division.',
    time: '2 min ago',
    icon: Bell,
  },
  {
    id: 2, type: 'success', unread: true,
    title: 'Session completed',
    body: 'React Advanced Patterns session has been marked complete with 92% attendance.',
    time: '1 hour ago',
    icon: CheckCircle,
  },
  {
    id: 3, type: 'warning', unread: true,
    title: 'Weekly progress missing',
    body: 'Group "Innovators" in Data Science has not submitted their weekly progress.',
    time: '3 hours ago',
    icon: AlertTriangle,
  },
  {
    id: 4, type: 'primary', unread: false,
    title: 'New admin account created',
    body: 'Prof. James Chen has been added as Cybersecurity division admin.',
    time: 'Yesterday',
    icon: Info,
  },
  {
    id: 5, type: 'success', unread: false,
    title: 'System backup completed',
    body: 'Scheduled backup completed successfully at 03:00 AM.',
    time: 'Yesterday',
    icon: CheckCircle,
  },
];

export default function NotificationsPage() {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Notifications</h2>
          <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
            Mark all as read
          </button>
        </div>

        <div className="notif-list">
          {/* {NOTIFICATIONS.map(({ id, type, unread, title, body, time, icon: Icon }) => (
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
          ))} */}
        </div>
      </div>
    </div>
  );
}
