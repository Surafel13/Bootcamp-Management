import { createContext, useContext, useState, useEffect } from 'react';
import apiFetch from '../utils/api';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiFetch('/notifications');
        setNotifications(data.data.notifications || []);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const count = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  return (
    <NotificationContext.Provider value={{ notifications, loading, markAsRead, markAllAsRead, count }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);   
