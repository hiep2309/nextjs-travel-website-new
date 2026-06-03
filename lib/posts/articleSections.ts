/**
 * Structured multilingual article model.
 *
 * An article body is an ordered list of language-neutral blocks (`sections`).
 * Layout-bearing data (block order, image `src`, dividers, galleries) is shared
 * across every locale; only the text inside a block changes per language. This
 * guarantees identical layout for vi / en / ko — only the words differ.
 *
 * This module is dependency-free (no DOM, no React) so it can run in the browser,
 * on the Next.js server, and be mirrored by the Node migration script.
 */
import { defaultLocale, locales, type AppLocale } from "@/i18n/routing";

export type SectionType =
  | "heading"
  | "paragraph"
  | "image"
  | "list"
  | "quote"
  | "divider"
  | "gallery";

/** Per-locale inline text (may contain inline markup like <strong>/<a>). */
export type LocalizedText = Partial<Record<AppLocale, string>>;
/** Per-locale list of items. */
export type LocalizedTextList = Partial<Record<AppLocale, string[]>>;

export type HeadingSection = {
  id: string;
  type: "heading";
  level: 2 | 3 | 4;
  translations: LocalizedText;
};

export type ParagraphSection = {
  id: string;
  type: "paragraph";
  translations: LocalizedText;
};

export type ImageSection = {
  id: string;
  type: "image";
  src: string;
  alt?: LocalizedText;
  caption?: LocalizedText;
};

export type ListSection = {
  id: string;
  type: "list";
  ordered: boolean;
  translations: LocalizedTextList;
};

export type QuoteSection = {
  id: string;
  type: "quote";
  translations: LocalizedText;
  cite?: LocalizedText;
};

export type DividerSection = {
  id: string;
  type: "divider";
};

export type GalleryImage = { src: string; alt?: LocalizedText };

export type GallerySection = {
  id: string;
  type: "gallery";
  images: GalleryImage[];
};

export type ArticleSection =
  | HeadingSection
  | ParagraphSection
  | ImageSection
  | ListSection
  | QuoteSection
  | DividerSection
  | GallerySection;

/** Bump when the section schema changes so migrations can be re-run safely. */
export const ARTICLE_SECTIONS_VERSION = 1;

const TEXT_SECTION_TYPES: SectionType[] = ["heading", "paragraph", "list", "quote"];

/* ------------------------------------------------------------------ *
 * HTML → sections (parsing)
 * ------------------------------------------------------------------ */

/** Matches a top-level block; paired tags or self-contained hr/img. */
const BLOCK_RE =
  /<(h[1-6]|p|ul|ol|blockquote|figure)\b([^>]*)>([\s\S]*?)<\/\1>|<hr\b[^>]*\/?>|<img\b([^>]*?)\/?>/gi;

const LI_RE = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
const IMG_RE = /<img\b([^>]*?)\/?>/i;
const FIGCAPTION_RE = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i;

function extractAttr(attrs: string, name: string): string {
  const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i");
  const m = attrs.match(re);
  return (m?.[2] ?? m?.[3] ?? "").trim();
}

