import { useState, useEffect, useCallback } from 'react';
import { initialActivities } from '../data/managerMockData';

let mockActivities = [...initialActivities];

export function useActivities() {
  const [activities, setActivities] = useState<any[]>(mockActivities);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setActivities([...mockActivities]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, error, refetch: fetchActivities };
}
