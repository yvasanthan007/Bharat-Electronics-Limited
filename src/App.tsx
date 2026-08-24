import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import DigitalAssets from './pages/DigitalAssets';
import Transactions from './pages/Transactions';
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

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/bel" element={<BelLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="digital-assets" element={<DigitalAssets />} />
          <Route path="transactions" element={<Transactions />} />

          <Route path="audit-trail" element={<AuditTrail />} />
          <Route path="smart-contracts" element={<SmartContracts />} />

          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-full text-slate-500">
                Coming Soon
              </div>
            }
          />
        </Route>

        <Route
          path="/dashboard"
          element={<Navigate to="/bel" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;