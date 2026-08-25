import type { User } from '../../services/users';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border border-purple-200',
  manager: 'bg-blue-100 text-blue-700 border border-blue-200',
  analyst: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  viewer: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const getRoleName = (role: User['role']) =>
  (typeof role === 'string' ? role : role?.name ?? 'User');

const getInitials = (u: User) =>
  `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

interface UsersTableProps {
  users: User[];
  search: string;
}

export default function UsersTable({ users, search }: UsersTableProps) {
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const role = getRoleName(u.role).toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      role.includes(q)
    );
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 11a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">No users match your search</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">User</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Role</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Joined</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filtered.map((user) => {
            const roleName = getRoleName(user.role);
            const roleKey = roleName.toLowerCase();
            const roleClass = ROLE_COLORS[roleKey] ?? ROLE_COLORS.viewer;
            return (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {getInitials(user)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-400 font-mono">ID: {user.id.slice(0, 8)}…</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleClass}`}>
                    {roleName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.isActive ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
