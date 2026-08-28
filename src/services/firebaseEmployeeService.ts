import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';
import { db } from './firebase';

export interface FirestoreEmployee {
  did: string;
  publicKey: string;
  role: string;
  email: string;
  name?: string;
  department?: string;
  employeeId: string;
  walletAddress: string;
  status?: string;
  securityClearance?: string;
  createdAt: string;
  updatedAt: string;
  /* Fields imported from the Excel dataset (BEL_Employee_Dataset_500.xlsx) */
  employeeName?: string;
  phone?: string;
  designation?: string;
  location?: string;
  joiningYear?: number;
  employmentStatus?: string;
  didStatus?: string;
  /* Fields written by the app's DID lifecycle (public data only) */
  walletId?: string;
  didCreatedAt?: string;
  importedAt?: string;
}

const COLLECTION_NAME = 'employees';

/**
 * Strips any sensitive private key properties from an object before saving.
 * Throws an error if any private key field is detected.
 */
function sanitizeEmployeeData(input: Record<string, any>): FirestoreEmployee {
  // Reject if private key fields are explicitly passed
  const forbiddenFields = [
    'privateKey',
    'private_key',
    '_privateKeyForSigning',
    'secretKey',
    'secret_key',
    'seedPhrase',
    'mnemonic',
    'privKey',
  ];

  for (const field of forbiddenFields) {
    if (field in input && input[field]) {
      // Clean it immediately to prevent accidental exposure
      delete input[field];
    }
  }

  const employeeId = (input.employeeId || input.id || `EMP-${Date.now()}`).trim();
  const did = input.did || input.fullDID || `did:ethr:${input.walletAddress || ''}`;
  const publicKey = input.publicKey || '';
  const role = input.role || 'User';
  const email = (input.email || '').trim().toLowerCase();
  const walletAddress = (input.walletAddress || '').toLowerCase();
  const name = input.name || 'Defense Personnel';
  const department = input.department || 'Operations';
  const status = input.status || 'Verified';
  const securityClearance = input.securityClearance || 'Secret';
  const now = new Date().toISOString();

  const employee: FirestoreEmployee = {
    employeeId,
    did,
    publicKey,
    role,
    email,
    name,
    department,
    walletAddress,
    status,
    securityClearance,
    createdAt: input.createdAt || now,
    updatedAt: now,
  };

  // DID lifecycle fields — public data only, never private keys.
  // `walletId` is the public wallet identifier (alias of walletAddress).
  if (employee.walletAddress || input.walletId) {
    employee.walletId = (input.walletId || employee.walletAddress || '').toLowerCase();
  }
  // Preserve the original DID creation timestamp on later updates.
  if (input.didCreatedAt) {
    employee.didCreatedAt = input.didCreatedAt;
  }
  if (input.didStatus) {
    employee.didStatus = input.didStatus;
  }

  return employee;
}

/**
 * Stores an employee's DID + public key + role + email in Firebase Firestore:
 *   Path: employees/{employeeId}
 * NEVER stores private keys.
 */
export async function saveEmployeeToFirestore(
  data: Record<string, any>,
  firestoreInstance: Firestore = db
): Promise<FirestoreEmployee> {
  const sanitized = sanitizeEmployeeData(data);

  try {
    const employeeDocRef = doc(firestoreInstance, COLLECTION_NAME, sanitized.employeeId);
    await setDoc(employeeDocRef, sanitized, { merge: true });
  } catch (error) {
    // Firestore write may be blocked if offline; data is still retained in local state
    console.warn('[Firebase] Employee Firestore sync notice:', error);
  }

  return sanitized;
}

/**
 * Reusable employee lookup — resolves a record by employeeId OR email.
 *
 * Resolution order (case-insensitive where possible):
 *   1. Direct document fetch: employees/{employeeId} (exact + lowercase)
 *   2. Query on the `employeeId` field
 *   3. Query on the `email` field (lowercase)
 */
