import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/bel" element={<BelLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="digital-assets" element={<DigitalAssets />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="identities" element={<Identities />} />
          <Route path="access-control" element={<AccessControl />} />
          <Route path="smart-contracts" element={<SmartContracts />} />
          <Route path="audit-trail" element={<AuditTrail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />

          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-full text-slate-500 font-medium">
                Coming Soon
              </div>
            }
          />
        </Route>

        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Navigate to="/bel" replace />} />
        <Route path="/reports" element={<Navigate to="/bel/reports" replace />} />
        <Route path="/settings" element={<Navigate to="/bel/settings" replace />} />
        <Route path="/identities" element={<Navigate to="/bel/identities" replace />} />
        <Route path="/access-control" element={<Navigate to="/bel/access-control" replace />} />
        <Route path="/smart-contracts" element={<Navigate to="/bel/smart-contracts" replace />} />
        <Route path="/audit-trail" element={<Navigate to="/bel/audit-trail" replace />} />

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