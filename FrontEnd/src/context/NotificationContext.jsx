import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiFetch from '../utils/api';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    
    try {
      const data = await apiFetch('/notifications');
      setNotifications(data.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 30000); 

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleFocus = () => {
      fetchNotifications();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchNotifications]);

  useEffect(() => {
    let lastActivity = Date.now();
    
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 60000) { 
        fetchNotifications();
      }
      lastActivity = now;
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    
    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [fetchNotifications]);

  const count = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      const data = await apiFetch('/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const refetch = () => {
    fetchNotifications(true);
  };

  const setPollingInterval = (intervalMs) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      fetchNotifications();
    }, intervalMs);
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      loading, 
      isRefreshing,
      markAsRead, 
      markAllAsRead, 
      count,
      refetch,
      setPollingInterval
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
