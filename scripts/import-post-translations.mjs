/**
 * Import pre-written post translations from JSON (no AI).
 *
 * File format:
 * {
 *   "POST_ID": {
 *     "en": { "title": "...", "content": "<p>…</p>" },
 *     "ko": { "title": "...", "content": "<p>…</p>" }
 *   }
 * }
 *
 * Usage:
 *   node scripts/import-post-translations.mjs translations.json [--dry-run]
 */
import { readFileSync } from "node:fs";
import { getScriptFirestore, loadScriptEnv } from "./lib/firebase-script.mjs";

const DRY_RUN = process.argv.includes("--dry-run");
const fileArg = process.argv.find((a) => a.endsWith(".json"));

function buildPatch(viTitle, viContent, entry) {
  const title = { vi: viTitle };
  const contentHtml = { vi: viContent };
  const translations = { vi: { title: viTitle, content: viContent } };

  for (const loc of ["en", "ko"]) {
    const block = entry?.[loc];
    if (!block?.title?.trim() || !block?.content?.trim()) continue;
    title[loc] = block.title.trim();
    contentHtml[loc] = block.content.trim();
    translations[loc] = { title: title[loc], content: contentHtml[loc] };
  }

  return { translations, title, contentHtml };
}

function pickVi(field, legacy) {
  if (field && typeof field === "object") return field.vi?.trim() || "";
  return (typeof field === "string" ? field : legacy)?.trim() || "";
}

async function main() {
  loadScriptEnv();
  if (!fileArg) {
    console.error("Usage: node scripts/import-post-translations.mjs translations.json [--dry-run]");
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(fileArg, "utf8"));
  const { db, mode, serverTimestamp } = await getScriptFirestore();
  console.info(`[import] mode=${mode} dry-run=${DRY_RUN} file=${fileArg}`);

  let updated = 0;
  let skipped = 0;

  for (const [postId, entry] of Object.entries(raw)) {
    if (!entry || typeof entry !== "object") {
      skipped += 1;
      continue;
    }

    let snap;
    if (mode === "admin") {
      snap = await db.collection("posts").doc(postId).get();
    } else {
      const { doc, getDoc } = await import("firebase/firestore");
      snap = await getDoc(doc(db, "posts", postId));
    }

    if (!snap.exists) {
      console.warn(`Skip ${postId}: not found`);
      skipped += 1;
      continue;
    }

    const data = snap.data();
    const viTitle = pickVi(data.title, data.name);
    const viContent = pickVi(data.contentHtml);
    if (!viTitle || !viContent) {
      console.warn(`Skip ${postId}: missing Vietnamese source`);
      skipped += 1;
      continue;
    }

    const patch = buildPatch(viTitle, viContent, entry);
    console.log(`  update ${postId}`);
    updated += 1;

    if (!DRY_RUN) {
      const fullPatch = { ...patch, updatedAt: serverTimestamp() };
      if (mode === "admin") {
        await db.collection("posts").doc(postId).update(fullPatch);
      } else {
        const { doc, updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "posts", postId), fullPatch);
      }
    }
  }

  console.log(`Done. updated=${updated} skipped=${skipped}${DRY_RUN ? " (dry-run)" : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
