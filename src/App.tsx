import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

import UserSidebar from './components/user/UserSidebar';
import UserHeader from './components/user/UserHeader';

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

const UserLayout = () => (
  <div className="flex h-screen bg-slate-50 overflow-hidden">
    <UserSidebar />

    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <UserHeader />

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= ROOT ================= */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* ================= LOGIN ================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ================= ADMIN / PLATFORM ================= */}

        <Route
          path="/bel"
          element={<BelLayout />}
        >
          <Route
            index
            element={<Dashboard />}
          />

          {/* Existing pages */}
          <Route
            path="digital-assets"
            element={<DigitalAssets />}
          />

          <Route
            path="transactions"
            element={<Transactions />}
          />

          <Route
            path="identities"
            element={<Identities />}
          />

          {/* Access control */}
          <Route
            path="access-control"
            element={<AccessControl />}
          />

          {/* Reports */}
          <Route
            path="reports"
            element={<Reports />}
          />

          {/* Settings */}
          <Route
            path="settings"
            element={<Settings />}
          />

          {/* Smart contracts */}
          <Route
            path="smart-contracts"
            element={<SmartContracts />}
          />

          {/* Audit trail */}
          <Route
            path="audit-trail"
            element={<AuditTrail />}
          />

          {/* Unknown admin route */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-full text-slate-500 font-medium">
                Coming Soon
              </div>
            }
          />
        </Route>

        {/* ================= EMPLOYEE / USER PORTAL ================= */}

        <Route
          path="/user"
          element={<UserLayout />}
        >
          <Route
            index
            element={<UserDashboard />}
          />

          <Route
            path="identity"
            element={<MyIdentity />}
          />

          <Route
            path="assets"
            element={<MyAssets />}
          />

          <Route
            path="request-access"
            element={<RequestAccess />}
          />

          <Route
            path="activity"
            element={<MyActivity />}
          />

          {/* Unknown user route */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-full text-slate-500 font-medium">
                Coming Soon
              </div>
            }
          />
        </Route>

        {/* ================= LEGACY REDIRECTS ================= */}

        <Route
          path="/dashboard"
          element={<Navigate to="/bel" replace />}
        />

        <Route
          path="/reports"
          element={<Navigate to="/bel/reports" replace />}
        />

        <Route
          path="/settings"
          element={<Navigate to="/bel/settings" replace />}
        />

        <Route
          path="/identities"
          element={<Navigate to="/bel/identities" replace />}
        />

        <Route
          path="/access-control"
          element={<Navigate to="/bel/access-control" replace />}
        />

        <Route
          path="/smart-contracts"
          element={<Navigate to="/bel/smart-contracts" replace />}
        />

        <Route
          path="/audit-trail"
          element={<Navigate to="/bel/audit-trail" replace />}
        />

        <Route
          path="/dashboard/reports"
          element={<Navigate to="/bel/reports" replace />}
        />

        <Route
          path="/dashboard/settings"
          element={<Navigate to="/bel/settings" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;