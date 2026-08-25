import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('mock_user');
      if (storedUser) {
        setUser({ id: '1', email: 'belmanager@gmail.com' });
        setProfile({ full_name: 'Manager', avatar_url: 'MN' });
        setRole('Manager');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = async (email: string) => {
    localStorage.setItem('mock_user', email);
    setUser({ id: '1', email });
    setProfile({ full_name: 'Manager', avatar_url: 'MN' });
    setRole('Manager');
  };

  const signOut = async () => {
    localStorage.removeItem('mock_user');
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  return { user, profile, role, loading, signIn, signOut };
}