function cleanInline(html: string): string {
  return html.replace(/\s+/g, " ").trim();
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let idCounter = 0;
function nextId(prefix = "sec"): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

/**
 * Parse an HTML article body into a flat list of structural blocks for ONE locale.
 * Inline markup inside paragraphs/headings/list items is preserved as text.
 */
export function htmlToSections(html: string, idFor?: (i: number) => string): ArticleSection[] {
  const source = (html ?? "").trim();
  if (!source) return [];

  const sections: ArticleSection[] = [];
  const mkId = (i: number) => (idFor ? idFor(i) : nextId());

  BLOCK_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = BLOCK_RE.exec(source)) !== null) {
    const full = match[0];
    const tag = match[1]?.toLowerCase();
    const attrs = match[2] ?? "";
    const inner = match[3] ?? "";

    // Standalone <hr>
    if (!tag && /^<hr/i.test(full)) {
      sections.push({ id: mkId(index++), type: "divider" });
      continue;
    }

    // Standalone <img>
    if (!tag && /^<img/i.test(full)) {
      const imgAttrs = match[4] ?? "";
      const src = extractAttr(imgAttrs, "src");
      if (src) {
        const alt = stripTags(extractAttr(imgAttrs, "alt"));
        sections.push({
          id: mkId(index++),
          type: "image",
          src,
          ...(alt ? { alt: { [defaultLocale]: alt } } : {}),
        });
      }
      continue;
    }

    if (!tag) continue;

    if (/^h[1-6]$/.test(tag)) {
      const lvlRaw = Number(tag.slice(1));
      const level = (lvlRaw <= 2 ? 2 : lvlRaw >= 4 ? 4 : 3) as 2 | 3 | 4;
      const text = cleanInline(inner);
      if (text) sections.push({ id: mkId(index++), type: "heading", level, translations: { [defaultLocale]: text } });
      continue;
    }

    if (tag === "p") {
      // A paragraph that only wraps an image becomes an image block.
      const imgMatch = inner.match(IMG_RE);
      const withoutImg = inner.replace(IMG_RE, "").trim();
      if (imgMatch && !stripTags(withoutImg)) {
        const src = extractAttr(imgMatch[1] ?? "", "src");
        if (src) {
          const alt = stripTags(extractAttr(imgMatch[1] ?? "", "alt"));
          sections.push({
            id: mkId(index++),
            type: "image",
            src,
            ...(alt ? { alt: { [defaultLocale]: alt } } : {}),
          });
          continue;
        }
      }
      const text = cleanInline(inner);
      if (text) sections.push({ id: mkId(index++), type: "paragraph", translations: { [defaultLocale]: text } });
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const items: string[] = [];
      LI_RE.lastIndex = 0;
      let li: RegExpExecArray | null;
      while ((li = LI_RE.exec(inner)) !== null) {
        const item = cleanInline(li[1] ?? "");
        if (item) items.push(item);
      }
      if (items.length) {
        sections.push({
          id: mkId(index++),
          type: "list",
          ordered: tag === "ol",
          translations: { [defaultLocale]: items },
        });
      }
      continue;
    }

    if (tag === "blockquote") {
      const text = cleanInline(inner.replace(/<\/?p\b[^>]*>/gi, " "));
      if (text) sections.push({ id: mkId(index++), type: "quote", translations: { [defaultLocale]: text } });
      continue;
    }

    if (tag === "figure") {
      const imgMatch = inner.match(IMG_RE);
      const src = imgMatch ? extractAttr(imgMatch[1] ?? "", "src") : "";
      if (src) {
        const capMatch = inner.match(FIGCAPTION_RE);
        const caption = capMatch ? cleanInline(capMatch[1] ?? "") : "";
        const alt = stripTags(extractAttr(imgMatch?.[1] ?? "", "alt"));
        sections.push({
          id: mkId(index++),
          type: "image",
          src,
          ...(alt ? { alt: { [defaultLocale]: alt } } : {}),
          ...(caption ? { caption: { [defaultLocale]: caption } } : {}),
        });
      }
      continue;
    }
  }

  return sections;
}

/* ------------------------------------------------------------------ *
 * sections → HTML (for SEO / search / legacy mirrors)
 * ------------------------------------------------------------------ */

