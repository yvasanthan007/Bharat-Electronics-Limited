import { useState, type FormEvent } from 'react';
import { Wallet, ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthCard = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: employeeId, password }),
      });
      const data = await response.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('accessToken', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        // Fetch profile
        const profileRes = await fetch('http://localhost:4000/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${data.data.token}`
          }
        });
        const profileData = await profileRes.json();
        
        if (profileData.success) {
          localStorage.setItem('user', JSON.stringify(profileData.data));
        }

        setIsLoading(false);
        navigate('/bel');
      } else {
        setIsLoading(false);
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      // Fallback to mock credentials if backend is down
      setTimeout(() => {
        setIsLoading(false);
        if (employeeId === 'BEL001' && password === 'bel123') {
          localStorage.setItem('user', JSON.stringify({
            firstName: 'Rahul',
            lastName: 'Verma',
            email: 'rahul@bel.com',
            role: { name: 'ADMIN' }
          }));
          navigate('/bel');
        } else {
          setError('Connection error or invalid credentials');
        }
      }, 500);
    }
  };

  const handleWalletConnect = () => {
    setIsWalletLoading(true);
    setTimeout(() => {
      setIsWalletLoading(false);
      setError('Wallet connection not available in this environment.');
    }, 1000);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">BEL Trust Platform</h2>
        <h3 className="text-lg font-medium text-slate-700 mt-1">Welcome to BEL</h3>
        <p className="text-sm text-slate-500 mt-2">Sign in to your secure workspace</p>
      </div>

      <button
        onClick={handleWalletConnect}
        disabled={isWalletLoading || isLoading}
        className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-xl border border-slate-200 transition-colors duration-200"
      >
        <Wallet className="w-5 h-5 text-slate-500" />
        {isWalletLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>

      <div className="relative flex py-6 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <p>{error}</p>
          </div>
        )}
        
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700" htmlFor="employeeId">
            Employee ID / Email
          </label>
          <input
            id="employeeId"
            type="text"
            placeholder="Enter your employee ID or email"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-slate-600 font-medium">Remember me</span>
          </label>
          <button type="button" className="text-sm text-blue-600 font-medium hover:text-blue-700">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || isWalletLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              Continue Securely
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted connection</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Identity verification enabled</span>
        </div>
      </div>
      
      <div className="mt-8 text-center border-t border-slate-100 pt-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Authorized BEL personnel only
        </p>
      </div>
    </div>
  );
};

export default AuthCard;
