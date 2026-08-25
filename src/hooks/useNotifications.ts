import { useState, useEffect, useCallback } from 'react';
import { initialNotifications } from '../data/managerMockData';

let mockNotifications = [...initialNotifications];
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>(mockNotifications);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setNotifications([...mockNotifications]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const unsubscribe = () => setNotifications([...mockNotifications]);
    listeners.add(unsubscribe);
    return () => {
      listeners.delete(unsubscribe);
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    mockNotifications = mockNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    notify();
    return { success: true };
  };

  return { notifications, loading, error, markAsRead, refetch: fetchNotifications };
}