/** Reconstruct an HTML body for a locale (used to keep contentHtml mirror fresh). */
export function sectionsToHtml(sections: ArticleSection[], locale: AppLocale): string {
  const out: string[] = [];
  for (const s of sections) {
    switch (s.type) {
      case "heading": {
        const text = pickText(s.translations, locale);
        if (text) out.push(`<h${s.level}>${text}</h${s.level}>`);
        break;
      }
      case "paragraph": {
        const text = pickText(s.translations, locale);
        if (text) out.push(`<p>${text}</p>`);
        break;
      }
      case "quote": {
        const text = pickText(s.translations, locale);
        if (text) out.push(`<blockquote><p>${text}</p></blockquote>`);
        break;
      }
      case "list": {
        const items = pickList(s.translations, locale);
        if (items.length) {
          const tag = s.ordered ? "ol" : "ul";
          out.push(`<${tag}>${items.map((it) => `<li>${it}</li>`).join("")}</${tag}>`);
        }
        break;
      }
      case "image": {
        const alt = s.alt ? pickText(s.alt, locale) : "";
        const caption = s.caption ? pickText(s.caption, locale) : "";
        out.push(
          `<figure><img src="${s.src}" alt="${stripTags(alt)}" />${
            caption ? `<figcaption>${caption}</figcaption>` : ""
          }</figure>`,
        );
        break;
      }
      case "gallery": {
        for (const img of s.images) {
          const alt = img.alt ? pickText(img.alt, locale) : "";
          out.push(`<figure><img src="${img.src}" alt="${stripTags(alt)}" /></figure>`);
        }
        break;
      }
      case "divider":
        out.push("<hr />");
        break;
    }
  }
  return out.join("");
}

/* ------------------------------------------------------------------ *
 * Locale resolution helpers
 * ------------------------------------------------------------------ */

export function pickText(text: LocalizedText | undefined, locale: AppLocale): string {
  if (!text) return "";
  return (text[locale]?.trim() || text[defaultLocale]?.trim() || "").trim();
}

export function pickList(list: LocalizedTextList | undefined, locale: AppLocale): string[] {
  if (!list) return [];
  const items = list[locale]?.length ? list[locale] : list[defaultLocale];
  return (items ?? []).map((i) => i?.trim() ?? "").filter(Boolean);
}

/** True when every text-bearing block has copy for `locale`. */
export function sectionsHaveLocale(sections: ArticleSection[], locale: AppLocale): boolean {
  for (const s of sections) {
    if (s.type === "list") {
      if (!(s.translations[locale]?.length)) return false;
    } else if (TEXT_SECTION_TYPES.includes(s.type)) {
      const t = (s as HeadingSection | ParagraphSection | QuoteSection).translations[locale];
      if (!t?.trim()) return false;
    }
  }
  return true;
}

/** Locales (en/ko) still missing any block text. */
export function listMissingSectionLocales(sections: ArticleSection[]): AppLocale[] {
  return locales.filter((loc) => loc !== defaultLocale && !sectionsHaveLocale(sections, loc));
}

/* ------------------------------------------------------------------ *
 * Read-time normalization & derivation
 * ------------------------------------------------------------------ */

function coerceLocalizedText(raw: unknown): LocalizedText {
  const out: LocalizedText = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const loc of locales) {
      const v = (raw as Record<string, unknown>)[loc];
      if (typeof v === "string" && v.trim()) out[loc] = v.trim();
    }
  } else if (typeof raw === "string" && raw.trim()) {
    out[defaultLocale] = raw.trim();
  }
  return out;
}

function coerceLocalizedTextList(raw: unknown): LocalizedTextList {
  const out: LocalizedTextList = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const loc of locales) {
      const v = (raw as Record<string, unknown>)[loc];
      if (Array.isArray(v)) {
        const items = v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
        if (items.length) out[loc] = items;
      }
    }
  }
  return out;
}

