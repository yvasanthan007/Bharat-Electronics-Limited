import { useState, type FormEvent, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  Mail,
  Fingerprint,
  UserCheck,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import {
  requestLoginChallengeByCredentials,
  signChallengeForUserAccount,
  completeLoginChallenge,
  ensureDemoEmployeeRegistered,
} from '../services/employeeAuth';

type LoginPhase =
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

const PHASE_LABELS: Record<LoginPhase, string> = {
  idle: 'Sign In with Verified DID',
  challenging: '1/3 Issuing one-time challenge…',
  signing: '2/3 Signing with DID private key…',
  verifying: '3/3 Cryptographic verification…',
  success: 'Identity & DID Verified ✓',
};

const DEMO_PRESETS = [
  { label: 'Arun (USER)', email: 'arun@bel.com', role: 'USER' },
  { label: 'Admin (ADMIN)', email: 'admin@bel.com', role: 'ADMIN' },
  { label: 'Priya (MANAGER)', email: 'priya@bel.com', role: 'MANAGER' },
];

const AuthCard = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('arun@bel.com');
  const [password, setPassword] = useState('Password@123');
  const [simulateUnauthorized, setSimulateUnauthorized] = useState(false);

  const [error, setError] = useState('');
  const [loginPhase, setLoginPhase] = useState<LoginPhase>('idle');
  const [outcome, setOutcome] = useState<OutcomeView | null>(null);

  const navigate = useNavigate();
  const { user, role, signIn } = useAuthContext();

  useEffect(() => {
    if (!user || !role) return;

    const roleUpper = role.toUpperCase();
    if (roleUpper === 'MANAGER') {
      navigate('/manager', { replace: true });
    } else if (roleUpper === 'ADMIN') {
      navigate('/bel', { replace: true });
    } else {
      navigate('/user', { replace: true });
    }
  }, [user, role, navigate]);

  const isBusy = loginPhase !== 'idle' && loginPhase !== 'success';

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setOutcome(null);

    const identifier = emailOrUsername.trim();
    if (!identifier) {
      setError('Please enter your email or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      await ensureDemoEmployeeRegistered();

      setLoginPhase('challenging');
      const challengeData = await requestLoginChallengeByCredentials(identifier, password);

      setLoginPhase('signing');
      const signature = await signChallengeForUserAccount(
        challengeData.did,
        challengeData.challenge,
        simulateUnauthorized
      );

      setLoginPhase('verifying');
      const result = await completeLoginChallenge(challengeData.nonce, signature);

      if (result.success && result.session) {
        setLoginPhase('success');
        await signIn(challengeData.user.email);

        const assignedRole = result.session.role;
        setOutcome({
          ok: true,
          title: 'DID Authentication Successful',
          message: `Verified DID ${result.session.did} · Role: ${assignedRole}. Redirecting to portal…`,
          steps: result.steps,
        });

        window.setTimeout(() => {
          const r = assignedRole.toUpperCase();
          if (r === 'ADMIN') {
            navigate('/bel', { replace: true });
          } else if (r === 'MANAGER') {
            navigate('/manager', { replace: true });
          } else {
            navigate('/user', { replace: true });
          }
        }, 1000);
        return;
      }

      setLoginPhase('idle');
      setOutcome({
        ok: false,
        title: 'DID Verification Failed',
        message: result.error || 'Cryptographic signature mismatch: unauthorized key.',
        steps: result.steps,
      });
    } catch (err: unknown) {
      setLoginPhase('idle');
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setOutcome({
        ok: false,
        title: 'Login Denied',
        message: msg,
        steps: [
          {
            label: 'DID Verification',
            passed: false,
            detail: msg,
          },
        ],
      });
    }
  };

  const selectPreset = (preset: (typeof DEMO_PRESETS)[0]) => {
    setEmailOrUsername(preset.email);
    setPassword('Password@123');
    setError('');
    setOutcome(null);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-3 shadow-inner">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">BEL Trust Platform</h2>
        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mt-1">
          Admin-Controlled DID Authentication
        </h3>

        <p className="text-xs text-slate-500 mt-1.5">
          Sign in with your account credentials. Your provisioned DID is automatically retrieved and verified.
        </p>
      </div>

      {/* Demo Preset Quick Select */}
      <div className="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Quick Select Account
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Auto-retrieves DID</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {DEMO_PRESETS.map((p) => (
            <button
              key={p.email}
              type="button"
              onClick={() => selectPreset(p)}
              disabled={isBusy}
              className={`px-2 py-1.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                emailOrUsername === p.email
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Username / Email */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Username or Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="e.g. arun@bel.com"
              disabled={isBusy}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-colors disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isBusy}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-colors disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Unauthorized / Hacker Simulation Toggle (Requirement 8) */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={simulateUnauthorized}
              onChange={(e) => setSimulateUnauthorized(e.target.checked)}
              disabled={isBusy}
              className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            <div className="text-xs">
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Simulate Friend/Attacker Scenario (No Private Key)
              </span>
              <p className="text-amber-700 mt-0.5 text-[11px] leading-relaxed">
                Test Requirement 8: Attacker has credentials but lacks the user's DID private key.
                DID verification will fail and reject access.
              </p>
            </div>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isBusy}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${
            simulateUnauthorized
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
          } disabled:opacity-60`}
        >
          {isBusy ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Fingerprint className="w-4 h-4" />
          )}
          {PHASE_LABELS[loginPhase]}
        </button>
      </form>

      {/* Outcome / Step Checklist */}
      {outcome && (
        <div
          className={`mt-4 rounded-xl border p-4 text-xs ${
            outcome.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {outcome.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{outcome.title}</span>
          </div>
          <p className="mt-1 text-[11px] font-medium opacity-90">{outcome.message}</p>

          {outcome.steps.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-current/15 pt-2.5">
              {outcome.steps.map((s, i) => (
                <div key={i} className="flex items-start justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1 font-semibold">
                    {s.passed ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-600 shrink-0" />
                    )}
                    {s.label}
                  </span>
                  <span className="font-mono text-[10px] opacity-80 text-right">{s.detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Security Architecture Notice */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <KeyRound className="w-3.5 h-3.5 text-blue-500" />
          Private keys never leave client wallet
        </span>
        <span className="flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
          RBAC Protected
        </span>
      </div>
    </div>
  );
};

export default AuthCard;