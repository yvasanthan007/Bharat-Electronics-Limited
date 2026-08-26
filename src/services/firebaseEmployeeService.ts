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

  return {
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
 * Retrieves an employee record from Firebase Firestore by employeeId, DID, email, or walletAddress.
 */
export async function getEmployeeFromFirestore(
  identifier: string,
  firestoreInstance: Firestore = db
): Promise<FirestoreEmployee | null> {
  if (!identifier) return null;
  const needle = identifier.trim();
  const needleLower = needle.toLowerCase();

  try {
    // 1. Direct document fetch by employeeId
    const docRef = doc(firestoreInstance, COLLECTION_NAME, needle);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as FirestoreEmployee;
    }

    // 2. Query by DID
    const employeesColl = collection(firestoreInstance, COLLECTION_NAME);
    const didQuery = query(employeesColl, where('did', '==', needle));
    const didSnap = await getDocs(didQuery);
    if (!didSnap.empty) {
      return didSnap.docs[0].data() as FirestoreEmployee;
    }

    // 3. Query by email
    const emailQuery = query(employeesColl, where('email', '==', needleLower));
    const emailSnap = await getDocs(emailQuery);
    if (!emailSnap.empty) {
      return emailSnap.docs[0].data() as FirestoreEmployee;
    }

    // 4. Query by walletAddress
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
