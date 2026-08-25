import { useState, useEffect, useCallback } from 'react';
import { initialTeamMembers } from '../data/managerMockData';

let mockTeam = [...initialTeamMembers];
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

export function useTeam() {
  const [teamMembers, setTeamMembers] = useState<any[]>(mockTeam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setTeamMembers([...mockTeam]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTeam();
    const unsubscribe = () => setTeamMembers([...mockTeam]);
    listeners.add(unsubscribe);
    return () => { listeners.delete(unsubscribe); };
  }, [fetchTeam]);

  return { teamMembers, loading, error, refetch: fetchTeam };
}