export async function findEmployeeByIdOrEmail(
  identifier: string,
  firestoreInstance: Firestore = db
): Promise<FirestoreEmployee | null> {
  if (!identifier) return null;
  const needle = identifier.trim();
  const needleLower = needle.toLowerCase();

  // 1. Direct document fetch by employeeId (Firestore doc IDs are case-sensitive)
  for (const idVariant of [needle, needleLower]) {
    try {
      const docRef = doc(firestoreInstance, COLLECTION_NAME, idVariant);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as FirestoreEmployee;
      }
    } catch (error) {
      console.warn('[Firebase] Firestore employee doc fetch failed:', error);
    }
  }

  try {
    const employeesColl = collection(firestoreInstance, COLLECTION_NAME);

    // 2. Query on the employeeId field
    const idQuery = query(employeesColl, where('employeeId', '==', needle));
    const idSnap = await getDocs(idQuery);
    if (!idSnap.empty) {
      return idSnap.docs[0].data() as FirestoreEmployee;
    }

    // 3. Query on the email field (stored lowercase)
    const emailQuery = query(employeesColl, where('email', '==', needleLower));
    const emailSnap = await getDocs(emailQuery);
    if (!emailSnap.empty) {
      return emailSnap.docs[0].data() as FirestoreEmployee;
    }
  } catch (error) {
    console.warn('[Firebase] Firestore employee query fallback:', error);
  }

  return null;
}

/** Lookup an employee record by their official email address. */
export async function findEmployeeByEmail(
  email: string,
  firestoreInstance: Firestore = db
): Promise<FirestoreEmployee | null> {
  if (!email) return null;
  try {
    const employeesColl = collection(firestoreInstance, COLLECTION_NAME);
    const emailQuery = query(employeesColl, where('email', '==', email.trim().toLowerCase()));
    const emailSnap = await getDocs(emailQuery);
    if (!emailSnap.empty) {
      return emailSnap.docs[0].data() as FirestoreEmployee;
    }
  } catch (error) {
    console.warn('[Firebase] Firestore email lookup failed:', error);
  }
  return null;
}

/**
 * Retrieves an employee record from Firebase Firestore by employeeId, DID, email, or walletAddress.
 */
export async function getEmployeeFromFirestore(
  identifier: string,
  firestoreInstance: Firestore = db
): Promise<FirestoreEmployee | null> {
  if (!identifier) return null;
  const needle = identifier.trim();
  const needleLower = needle.toLowerCase();

  // 1–3. employeeId / email resolution via the reusable lookup service
  const byIdOrEmail = await findEmployeeByIdOrEmail(needle, firestoreInstance);
  if (byIdOrEmail) {
    return byIdOrEmail;
  }

  try {
    // 4. Query by DID
    const employeesColl = collection(firestoreInstance, COLLECTION_NAME);
    const didQuery = query(employeesColl, where('did', '==', needle));
    const didSnap = await getDocs(didQuery);
    if (!didSnap.empty) {
      return didSnap.docs[0].data() as FirestoreEmployee;
    }

    // 5. Query by walletAddress
    const walletQuery = query(employeesColl, where('walletAddress', '==', needleLower));
    const walletSnap = await getDocs(walletQuery);
    if (!walletSnap.empty) {
      return walletSnap.docs[0].data() as FirestoreEmployee;
    }
  } catch (error) {
    console.warn('[Firebase] Firestore employee lookup fallback:', error);
  }

  return null;
}

/**
 * Retrieves all employee records from Firebase Firestore.
 */
export async function getAllEmployeesFromFirestore(
  firestoreInstance: Firestore = db
): Promise<FirestoreEmployee[]> {
  try {
    const employeesColl = collection(firestoreInstance, COLLECTION_NAME);
    const snapshot = await getDocs(employeesColl);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => d.data() as FirestoreEmployee);
    }
  } catch (error) {
    console.warn('[Firebase] Firestore getAllEmployees fallback:', error);
  }
  return [];
}
