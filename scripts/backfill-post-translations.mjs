/**
 * Backfill Firestore posts → canonical `translations.{vi,en,ko}.{title,content}`.
 *
 * Usage:
 *   node scripts/backfill-post-translations.mjs [--dry-run] [--id POST_ID]
 *
 * Requires Firebase config in `.env.local` (client SDK — rules must allow writes).
 * For production, prefer Admin SDK credentials via FIREBASE_SERVICE_ACCOUNT_JSON.
 */
import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

const LOCALES = ["vi", "en", "ko"];
const DRY_RUN = process.argv.includes("--dry-run");
const idArgIndex = process.argv.indexOf("--id");
const SINGLE_ID = idArgIndex >= 0 ? process.argv[idArgIndex + 1]?.trim() : "";

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

function normalizeLocalizedString(raw, legacyFallback) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const map = raw;
    const out = {};
    for (const loc of LOCALES) {
      const v = map[loc];
      if (typeof v === "string" && v.trim()) out[loc] = v.trim();
    }
    if (Object.keys(out).length > 0) return out;
  }
  const plain =
    (typeof raw === "string" ? raw : legacyFallback)?.trim() ||
    (typeof raw === "number" ? String(raw) : "") ||
    "";
  return plain ? { vi: plain } : { vi: "" };
}

function plainTextExcerpt(html, max = 160) {
  const text = String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function buildTranslationsFromLegacyMaps(title, contentHtml, description) {
  const out = {};
  for (const loc of LOCALES) {
    const t = title?.[loc]?.trim() ?? "";
    const c = contentHtml?.[loc]?.trim() ?? "";
    const d = description?.[loc]?.trim() ?? "";
    if (t || c) {
      out[loc] = { title: t, content: c };
    } else if (d) {
      out[loc] = { title: t, content: `<p>${d}</p>` };
    }
  }
  return out;
}

function normalizeArticleTranslations(raw, title, contentHtml, description) {
  const legacy = buildTranslationsFromLegacyMaps(title, contentHtml, description);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return legacy;
  }

  const parsed = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!LOCALES.includes(key)) continue;
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;

    const entryTitle = typeof value.title === "string" ? value.title.trim() : "";
    const entryContent =
      typeof value.content === "string"
        ? value.content.trim()
        : typeof value.contentHtml === "string"
          ? value.contentHtml.trim()
          : typeof value.description === "string" && !entryTitle
            ? `<p>${value.description.trim()}</p>`
            : "";

    if (entryTitle || entryContent) {
      parsed[key] = { title: entryTitle, content: entryContent };
    }
  }

  const out = {};
  for (const loc of LOCALES) {
    const p = parsed[loc];
    const l = legacy[loc];
    if (!p && !l) continue;
    out[loc] = {
      title: p?.title?.trim() || l?.title?.trim() || "",
      content: p?.content?.trim() || l?.content?.trim() || "",
    };
  }
  return out;
}

function deriveLocalizedMapsFromTranslations(translations) {
  const title = {};
  const description = {};
  const contentHtml = {};
  for (const loc of LOCALES) {
    const entry = translations[loc];
    if (!entry) continue;
    if (entry.title?.trim()) title[loc] = entry.title.trim();
    if (entry.content?.trim()) {
      contentHtml[loc] = entry.content.trim();
      description[loc] = plainTextExcerpt(entry.content);
    }
  }
  return { title, description, contentHtml };
}

function translationsNeedUpdate(existing, canonical) {
  if (!existing || typeof existing !== "object" || Array.isArray(existing)) return true;
  for (const loc of LOCALES) {
    const e = existing[loc];
    const c = canonical[loc];
    if (!c) continue;
    const eTitle = typeof e?.title === "string" ? e.title.trim() : "";
    const eContent =
      typeof e?.content === "string"
        ? e.content.trim()
        : typeof e?.contentHtml === "string"
          ? e.contentHtml.trim()
          : "";
    if (eTitle !== c.title || eContent !== c.content) return true;
    if (typeof e?.description === "string") return true;
  }
  return Object.keys(canonical).length > 0 && !existing.vi;
}

function buildPatch(data) {
  const legacyName = typeof data.name === "string" ? data.name : undefined;
  const title = normalizeLocalizedString(data.title, legacyName);
  if (!title.vi && legacyName) title.vi = legacyName;
  const description = normalizeLocalizedString(data.description);
  const contentHtml = normalizeLocalizedString(data.contentHtml);

  const translations = normalizeArticleTranslations(
    data.translations,
    title,
    contentHtml,
    description,
  );

  if (!Object.keys(translations).length) {
    return null;
  }

  const derived = deriveLocalizedMapsFromTranslations(translations);

  return {
    translations,
    title: Object.keys(derived.title).length ? derived.title : title,
    description: Object.keys(derived.description).length ? derived.description : description,
    contentHtml: Object.keys(derived.contentHtml).length ? derived.contentHtml : contentHtml,
    sourceLocale: data.sourceLocale ?? "vi",
    updatedAt: serverTimestamp(),
  };
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

  const docs = [];
  if (SINGLE_ID) {
    const snap = await getDoc(doc(db, "posts", SINGLE_ID));
    if (!snap.exists()) {
      console.error(`Post not found: ${SINGLE_ID}`);
      process.exit(1);
    }
    docs.push(snap);
  } else {
    const snap = await getDocs(collection(db, "posts"));
    docs.push(...snap.docs);
  }

  console.log(`Scanning ${docs.length} post(s). dry-run=${DRY_RUN}`);

  let batch = writeBatch(db);
  let batchCount = 0;
  let updated = 0;
  let skipped = 0;

  for (const d of docs) {
    const data = d.data();
    const patch = buildPatch(data);
    if (!patch) {
      skipped += 1;
      continue;
    }

    if (!translationsNeedUpdate(data.translations, patch.translations)) {
      skipped += 1;
      continue;
    }

    console.log(`  update ${d.id}`);
    updated += 1;

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
  console.log(
    `Done. ${updated} updated, ${skipped} skipped${DRY_RUN ? " (dry-run — no writes)" : ""}.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
