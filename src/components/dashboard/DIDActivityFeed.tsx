import { useMemo } from 'react';
import {
    Fingerprint,
    Award,
    ShieldCheck,
    ShieldAlert,
    Wallet,
    Link2,
} from 'lucide-react';
import { getBlockchainEvents, formatEventType } from '../../lib/did/blockchainLayer';
import { getAllDIDIdentities } from '../../services/did';

const eventIcon = (type: string) => {
    switch (type) {
        case 'DID_CREATED':
        case 'DID_VERIFIED':
            return <Fingerprint className="w-4 h-4 text-blue-600" />;
        case 'VC_ISSUED':
        case 'VC_VERIFIED':
            return <Award className="w-4 h-4 text-amber-600" />;
        case 'ACCESS_GRANTED':
            return <ShieldCheck className="w-4 h-4 text-green-600" />;
        case 'ACCESS_DENIED':
            return <ShieldAlert className="w-4 h-4 text-red-500" />;
        case 'WALLET_CONNECTED':
            return <Wallet className="w-4 h-4 text-purple-600" />;
        default:
            return <Link2 className="w-4 h-4 text-slate-500" />;
    }
};

const badgeStyle = (type: string) => {
    switch (type) {
        case 'DID_CREATED':
        case 'DID_VERIFIED':
            return 'bg-indigo-100 text-indigo-700';
        case 'VC_ISSUED':
        case 'VC_VERIFIED':
            return 'bg-amber-100 text-amber-700';
        case 'ACCESS_GRANTED':
            return 'bg-green-100 text-green-700';
        case 'ACCESS_DENIED':
            return 'bg-red-100 text-red-700';
        case 'WALLET_CONNECTED':
            return 'bg-purple-100 text-purple-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
};

function resolveName(did: string): string {
    const identity = getAllDIDIdentities().find(i => i.fullDID === did || i.did === did);
    if (identity) return identity.name;
    if (did.includes('Issuer')) return 'BEL Trust Platform';
    return `${did.slice(0, 20)}…`;
}

export default function DIDActivityFeed() {
    const events = useMemo(
        () => getBlockchainEvents().slice(0, 6),
        []
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">DID & Credential Activity</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Live events from the blockchain ledger</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Live
                </span>
            </div>

            <div className="divide-y divide-slate-100">
                {events.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No blockchain events yet.
                    </div>
                )}
                {events.map(evt => (
                    <div key={evt.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            {eventIcon(evt.eventType)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-slate-800">{formatEventType(evt.eventType)}</p>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeStyle(evt.eventType)}`}>
                                    {evt.verificationResult === 'FAILURE' ? 'FAILED' : 'SUCCESS'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                {resolveName(evt.actorDID)} · Block #{evt.blockNumber}
                            </p>
                        </div>
                        <div className="text-right shrink-0 hidden sm:block">
                            <p className="text-[11px] text-slate-400">
                                {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <code className="text-[10px] font-mono text-slate-400">{evt.txHash.slice(0, 10)}…</code>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                <a href="/bel/audit-trail" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    View full audit trail →
                </a>
            </div>
        </div>
    );
}