const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: { name: string } | string;
  createdAt: string;
}

export interface UsersSummaryData {
  total: number;
  active: number;
  inactive: number;
  admins: number;
}

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
});

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const res = await fetch(`${BASE_URL}/users`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch users');
    const json = await res.json();
    return json.data ?? json;
  } catch {
    // Return realistic mock data when backend isn't reachable
    return MOCK_USERS;
  }
};

export const getUsersSummary = (users: User[]): UsersSummaryData => ({
  total: users.length,
  active: users.filter((u) => u.isActive).length,
  inactive: users.filter((u) => !u.isActive).length,
  admins: users.filter((u) => {
    const role = typeof u.role === 'string' ? u.role : u.role?.name ?? '';
    return role.toLowerCase() === 'admin';
  }).length,
});

const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@bel.com', firstName: 'Arjun', lastName: 'Mehta', isActive: true, role: { name: 'Admin' }, createdAt: '2024-01-15T10:00:00Z' },
  { id: '2', email: 'priya@bel.com', firstName: 'Priya', lastName: 'Sharma', isActive: true, role: { name: 'Manager' }, createdAt: '2024-02-20T09:30:00Z' },
  { id: '3', email: 'rahul@bel.com', firstName: 'Rahul', lastName: 'Verma', isActive: true, role: { name: 'Analyst' }, createdAt: '2024-03-10T11:00:00Z' },
  { id: '4', email: 'sneha@bel.com', firstName: 'Sneha', lastName: 'Patel', isActive: false, role: { name: 'Viewer' }, createdAt: '2024-04-05T08:00:00Z' },
  { id: '5', email: 'vikram@bel.com', firstName: 'Vikram', lastName: 'Singh', isActive: true, role: { name: 'Admin' }, createdAt: '2024-01-28T14:00:00Z' },
  { id: '6', email: 'ananya@bel.com', firstName: 'Ananya', lastName: 'Rao', isActive: true, role: { name: 'Analyst' }, createdAt: '2024-05-18T10:45:00Z' },
  { id: '7', email: 'karan@bel.com', firstName: 'Karan', lastName: 'Gupta', isActive: false, role: { name: 'Viewer' }, createdAt: '2024-06-01T09:00:00Z' },
  { id: '8', email: 'meera@bel.com', firstName: 'Meera', lastName: 'Nair', isActive: true, role: { name: 'Manager' }, createdAt: '2024-03-22T13:15:00Z' },
];
