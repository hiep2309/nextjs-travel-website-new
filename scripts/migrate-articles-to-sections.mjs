/**
 * Backfill structured `sections` for every article in `posts`.
 *
 * Parses each post's canonical Vietnamese HTML into language-neutral blocks
 * (heading / paragraph / image / list / quote / divider), then aligns existing
 * EN/KO HTML block-by-block so the layout is identical across locales. Images,
 * embedded media, ordering and spacing are preserved. No content is discarded.
 *
 * Blocks with no EN/KO match are left vi-only and fall back to vi at render;
 * run `translateMissingSections()` (or /api/admin/batch-translate-posts) after.
 *
 * Usage:
 *   node scripts/migrate-articles-to-sections.mjs [--dry-run] [--force] [--id=<postId>] [--limit=N]
 *
 *   --dry-run   parse + report, write nothing
 *   --force     re-migrate posts that already have `sections`
 *   --id=ID     migrate a single post
 *   --limit=N   stop after N candidate posts
 */
import { getScriptFirestore } from "./lib/firebase-script.mjs";

const LOCALES = ["vi", "en", "ko"];
const DEFAULT_LOCALE = "vi";
const SECTIONS_VERSION = 1;

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run");
const FORCE = argv.includes("--force");
const ONLY_ID = (argv.find((a) => a.startsWith("--id=")) ?? "").split("=")[1] ?? "";
const LIMIT = Number((argv.find((a) => a.startsWith("--limit=")) ?? "").split("=")[1]) || Infinity;

/* ------------------------------- parsing ------------------------------- */

const BLOCK_RE =
  /<(h[1-6]|p|ul|ol|blockquote|figure)\b([^>]*)>([\s\S]*?)<\/\1>|<hr\b[^>]*\/?>|<img\b([^>]*?)\/?>/gi;
const LI_RE = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
const IMG_RE = /<img\b([^>]*?)\/?>/i;
const FIGCAPTION_RE = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i;

