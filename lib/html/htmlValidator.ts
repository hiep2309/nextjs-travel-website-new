import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { countPlaceholders } from "@/lib/html/placeholderManager";

export type HtmlValidationResult = {
  ok: boolean;
  errors: string[];
};

function isElement(node: unknown): node is Element {
  return typeof node === "object" && node !== null && "type" in node && (node as Element).type === "tag";
}

function loadFragment(html: string): cheerio.CheerioAPI | null {
  try {
    return cheerio.load(`<div id="__validate__">${html}</div>`, null, false);
  } catch {
    return null;
  }
}

/** Validate translated HTML integrity before persisting to Firestore. */
export function validateTranslatedHtml(originalHtml: string, translatedHtml: string): HtmlValidationResult {
  const errors: string[] = [];

  if (!translatedHtml.trim()) {
    return { ok: false, errors: ["empty_html"] };
  }

  if (countPlaceholders(translatedHtml) > 0) {
    errors.push("unrestored_placeholders");
  }

  const $orig = loadFragment(originalHtml);
  const $trans = loadFragment(translatedHtml);
  if (!$orig || !$trans) {
    errors.push("parse_failed");
    return { ok: false, errors };
  }

  const origRoot = $orig("#__validate__").get(0);
  const transRoot = $trans("#__validate__").get(0);
  const origTags = $orig("#__validate__ *").length + (isElement(origRoot) ? origRoot.children.length : 0);
  const transTags = $trans("#__validate__ *").length + (isElement(transRoot) ? transRoot.children.length : 0);

  if (Math.abs(origTags - transTags) > 3) {
    errors.push("tag_count_mismatch");
  }

  const origImg = $orig("img").length;
  const transImg = $trans("img").length;
  if (origImg !== transImg) {
    errors.push("img_count_mismatch");
  }

  return { ok: errors.length === 0, errors };
}

/** Strip HTML to plain text for excerpts — keeps paragraph breaks. */
export function stripHtmlToPlain(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
