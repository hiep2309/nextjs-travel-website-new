/**
 * One-time migration: normalize legacy posts to multilingual schema v2.
 *
 * Usage (requires Firebase Admin credentials or run from authenticated admin context):
 *   node scripts/migrate-posts-localized.mjs [--dry-run]
 *
 * Converts:
 *   title: string        → { vi: string }
 *   slug: string         → slugs: { vi, en, ko }
 *   drops writing name on next save (optional deleteField in admin SDK)
 *
 * Does NOT machine-translate missing en/ko — run after deploy or use Create Post re-save.
 */
import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

const DRY_RUN = process.argv.includes("--dry-run");

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

function normalizeStringField(raw, legacy) {
  if (raw && typeof raw === "object") return raw;
  const plain = (typeof raw === "string" ? raw : legacy)?.trim() || "";
  return plain ? { vi: plain } : { vi: "" };
}

function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "post"
  );
}

function buildSlugs(title, legacySlug) {
  if (legacySlug) {
    const base = legacySlug.trim();
    return { vi: base, en: base, ko: base };
  }
  const token = Date.now().toString(36);
  const vi = title?.vi || title?.en || "post";
  const slug = `${slugify(vi)}-${token}`;
  return { vi: slug, en: slug, ko: slug };
}

function buildSeo(title, description) {
  const seo = {};
  for (const loc of ["vi", "en", "ko"]) {
    const t = title?.[loc]?.trim();
    const d = description?.[loc]?.trim();
    if (t || d) {
      seo[loc] = {
        title: t ? `${t} | VN Insight` : undefined,
        description: d ? d.slice(0, 160) : undefined,
      };
    }
  }
  return seo;
}

async function main() {
  loadEnvLocal();
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!config.projectId) {
    console.error("Missing Firebase config in .env.local");
    process.exit(1);
  }

  const app = initializeApp(config);
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, "posts"));

  console.log(`Found ${snap.size} posts. dry-run=${DRY_RUN}`);

  let batch = writeBatch(db);
  let batchCount = 0;
  let migrated = 0;

  for (const d of snap.docs) {
    const data = d.data();
    const title = normalizeStringField(data.title, data.name);
    const description = normalizeStringField(data.description);
    const contentHtml = normalizeStringField(data.contentHtml);
    const slugs = data.slugs ?? buildSlugs(title, data.slug);
    const seo = data.seo ?? buildSeo(title, description);
    const needsUpdate =
      typeof data.title === "string" ||
      typeof data.description === "string" ||
      typeof data.contentHtml === "string" ||
      !data.slugs ||
      !data.seo ||
      !data.sourceLocale ||
      !data.translationStatus;

    if (!needsUpdate) continue;

    const patch = {
      title,
      description,
      contentHtml,
      slugs,
      seo,
      sourceLocale: data.sourceLocale ?? "vi",
      translationStatus: data.translationStatus ?? {
        vi: "published",
        en: data.title?.en ? "machine" : "draft",
        ko: data.title?.ko ? "machine" : "draft",
      },
    };

    console.log(`  migrate ${d.id}`);
    migrated += 1;

    if (!DRY_RUN) {
      batch.update(doc(db, "posts", d.id), patch);
      batchCount += 1;
      if (batchCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
  }

  if (!DRY_RUN && batchCount > 0) await batch.commit();
  console.log(`Done. ${migrated} document(s) ${DRY_RUN ? "would be" : ""} updated.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
