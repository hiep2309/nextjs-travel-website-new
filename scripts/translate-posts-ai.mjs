/**
 * Batch AI translation for Firestore posts via /api/translate/post.
 *
 * Usage:
 *   npm run dev   # in another terminal
 *   node scripts/translate-posts-ai.mjs [--dry-run] [--id=POST_ID]
 *
 * Env (from .env.local):
 *   NEXT_PUBLIC_SITE_URL=http://localhost:3000
 *   Firebase client config (same as migrate script)
 */
import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";

const DRY_RUN = process.argv.includes("--dry-run");
const ID_FILTER = process.argv.find((a) => a.startsWith("--id="))?.slice(5);

function loadEnvLocal() {
  try {
    const raw = readFileSync(".env.local", "utf8");
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

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickVi(field, legacy) {
  if (field && typeof field === "object" && !Array.isArray(field)) {
    return field.vi?.trim() || field.en?.trim() || "";
  }
  return (typeof field === "string" ? field : legacy)?.trim() || "";
}

function needsTranslation(data) {
  const title = data.title;
  if (!title || typeof title !== "object") return true;
  return !title.en?.trim() || !title.ko?.trim();
}

async function translateViaApi(baseUrl, body) {
  const res = await fetch(`${baseUrl}/api/translate/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || res.statusText);
  return json.payload;
}

async function main() {
  loadEnvLocal();
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!firebaseConfig.projectId) {
    console.error("Missing Firebase config in .env.local");
    process.exit(1);
  }

  console.log(`Site: ${baseUrl}`);
  console.log(DRY_RUN ? "[DRY RUN]" : "[LIVE]");

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, "posts"));

  let updated = 0;
  let skipped = 0;

  for (const d of snap.docs) {
    if (ID_FILTER && d.id !== ID_FILTER) continue;
    const data = d.data();
    if (!needsTranslation(data)) {
      skipped += 1;
      continue;
    }

    const title = pickVi(data.title, data.name);
    const description = pickVi(data.description, "") || title;
    const contentHtml = pickVi(data.contentHtml, "");
    const plain = stripHtml(contentHtml);

    if (!title || !plain) {
      console.warn(`Skip ${d.id}: missing title or content`);
      skipped += 1;
      continue;
    }

    console.log(`Translating ${d.id}: ${title.slice(0, 50)}…`);

    if (DRY_RUN) {
      updated += 1;
      continue;
    }

    try {
      const payload = await translateViaApi(baseUrl, {
        title,
        description,
        contentHtml,
        sourceLocale: data.sourceLocale || "vi",
        existingSlugs: data.slugs,
      });

      await updateDoc(doc(db, "posts", d.id), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      updated += 1;
      console.log(`  ✓ ${d.id}`);
    } catch (err) {
      console.error(`  ✗ ${d.id}:`, err.message || err);
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`Done. translated=${updated} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
