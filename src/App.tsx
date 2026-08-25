import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UserSidebar from './components/user/UserSidebar';
import UserHeader from './components/user/UserHeader';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import DigitalAssets from './pages/DigitalAssets';
import Transactions from './pages/Transactions';
import Identities from './pages/Identities';
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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        {/* Admin / platform dashboard */}
        <Route path="/bel" element={<BelLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="digital-assets" element={<DigitalAssets />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="identities" element={<Identities />} />
          <Route path="*" element={<div className="flex items-center justify-center h-full text-slate-500">Coming Soon</div>} />
        </Route>
        {/* User-facing portal */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="identity" element={<MyIdentity />} />
          <Route path="assets" element={<MyAssets />} />
          <Route path="request-access" element={<RequestAccess />} />
          <Route path="activity" element={<MyActivity />} />
        </Route>
        {/* Legacy redirect */}
        <Route path="/dashboard" element={<Navigate to="/bel" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
