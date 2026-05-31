/**
 * Shared Firebase bootstrap for Node scripts.
 * Loads `.env.local` / `.env`, then falls back to `lib/firebaseConfig.ts`.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp as initClientApp } from "firebase/app";
import { getFirestore as getClientFirestore } from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

/** Same values as `lib/firebaseConfig.ts` — used when env vars are absent. */
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBfQOD4mloHI53IMZM8K3JMAN4m1Rlatm0",
  authDomain: "vietnam-insight.firebaseapp.com",
  projectId: "vietnam-insight",
  storageBucket: "vietnam-insight.firebasestorage.app",
  messagingSenderId: "138579778908",
  appId: "1:138579778908:web:3024fb1731c22fdecff599",
};

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  try {
    const raw = readFileSync(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* ignore */
  }
}

function loadServiceAccountJson() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) return inline;

  const pathValue = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (!pathValue) return null;

  const resolved = pathValue.startsWith("/") || /^[A-Za-z]:/.test(pathValue)
    ? pathValue
    : join(ROOT, pathValue);

  if (!existsSync(resolved)) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT_PATH not found: ${resolved}`);
  }
  return readFileSync(resolved, "utf8");
}

/** Load env files then resolve Firebase client config. */
export function loadScriptEnv() {
  parseEnvFile(join(ROOT, ".env.local"));
  parseEnvFile(join(ROOT, ".env"));
}

export function resolveFirebaseClientConfig() {
  loadScriptEnv();

  const fromEnv = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const projectId = fromEnv.projectId || DEFAULT_FIREBASE_CONFIG.projectId;
  if (!projectId) return null;

  return {
    apiKey: fromEnv.apiKey || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: fromEnv.authDomain || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId,
    storageBucket: fromEnv.storageBucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: fromEnv.messagingSenderId || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: fromEnv.appId || DEFAULT_FIREBASE_CONFIG.appId,
  };
}

let adminDbPromise = null;

/** Admin Firestore when `FIREBASE_SERVICE_ACCOUNT_JSON` is set. */
async function getAdminFirestore() {
  loadScriptEnv();
  const raw = loadServiceAccountJson();
  if (!raw) return null;

  if (!adminDbPromise) {
    adminDbPromise = (async () => {
      const { cert, getApps, initializeApp } = await import("firebase-admin/app");
      const { getFirestore } = await import("firebase-admin/firestore");

      const serviceAccount = JSON.parse(raw);
      if (!getApps().length) {
        initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id ?? DEFAULT_FIREBASE_CONFIG.projectId,
        });
      }
      return getFirestore();
    })();
  }

  return adminDbPromise;
}

let clientDb = null;

function getClientDb(config) {
  if (!clientDb) {
    clientDb = getClientFirestore(initClientApp(config));
  }
  return clientDb;
}

/**
 * Firestore for scripts — prefers Admin SDK, falls back to client SDK + firebaseConfig.
 * @returns {{ db: import('firebase-admin/firestore').Firestore | import('firebase/firestore').Firestore, mode: 'admin' | 'client', serverTimestamp: () => unknown }}
 */
export async function getScriptFirestore() {
  const adminDb = await getAdminFirestore();
  if (adminDb) {
    const { FieldValue } = await import("firebase-admin/firestore");
    return {
      db: adminDb,
      mode: "admin",
      serverTimestamp: () => FieldValue.serverTimestamp(),
    };
  }

  const config = resolveFirebaseClientConfig();
  if (!config?.projectId) {
    throw new Error(
      "Missing Firebase config. Set NEXT_PUBLIC_FIREBASE_* in .env.local or rely on lib/firebaseConfig.ts defaults.",
    );
  }

  console.warn(
    "[firebase-script] No Admin credentials — using client SDK. Batch writes may fail with permission-denied.\n" +
      "  Add FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH to .env.local for scripts.",
  );
  const { serverTimestamp } = await import("firebase/firestore");
  console.info(`[firebase-script] Client SDK (project: ${config.projectId})`);
  return {
    db: getClientDb(config),
    mode: "client",
    serverTimestamp,
  };
}
