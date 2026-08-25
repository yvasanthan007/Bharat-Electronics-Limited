import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import {
    connectWallet as connectWalletService,
    disconnectWallet as disconnectWalletService,
    getSavedSession,
    getLinkedDID,
    subscribeToAccountChanges,
    WalletRejectedError,
    type WalletSession,
} from '../services/wallet';

interface WalletContextValue {
    address: string | null;
    isConnected: boolean;
    isDemo: boolean;
    isConnecting: boolean;
    error: string | null;
    linkedDID: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    refreshLinkedDID: () => void;
}

const WalletContext = createContext<WalletContextValue>({
    address: null,
    isConnected: false,
    isDemo: false,
    isConnecting: false,
    error: null,
    linkedDID: null,
    connect: async () => { },
    disconnect: () => { },
    refreshLinkedDID: () => { },
});

export function WalletProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<WalletSession | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [linkedDID, setLinkedDID] = useState<string | null>(null);

    // Restore session on mount + subscribe to wallet account changes
    useEffect(() => {
        const saved = getSavedSession();
        if (saved) {
            setSession(saved);
            setLinkedDID(getLinkedDID(saved.address) ?? null);
        }

        const unsubscribe = subscribeToAccountChanges((address) => {
            if (!address) {
                // User locked / disconnected the wallet in the extension
                setSession(null);
                setLinkedDID(null);
            } else {
                setSession(getSavedSession());
                setLinkedDID(getLinkedDID(address) ?? null);
            }
        });
        return unsubscribe;
    }, []);

    const refreshLinkedDID = useCallback(() => {
        if (session) {
            setLinkedDID(getLinkedDID(session.address) ?? null);
        }
    }, [session]);

    const connect = useCallback(async () => {
        setError(null);
        setIsConnecting(true);
        try {
            const s = await connectWalletService();
            setSession(s);
            setLinkedDID(getLinkedDID(s.address) ?? null);
        } catch (err: any) {
            if (err instanceof WalletRejectedError) {
                setError('Connection rejected — approve the request in your wallet to continue.');
            } else {
                setError(err?.message ?? 'Failed to connect wallet.');
            }
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        disconnectWalletService();
        setSession(null);
        setLinkedDID(null);
        setError(null);
    }, []);

    return (
        <WalletContext.Provider
            value={{
                address: session?.address ?? null,
                isConnected: !!session,
                isDemo: session?.isDemo ?? false,
                isConnecting,
                error,
                linkedDID,
                connect,
                disconnect,
                refreshLinkedDID,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet(): WalletContextValue {
    return useContext(WalletContext);
}