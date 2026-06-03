/**
 * Admin utilities for the structured multilingual article system.
 *
 * All helpers store translations PERMANENTLY in Firestore (`posts`). Page render
 * never triggers translation. Per-block text is translated via `/api/translate`
 * (client SDK, authenticated) so structure/images stay fixed across locales.
 *
 *   createArticle()           → write a new article (vi → Gemini en/ko)
 *   updateArticle()           → edit an existing article, re-derive mirrors
 *   translateArticle()        → (re)translate every block for target locales
 *   translateMissingSections()→ only fill blocks/locales that are still empty
 */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { defaultLocale, locales, type AppLocale } from "@/i18n/routing";
import type { LocalizedHtml, LocalizedString, LocalizedSlug } from "@/lib/i18n/types";
import {
  buildPostLocaleWritePayload,
  normalizeTravelPost,
} from "@/lib/firestore/multilingual";
import { translateTextsClient } from "@/lib/translation/translateTextsClient";
import {
  ARTICLE_SECTIONS_VERSION,
  htmlToSections,
  listMissingSectionLocales,
  sectionsHaveLocale,
  sectionsToHtml,
  type ArticleSection,
} from "@/lib/posts/articleSections";

const TARGET_LOCALES = locales.filter((l) => l !== defaultLocale) as AppLocale[];

/* ------------------------------------------------------------------ *
 * Section text translation
 * ------------------------------------------------------------------ */

type TranslateUnit = { text: string; apply: (value: string) => void };

function collectUnits(
  section: ArticleSection,
  source: AppLocale,
  target: AppLocale,
): TranslateUnit[] {
  const units: TranslateUnit[] = [];

  if (section.type === "heading" || section.type === "paragraph" || section.type === "quote") {
    const src = section.translations[source]?.trim();
    if (src) units.push({ text: src, apply: (v) => (section.translations[target] = v) });
    if (section.type === "quote") {
      const cite = section.cite?.[source]?.trim();
      if (cite) units.push({ text: cite, apply: (v) => (section.cite = { ...(section.cite ?? {}), [target]: v }) });
    }
  } else if (section.type === "list") {
    const items = section.translations[source];
    if (items?.length) {
      const localized: string[] = new Array(items.length).fill("");
      items.forEach((item, i) => {
        const t = item?.trim();
        if (!t) return;
        units.push({
          text: t,
          apply: (v) => {
            localized[i] = v;
            section.translations[target] = localized;
          },
        });
      });
    }
  } else if (section.type === "image") {
    const alt = section.alt?.[source]?.trim();
    if (alt) units.push({ text: alt, apply: (v) => (section.alt = { ...(section.alt ?? {}), [target]: v }) });
    const caption = section.caption?.[source]?.trim();
    if (caption) units.push({ text: caption, apply: (v) => (section.caption = { ...(section.caption ?? {}), [target]: v }) });
  } else if (section.type === "gallery") {
    section.images.forEach((img) => {
      const alt = img.alt?.[source]?.trim();
      if (alt) units.push({ text: alt, apply: (v) => (img.alt = { ...(img.alt ?? {}), [target]: v }) });
    });
  }

  return units;
}

/**
 * Fill missing locale text for every block. `onlyMissing` skips blocks/locales
 * that already have copy so re-runs are cheap and idempotent.
 */
export async function translateSections(
  sections: ArticleSection[],
  targets: AppLocale[] = TARGET_LOCALES,
  source: AppLocale = defaultLocale,
  onlyMissing = false,
): Promise<ArticleSection[]> {
  const out = (structuredClone(sections) as ArticleSection[]) ?? [];

  for (const target of targets) {
    if (target === source) continue;
    if (onlyMissing && sectionsHaveLocale(out, target)) continue;

    const units: TranslateUnit[] = [];
    for (const section of out) {
      if (onlyMissing && blockHasLocale(section, target)) continue;
      units.push(...collectUnits(section, source, target));
    }
    if (!units.length) continue;

    const translated = await translateTextsClient(units.map((u) => u.text), target, source);
    units.forEach((u, i) => u.apply(translated[i]?.trim() || u.text));
  }

  return out;
}

function blockHasLocale(section: ArticleSection, locale: AppLocale): boolean {
  if (section.type === "list") return Boolean(section.translations[locale]?.length);
  if (section.type === "heading" || section.type === "paragraph" || section.type === "quote") {
    return Boolean(section.translations[locale]?.trim());
  }
  return true; // image/divider/gallery carry no required body text
}

/* ------------------------------------------------------------------ *
 * Write payload
 * ------------------------------------------------------------------ */

function buildArticleWritePayload(
  titleByLocale: LocalizedString,
  sections: ArticleSection[],
  options?: { existingSlugs?: LocalizedSlug; slugSuffix?: string },
) {
  const title: LocalizedString = {};
  const contentHtml: LocalizedHtml = {};

  for (const loc of locales) {
    const covered = loc === defaultLocale || sectionsHaveLocale(sections, loc);
    if (!covered) continue;
    contentHtml[loc] = sectionsToHtml(sections, loc);
    if (titleByLocale[loc]?.trim()) title[loc] = titleByLocale[loc]!.trim();
  }
  if (!title[defaultLocale] && titleByLocale[defaultLocale]) {
    title[defaultLocale] = titleByLocale[defaultLocale]!.trim();
  }

  const payload = buildPostLocaleWritePayload(title, contentHtml, {
    sourceLocale: defaultLocale,
    existingSlugs: options?.existingSlugs,
    slugSuffix: options?.slugSuffix,
  });

  return {
    ...payload,
    sections,
    sectionsVersion: ARTICLE_SECTIONS_VERSION,
  };
}

