import { useState, useEffect, useCallback } from 'react';
import { initialActivities } from '../data/managerMockData';

let mockActivities = [...initialActivities];
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

export function useActivities() {
  const [activities, setActivities] = useState<any[]>(mockActivities);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setActivities([...mockActivities]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActivities();
    const unsubscribe = () => setActivities([...mockActivities]);
    listeners.add(unsubscribe);
    return () => { listeners.delete(unsubscribe); };
  }, [fetchActivities]);

  return { activities, loading, error, refetch: fetchActivities };
}
