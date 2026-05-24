import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig } from "@/lib/firebaseConfig";

let adminApp: App | null = null;

function initAdminApp(): App | null {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (raw) {
    try {
      const serviceAccount = JSON.parse(raw) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };
      adminApp = initializeApp({
        credential: cert(serviceAccount as Parameters<typeof cert>[0]),
        projectId: serviceAccount.project_id ?? firebaseConfig.projectId,
      });
      return adminApp;
    } catch (err) {
      console.warn("[firebaseAdmin] Invalid FIREBASE_SERVICE_ACCOUNT_JSON:", err);
    }
  }

  try {
    adminApp = initializeApp({ projectId: firebaseConfig.projectId });
    return adminApp;
  } catch {
    return null;
  }
}

export function getAdminApp(): App | null {
  return initAdminApp();
}

export function getAdminFirestore() {
  const app = initAdminApp();
  return app ? getFirestore(app) : null;
}

export function getAdminAuth() {
  const app = initAdminApp();
  return app ? getAuth(app) : null;
}

export function isAdminFirestoreAvailable(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim());
}
