/**
 * Backfill Firestore posts → canonical `translations.{vi,en,ko}.{title,content}`.
 *
 * Usage:
 *   node scripts/backfill-post-translations.mjs [--dry-run] [--id POST_ID]
 *
 * Firebase config: `.env.local` → `.env` → `lib/firebaseConfig.ts` defaults.
 * Writes: Admin SDK if `FIREBASE_SERVICE_ACCOUNT_JSON` is set, else client SDK.
 */
import { getScriptFirestore } from "./lib/firebase-script.mjs";

const LOCALES = ["vi", "en", "ko"];
const DRY_RUN = process.argv.includes("--dry-run");
const idArgIndex = process.argv.indexOf("--id");
const SINGLE_ID = idArgIndex >= 0 ? process.argv[idArgIndex + 1]?.trim() : "";

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

function buildPatch(data, serverTimestamp) {
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

async function loadPostDocs(db, mode, singleId) {
  if (mode === "admin") {
    if (singleId) {
      const snap = await db.collection("posts").doc(singleId).get();
      if (!snap.exists) return null;
      return [{ id: snap.id, data: () => snap.data() }];
    }
    const snap = await db.collection("posts").get();
    return snap.docs.map((d) => ({ id: d.id, data: () => d.data() }));
  }

  const { collection, getDocs, doc, getDoc } = await import("firebase/firestore");
  if (singleId) {
    const snap = await getDoc(doc(db, "posts", singleId));
    if (!snap.exists()) return null;
    return [{ id: snap.id, data: () => snap.data() }];
  }
  const snap = await getDocs(collection(db, "posts"));
  return snap.docs.map((d) => ({ id: d.id, data: () => d.data() }));
}

async function main() {
  const { db, mode, serverTimestamp } = await getScriptFirestore();
  console.info(`[backfill] mode=${mode} dry-run=${DRY_RUN}`);

  const rawDocs = await loadPostDocs(db, mode, SINGLE_ID);
  if (rawDocs === null) {
    console.error(`Post not found: ${SINGLE_ID}`);
    process.exit(1);
  }

  console.log(`Scanning ${rawDocs.length} post(s).`);

  let batch = null;
  let batchCount = 0;
  let updated = 0;
  let skipped = 0;

  if (mode === "admin" && !DRY_RUN) {
    batch = db.batch();
  } else if (mode === "client" && !DRY_RUN) {
    const { writeBatch } = await import("firebase/firestore");
    batch = writeBatch(db);
  }

  for (const d of rawDocs) {
    const data = d.data();
    const patch = buildPatch(data, serverTimestamp);
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
      if (mode === "admin") {
        batch.update(db.collection("posts").doc(d.id), patch);
      } else {
        const { doc } = await import("firebase/firestore");
        batch.update(doc(db, "posts", d.id), patch);
      }
      batchCount += 1;
      if (batchCount >= 400) {
        await batch.commit();
        if (mode === "admin") {
          batch = db.batch();
        } else {
          const { writeBatch } = await import("firebase/firestore");
          batch = writeBatch(db);
        }
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
  if (e?.code === "permission-denied") {
    console.error(
      "\nFirestore permission denied.\n" +
        "Scripts need Admin credentials to read/write all posts.\n\n" +
        "1. Firebase Console → Project Settings → Service accounts → Generate new private key\n" +
        "2. Create `.env.local` in project root with either:\n" +
        "   FIREBASE_SERVICE_ACCOUNT_PATH=./your-service-account.json\n" +
        "   — or —\n" +
        "   FIREBASE_SERVICE_ACCOUNT_JSON={\"type\":\"service_account\",...}\n\n" +
        "3. Re-run: npm run backfill:translations:dry\n",
    );
  } else {
    console.error(e);
  }
  process.exit(1);
});
