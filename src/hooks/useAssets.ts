import { useState, useEffect, useCallback } from 'react';
import { initialTeamAssets } from '../data/managerMockData';

let mockAssets = [...initialTeamAssets];
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

export function useAssets() {
  const [assets, setAssets] = useState<any[]>(mockAssets);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setAssets([...mockAssets]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets();
    const unsubscribe = () => setAssets([...mockAssets]);
    listeners.add(unsubscribe);
    return () => { listeners.delete(unsubscribe); };
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
}
