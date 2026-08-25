import { useState, useEffect, useCallback } from 'react';
import { initialTeamMembers } from '../data/managerMockData';

let mockTeam = [...initialTeamMembers];

export function useTeam() {
  const [teamMembers, setTeamMembers] = useState<any[]>(mockTeam);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setTeamMembers([...mockTeam]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return { teamMembers, loading, error, refetch: fetchTeam };
}
