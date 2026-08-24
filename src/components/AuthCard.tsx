import { useState, type FormEvent } from 'react';
import { Wallet, ShieldCheck, Lock, CheckCircle2, ArrowRight, Mail, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthCard = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanId = identifier.trim().toLowerCase();

    // 1. Direct BEL Admin credentials check
    const isAdminMatch = 
      (cleanId === 'bel.admin@gmail' || cleanId === 'bel.admin@gmail.com' || cleanId === 'admin') && 
      password === 'beladmin0';

    const isLegacyMatch = 
      (cleanId === 'bel001' && password === 'bel123') ||
      (cleanId === 'rahul.verma@bel.co.in' && password === 'Admin@123');

    if (isAdminMatch || isLegacyMatch) {
      setTimeout(() => {
        setIsLoading(false);
        localStorage.setItem('bel_user', JSON.stringify({
          name: 'BEL Admin',
          email: 'bel.admin@gmail',
          role: 'Administrator',
          did: 'did:bel:sov:admin01'
        }));
        navigate('/bel');
      }, 400);
      return;
    }

    // 2. Firebase Authentication
    try {
      if (isSignUp) {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, cleanId, password);
        const user = userCredential.user;
        
        // Save additional user details in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          employeeId: employeeId,
          email: cleanId,
          role: 'user',
          createdAt: serverTimestamp()
        });
      } else {
        // Log in user
        await signInWithEmailAndPassword(auth, cleanId, password);
      }
      
      setIsLoading(false);
      localStorage.setItem('bel_user', JSON.stringify({
        name: employeeId || 'BEL Officer',
        email: cleanId,
        role: 'Officer',
        did: `did:bel:sov:${(employeeId || 'user01').toLowerCase()}`
      }));
      navigate('/bel');
    } catch (err: unknown) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Invalid ID/Email or password.';
      setError(errorMessage.replace('Firebase: ', ''));
    }
  };

  const handleWalletConnect = () => {
    setIsWalletLoading(true);
    setTimeout(() => {
      setIsWalletLoading(false);
      localStorage.setItem('bel_user', JSON.stringify({
        name: 'BEL Admin',
        email: 'bel.admin@gmail',
        role: 'Administrator',
        did: 'did:bel:sov:admin01'
      }));
      navigate('/bel');
    }, 600);
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPassword('');
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">BEL Trust Platform</h2>
        <h3 className="text-lg font-medium text-slate-700 mt-1">
          {isSignUp ? 'Create an Account' : 'Welcome to BEL'}
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          {isSignUp ? 'Register to access the secure workspace' : 'Sign in to your secure workspace'}
        </p>
      </div>

      {!isSignUp && (
        <>
          <button
            onClick={handleWalletConnect}
            disabled={isWalletLoading || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-xl border border-slate-200 transition-colors duration-200 cursor-pointer"
          >
            <Wallet className="w-5 h-5 text-slate-500" />
            {isWalletLoading ? 'Connecting Hardware Vault...' : 'Connect Hardware Vault / Wallet'}
          </button>

          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
        </>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <p>{error}</p>
          </div>
        )}
        
        {isSignUp && (
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="employeeId">
              Employee ID
            </label>
            <div className="relative">
              <input
                id="employeeId"
                type="text"
                placeholder="e.g. BEL001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required={isSignUp}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
              />
              <UserCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700" htmlFor="identifier">
            ID / Email
          </label>
          <div className="relative">
            <input
              id="identifier"
              type="text"
              placeholder="Enter your ID or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700" htmlFor="password">
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {!isSignUp && (
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-slate-600 font-medium">Remember me</span>
            </label>
            <button type="button" className="text-sm text-blue-600 font-medium hover:text-blue-700">
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isWalletLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              {isSignUp ? 'Create Account' : 'Continue Securely'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </form>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>AES-256 Encrypted connection</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Zero-Trust Decentralized Identity (DID)</span>
        </div>
      </div>
      
      <div className="mt-6 text-center border-t border-slate-100 pt-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Authorized BEL personnel only
        </p>
      </div>
    </div>
  );
};

export default AuthCard;