async function translateTitle(
  viTitle: string,
  targets: AppLocale[],
): Promise<LocalizedString> {
  const title: LocalizedString = { [defaultLocale]: viTitle.trim() };
  for (const target of targets) {
    if (target === defaultLocale) continue;
    const [t] = await translateTextsClient([viTitle], target, defaultLocale);
    if (t?.trim()) title[target] = t.trim();
  }
  return title;
}

/* ------------------------------------------------------------------ *
 * Public helpers
 * ------------------------------------------------------------------ */

export type CreateArticleInput = {
  viTitle: string;
  /** Provide structured vi sections OR raw vi HTML (parsed into sections). */
  sections?: ArticleSection[];
  viContentHtml?: string;
  coverImage?: string;
  authorId?: string;
  authorName?: string;
  postType?: string;
  region?: string;
  tags?: string[];
  status?: string;
  /** Locales to machine-translate into (default en + ko). */
  targets?: AppLocale[];
  /** Set false to save vi only (no Gemini calls). */
  translate?: boolean;
};

/** Create a multilingual article: vi authored, en/ko generated, all stored. */
export async function createArticle(input: CreateArticleInput): Promise<{ id: string }> {
  const targets = input.targets ?? TARGET_LOCALES;
  const baseSections = input.sections ?? htmlToSections(input.viContentHtml ?? "");
  if (!baseSections.length) throw new Error("createArticle: no content sections");

  const sections =
    input.translate === false ? baseSections : await translateSections(baseSections, targets);
  const title =
    input.translate === false
      ? { [defaultLocale]: input.viTitle.trim() }
      : await translateTitle(input.viTitle, targets);

  const payload = buildArticleWritePayload(title, sections);

  const docData: Record<string, unknown> = {
    ...payload,
    viewCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (input.coverImage?.trim()) docData.image = input.coverImage.trim();
  if (input.authorId) docData.authorId = input.authorId;
  if (input.authorName) docData.authorName = input.authorName;
  if (input.postType) docData.postType = input.postType;
  if (input.region) docData.region = input.region;
  if (input.tags?.length) docData.tags = input.tags;
  docData.status = input.status ?? "pending";

  const ref = await addDoc(collection(db, "posts"), docData);
  return { id: ref.id };
}

export type UpdateArticleInput = {
  viTitle?: string;
  sections?: ArticleSection[];
  viContentHtml?: string;
  coverImage?: string;
  /** Re-translate en/ko for the new content (default true when content changes). */
  retranslate?: boolean;
};

/** Update an article and refresh derived mirrors (translations/seo/contentHtml). */
export async function updateArticle(id: string, input: UpdateArticleInput): Promise<void> {
  const ref = doc(db, "posts", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("updateArticle: post not found");

  const post = normalizeTravelPost(id, snap.data() as Record<string, unknown>);
  const viTitle = input.viTitle?.trim() || post.title.vi || post.title.en || "";

  const contentChanged = Boolean(input.sections || input.viContentHtml);
  let baseSections: ArticleSection[] = input.sections
    ? input.sections
    : input.viContentHtml
      ? htmlToSections(input.viContentHtml)
      : (post.sections ?? []);

  const shouldTranslate = input.retranslate ?? contentChanged;
  if (shouldTranslate && baseSections.length) {
    baseSections = await translateSections(baseSections, TARGET_LOCALES);
  }

  const title = shouldTranslate
    ? await translateTitle(viTitle, TARGET_LOCALES)
    : { [defaultLocale]: viTitle, ...post.title };

  const payload = buildArticleWritePayload(title, baseSections, { existingSlugs: post.slugs });
  const cover = input.coverImage?.trim();

  await updateDoc(
    ref,
    cover
      ? { ...payload, image: cover, updatedAt: serverTimestamp() }
      : { ...payload, updatedAt: serverTimestamp() },
  );
}

/** (Re)translate every block of an existing article for the target locales. */
export async function translateArticle(
  id: string,
  targets: AppLocale[] = TARGET_LOCALES,
): Promise<void> {
  await runTranslate(id, targets, false);
}

/** Only fill blocks/locales that are still empty (idempotent, cheap re-run). */
export async function translateMissingSections(id: string): Promise<void> {
  const ref = doc(db, "posts", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("translateMissingSections: post not found");
  const post = normalizeTravelPost(id, snap.data() as Record<string, unknown>);
  const sections = post.sections ?? [];
  const missing = listMissingSectionLocales(sections);
  if (!missing.length) return;
  await runTranslate(id, missing, true);
}

async function runTranslate(id: string, targets: AppLocale[], onlyMissing: boolean): Promise<void> {
  const ref = doc(db, "posts", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("translateArticle: post not found");

  const post = normalizeTravelPost(id, snap.data() as Record<string, unknown>);
  const sections = post.sections ?? [];
  if (!sections.length) return;

  const translated = await translateSections(sections, targets, defaultLocale, onlyMissing);

  const title: LocalizedString = { ...post.title };
  const viTitle = post.title.vi || "";
  for (const target of targets) {
    if (target === defaultLocale) continue;
    if (onlyMissing && title[target]?.trim()) continue;
    if (!viTitle) continue;
    const [t] = await translateTextsClient([viTitle], target, defaultLocale);
    if (t?.trim()) title[target] = t.trim();
  }

  const payload = buildArticleWritePayload(title, translated, { existingSlugs: post.slugs });
  await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
}
