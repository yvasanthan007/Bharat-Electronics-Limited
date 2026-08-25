import { useState, useEffect, useCallback } from 'react';
import { initialTeamAssets } from '../data/managerMockData';

let mockAssets = [...initialTeamAssets];

export function useAssets() {
  const [assets, setAssets] = useState<any[]>(mockAssets);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setAssets([...mockAssets]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
}
