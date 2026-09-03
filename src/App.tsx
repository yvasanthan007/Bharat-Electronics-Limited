import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UserSidebar from './components/user/UserSidebar';
import UserHeader from './components/user/UserHeader';
import ManagerSidebar from './components/manager/ManagerSidebar';
import ManagerHeader from './components/manager/ManagerHeader';
import AuditorSidebar from './components/auditor/AuditorSidebar';
import AuditorHeader from './components/auditor/AuditorHeader';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import DigitalAssets from './pages/DigitalAssets';
import Transactions from './pages/Transactions';
import Identities from './pages/Identities';
import AccessControl from './pages/AccessControl';
import SmartContracts from './pages/SmartContracts';
import AuditTrail from './pages/AuditTrail';
import UserDashboard from './pages/user/UserDashboard';
import MyIdentity from './pages/user/MyIdentity';
import MyAssets from './pages/user/MyAssets';
import RequestAccess from './pages/user/RequestAccess';
import MyActivity from './pages/user/MyActivity';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AuditorDashboard from './pages/auditor/AuditorDashboard';
import {
  normalizeBelRole,
  getDashboardRouteForRole,
  getRouteForRoleKey,
  type BelRoleKey,
} from './services/employeeRbac';

// Helper to check the current authenticated role
const getAuthUserRole = (): { isAuthenticated: boolean; role: BelRoleKey } => {
  try {
    const belUserStr = localStorage.getItem('bel_user');
    const userStr = localStorage.getItem('user');

    if (!belUserStr && !userStr) {
      return { isAuthenticated: false, role: 'EMPLOYEE' };
    }

    let role = '';
    if (belUserStr) {
      const u = JSON.parse(belUserStr);
      role = u.role || '';
    } else if (userStr) {
      const u = JSON.parse(userStr);
      role = u.role?.name || u.role || '';
    }

    return { isAuthenticated: true, role: normalizeBelRole(role) };
  } catch {
    return { isAuthenticated: false, role: 'EMPLOYEE' };
  }
};

/** Guard for Admin Routes (/bel/*). */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role } = getAuthUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'ADMIN') {
    // Everyone else is redirected to their own role dashboard.
    return <Navigate to={getDashboardRouteForRole(role)} replace />;
  }

  return <>{children}</>;
};

/** Guard for Manager Routes (/manager/*). */
const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role } = getAuthUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'MANAGER') {
    return <Navigate to={getDashboardRouteForRole(role)} replace />;
  }

  return <>{children}</>;
};

/** Guard for Auditor Routes (/auditor/*). */
const AuditorRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role } = getAuthUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'AUDITOR') {
    return <Navigate to={getDashboardRouteForRole(role)} replace />;
  }

  return <>{children}</>;
};

// Guard for User Portal Routes (/user/*)
const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = getAuthUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Root route intelligent redirector — every role lands on its own dashboard.
const RootRedirect = () => {
  const { isAuthenticated, role } = getAuthUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRouteForRoleKey(role)} replace />;
};

const ComingSoon = () => (
  <div className="flex items-center justify-center h-full text-slate-500 font-medium">
    Page Coming Soon
  </div>
);

/** Shared shell: left rail (sidebar) + top bar (header) + routed content. */
const RoleLayout = ({ sidebar, header }: { sidebar: React.ReactNode; header: React.ReactNode }) => (
  <div className="flex h-screen bg-slate-50 overflow-hidden">
    {sidebar}

    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {header}

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

const BelLayout = () => <RoleLayout sidebar={<Sidebar />} header={<Header />} />;
const UserLayout = () => <RoleLayout sidebar={<UserSidebar />} header={<UserHeader />} />;
const ManagerLayout = () => <RoleLayout sidebar={<ManagerSidebar />} header={<ManagerHeader />} />;
const AuditorLayout = () => <RoleLayout sidebar={<AuditorSidebar />} header={<AuditorHeader />} />;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entry / Login */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Application under /bel with AdminRoute guard */}
        <Route
          path="/bel"
          element={
            <AdminRoute>
              <BelLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="digital-assets" element={<DigitalAssets />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="identities" element={<Identities />} />
          <Route path="access-control" element={<AccessControl />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="audit-trail" element={<AuditTrail />} />
          <Route path="smart-contracts" element={<SmartContracts />} />
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-full text-slate-500 font-medium">
                Page Coming Soon
              </div>
            }
          />
        </Route>

        {/* Manager Application under /manager with ManagerRoute guard */}
        <Route
          path="/manager"
          element={
            <ManagerRoute>
              <ManagerLayout />
            </ManagerRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="access-control" element={<AccessControl />} />
          <Route path="audit-trail" element={<AuditTrail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<ComingSoon />} />
        </Route>

        {/* Auditor application under /auditor with AuditorRoute guard */}
        <Route
          path="/auditor"
          element={
            <AuditorRoute>
              <AuditorLayout />
            </AuditorRoute>
          }
        >
          <Route index element={<AuditorDashboard />} />
          <Route path="dashboard" element={<AuditorDashboard />} />
          <Route path="audit-trail" element={<AuditTrail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<ComingSoon />} />
        </Route>
        {/* User-facing portal under /user with UserRoute guard */}
        <Route
          path="/user"
          element={
            <UserRoute>
              <UserLayout />
            </UserRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="identity" element={<MyIdentity />} />
          <Route path="assets" element={<MyAssets />} />
          <Route path="request-access" element={<RequestAccess />} />
          <Route path="activity" element={<MyActivity />} />
        </Route>

        {/* Aliases & Direct Redirects */}
        <Route path="/user-dashboard" element={<Navigate to="/user" replace />} />
        <Route path="/manager-dashboard" element={<Navigate to="/manager" replace />} />
        <Route path="/auditor-dashboard" element={<Navigate to="/auditor" replace />} />
        <Route path="/dashboard" element={<Navigate to="/bel/dashboard" replace />} />
        <Route path="/digital-assets" element={<Navigate to="/bel/digital-assets" replace />} />
        <Route path="/transactions" element={<Navigate to="/bel/transactions" replace />} />
        <Route path="/identities" element={<Navigate to="/bel/identities" replace />} />
        <Route path="/access-control" element={<Navigate to="/bel/access-control" replace />} />
        <Route path="/reports" element={<Navigate to="/bel/reports" replace />} />
        <Route path="/settings" element={<Navigate to="/bel/settings" replace />} />
        <Route path="/audit-trail" element={<Navigate to="/bel/audit-trail" replace />} />
        <Route path="/smart-contracts" element={<Navigate to="/bel/smart-contracts" replace />} />

        {/* Fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;