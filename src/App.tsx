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
import AuditTrail from './pages/AuditTrail';
import SmartContracts from './pages/SmartContracts';

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
        {/* Entry / Login */}
        <Route path="/" element={<Navigate to="/bel" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Main BEL Application under /bel */}
        <Route path="/bel" element={<BelLayout />}>
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

        {/* Top-Level Direct Route Wrappers */}
        <Route element={<BelLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/digital-assets" element={<DigitalAssets />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/identities" element={<Identities />} />
          <Route path="/access-control" element={<AccessControl />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/audit-trail" element={<AuditTrail />} />
          <Route path="/smart-contracts" element={<SmartContracts />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/bel" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;