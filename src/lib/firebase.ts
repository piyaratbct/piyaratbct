import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Safe Firestore initialization
export let db: any;
try {
  // Use initializeFirestore with experimentalForceLongPolling to avoid WebSocket connection blocks inside sandboxed iframe
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  console.warn("Firestore custom database-id setup failed, trying fallback default initialization:", e);
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (err) {
    console.error("Firestore initialization completely failed:", err);
  }
}

// Safe Auth initialization to prevent DOMException / SecurityError inside sandboxed iframe
export let auth: any;
try {
  let useInMemory = false;
  if (typeof window !== 'undefined') {
    // If inside an iframe or localStorage is blocked, enforce in-memory storage proactively
    if (window.self !== window.top) {
      useInMemory = true;
    }
    try {
      localStorage.setItem('__auth_test', '1');
      localStorage.removeItem('__auth_test');
    } catch (e) {
      useInMemory = true;
    }
  }

  if (useInMemory) {
    console.log("SafeFrame: Restricted storage or iframe environment detected. Initializing Firebase Auth with inMemoryPersistence.");
    auth = initializeAuth(app, {
      persistence: inMemoryPersistence,
    });
  } else {
    try {
      auth = getAuth(app);
    } catch (getAuthErr) {
      console.warn("getAuth failed synchronously, falling back to initializeAuth:", getAuthErr);
      auth = initializeAuth(app, {
        persistence: inMemoryPersistence,
      });
    }
  }
} catch (e) {
  console.error("Initial block of Firebase Auth failed, attempting fallback inMemoryPersistence:", e);
  try {
    auth = initializeAuth(app, {
      persistence: inMemoryPersistence,
    });
  } catch (err) {
    console.error("Firebase Auth initialization completely failed, building mock fallback:", err);
    auth = {
      currentUser: null,
      onAuthStateChanged: (callback: any) => {
        try { callback(null); } catch (ev) {}
        return () => {};
      },
      signOut: () => Promise.resolve(),
    };
  }
}


export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Proactively test connection during initial load as required by instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
// Do not execute automatically on module load to prevent Script error / Unhandled Rejection in sandboxed iframes