function extractAttr(attrs, name) {
  const m = (attrs || "").match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return (m?.[2] ?? m?.[3] ?? "").trim();
}
const cleanInline = (html) => (html || "").replace(/\s+/g, " ").trim();
const stripTags = (html) =>
  (html || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/** HTML → flat blocks for one locale; ids are stable (`b0`, `b1`, …). */
function htmlToSections(html) {
  const source = (html || "").trim();
  if (!source) return [];
  const sections = [];
  let i = 0;
  const id = () => `b${i++}`;

  BLOCK_RE.lastIndex = 0;
  let m;
  while ((m = BLOCK_RE.exec(source)) !== null) {
    const full = m[0];
    const tag = m[1]?.toLowerCase();
    const attrs = m[2] ?? "";
    const inner = m[3] ?? "";

    if (!tag && /^<hr/i.test(full)) {
      sections.push({ id: id(), type: "divider" });
      continue;
    }
    if (!tag && /^<img/i.test(full)) {
      const src = extractAttr(m[4] ?? "", "src");
      if (src) {
        const alt = stripTags(extractAttr(m[4] ?? "", "alt"));
        sections.push({ id: id(), type: "image", src, ...(alt ? { alt: { vi: alt } } : {}) });
      }
      continue;
    }
    if (!tag) continue;

    if (/^h[1-6]$/.test(tag)) {
      const lvl = Number(tag.slice(1));
      const level = lvl <= 2 ? 2 : lvl >= 4 ? 4 : 3;
      const text = cleanInline(inner);
      if (text) sections.push({ id: id(), type: "heading", level, translations: { vi: text } });
      continue;
    }
    if (tag === "p") {
      const img = inner.match(IMG_RE);
      const rest = inner.replace(IMG_RE, "").trim();
      if (img && !stripTags(rest)) {
        const src = extractAttr(img[1] ?? "", "src");
        if (src) {
          const alt = stripTags(extractAttr(img[1] ?? "", "alt"));
          sections.push({ id: id(), type: "image", src, ...(alt ? { alt: { vi: alt } } : {}) });
          continue;
        }
      }
      const text = cleanInline(inner);
      if (text) sections.push({ id: id(), type: "paragraph", translations: { vi: text } });
      continue;
    }
    if (tag === "ul" || tag === "ol") {
      const items = [];
      LI_RE.lastIndex = 0;
      let li;
      while ((li = LI_RE.exec(inner)) !== null) {
        const it = cleanInline(li[1] ?? "");
        if (it) items.push(it);
      }
      if (items.length)
        sections.push({ id: id(), type: "list", ordered: tag === "ol", translations: { vi: items } });
      continue;
    }
    if (tag === "blockquote") {
      const text = cleanInline(inner.replace(/<\/?p\b[^>]*>/gi, " "));
      if (text) sections.push({ id: id(), type: "quote", translations: { vi: text } });
      continue;
    }
    if (tag === "figure") {
      const img = inner.match(IMG_RE);
      const src = img ? extractAttr(img[1] ?? "", "src") : "";
      if (src) {
        const cap = inner.match(FIGCAPTION_RE);
        const caption = cap ? cleanInline(cap[1] ?? "") : "";
        const alt = stripTags(extractAttr(img?.[1] ?? "", "alt"));
        sections.push({
          id: id(),
          type: "image",
          src,
          ...(alt ? { alt: { vi: alt } } : {}),
          ...(caption ? { caption: { vi: caption } } : {}),
        });
      }
      continue;
    }
  }
  return sections;
}

const shapeOf = (s) => (s.type === "image" ? `image:${s.src}` : s.type === "list" ? `list:${s.ordered ? "o" : "u"}` : s.type);

function mergeLocale(target, src, loc) {
  if (target.type !== src.type) return;
  if (target.type === "list") {
    if (src.translations?.vi?.length) target.translations[loc] = src.translations.vi;
  } else if (["heading", "paragraph", "quote"].includes(target.type)) {
    const t = src.translations?.vi;
    if (t && t.trim()) target.translations[loc] = t.trim();
  } else if (target.type === "image") {
    if (src.caption?.vi?.trim()) target.caption = { ...(target.caption ?? {}), [loc]: src.caption.vi.trim() };
    if (src.alt?.vi?.trim()) target.alt = { ...(target.alt ?? {}), [loc]: src.alt.vi.trim() };
  }
}

function deriveSections(htmlByLocale) {
  const base = htmlToSections(htmlByLocale[DEFAULT_LOCALE] ?? "");
  if (!base.length) return [];
  for (const loc of LOCALES) {
    if (loc === DEFAULT_LOCALE) continue;
    const html = htmlByLocale[loc];
    if (!html || !html.trim()) continue;
    const ls = htmlToSections(html);
    const same = ls.length === base.length && base.every((b, i) => shapeOf(b) === shapeOf(ls[i]));
    if (!same) continue;
    base.forEach((b, i) => mergeLocale(b, ls[i], loc));
  }
  return base;
}

/* --------------------------- locale HTML source --------------------------- */

function htmlMapFromPost(data) {
  const out = {};
  const tr = data.translations;
  if (tr && typeof tr === "object" && !Array.isArray(tr)) {
    for (const loc of LOCALES) {
      const c = tr[loc]?.content ?? tr[loc]?.contentHtml;
      if (typeof c === "string" && c.trim()) out[loc] = c.trim();
    }
  }
  const ch = data.contentHtml;
  if (ch && typeof ch === "object") {
    for (const loc of LOCALES) {
      if (!out[loc] && typeof ch[loc] === "string" && ch[loc].trim()) out[loc] = ch[loc].trim();
    }
  } else if (typeof ch === "string" && ch.trim() && !out[DEFAULT_LOCALE]) {
    out[DEFAULT_LOCALE] = ch.trim();
  }
  if (!out[DEFAULT_LOCALE] && typeof data.content === "string" && data.content.trim()) {
    out[DEFAULT_LOCALE] = data.content.trim();
  }
  return out;
}

/* -------------------------------- runner -------------------------------- */

async function main() {
  const { db, mode, serverTimestamp } = await getScriptFirestore();
  console.log(`[migrate-sections] mode=${mode} dry-run=${DRY_RUN} force=${FORCE}${ONLY_ID ? ` id=${ONLY_ID}` : ""}`);

  let docs;
  if (mode === "admin") {
    docs = ONLY_ID
      ? [await db.collection("posts").doc(ONLY_ID).get()].filter((d) => d.exists)
      : (await db.collection("posts").get()).docs;
  } else {
    const { collection, getDocs, doc, getDoc } = await import("firebase/firestore");
    docs = ONLY_ID
      ? [await getDoc(doc(db, "posts", ONLY_ID))].filter((d) => d.exists())
      : (await getDocs(collection(db, "posts"))).docs;
  }

  console.log(`[migrate-sections] scanning ${docs.length} post(s)`);

  let migrated = 0;
  let skipped = 0;
  let empty = 0;
  let processed = 0;

  for (const snap of docs) {
    if (processed >= LIMIT) break;
    const id = snap.id;
    const data = snap.data();

    if (Array.isArray(data.sections) && data.sections.length && !FORCE) {
      skipped += 1;
      continue;
    }

    const htmlByLocale = htmlMapFromPost(data);
    const sections = deriveSections(htmlByLocale);
    if (!sections.length) {
      empty += 1;
      continue;
    }
    processed += 1;

    const covered = LOCALES.filter((loc) =>
      sections.every((s) =>
        s.type === "list"
          ? loc === DEFAULT_LOCALE || (s.translations?.[loc]?.length ?? 0) > 0
          : ["heading", "paragraph", "quote"].includes(s.type)
            ? loc === DEFAULT_LOCALE || Boolean(s.translations?.[loc]?.trim())
            : true,
      ),
    );

    console.log(
      `  ${DRY_RUN ? "would migrate" : "migrate"} ${id} — ${sections.length} block(s), locales: ${covered.join("/")}`,
    );
    migrated += 1;

    if (DRY_RUN) continue;

    const patch = { sections, sectionsVersion: SECTIONS_VERSION, updatedAt: serverTimestamp() };
    if (mode === "admin") {
      await db.collection("posts").doc(id).update(patch);
    } else {
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "posts", id), patch);
    }
  }

  console.log(
    `[migrate-sections] done. ${migrated} ${DRY_RUN ? "would be " : ""}migrated, ${skipped} skipped (already had sections), ${empty} empty.`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("[migrate-sections] failed:", e);
  process.exit(1);
});
