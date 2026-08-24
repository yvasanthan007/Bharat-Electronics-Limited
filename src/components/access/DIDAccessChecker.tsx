import { useEffect, useState } from 'react';
import {
    ShieldCheck,
    ShieldAlert,
    Fingerprint,
    Award,
    Key,
    Loader2,
    CheckCircle2,
    XCircle,
    Link2,
} from 'lucide-react';
import { authorizeAccess, type AccessDecision } from '../../services/credentials';
import { getAllDIDIdentities } from '../../services/did';
import { getBlockchainEvents, formatEventType } from '../../lib/did/blockchainLayer';
import type { DIDIdentity } from '../../data/mockDIDData';
import { mockPermissions } from '../../data/mockData';

const ACTIONS = ['View', 'Modify', 'Deploy', 'Approve', 'Export'];

export default function DIDAccessChecker() {
    const [identities, setIdentities] = useState<DIDIdentity[]>([]);
    const [selectedDID, setSelectedDID] = useState('');
    const [resource, setResource] = useState(mockPermissions[0]);
    const [action, setAction] = useState(ACTIONS[0]);
    const [state, setState] = useState<'idle' | 'checking' | 'done'>('idle');
    const [decision, setDecision] = useState<AccessDecision | null>(null);
    const [recentEvents, setRecentEvents] = useState(() =>
        getBlockchainEvents().filter(e => e.eventType === 'ACCESS_GRANTED' || e.eventType === 'ACCESS_DENIED').slice(0, 5)
    );

    useEffect(() => {
        const all = getAllDIDIdentities();
        setIdentities(all);
        if (all.length > 0 && !selectedDID) {
            setSelectedDID(all[0].fullDID);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCheck = async () => {
        if (!selectedDID) return;
        setState('checking');
        try {
            const result = await authorizeAccess({
                did: selectedDID,
                resource,
                action,
            });
            setDecision(result);
            setState('done');
            setRecentEvents(
                getBlockchainEvents()
                    .filter(e => e.eventType === 'ACCESS_GRANTED' || e.eventType === 'ACCESS_DENIED')
                    .slice(0, 5)
            );
        } catch {
            setState('idle');
        }
    };

    const stepIcons = [
        <Fingerprint key="did" className="w-4 h-4" />,
        <Award key="vc" className="w-4 h-4" />,
        <Key key="perm" className="w-4 h-4" />,
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left: Authorization checker */}
            <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">DID-Based Authorization</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Chain: DID → Verified Credential → Role → Permission → Allow / Deny
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Identity (DID)</label>
                            <select
                                value={selectedDID}
                                onChange={(e) => { setSelectedDID(e.target.value); setState('idle'); }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                {identities.map(i => (
                                    <option key={i.id} value={i.fullDID}>
                                        {i.name} — {i.role}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resource</label>
                            <select
                                value={resource}
                                onChange={(e) => { setResource(e.target.value); setState('idle'); }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                {mockPermissions.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</label>
                            <select
                                value={action}
                                onChange={(e) => { setAction(e.target.value); setState('idle'); }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                {ACTIONS.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleCheck}
                        disabled={!selectedDID || state === 'checking'}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        {state === 'checking'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <ShieldCheck className="w-4 h-4" />}
                        {state === 'checking' ? 'Evaluating access chain...' : 'Check Access'}
                    </button>

                    {/* Result */}
                    {state === 'done' && decision && (
                        <div className="space-y-3 pt-2">
                            {/* Overall verdict */}
                            <div className={`flex items-center gap-3 p-4 rounded-xl border ${decision.allowed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                {decision.allowed
                                    ? <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                                    : <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
                                <div>
                                    <p className={`font-bold text-sm ${decision.allowed ? 'text-green-800' : 'text-red-800'}`}>
                                        {decision.allowed ? `✓ ACCESS GRANTED — ${decision.resource}` : `✗ ACCESS DENIED — ${decision.resource}`}
                                    </p>
                                    <p className={`text-xs ${decision.allowed ? 'text-green-600' : 'text-red-600'}`}>
                                        Action: {decision.action} · Decision recorded on blockchain
                                    </p>
                                </div>
                            </div>

                            {/* Verification chain */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {decision.steps.map((step, i) => (
                                    <div
                                        key={step.label}
                                        className={`rounded-xl border p-4 ${step.passed ? 'border-green-200 bg-green-50/60' : 'border-red-200 bg-red-50/60'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={step.passed ? 'text-green-600' : 'text-red-500'}>
                                                {stepIcons[i]}
                                            </span>
                                            <p className="text-sm font-bold text-slate-800">
                                                {step.passed ? '✓' : '✗'} {step.label}
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">{step.detail}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Tx hash */}
                            {decision.txHash && (
                                <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <Link2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">Blockchain Transaction</p>
                                        <code className="font-mono text-xs text-slate-700 break-all">{decision.txHash}</code>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {state === 'idle' && (
                        <p className="text-xs text-slate-400 pt-1">
                            Select an identity and resource, then run the check. Every decision is verified against the holder's Verifiable Credential and recorded on the audit trail.
                        </p>
                    )}
                </div>
            </div>

            {/* Right: Recent access decisions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                <div className="p-5 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Recent Decisions</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Live from blockchain audit trail</p>
                </div>
                <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                    {recentEvents.length === 0 && (
                        <div className="p-6 text-center text-slate-400 text-sm">
                            No access decisions yet — run a check above.
                        </div>
                    )}
                    {recentEvents.map(evt => (
                        <div key={evt.id} className="p-4 flex items-start gap-3">
                            {evt.eventType === 'ACCESS_GRANTED'
                                ? <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                : <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                    {evt.details.resource ?? formatEventType(evt.eventType)}
                                    <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full align-middle ${evt.eventType === 'ACCESS_GRANTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {evt.eventType === 'ACCESS_GRANTED' ? 'ALLOWED' : 'DENIED'}
                                    </span>
                                </p>
                                <p className="text-xs text-slate-500 truncate mt-0.5">{evt.actorDID}</p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    {new Date(evt.timestamp).toLocaleString()} · Block #{evt.blockNumber}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}