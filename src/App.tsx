import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManagerLayout from './pages/ManagerLayout';
import ManagerDashboardRoute from './pages/routes/ManagerDashboardRoute';
import ManagerTeamRoute from './pages/routes/ManagerTeamRoute';
import ManagerAccessRequestsRoute from './pages/routes/ManagerAccessRequestsRoute';
import ManagerAssetsRoute from './pages/routes/ManagerAssetsRoute';
import ManagerActivityRoute from './pages/routes/ManagerActivityRoute';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';

const BelLayout = () => (
  <div className="flex h-screen bg-slate-50 overflow-hidden">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

const RequireAuth = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) => {
  const { user, role, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-slate-50"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Simplified role check. In a full app you might check exact role matches.
  // If allowedRole is provided, we could enforce it here.
  if (allowedRole && role !== allowedRole && role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  const { signOut } = useAuthContext();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/bel" element={
        <RequireAuth allowedRole="Admin">
          <BelLayout />
        </RequireAuth>
      }>
        <Route index element={<Dashboard />} />
        <Route path="*" element={<div className="flex items-center justify-center h-full text-slate-500">Coming Soon</div>} />
      </Route>
      
      {/* Manager Routes */}
      <Route path="/manager" element={
        <RequireAuth allowedRole="Manager">
          <ManagerLayout onLogout={signOut} />
        </RequireAuth>
      }>
        <Route index element={<ManagerDashboardRoute />} />
        <Route path="team" element={<ManagerTeamRoute />} />
        <Route path="access-requests" element={<ManagerAccessRequestsRoute />} />
        <Route path="assets" element={<ManagerAssetsRoute />} />
        <Route path="activity" element={<ManagerActivityRoute />} />
      </Route>

      {/* Legacy redirect for any existing links to /dashboard */}
      <Route path="/dashboard" element={<Navigate to="/bel" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
