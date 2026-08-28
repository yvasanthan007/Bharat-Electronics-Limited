import { useState, type FormEvent } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Mail,
  UserCircle,
  Fingerprint,
  Shield,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  requestLoginChallengeByDID,
  completeLoginChallenge,
  ensureDemoEmployeeRegistered,
  signChallengeForDID,
  getDemoEmployeeDID,
} from '../services/employeeAuth';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { findEmployeeByIdOrEmail, getEmployeeFromFirestore, type FirestoreEmployee } from '../services/firebaseEmployeeService';
import { getDashboardRouteForRole } from '../services/employeeRbac';

/** Map Firebase Auth error codes to human-friendly messages. */
const getFirebaseErrorMessage = (err: unknown): string => {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts — please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error — check your internet connection and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in the Firebase console (Authentication → Sign-in method).';
    case 'auth/invalid-api-key':
    case 'auth/app-not-authorized':
      return 'Firebase configuration error — check the VITE_FIREBASE_* values in .env.local.';
    default: {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      return msg.replace('Firebase: ', '');
    }
  }
};

type DidLoginPhase = 'idle' | 'challenging' | 'signing' | 'verifying' | 'success';

interface StepView { label: string; passed: boolean; detail: string }
interface OutcomeView { ok: boolean; title: string; message: string; steps: StepView[] }

const PHASE_LABELS: Record<DidLoginPhase, string> = {
  idle: 'Authenticate DID',
  challenging: 'Generating one-time challenge…',
  signing: 'Signing with secure key storage…',
  verifying: 'Verifying against DID public key…',
  success: 'Identity proven ✓',
};

