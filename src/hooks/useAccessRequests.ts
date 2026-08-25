import { useState, useEffect, useCallback } from 'react';
import { initialAccessRequests } from '../data/managerMockData';

let mockRequests = [...initialAccessRequests];
const listeners = new Set<() => void>();
const _notify = () => listeners.forEach(l => l());

export function useAccessRequests() {
  const [requests, setRequests] = useState<any[]>(mockRequests);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setRequests([...mockRequests]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
    const unsubscribe = () => setRequests([...mockRequests]);
    listeners.add(unsubscribe);
    return () => { listeners.delete(unsubscribe); };
  }, [fetchRequests]);

  const updateRequestStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    mockRequests = mockRequests.map(r => r.id === id ? { ...r, status } : r);
    _notify();
    return { success: true };
  };

  return { requests, loading, error, updateRequestStatus, refetch: fetchRequests };
}
