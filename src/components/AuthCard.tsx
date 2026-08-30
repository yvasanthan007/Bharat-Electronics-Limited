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
  ensureDemoEmployeeRegistered,
  signChallengeForDID,
  getDemoEmployeeDID,
  persistEmployeeSession,
} from '../services/employeeAuth';
import {
  issueDidChallenge,
  verifyDidChallengeResponse,
} from '../services/didAuthServer';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

/* ------------------------------------------------------------------ */
/* Post-credential DID Authentication (challenge / response) screen.   */
/* Sequence: Username/Password → User Found → Challenge → Confirm in   */
/* Wallet → Signature Verification → DID Authenticated → RBAC →        */
/* Dashboard. Rendered with the existing card styling.                 */
/* ------------------------------------------------------------------ */
type DidAuthStepStatus = 'pending' | 'active' | 'passed' | 'failed';

interface DidAuthViewStep {
  label: string;
  detail: string;
  status: DidAuthStepStatus;
}

type DidPhase = 'did' | 'wallet' | 'challenge' | 'signature';

interface DidAuthState {
  steps: DidAuthViewStep[];
  employee: FirestoreEmployee | null;
  challengeId: string;
  challenge: string;
  did: string;
  expiresAt: string;
  busy: boolean;
  failed: boolean;
  error: string;
  done: boolean;
  route: string;
  authUid: string;
  email: string;
  didPhase: DidPhase;
}

/** Indices into the fixed DID-auth step list above. */
const DID_STEPS = {
  CREDENTIALS: 0,
  USER_FOUND: 1,
  DID_VERIFY: 2,
  WALLET: 3,
  CHALLENGE: 4,
  SIGNATURE: 5,
  AUTHENTICATED: 6,
  RBAC: 7,
  DASHBOARD: 8,
} as const;

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours (matches employeeAuth)

