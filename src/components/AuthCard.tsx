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
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Email/password authentication is restricted to the platform administrator.
// Employees authenticate exclusively through the DID wallet flow.
const ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@bel.in'
).toLowerCase();

type DidLoginPhase =
  | 'idle'
  | 'challenging'
  | 'signing'
  | 'verifying'
  | 'success';

interface StepView {
  label: string;
  passed: boolean;
  detail: string;
}

interface OutcomeView {
  ok: boolean;
  title: string;
  message: string;
  steps: StepView[];
}

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [didInput, setDidInput] = useState('');
  const [loginPhase, setLoginPhase] =
    useState<DidLoginPhase>('idle');

  const [outcome, setOutcome] =
    useState<OutcomeView | null>(null);

  const navigate = useNavigate();

  const isDidBusy =
    loginPhase !== 'idle' && loginPhase !== 'success';

  /**
   * ADMIN AUTHENTICATION
   *
   * Sign-up:
   *   Firebase Auth → Firestore → /bel
   *
   * Login:
   *   Firebase Auth → /bel
   *
   * Employees are blocked from this flow and must use DID.
   */
  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setOutcome(null);

    const normalizedEmail = email.trim().toLowerCase();

    // Administrator gate.
    // Employees must use DID authentication.
    if (normalizedEmail !== ADMIN_EMAIL) {
      setError(
        'Access restricted — administrator credentials required. Employees must sign in with their DID wallet.'
      );
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Create administrator account in Firebase Auth.
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            normalizedEmail,
            password
          );

        const user = userCredential.user;

        // Store administrator profile in Firestore.
        await setDoc(doc(db, 'users', user.uid), {
          employeeId: employeeId.trim(),
          email: normalizedEmail,
          role: 'admin',
          createdAt: serverTimestamp(),
        });
      } else {
        // Administrator login.
        await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );
      }

      setIsLoading(false);
      navigate('/bel');
    } catch (err: any) {
      setIsLoading(false);

      const errorMessage =
        err?.message ||
        'An error occurred during authentication.';

      setError(
        errorMessage.replace('Firebase: ', '')
      );
    }
  };

  /**
   * DID CHALLENGE / RESPONSE AUTHENTICATION
   *
   * Employee:
   *   DID
   *    ↓
   * Backend generates challenge
   *    ↓
   * Wallet signs challenge
   *    ↓
   * Backend verifies signature
   *    ↓
   * LOGIN / DENY
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

    try {
      // Step 1:
      // Make sure the demo employee exists.
      setLoginPhase('challenging');

      await ensureDemoEmployeeRegistered();

      // Generate one-time challenge.
      const { challenge, nonce } =
        requestLoginChallengeByDID(did);

      // Step 2:
      // Employee wallet signs the challenge.
      setLoginPhase('signing');

      const signature =
        await signChallengeForDID(
          did,
          challenge
        );

      // Step 3:
      // Verify signature against DID public key.
      setLoginPhase('verifying');

      const result =
        await completeLoginChallenge(
          nonce,
          signature
        );

      if (result.success && result.session) {
        // Valid DID → LOGIN
        setLoginPhase('success');

        setOutcome({
          ok: true,
          title: 'Login successful',
          message: `${result.session.name} · session valid for 8h. Redirecting…`,
          steps: result.steps,
        });

        window.setTimeout(() => {
          navigate('/bel');
        }, 900);
      } else {
        // Invalid DID/signature → DENY
        setLoginPhase('idle');

        setOutcome({
          ok: false,
          title: 'Access denied',
          message:
            result.error ??
            'Verification failed.',
          steps: result.steps,
        });
      }
    } catch (err: any) {
      setLoginPhase('idle');

      setOutcome({
        ok: false,
        title: 'Access denied',
        message:
          err?.message ??
          'Authentication failed.',
        steps: [],
      });
    }
  };

  /**
   * Demo DID helper.
   */
  const fillDemoDid = () => {
    setDidInput(getDemoEmployeeDID());
    setOutcome(null);
    setError('');
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPassword('');
    setOutcome(null);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          BEL Trust Platform
        </h2>

        <h3 className="text-lg font-medium text-slate-700 mt-1">
          {isSignUp
            ? 'Create an Account'
            : 'Welcome to BEL'}
        </h3>

        <p className="text-sm text-slate-500 mt-2">
          {isSignUp
            ? 'Register to access the secure workspace'
            : 'Sign in to your secure workspace'}
        </p>
      </div>

      {/* ================= DID LOGIN ================= */}

      {!isSignUp && (
        <>
          <div className="space-y-1.5">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="did-input"
            >
              Decentralized Identifier (DID)
            </label>

            <div className="relative">
              <input
                id="did-input"
                type="text"
                value={didInput}
                onChange={(e) =>
                  setDidInput(e.target.value)
                }
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

          <button
            type="button"
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

          {/* DID RESULT */}
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

              <p className="text-xs mt-0.5">
                {outcome.message}
              </p>

              {outcome.steps.length > 0 && (
                <ul className="mt-2 space-y-1 border-t border-current/10 pt-2">
                  {outcome.steps.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-start gap-1.5 text-[11px] leading-snug"
                    >
                      {s.passed ? (
                        <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
                      ) : (
                        <XCircle className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
                      )}

                      <span>
                        <span className="font-semibold">
                          {s.label}
                        </span>{' '}
                        — {s.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-slate-200" />

            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">
              OR
            </span>

            <div className="flex-grow border-t border-slate-200" />
          </div>
        </>
      )}

      {/* ================= ADMIN LOGIN ================= */}

      <form
        onSubmit={handleAuth}
        className="space-y-4"
      >
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Employee ID — Admin registration only */}
        {isSignUp && (
          <div className="space-y-1">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="employeeId"
            >
              Employee ID
            </label>

            <div className="relative">
              <input
                id="employeeId"
                type="text"
                placeholder="e.g. BEL001"
                value={employeeId}
                onChange={(e) =>
                  setEmployeeId(e.target.value)
                }
                required={isSignUp}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
              />

              <UserCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="email"
          >
            Email Address
          </label>

          <div className="relative">
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
            />

            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="password"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type="password"
              placeholder={
                isSignUp
                  ? 'Create a password (min. 6 characters)'
                  : 'Enter your password'
              }
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
            />

            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Remember / Forgot */}
        {!isSignUp && (
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              <span className="text-sm text-slate-600 font-medium">
                Remember me
              </span>
            </label>

            <button
              type="button"
              className="text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || isDidBusy}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {isSignUp
                ? 'Create Account'
                : 'Continue Securely'}

              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Toggle */}
        <div className="text-center pt-2">
          <p className="text-sm text-slate-600">
            {isSignUp
              ? 'Already have an account?'
              : "Don't have an account?"}{' '}

            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </form>

      {/* Security indicators */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted connection</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Identity verification enabled</span>
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