/** Parse a raw Firestore `sections` array into typed sections (defensive). */
export function normalizeStoredSections(raw: unknown): ArticleSection[] {
  if (!Array.isArray(raw)) return [];
  const out: ArticleSection[] = [];

  raw.forEach((entry, i) => {
    if (!entry || typeof entry !== "object") return;
    const e = entry as Record<string, unknown>;
    const type = e.type as SectionType;
    const id = typeof e.id === "string" && e.id ? e.id : `sec-${i}`;

    switch (type) {
      case "heading": {
        const lvl = Number(e.level);
        const level = (lvl === 2 || lvl === 3 || lvl === 4 ? lvl : 2) as 2 | 3 | 4;
        const translations = coerceLocalizedText(e.translations);
        if (Object.keys(translations).length) out.push({ id, type, level, translations });
        break;
      }
      case "paragraph":
      case "quote": {
        const translations = coerceLocalizedText(e.translations);
        const cite = type === "quote" ? coerceLocalizedText(e.cite) : undefined;
        if (Object.keys(translations).length) {
          out.push(
            type === "quote"
              ? { id, type, translations, ...(cite && Object.keys(cite).length ? { cite } : {}) }
              : { id, type, translations },
          );
        }
        break;
      }
      case "list": {
        const translations = coerceLocalizedTextList(e.translations);
        if (Object.keys(translations).length) {
          out.push({ id, type, ordered: Boolean(e.ordered), translations });
        }
        break;
      }
      case "image": {
        const src = typeof e.src === "string" ? e.src.trim() : "";
        if (src) {
          const alt = coerceLocalizedText(e.alt);
          const caption = coerceLocalizedText(e.caption);
          out.push({
            id,
            type,
            src,
            ...(Object.keys(alt).length ? { alt } : {}),
            ...(Object.keys(caption).length ? { caption } : {}),
          });
        }
        break;
      }
      case "gallery": {
        const imgsRaw = Array.isArray(e.images) ? e.images : [];
        const images: GalleryImage[] = [];
        for (const im of imgsRaw) {
          if (im && typeof im === "object") {
            const src = typeof (im as Record<string, unknown>).src === "string"
              ? ((im as Record<string, unknown>).src as string).trim()
              : "";
            if (src) {
              const alt = coerceLocalizedText((im as Record<string, unknown>).alt);
              images.push({ src, ...(Object.keys(alt).length ? { alt } : {}) });
            }
          }
        }
        if (images.length) out.push({ id, type, images });
        break;
      }
      case "divider":
        out.push({ id, type });
        break;
    }
  });

  return out;
}

/** Layout signature used to align two locales' parsed blocks. */
function sectionShape(s: ArticleSection): string {
  if (s.type === "image") return `image:${s.src}`;
  if (s.type === "list") return `list:${s.ordered ? "o" : "u"}`;
  return s.type;
}

function mergeLocaleText(target: ArticleSection, source: ArticleSection, locale: AppLocale): void {
  if (target.type !== source.type) return;
  if (target.type === "list" && source.type === "list") {
    const items = source.translations[defaultLocale];
    if (items?.length) target.translations[locale] = items;
  } else if (
    (target.type === "heading" || target.type === "paragraph" || target.type === "quote") &&
    (source.type === "heading" || source.type === "paragraph" || source.type === "quote")
  ) {
    const text = source.translations[defaultLocale];
    if (text?.trim()) (target as HeadingSection).translations[locale] = text.trim();
  } else if (target.type === "image" && source.type === "image") {
    const cap = source.caption?.[defaultLocale];
    if (cap?.trim()) target.caption = { ...(target.caption ?? {}), [locale]: cap.trim() };
    const alt = source.alt?.[defaultLocale];
    if (alt?.trim()) target.alt = { ...(target.alt ?? {}), [locale]: alt.trim() };
  }
}

/**
 * Build shared-structure sections from per-locale HTML.
 * VI HTML defines the canonical structure; en/ko text is aligned block-by-block
 * when their structure matches, otherwise that locale falls back to VI at render.
 */
export function deriveSectionsFromHtmlMap(
  htmlByLocale: Partial<Record<AppLocale, string>>,
): ArticleSection[] {
  const baseHtml = htmlByLocale[defaultLocale] ?? "";
  const stableId = (i: number) => `b${i}`;
  const base = htmlToSections(baseHtml, stableId);
  if (!base.length) return [];

  for (const loc of locales) {
    if (loc === defaultLocale) continue;
    const html = htmlByLocale[loc];
    if (!html?.trim()) continue;
    const localeSections = htmlToSections(html, stableId);

    // Only align when the structure matches (same count + same shapes).
    const sameShape =
      localeSections.length === base.length &&
      base.every((b, i) => sectionShape(b) === sectionShape(localeSections[i]!));
    if (!sameShape) continue;

    base.forEach((b, i) => mergeLocaleText(b, localeSections[i]!, loc));
  }

  return base;
}
