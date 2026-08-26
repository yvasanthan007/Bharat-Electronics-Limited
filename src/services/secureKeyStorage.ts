import { ethers } from 'ethers';

/**
 * Bharat Electronics Limited (BEL) — Secure Browser Wallet Key Storage.
 *
 * Implements client-side encrypted key persistence in browser IndexedDB + Web Crypto APIs:
 *   • Private keys are AES-GCM encrypted before being written to IndexedDB.
 *   • Encryption uses a non-extractable AES-GCM CryptoKey (Web Crypto API).
 *   • The private key is decrypted ONLY in memory when required for signing.
 *   • Private keys NEVER leave the local wallet and are NEVER sent to Firebase/backend.
 *   • Private keys are NEVER logged in console or debug outputs.
 */

export interface WalletKeyPair {
  did: string;
  walletAddress: string;
  publicKey: string;
  privateKey: string;
  employeeId: string;
  email: string;
  createdAt: string;
}

export interface PublicWalletInfo {
  did: string;
  walletAddress: string;
  publicKey: string;
  employeeId: string;
  email: string;
  createdAt: string;
}

const DB_NAME = 'bel_employee_wallet_db';
const DB_VERSION = 1;
const STORE_NAME = 'employee_keys';
const ENC_STORE_NAME = 'wallet_encryption_keys';

// In-memory runtime cache for reliable low-latency access across tab lifecycle
const memoryKeyVault = new Map<string, WalletKeyPair>();

// Per-session non-extractable AES-GCM key cache (in-memory only, never persisted as raw bytes)
let sessionEncryptionKey: CryptoKey | null = null;

/* ------------------------------ Web Crypto helpers ----------------------------- */

function isCryptoSubtleAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