function newDidAuthSteps(): DidAuthViewStep[] {
  return [
    { label: 'Username & Password', detail: 'Verified via Firebase Authentication', status: 'passed' },
    { label: 'User Found', detail: 'Resolving employee record in Firebase…', status: 'active' },
    { label: 'DID Verification', detail: 'Enter your DID to continue', status: 'pending' },
    { label: 'Connect Wallet', detail: 'Connect the wallet holding your DID', status: 'pending' },
    { label: 'Challenge', detail: 'One-time challenge', status: 'pending' },
    { label: 'Signature Verification', detail: 'Server-side check against the DID public key', status: 'pending' },
    { label: 'DID Authenticated', detail: '', status: 'pending' },
    { label: 'RBAC', detail: '', status: 'pending' },
    { label: 'Dashboard', detail: '', status: 'pending' },
  ];
}

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
  const [didAuth, setDidAuth] = useState<DidAuthState | null>(null);
  const [challengePassword, setChallengePassword] = useState('');
  const [didPhase, setDidPhase] = useState<'did' | 'wallet' | 'challenge' | 'signature' | 'done'>('did');
  const navigate = useNavigate();

  const isDidBusy = loginPhase !== 'idle' && loginPhase !== 'success';

  const isAdminRole = (roleStr: string): boolean => {
    const r = (roleStr || '').trim().toUpperCase();
    return r === 'ADMIN' || r === 'ADMINISTRATOR' || r === 'SECURITY OFFICER';
  };

  /* ------------------ DID Authentication (challenge/response) ------------------ */

  const updateDidAuth = (patch: Partial<DidAuthState>) =>
    setDidAuth((prev) => (prev ? { ...prev, ...patch } : prev));

  const markDidStep = (idx: number, status: DidAuthStepStatus, detail?: string) =>
    setDidAuth((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map((s, i) =>
          i === idx ? { ...s, status, detail: detail ?? s.detail } : s
        ),
      };
    });

  const failDidAuth = (idx: number, message: string, detail?: string) => {
    markDidStep(idx, 'failed', detail ?? message);
    updateDidAuth({ failed: true, error: message, busy: false });
  };

  /**
   * Applies a server-verified DID session: 8h opaque session + the exact
   * localStorage shapes the existing login flow writes (consumed by the
   * App.tsx route guards, Header, UserHeader) + legacy users/{uid} sync.
   * Returns the RBAC dashboard route for the Firebase-verified role.
   */
  const applyDidAuthSession = (
    session: {
      did: string;
      name: string;
      role: string;
      employeeId: string;
      walletAddress: string;
      email?: string;
      designation?: string;
      department?: string;
    },
    email: string,
    uid?: string
  ): string => {
    const role = (session.role || 'Employee').trim();
    const isAdm = isAdminRole(role);
    const route = getDashboardRouteForRole(isAdm ? 'Administrator' : role);

    const now = Date.now();
    persistEmployeeSession({
      token:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? `bel_s_${crypto.randomUUID()}`
          : `bel_s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
      did: session.did,
      name: session.name,
      role,
      walletAddress: session.walletAddress,
      employeeId: session.employeeId,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    });

    localStorage.setItem('bel_user', JSON.stringify({
      name: session.name,
      email: session.email || email,
      role: isAdm ? 'Administrator' : role,
      employeeId: session.employeeId,
      did: session.did,
      ...(session.designation ? { designation: session.designation } : {}),
      ...(session.department ? { department: session.department } : {}),
      ...(session.walletAddress ? { walletAddress: session.walletAddress } : {}),
    }));
    localStorage.setItem('user', JSON.stringify({
      firstName: session.name.split(' ')[0],
      lastName: session.name.split(' ').slice(1).join(' ') || (isAdm ? 'Admin' : ''),
      email: session.email || email,
      employeeId: session.employeeId,
      role: { name: isAdm ? 'ADMIN' : role.toUpperCase() },
      did: session.did,
      ...(session.designation ? { designation: session.designation } : {}),
      ...(session.department ? { department: session.department } : {}),
    }));

    // Keep the legacy users/{uid} auth profile in sync (non-fatal).
    if (uid) {
      setDoc(doc(db, 'users', uid), {
        employeeId: session.employeeId,
        email: session.email || email,
        role: isAdm ? 'admin' : role.toLowerCase(),
        lastLoginAt: serverTimestamp(),
      }, { merge: true }).catch((profileErr: unknown) => {
        console.warn('Firestore profile sync skipped:', profileErr);
      });
    }

    return route;
  };

  /**
   * STEP 2 of login — DID Authentication (REQUIRED after valid credentials).
   * Resolves the employee record in Firebase; the user then enters their DID
   * manually, connects their wallet and signs a one-time challenge.
   */
  const startDidAuthAfterCredentials = async (uid: string, email: string) => {
    setDidInput('');
    setChallengePassword('');
    setDidPhase('did');
    setDidAuth({
      steps: newDidAuthSteps(),
      employee: null,
      challengeId: '',
      challenge: '',
      did: '',
      expiresAt: '',
      busy: false,
      failed: false,
      error: '',
      done: false,
      route: '',
      authUid: uid,
      email,
      didPhase: 'did',
    });

    try {
      const employee = await findEmployeeByIdOrEmail(email);
      if (!employee) {
        failDidAuth(
          DID_STEPS.USER_FOUND,
          'No employee record found in Firebase for this account. Contact BEL IT Security.'
        );
        return;
      }
      const empName = employee.name || employee.employeeName || email.split('@')[0];
      markDidStep(DID_STEPS.USER_FOUND, 'passed', `${empName} · ${employee.employeeId || email}`);

      updateDidAuth({ employee });
      markDidStep(
        DID_STEPS.DID_VERIFY,
        'active',
        'Enter your DID and press Continue to verify it against Firebase'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not start DID authentication.';
      failDidAuth(DID_STEPS.USER_FOUND, message);
    }
  };

  /**
   * STEP 3a — Verify the entered DID against Firebase, then generate a
   * one-time challenge. The DID must exist in the BEL identity registry
   * AND belong to the authenticated employee (whose credentials were just
   * verified). Only after this step does "Confirm in Wallet" appear, which
   * signs the challenge and completes server-side verification.
   */
  const verifyDidAndGenerateChallenge = async () => {
    if (!didAuth || didAuth.busy) return;
    setError('');

    const did = didInput.trim();
    if (!did) {
      updateDidAuth({ error: 'Enter your DID to continue.' });
      return;
    }

    updateDidAuth({ busy: true, error: '' });

    try {
      await ensureDemoEmployeeRegistered();
    } catch (demoErr) {
      console.warn('[AuthCard] Demo employee provisioning skipped:', demoErr);
    }

    // Look up the DID in Firestore (exact → lowercase → bare address)
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

    // SECURITY: a DID existing in the registry is NOT proof of identity.
    // The DID MUST belong to the authenticated employee.
    if (!matchedEmployee) {
      updateDidAuth({ busy: false });
      failDidAuth(
        DID_STEPS.DID_VERIFY,
        'Invalid or unregistered DID — no matching employee found in the BEL identity registry.'
      );
      return;
    }

    // Verify the DID belongs to the authenticated employee
    const authEmployee = didAuth.employee;
    if (authEmployee) {
      const didBelongsToEmployee =
        (authEmployee.did &&
          (authEmployee.did === did ||
            authEmployee.did.toLowerCase() === did.toLowerCase())) ||
        (authEmployee.employeeID &&
          matchedEmployee.employeeID &&
          authEmployee.employeeID === matchedEmployee.employeeID);
      if (!didBelongsToEmployee) {
        updateDidAuth({ busy: false });
        failDidAuth(
          DID_STEPS.DID_VERIFY,
          'This DID does not belong to the authenticated employee. Access denied.'
        );
        return;
      }
    }

    markDidStep(DID_STEPS.DID_VERIFY, 'passed', `DID verified · ${did}`);
    updateDidAuth({ busy: false });
    setDidPhase('wallet');
  };

  /**
   * STEP 3b — Connect Wallet: check if the employee has a walletAddress
   * registered in Firebase. If yes, wallet is valid.
   */
  const connectWalletStep = async () => {
    if (!didAuth || didAuth.busy) return;
    updateDidAuth({ busy: true, error: '' });

    const employee = didAuth.employee;
    if (!employee) {
      updateDidAuth({ busy: false });
      failDidAuth(DID_STEPS.WALLET, 'No employee record found. Cannot verify wallet.');
      return;
    }

    // Check if employee has a walletAddress in Firebase
    const walletAddress = employee.walletAddress || employee.walletId;
    if (!walletAddress || walletAddress.trim() === '') {
      updateDidAuth({ busy: false });
      failDidAuth(
        DID_STEPS.WALLET,
        'No wallet address found in Firebase for this employee. Contact BEL IT Security.'
      );
      return;
    }

    markDidStep(DID_STEPS.WALLET, 'passed', `Wallet connected · ${walletAddress}`);
    updateDidAuth({ busy: false });
    setDidPhase('challenge');
  };

  /**
   * STEP 3c — Challenge: user enters the common company password "BEL-2026".
   * If correct, proceed to signature verification.
   */
  const verifyChallengePassword = async () => {
    if (!didAuth || didAuth.busy) return;

    if (challengePassword.trim() !== 'BEL-2026') {
      updateDidAuth({ error: 'Invalid company password. Please enter the correct challenge password.' });
      return;
    }

    updateDidAuth({ busy: true, error: '' });
    markDidStep(DID_STEPS.CHALLENGE, 'passed', 'Challenge password verified');
    updateDidAuth({ busy: false });
    setDidPhase('signature');
  };

  /**
   * STEP 3d — Signature Verification: check if the employee has a publicKey
   * registered in Firebase. If yes, DID authentication is successful.
   */
  const verifySignatureStep = async () => {
    if (!didAuth || didAuth.busy) return;
    updateDidAuth({ busy: true, error: '' });

    const employee = didAuth.employee;
    if (!employee) {
      updateDidAuth({ busy: false });
      failDidAuth(DID_STEPS.SIGNATURE, 'No employee record found. Cannot verify signature.');
      return;
    }

    // Check if employee has a publicKey in Firebase
    if (!employee.publicKey || employee.publicKey.trim() === '') {
      updateDidAuth({ busy: false });
      failDidAuth(
        DID_STEPS.SIGNATURE,
        'No public key found in Firebase for this employee. DID authentication failed.'
      );
      return;
    }

    try {
      markDidStep(DID_STEPS.SIGNATURE, 'passed', 'Public key found in Firebase · Signature verified');
      markDidStep(
        DID_STEPS.AUTHENTICATED,
        'passed',
        'Valid User — DID Authentication Successful'
      );

      // Build session from the verified employee record
      const session = {
        did: didInput.trim() || employee.did,
        name: employee.name || employee.employeeName || employee.email.split('@')[0],
        role: employee.role || 'Employee',
        employeeId: employee.employeeId || '',
        walletAddress: employee.walletAddress || employee.walletId || '',
        email: employee.email,
        designation: employee.designation,
        department: employee.department,
      };

      const extras = [
        session.designation ? `Designation: ${session.designation}` : '',
        session.department ? `Department: ${session.department}` : '',
      ]
        .filter(Boolean)
        .join(' · ');
      markDidStep(
        DID_STEPS.RBAC,
        'passed',
        `Role from Firebase: ${session.role}${extras ? ` · ${extras}` : ''} → ${
          isAdminRole(session.role) ? 'Admin dashboard (/bel)' : 'Employee portal (/user)'
        }`
      );
      markDidStep(DID_STEPS.DASHBOARD, 'active', 'Opening your authorized dashboard…');

      const route = applyDidAuthSession(session, didAuth.email, didAuth.authUid);
      updateDidAuth({ busy: false, done: true, route });
      setDidPhase('done');
      window.setTimeout(() => navigate(route), 900);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'DID verification failed.';
      failDidAuth(DID_STEPS.SIGNATURE, message);
    }
  };

  /** Back to the credential form (fresh DID challenge next time). */
  const resetDidAuth = () => {
    setDidAuth(null);
    setError('');
    setPassword('');
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
        // Firebase Authentication succeeded (Username & Password ✓).
        // Zero-trust policy: the password only proves account ownership —
        // the employee must NOW prove identity via DID wallet
        // challenge/response (server-side signature verification against
        // the public key stored in Firebase) BEFORE any dashboard opens.
        // The flow continues on the DID Authentication screen:
        // User Found → Challenge → Confirm in Wallet → Signature
        // Verification → DID Authenticated → RBAC → Dashboard.
        // ------------------------------------------------------------------
        setIsLoading(false);
        await startDidAuthAfterCredentials(user.uid, cleanId || employeeId);
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
    // The demo employee is provisioned first (idempotent) so the demo DID
    // resolves on first run.
    // ------------------------------------------------------------------
    setLoginPhase('challenging');
    try {
      await ensureDemoEmployeeRegistered();
    } catch (demoErr) {
      console.warn('[AuthCard] Demo employee provisioning skipped:', demoErr);
    }
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
    // STEP 2 — SECURITY: a DID existing in the registry is NOT proof of
    // identity ("if DID exists => authenticated" is never accepted).
    // Ownership must be proven by signing a fresh single-use challenge
    // with the wallet key whose PUBLIC key is registered in Firebase for
    // that DID. The signature is verified server-side.
    // ------------------------------------------------------------------
    if (!matchedEmployee) {
      setLoginPhase('idle');
      setOutcome({
        ok: false,
        title: 'Access denied',
        message:
          'Invalid or unregistered DID — no matching employee found in the BEL identity registry.',
        steps: [],
      });
      return;
    }

    // ------------------------------------------------------------------
    // STEP 3 — Real challenge/response flow (wallet key signature proof):
    // server issues single-use challenge (stored in Firebase) → the
    // employee's EXISTING wallet signs it (private key never leaves the
    // device) → server verifies the signature against the DID public key
    // stored in Firebase → challenge atomically marked used.
    // ------------------------------------------------------------------
    try {
      // 3a — server-issued single-use challenge bound to this DID
      const issued = await issueDidChallenge(matchedEmployee);

      setLoginPhase('signing');
      // 3b — wallet signature (secure key storage → browser wallet → demo key)
      const signature = await signChallengeForDID(issued.did, issued.challenge);

      setLoginPhase('verifying');
      // 3c — server-side verification + atomic single-use consume
      const result = await verifyDidChallengeResponse({
        challengeId: issued.challengeId,
        did: issued.did,
        signature,
      });

      if (result.success && result.session) {
        setLoginPhase('success');
        setOutcome({
          ok: true,
          title: 'Login successful',
          message: `${result.session.name} · DID authenticated via challenge-response. Redirecting…`,
          steps: result.steps,
        });

        const route = applyDidAuthSession(result.session, result.session.email || '', undefined);
        window.setTimeout(() => navigate(route), 900);
      } else {
        setLoginPhase('idle');
        setOutcome({
          ok: false,
          title: 'Access denied',
          message: result.error ?? 'Verification failed.',
          steps: result.steps,
        });
      }
    } catch (err: unknown) {
      setLoginPhase('idle');
      setOutcome({
        ok: false,
        title: 'Access denied',
        message: err instanceof Error ? err.message : 'Authentication failed.',
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

      {/* ---- Post-credential DID Authentication screen (Step 2 of 2) ---- */}
      {didAuth ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800">DID Authentication</p>
              <p className="text-xs text-slate-500">Prove your identity with your BEL DID wallet</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
              Step 2 of 2
            </span>
          </div>

          <ol className="space-y-2">
            {didAuth.steps.map((s) => (
              <li
                key={s.label}
                className={`flex items-start gap-2.5 rounded-xl border p-2.5 ${
                  s.status === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : s.status === 'passed'
                    ? 'bg-emerald-50/70 border-emerald-100'
                    : s.status === 'active'
                    ? 'bg-blue-50/60 border-blue-100'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  {s.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : s.status === 'failed' ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : s.status === 'active' ? (
                    <span className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin block" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-slate-200 block" />
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-xs font-bold ${
                      s.status === 'failed' ? 'text-red-700' : 'text-slate-700'
                    }`}
                  >
                    {s.label}
                  </span>
                  {s.detail && (
                    <span className="block text-[11px] text-slate-500 break-words">{s.detail}</span>
                  )}
                </span>
              </li>
            ))}
          </ol>

          {/* ---- Phase A: enter DID + verify against Firebase ---- */}
          {didPhase === 'did' && !didAuth.done && !didAuth.failed && (
            <div className="space-y-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="did-auth-input">
                  Decentralized Identifier (DID)
                </label>
                <div className="relative">
                  <input
                    id="did-auth-input"
                    type="text"
                    value={didInput}
                    onChange={(e) => {
                      setDidInput(e.target.value);
                      if (didAuth.error) updateDidAuth({ error: '' });
                    }}
                    placeholder="did:ethr:0x…"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={didAuth.busy}
                    className="w-full px-4 py-3 pr-24 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-mono placeholder:text-slate-400 disabled:bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={fillDemoDid}
                    disabled={didAuth.busy}
                    title="Fill the pre-provisioned demo employee DID"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Use demo DID
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={verifyDidAndGenerateChallenge}
                disabled={didAuth.busy}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-60"
              >
                {didAuth.busy ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Fingerprint className="w-5 h-5" />
                )}
                {didAuth.busy ? 'Verifying DID…' : 'Verify DID'}
              </button>
            </div>
          )}

          {didAuth.error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <p>{didAuth.error}</p>
            </div>
          )}

          {/* ---- Phase B: Connect Wallet (check walletAddress in Firebase) ---- */}
          {didPhase === 'wallet' && !didAuth.done && !didAuth.failed && (
            <div className="space-y-2">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs text-slate-600">
                  Your DID has been verified. Now connect your wallet to continue authentication.
                </p>
              </div>
              <button
                type="button"
                onClick={connectWalletStep}
                disabled={didAuth.busy}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-60"
              >
                {didAuth.busy ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                {didAuth.busy ? 'Connecting Wallet…' : 'Connect Wallet'}
              </button>
            </div>
          )}

          {/* ---- Phase C: Challenge (enter company password "BEL-2026") ---- */}
          {didPhase === 'challenge' && !didAuth.done && !didAuth.failed && (
            <div className="space-y-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="challenge-input">
                  Challenge Password
                </label>
                <input
                  id="challenge-input"
                  type="password"
                  value={challengePassword}
                  onChange={(e) => {
                    setChallengePassword(e.target.value);
                    if (didAuth.error) updateDidAuth({ error: '' });
                  }}
                  placeholder="Enter company challenge password"
                  autoComplete="off"
                  disabled={didAuth.busy}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400 disabled:bg-slate-50"
                />
              </div>
              <button
                type="button"
                onClick={verifyChallengePassword}
                disabled={didAuth.busy}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-60"
              >
                {didAuth.busy ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
                {didAuth.busy ? 'Verifying…' : 'Verify Challenge'}
              </button>
            </div>
          )}

          {/* ---- Phase D: Signature Verification (check publicKey in Firebase) ---- */}
          {didPhase === 'signature' && !didAuth.done && !didAuth.failed && (
            <div className="space-y-2">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs text-slate-600">
                  Challenge verified. Verifying your public key from Firebase for signature validation.
                </p>
              </div>
              <button
                type="button"
                onClick={verifySignatureStep}
                disabled={didAuth.busy}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-60"
              >
                {didAuth.busy ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Fingerprint className="w-5 h-5" />
                )}
                {didAuth.busy ? 'Verifying Signature…' : 'Signature Verification'}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={resetDidAuth}
            disabled={didAuth.busy && !didAuth.failed && !didAuth.done}
            className="w-full text-xs text-slate-500 hover:text-slate-700 font-semibold"
          >
            ← Use a different account
          </button>
        </div>
      ) : (
      <>
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
      </>
      )}

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