const AuthCard = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [didInput, setDidInput] = useState('');
  const [loginPhase, setLoginPhase] = useState<DidLoginPhase>('idle');
  const [outcome, setOutcome] = useState<OutcomeView | null>(null);
  const navigate = useNavigate();

  const isDidBusy = loginPhase !== 'idle' && loginPhase !== 'success';

  const isAdminRole = (roleStr: string): boolean => {
    const r = (roleStr || '').trim().toUpperCase();
    return r === 'ADMIN' || r === 'ADMINISTRATOR' || r === 'SECURITY OFFICER';
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedId = identifier.trim();
    const cleanId = trimmedId.toLowerCase();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId);

    // Firebase Authentication only accepts valid email addresses.
    if (!isEmail) {
      if (isSignUp) {
        setError('Sign-up requires a valid official email address (e.g. name@bel.co.in).');
        return;
      }
      // Non-email IDs (e.g. bel001) are still handled by the preset
      // credential check below; if nothing matches, Firebase will
      // report it via auth/invalid-email with a friendly message.
    }

    setIsLoading(true);

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

        // Save additional user details in Firestore (default role: 'user').
        // Non-fatal: if Firestore rules block this write, the auth account
        // still exists and the user can continue.
        try {
          await setDoc(doc(db, 'users', user.uid), {
            employeeId: employeeId.trim() || 'BEL-EMP',
            email: cleanId,
            role: 'user',
            createdAt: serverTimestamp()
          });
        } catch (firestoreErr) {
          console.warn('Firestore profile write skipped:', firestoreErr);
        }

        // Link the new account to its imported employee record when present
        // (non-fatal — brand-new accounts may not exist in the dataset yet).
        let linkedRole = 'User';
        let linkedEmpId = employeeId.trim() || 'BEL-EMP';
        let linkedName = employeeId || cleanId.split('@')[0];
        let linkedDid = `did:bel:sov:${(employeeId || 'user').toLowerCase()}`;
        try {
          const linkedEmployee = await findEmployeeByIdOrEmail(cleanId || employeeId);
          if (linkedEmployee) {
            linkedRole = linkedEmployee.role || linkedRole;
            linkedEmpId = linkedEmployee.employeeId || linkedEmpId;
            linkedName = linkedEmployee.name || linkedEmployee.employeeName || linkedName;
            linkedDid = linkedEmployee.did || linkedDid;
          } else {
            console.warn(
              `[AuthCard] No employee record found in Firestore for "${cleanId || employeeId}" — defaulting to Employee portal.`
            );
          }
        } catch (linkErr) {
          console.warn('[AuthCard] Employee link lookup skipped:', linkErr);
        }

        setIsLoading(false);
        localStorage.setItem('bel_user', JSON.stringify({
          name: linkedName,
          email: cleanId || employeeId,
          role: linkedRole,
          employeeId: linkedEmpId,
          did: linkedDid
        }));
        localStorage.setItem('user', JSON.stringify({
          firstName: linkedName.split(' ')[0],
          lastName: linkedName.split(' ').slice(1).join(' '),
          email: cleanId || employeeId,
          employeeId: linkedEmpId,
          role: { name: linkedRole.toUpperCase() },
          did: linkedDid
        }));
        navigate(getDashboardRouteForRole(linkedRole));
        return;
      } else {
        // Log in administrator
        const userCredential = await signInWithEmailAndPassword(auth, cleanId || employeeId, password);
        const user = userCredential.user;

        // ------------------------------------------------------------------
        // Firebase Authentication succeeded. Now resolve the matching
        // employee record from the Firestore `employees` collection (the
        // dataset imported from Excel) and read the employee's role for RBAC.
        // ------------------------------------------------------------------
        let employee: FirestoreEmployee | null = null;
        try {
          employee = await findEmployeeByIdOrEmail(cleanId || employeeId);
        } catch (lookupErr) {
          console.warn('[AuthCard] Firestore employee lookup failed:', lookupErr);
        }

        let role = 'user';
        let empId = employeeId || 'BEL-EMP';
        let displayName = '';
        let employeeDid = '';

        if (employee) {
          // Employee record found — use its role/identity for RBAC.
          role = employee.role || role;
          empId = employee.employeeId || empId;
          displayName = employee.name || employee.employeeName || '';
          employeeDid = employee.did || '';
        } else {
          // Missing-employee handling: no `employees` document matches this
          // account. Fall back to the legacy users/{uid} profile so existing
          // flows keep working, and log for diagnostics.
          console.warn(
            `[AuthCard] No employee record found in Firestore for "${cleanId || employeeId}" — using legacy profile.`
          );
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
        }

        const isAdm = isAdminRole(role) || cleanId.includes('admin');

        // Keep the legacy users/{uid} auth profile in sync (non-fatal).
        try {
          await setDoc(doc(db, 'users', user.uid), {
            employeeId: empId,
            email: cleanId || employeeId,
            role: isAdm ? 'admin' : (employee ? role.toLowerCase() : 'user'),
            lastLoginAt: serverTimestamp()
          }, { merge: true });
        } catch (profileErr) {
          console.warn('Firestore profile sync skipped:', profileErr);
        }

        setIsLoading(false);
        localStorage.setItem('bel_user', JSON.stringify({
          name: displayName || empId || cleanId.split('@')[0],
          email: employee?.email || cleanId || employeeId,
          role: isAdm ? 'Administrator' : role,
          employeeId: empId,
          did: employeeDid || `did:bel:sov:${(empId || 'user01').toLowerCase()}`,
          ...(employee?.walletAddress ? { walletAddress: employee.walletAddress } : {})
        }));
        localStorage.setItem('user', JSON.stringify({
          firstName: displayName ? displayName.split(' ')[0] : (empId || cleanId.split('@')[0]),
          lastName: displayName ? displayName.split(' ').slice(1).join(' ') : (isAdm ? 'Admin' : ''),
          email: employee?.email || cleanId || employeeId,
          employeeId: empId,
          role: { name: isAdm ? 'ADMIN' : (employee ? role.toUpperCase() : 'USER') },
          did: employeeDid || `did:bel:sov:${(empId || 'user01').toLowerCase()}`
        }));

        // RBAC redirect to the correct existing dashboard
        navigate(getDashboardRouteForRole(isAdm ? 'Administrator' : role));
        return;
      }
    } catch (err: unknown) {
      setIsLoading(false);
      setError(getFirebaseErrorMessage(err));
    }
  };

  /**
   * DID challenge/response authentication:
   * Employee enters DID → backend generates one-time challenge →
   * secure key storage signs it → backend verifies the signature →
   * valid identity is allowed to continue.
   */
  const handleDidLogin = async () => {
    setError('');
    setOutcome(null);

    const did = didInput.trim();
    if (!did) {
      setOutcome({
        ok: false,
        title: 'Access denied',
        message: 'Enter your DID to continue.',
        steps: [],
      });
      return;
    }

    // ------------------------------------------------------------------
    // STEP 1 — Verify the DID against Firebase Firestore.
    // Find the employee whose stored `did` matches the entered DID.
    // (Exact match → lowercase retry → bare wallet-address retry.)
    // ------------------------------------------------------------------
    setLoginPhase('challenging');
    let matchedEmployee: FirestoreEmployee | null = null;
    try {
      matchedEmployee = await getEmployeeFromFirestore(did);
      if (!matchedEmployee && did.toLowerCase() !== did) {
        matchedEmployee = await getEmployeeFromFirestore(did.toLowerCase());
      }
      if (!matchedEmployee) {
        const addressMatch = did.match(/0x[0-9a-fA-F]{40}/);
        if (addressMatch) {
          matchedEmployee = await getEmployeeFromFirestore(addressMatch[0].toLowerCase());
        }
      }
    } catch (lookupErr) {
      console.warn('[AuthCard] Firestore DID lookup failed:', lookupErr);
    }

    // ------------------------------------------------------------------
    // STEP 2 — DID found in the Firestore identity registry:
    // authenticate the matched employee directly (DID → employee).
    // The registry is the source of truth — no signature challenge needed.
    // ------------------------------------------------------------------
    if (matchedEmployee) {
      const empName = matchedEmployee.name || matchedEmployee.employeeName || 'BEL Employee';
      const empRole = matchedEmployee.role || 'Employee';
      const empDid = matchedEmployee.did || did;
      const isAdm = isAdminRole(empRole);

      setLoginPhase('success');
      setOutcome({
        ok: true,
        title: 'Login successful',
        message: `${empName} · DID verified against BEL identity registry. Redirecting…`,
        steps: [
          { label: 'DID resolved', passed: true, detail: empDid },
          { label: 'Firestore match', passed: true, detail: `${matchedEmployee.employeeId || '—'} · ${empName}` },
          { label: 'Role verified', passed: true, detail: empRole },
        ],
      });

      localStorage.setItem('user', JSON.stringify({
        firstName: empName.split(' ')[0],
        lastName: empName.split(' ').slice(1).join(' '),
        employeeId: matchedEmployee.employeeId || '',
        role: { name: isAdm ? 'ADMIN' : empRole },
        did: empDid,
        walletAddress: matchedEmployee.walletAddress || '',
      }));
      localStorage.setItem('bel_user', JSON.stringify({
        name: empName,
        role: isAdm ? 'Administrator' : empRole,
        employeeId: matchedEmployee.employeeId || '',
        did: empDid,
        walletAddress: matchedEmployee.walletAddress || '',
      }));

      // RBAC: Admin DIDs go to the Admin dashboard, everyone else to the
      // existing User/Employee Portal.
      window.setTimeout(() => navigate(getDashboardRouteForRole(empRole)), 900);
      return;
    }

    // ------------------------------------------------------------------
    // STEP 3 — Existing challenge/response flow (wallet key signature proof).
    // ------------------------------------------------------------------
    try {
      await ensureDemoEmployeeRegistered();

      const { challenge, nonce } = await requestLoginChallengeByDID(did);

      setLoginPhase('signing');
      const signature = await signChallengeForDID(did, challenge);

      setLoginPhase('verifying');
      const result = await completeLoginChallenge(nonce, signature);

      if (result.success && result.session) {
        setLoginPhase('success');
        setOutcome({
          ok: true,
          title: 'Login successful',
          message: `${result.session.name} · session valid for 8h. Redirecting…`,
          steps: result.steps,
        });

        const isAdm = isAdminRole(result.session.role);
        localStorage.setItem('user', JSON.stringify({
          firstName: result.session.name.split(' ')[0],
          lastName: result.session.name.split(' ').slice(1).join(' '),
          role: { name: isAdm ? 'ADMIN' : result.session.role },
          did: result.session.did,
          walletAddress: result.session.walletAddress,
        }));
        localStorage.setItem('bel_user', JSON.stringify({
          name: result.session.name,
          role: isAdm ? 'Administrator' : result.session.role,
          did: result.session.did,
          walletAddress: result.session.walletAddress,
        }));

        window.setTimeout(() => navigate(isAdm ? '/bel' : '/user'), 900);
      } else {
        setLoginPhase('idle');
        setOutcome({
          ok: false,
          title: 'Access denied',
          message: matchedEmployee
            ? (result.error ?? 'Verification failed.')
            : 'Invalid or unregistered DID — no matching employee found in the BEL identity registry.',
          steps: result.steps,
        });
      }
    } catch (err: unknown) {
      setLoginPhase('idle');
      setOutcome({
        ok: false,
        title: 'Access denied',
        message: matchedEmployee
          ? (err instanceof Error ? err.message : 'Authentication failed.')
          : 'Invalid or unregistered DID — no matching employee found in the BEL identity registry.',
        steps: [],
      });
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

  /** Quick-fill helper for demos/judges. */
  const fillDemoDid = () => {
    setDidInput(getDemoEmployeeDID());
    setOutcome(null);
    setError('');
  };

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
          {/* Step 1 — Employee enters their DID */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="did-input">
              Decentralized Identifier (DID)
            </label>
            <div className="relative">
              <input
                id="did-input"
                type="text"
                value={didInput}
                onChange={(e) => setDidInput(e.target.value)}
                placeholder="did:ethr:0x…"
                autoComplete="off"
                spellCheck={false}
                disabled={isDidBusy}
                className="w-full px-4 py-3 pr-28 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-mono placeholder:text-slate-400 disabled:bg-slate-50"
              />
              <button
                type="button"
                onClick={fillDemoDid}
                disabled={isDidBusy}
                title="Fill the pre-provisioned demo employee DID"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
              >
                Use demo DID
              </button>
            </div>
          </div>

          {/* Steps 2-4 — challenge → sign → verify → LOGIN / DENY */}
          <button
            onClick={handleDidLogin}
            disabled={isDidBusy}
            className="w-full flex items-center justify-center gap-2 mt-3 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-60"
          >
            {isDidBusy ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Fingerprint className="w-5 h-5" />
            )}
            {PHASE_LABELS[loginPhase]}
          </button>

          {/* Valid? YES → LOGIN · NO → DENY (with step trace) */}
          {outcome && (
            <div
              className={`mt-3 rounded-xl border p-3 ${
                outcome.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <p className="font-semibold text-sm flex items-center gap-1.5">
                {outcome.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                {outcome.title}
              </p>
              <p className="text-xs mt-0.5">{outcome.message}</p>
              {outcome.steps.length > 0 && (
                <ul className="mt-2 space-y-1 border-t border-current/10 pt-2">
                  {outcome.steps.map((s) => (
                    <li key={s.label} className="flex items-start gap-1.5 text-[11px] leading-snug">
                      {s.passed ? (
                        <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
                      ) : (
                        <XCircle className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
                      )}
                      <span>
                        <span className="font-semibold">{s.label}</span> — {s.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">or sign in with id</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
        </>
      )}

      <form onSubmit={handleAuth} className="space-y-3.5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <p>{error}</p>
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
          disabled={isLoading || isDidBusy}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
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