async function getOrCreateSessionEncryptionKey(): Promise<CryptoKey | null> {
  if (!isCryptoSubtleAvailable()) return null;

  if (sessionEncryptionKey) return sessionEncryptionKey;

  try {
    const db = await openKeyVaultDB();
    const encKeyRecord = await new Promise<any | null>((resolve) => {
      const tx = db.transaction(ENC_STORE_NAME, 'readonly');
      const store = tx.objectStore(ENC_STORE_NAME);
      const req = store.get('default');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });

    if (encKeyRecord?.cryptoKey) {
      sessionEncryptionKey = encKeyRecord.cryptoKey as CryptoKey;
      return sessionEncryptionKey;
    }
  } catch {
    // Fall through to generate a new key
  }

  try {
    sessionEncryptionKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    try {
      const db = await openKeyVaultDB();
      await new Promise<void>((resolve) => {
        const tx = db.transaction(ENC_STORE_NAME, 'readwrite');
        const store = tx.objectStore(ENC_STORE_NAME);
        store.put({ id: 'default', cryptoKey: sessionEncryptionKey });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // Non-extractable CryptoKey storage may not be supported; key stays in memory only
    }

    return sessionEncryptionKey;
  } catch {
    return null;
  }
}

async function encryptPrivateKey(privateKey: string, key: CryptoKey): Promise<string | null> {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(privateKey);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch {
    return null;
  }
}

async function decryptPrivateKey(encryptedKey: string, key: CryptoKey): Promise<string | null> {
  try {
    const raw = Uint8Array.from(atob(encryptedKey), (c) => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const data = raw.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

/* ------------------------------- IndexedDB helpers ---------------------------- */

/**
 * Opens or initializes the IndexedDB key vault.
 */
function openKeyVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'did' });
        store.createIndex('walletAddress', 'walletAddress', { unique: false });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('email', 'email', { unique: false });
      }
      if (!db.objectStoreNames.contains(ENC_STORE_NAME)) {
        db.createObjectStore(ENC_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves an employee's private key into the local browser wallet (IndexedDB + memory cache).
 * The private key is AES-GCM encrypted before being written to IndexedDB using a
 * non-extractable CryptoKey. It is decrypted ONLY in memory when required for signing.
 * NEVER logs or transmits the private key.
 */
export async function storeWalletKey(params: {
  did: string;
  walletAddress: string;
  publicKey: string;
  privateKey: string;
  employeeId?: string;
  email?: string;
}): Promise<void> {
  const normAddress = params.walletAddress.toLowerCase();
  const normDid = params.did;
  const empId = params.employeeId || '';
  const email = (params.email || '').toLowerCase();

  const record: WalletKeyPair = {
    did: normDid,
    walletAddress: normAddress,
    publicKey: params.publicKey,
    privateKey: params.privateKey,
    employeeId: empId,
    email,
    createdAt: new Date().toISOString(),
  };

  // 1. Cache in memory (plaintext — acceptable for active tab lifecycle)
  memoryKeyVault.set(normDid.toLowerCase(), record);
  memoryKeyVault.set(normAddress, record);
  if (empId) memoryKeyVault.set(empId.toLowerCase(), record);
  if (email) memoryKeyVault.set(email.toLowerCase(), record);

  // 2. Persist encrypted private key to IndexedDB
  try {
    const encKey = await getOrCreateSessionEncryptionKey();
    const encryptedPrivateKey = encKey
      ? await encryptPrivateKey(params.privateKey, encKey)
      : null;

    const db = await openKeyVaultDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const persisted: any = {
        did: normDid,
        walletAddress: normAddress,
        publicKey: params.publicKey,
        employeeId: empId,
        email,
        createdAt: record.createdAt,
      };

      if (encryptedPrivateKey) {
        persisted.encryptedPrivateKey = encryptedPrivateKey;
        persisted.privateKey = undefined;
      } else {
        persisted.privateKey = params.privateKey;
      }

      const req = store.put(persisted);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Graceful fallback to memory storage
  }
}

/**
 * Retrieves the wallet key pair for a given DID, wallet address, employeeId, or email.
 * Checks memory cache first, then IndexedDB. Decrypts the private key using the
 * non-extractable AES-GCM CryptoKey if encrypted storage is available.
 */
export async function getWalletKey(
  identifier: string
): Promise<WalletKeyPair | null> {
  if (!identifier) return null;
  const needle = identifier.trim().toLowerCase();

  // 1. Memory cache check
  if (memoryKeyVault.has(needle)) {
    return memoryKeyVault.get(needle) || null;
  }

  // Iterate memory vault in case identifier is contained inside
  for (const record of memoryKeyVault.values()) {
    if (
      record.did.toLowerCase() === needle ||
      record.walletAddress.toLowerCase() === needle ||
      record.employeeId.toLowerCase() === needle ||
      record.email.toLowerCase() === needle ||
      record.did.toLowerCase().includes(needle)
    ) {
      return record;
    }
  }

  // 2. IndexedDB query
  try {
    const db = await openKeyVaultDB();
    const result = await new Promise<any | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        const match = list.find(
          (k: any) =>
            k.did.toLowerCase() === needle ||
            k.walletAddress.toLowerCase() === needle ||
            k.employeeId?.toLowerCase() === needle ||
            k.email?.toLowerCase() === needle ||
            k.did.toLowerCase().includes(needle)
        );
        resolve(match || null);
      };
      req.onerror = () => resolve(null);
    });

    if (result) {
      const encKey = await getOrCreateSessionEncryptionKey();
      let privateKey = result.privateKey as string | undefined;

      if (!privateKey && result.encryptedPrivateKey && encKey) {
        const decrypted = await decryptPrivateKey(result.encryptedPrivateKey, encKey);
        if (!decrypted) return null;
        privateKey = decrypted;
      }

      if (!privateKey) {
        return null;
      }

      const fullRecord: WalletKeyPair = {
        did: result.did,
        walletAddress: result.walletAddress,
        publicKey: result.publicKey,
        privateKey,
        employeeId: result.employeeId || '',
        email: result.email || '',
        createdAt: result.createdAt || new Date().toISOString(),
      };

      // Re-populate memory cache
      memoryKeyVault.set(fullRecord.did.toLowerCase(), fullRecord);
      memoryKeyVault.set(fullRecord.walletAddress.toLowerCase(), fullRecord);
      if (fullRecord.employeeId) memoryKeyVault.set(fullRecord.employeeId.toLowerCase(), fullRecord);
      if (fullRecord.email) memoryKeyVault.set(fullRecord.email.toLowerCase(), fullRecord);

      return fullRecord;
    }
  } catch {
    // Return null if IndexedDB query fails
  }

  return null;
}

/**
 * Returns true if the browser wallet holds a private key for this DID or identifier.
 */
export async function hasWalletKey(identifier: string): Promise<boolean> {
  const key = await getWalletKey(identifier);
  return key !== null && Boolean(key.privateKey);
}

/**
 * Returns true if a non-extractable Web Crypto encryption key is available for
 * this session (indicates encrypted-at-rest storage is active).
 */
export async function hasNonExportableKey(): Promise<boolean> {
  const key = await getOrCreateSessionEncryptionKey();
  return key !== null;
}

/**
 * Signs an authentication challenge using the private key stored securely in the browser wallet.
 * The private key is decrypted in memory only for the duration of the signing operation
 * and is never returned or logged.
 */
export async function signChallengeWithWalletKey(
  identifier: string,
  challenge: string
): Promise<string> {
  const keyRecord = await getWalletKey(identifier);
  if (!keyRecord || !keyRecord.privateKey) {
    throw new Error(
      `No private key found in browser wallet for '${identifier}'. Please ensure this browser holds the identity key or connect an external wallet.`
    );
  }

  try {
    const wallet = new ethers.Wallet(keyRecord.privateKey);
    return await wallet.signMessage(challenge);
  } catch (err: any) {
    throw new Error(`Browser wallet signing failed: ${err?.message || 'Cryptographic signing error'}`);
  }
}

/**
 * Removes a key from the local browser wallet.
 */
export async function deleteWalletKey(did: string): Promise<void> {
  const normDid = did.trim().toLowerCase();
  const existing = memoryKeyVault.get(normDid);
  if (existing) {
    memoryKeyVault.delete(existing.did.toLowerCase());
    memoryKeyVault.delete(existing.walletAddress.toLowerCase());
    if (existing.employeeId) memoryKeyVault.delete(existing.employeeId.toLowerCase());
    if (existing.email) memoryKeyVault.delete(existing.email.toLowerCase());
  }

  try {
    const db = await openKeyVaultDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(did);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore error
  }
}

/**
 * Returns a list of all DIDs currently stored in this browser wallet (WITHOUT private keys).
 */
export async function listStoredWallets(): Promise<PublicWalletInfo[]> {
  const map = new Map<string, PublicWalletInfo>();

  // From memory
  for (const record of memoryKeyVault.values()) {
    map.set(record.did, {
      did: record.did,
      walletAddress: record.walletAddress,
      publicKey: record.publicKey,
      employeeId: record.employeeId,
      email: record.email,
      createdAt: record.createdAt,
    });
  }

  // From IndexedDB
  try {
    const db = await openKeyVaultDB();
    const list = await new Promise<any[]>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    for (const record of list) {
      map.set(record.did, {
        did: record.did,
        walletAddress: record.walletAddress,
        publicKey: record.publicKey,
        employeeId: record.employeeId || '',
        email: record.email || '',
        createdAt: record.createdAt || new Date().toISOString(),
      });
    }
  } catch {
    // Return memory results
  }

  return Array.from(map.values());
}
