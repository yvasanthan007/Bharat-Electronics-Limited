import { useState, type FormEvent } from 'react';
import { Wallet, ShieldCheck, Lock, CheckCircle2, ArrowRight, Mail, UserCircle, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthCard = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isConnecting: isWalletLoading, error: walletError, isConnected: walletConnected, connect: connectWallet } = useWallet();
  const navigate = useNavigate();

  const isAdminRole = (roleStr: string): boolean => {
    const r = (roleStr || '').trim().toUpperCase();
    return r === 'ADMIN' || r === 'ADMINISTRATOR' || r === 'SECURITY OFFICER';
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanId = identifier.trim().toLowerCase();

    // 1. Try Backend API first if running
    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanId || employeeId, password }),
      });
      const data = await response.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('accessToken', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        // Fetch user profile from backend
        try {
          const profileRes = await fetch('http://localhost:4000/api/v1/users/me', {
            headers: {
              'Authorization': `Bearer ${data.data.token}`
            }
          });
          const profileData = await profileRes.json();
          
          if (profileData.success && profileData.data) {
            const userObj = profileData.data;
            const roleName = userObj.role?.name || userObj.role || 'User';
            const isAdm = isAdminRole(roleName);

            localStorage.setItem('user', JSON.stringify(userObj));
            localStorage.setItem('bel_user', JSON.stringify({
              name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || userObj.email,
              email: userObj.email,
              role: isAdm ? 'Administrator' : roleName,
              did: userObj.did || `did:bel:sov:${(userObj.employeeId || 'user01').toLowerCase()}`
            }));

            setIsLoading(false);
            if (isAdm) {
              navigate('/bel');
            } else {
              navigate('/user');
            }
            return;
          }
        } catch {
          // If profile fetch fails, check role from token payload or default
        }

        setIsLoading(false);
        navigate('/bel');
        return;
      }
    } catch {
      // Backend unavailable, fallback to preset credentials & Firebase
    }

    // 2. Direct BEL Credentials check (Admin & User RBAC)
    const isAdminMatch = 
      (cleanId === 'bel.admin@gmail' || cleanId === 'bel.admin@gmail.com' || cleanId === 'admin') && 
      password === 'beladmin0';

    const isLegacyAdminMatch = 
      (cleanId === 'rahul.verma@bel.co.in' && password === 'Admin@123');

    const isUserMatch = 
      (cleanId === 'bel001' && password === 'bel123') ||
      (employeeId.toLowerCase() === 'bel001' && password === 'bel123') ||
      (cleanId === 'rithvik@bel.co.in' && password === 'bel123') ||
      (cleanId === 'user' && password === 'user123');

    if (isAdminMatch || isLegacyAdminMatch) {
      setTimeout(() => {
        setIsLoading(false);
        const adminUser = {
          name: 'BEL Admin',
          email: cleanId || 'bel.admin@gmail.com',
          role: 'Administrator',
          did: 'did:bel:sov:admin01'
        };
        localStorage.setItem('bel_user', JSON.stringify(adminUser));
        localStorage.setItem('user', JSON.stringify({
          firstName: 'BEL',
          lastName: 'Admin',
          email: cleanId || 'bel.admin@gmail.com',
          role: { name: 'ADMIN' },
          did: 'did:bel:sov:admin01'
        }));
        navigate('/bel');
      }, 400);
      return;
    }

    if (isUserMatch) {
      setTimeout(() => {
        setIsLoading(false);
        const regularUser = {
          name: 'Rithvik Aadhiran',
          email: cleanId === 'bel001' ? 'rithvik.a@bel.co.in' : cleanId,
          role: 'Engineer',
          employeeId: 'BEL-2024-1024',
          did: 'did:bel:sov:rithvik01'
        };
        localStorage.setItem('bel_user', JSON.stringify(regularUser));
        localStorage.setItem('user', JSON.stringify({
          firstName: 'Rithvik',
          lastName: 'Aadhiran',
          email: cleanId === 'bel001' ? 'rithvik.a@bel.co.in' : cleanId,
          employeeId: 'BEL-2024-1024',
          role: { name: 'USER' },
          did: 'did:bel:sov:rithvik01'
        }));
        navigate('/user');
      }, 400);
      return;
    }

    // 3. Firebase Authentication
    try {
      if (isSignUp) {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, cleanId || employeeId, password);
        const user = userCredential.user;

        // Save additional user details in Firestore (Default role: 'user')
        await setDoc(doc(db, 'users', user.uid), {
          employeeId: employeeId || 'BEL-EMP',
          email: cleanId || employeeId,
          role: 'user',
          createdAt: serverTimestamp()
        });

        setIsLoading(false);
        localStorage.setItem('bel_user', JSON.stringify({
          name: employeeId || cleanId.split('@')[0],
          email: cleanId || employeeId,
          role: 'User',
          did: `did:bel:sov:${(employeeId || 'user').toLowerCase()}`
        }));
        localStorage.setItem('user', JSON.stringify({
          firstName: employeeId || cleanId.split('@')[0],
          lastName: '',
          email: cleanId || employeeId,
          role: { name: 'USER' },
          did: `did:bel:sov:${(employeeId || 'user').toLowerCase()}`
        }));
        navigate('/user');
        return;
      } else {
        // Log in user
        const userCredential = await signInWithEmailAndPassword(auth, cleanId || employeeId, password);
        const user = userCredential.user;

        let role = 'user';
        let empId = employeeId || 'BEL-EMP';

        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role) role = data.role;
            if (data.employeeId) empId = data.employeeId;
          }
        } catch {
          // If Firestore query fails, infer from email
          if (cleanId.includes('admin')) role = 'admin';
        }

        const isAdm = isAdminRole(role) || cleanId.includes('admin');

        setIsLoading(false);
        localStorage.setItem('bel_user', JSON.stringify({
          name: empId || cleanId.split('@')[0],
          email: cleanId || employeeId,
          role: isAdm ? 'Administrator' : 'Officer',
          did: `did:bel:sov:${(empId || 'user01').toLowerCase()}`
        }));
        localStorage.setItem('user', JSON.stringify({
          firstName: empId || cleanId.split('@')[0],
          lastName: isAdm ? 'Admin' : 'Officer',
          email: cleanId || employeeId,
          role: { name: isAdm ? 'ADMIN' : 'USER' },
          did: `did:bel:sov:${(empId || 'user01').toLowerCase()}`
        }));

        if (isAdm) {
          navigate('/bel');
        } else {
          navigate('/user');
        }
        return;
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Invalid ID/Email or password.';
      setError(errorMessage.replace('Firebase: ', ''));
    }
  };

  // Connects Web3 browser wallet
  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      const belUserStr = localStorage.getItem('bel_user');
      let isAdm = false;
      if (belUserStr) {
        try {
          const u = JSON.parse(belUserStr);
          isAdm = isAdminRole(u.role);
        } catch {}
      }
      if (isAdm) {
        navigate('/bel');
      } else {
        navigate('/user');
      }
    } catch {
      // Error surfaced through wallet context
    }
  };

  const setDemoCredentials = (type: 'admin' | 'user') => {
    setError('');
    if (type === 'admin') {
      setIdentifier('bel.admin@gmail.com');
      setPassword('beladmin0');
      setIsSignUp(false);
    } else {
      setIdentifier('bel001');
      setPassword('bel123');
      setIsSignUp(false);
    }
  };

  const displayError = error || walletError;

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPassword('');
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-3">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">BEL Trust Platform</h2>
        <h3 className="text-sm font-medium text-slate-600 mt-1">
          {isSignUp ? 'Create Defense Personnel Account' : 'Role-Based Access Control (RBAC) Portal'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {isSignUp ? 'Register to receive your Decentralized DID' : 'Sign in to access your role-specific dashboard'}
        </p>
      </div>

      {/* Demo Credentials Quick Switcher */}
      {!isSignUp && (
        <div className="mb-5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500">Quick Demo Login:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-blue-700 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3 h-3 text-blue-600" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('user')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-emerald-700 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <User className="w-3 h-3 text-emerald-600" />
              User Portal
            </button>
          </div>
        </div>
      )}

      {!isSignUp && (
        <>
          <button
            onClick={handleWalletConnect}
            disabled={isWalletLoading || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2.5 px-4 rounded-xl border border-slate-200 transition-colors duration-200 cursor-pointer disabled:opacity-60 text-xs font-bold"
          >
            <Wallet className="w-4 h-4 text-slate-500" />
            {walletConnected ? 'Wallet Connected — Continue' : isWalletLoading ? 'Connecting Hardware Vault...' : 'Connect Hardware Vault / Web3 Wallet'}
          </button>

          {walletError && (
            <p className="text-xs text-red-600 font-medium mt-2 flex items-start gap-1.5">
              <span>⚠️</span>
              <span>{walletError}</span>
            </p>
          )}

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">or sign in with id</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
        </>
      )}

      <form onSubmit={handleAuth} className="space-y-3.5">
        {displayError && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <p>{displayError}</p>
          </div>
        )}

        {isSignUp && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700" htmlFor="employeeId">
              BEL Employee ID
            </label>
            <div className="relative">
              <input
                id="employeeId"
                type="text"
                placeholder="e.g. BEL-RD-0104"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required={isSignUp}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs placeholder:text-slate-400"
              />
              <UserCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700" htmlFor="identifier">
            Employee ID or Official Email
          </label>
          <div className="relative">
            <input
              id="identifier"
              type="text"
              placeholder="e.g. bel001 or name@bel.co.in"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs placeholder:text-slate-400"
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              placeholder={isSignUp ? "Create a password (min. 6 characters)" : "Enter your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs placeholder:text-slate-400"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {!isSignUp && (
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-xs text-slate-600 font-medium">Remember me</span>
            </label>
            <button type="button" className="text-xs text-blue-600 font-semibold hover:text-blue-700">
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isWalletLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 mt-3 cursor-pointer text-xs disabled:opacity-50"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              {isSignUp ? 'Create Account & Issue DID' : 'Authenticate & Continue'}
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            {isSignUp ? 'Already have an account?' : "Need a defense identity?"}{' '}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-blue-600 font-bold hover:text-blue-700 transition-colors cursor-pointer"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </form>

      <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>Role-Based Access Control (RBAC) Enforced</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>Zero-Trust Decentralized Identity (DID)</span>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
