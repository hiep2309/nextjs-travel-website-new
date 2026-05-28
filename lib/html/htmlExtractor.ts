import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";

const BLOCK_TAGS = new Set(["p", "ul", "ol", "li", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "figure", "div"]);

const SKIP_TAGS = new Set(["script", "style", "noscript", "iframe", "object", "embed"]);

/** Non-translatable standalone elements — copied as-is. */
const VOID_COPY_TAGS = new Set(["img", "hr", "br", "video", "audio", "source", "picture"]);

export type HtmlBlock = {
  /** Outer HTML of one translatable block (or void element). */
  html: string;
  /** When true, block is returned unchanged (images, hr, …). */
  skipTranslation: boolean;
};

function isElement(node: AnyNode): node is Element {
  return node.type === "tag";
}

function wrapFragment(html: string): cheerio.CheerioAPI {
  return cheerio.load(`<div id="__root__">${html}</div>`, null, false);
}

function outerHtml($: cheerio.CheerioAPI, el: Element): string {
  return $.html(el) ?? "";
}

/** Split sanitized post HTML into sequential blocks for batched translation. */
export function splitHtmlIntoBlocks(html: string): HtmlBlock[] {
  const trimmed = html.trim();
  if (!trimmed) return [];

  const $ = wrapFragment(trimmed);
  const root = $("#__root__").get(0);
  if (!root || !isElement(root)) return [{ html: trimmed, skipTranslation: false }];

  const blocks: HtmlBlock[] = [];

  for (const node of root.children) {
    if (node.type === "text") {
      const text = String(node.data ?? "").trim();
      if (text) blocks.push({ html: `<p>${text}</p>`, skipTranslation: false });
      continue;
    }

    if (!isElement(node)) continue;

    const tag = node.name.toLowerCase();
    if (SKIP_TAGS.has(tag)) continue;

    const htmlChunk = outerHtml($, node);
    if (VOID_COPY_TAGS.has(tag)) {
      blocks.push({ html: htmlChunk, skipTranslation: true });
      continue;
    }

    blocks.push({ html: htmlChunk, skipTranslation: false });
  }

  return blocks.length > 0 ? blocks : [{ html: trimmed, skipTranslation: false }];
}

/** Extract visible plain text from HTML (for validation / failure detection). */
export function extractVisibleText(html: string): string {
  const $ = wrapFragment(html);
  $("script, style, noscript").remove();
  return $("#__root__").text().replace(/\s+/g, " ").trim();
}

/** Collect direct text nodes inside a block (debug / metrics). */
export function listTextNodeValues(html: string): string[] {
  const $ = wrapFragment(html);
  const values: string[] = [];
  $("#__root__")
    .find("*")
    .addBack()
    .contents()
    .each((_, node) => {
      if (node.type === "text") {
        const value = String(node.data ?? "").trim();
        if (value) values.push(value);
      }
    });
  return values;
}

export function isBlockTag(tagName: string): boolean {
  return BLOCK_TAGS.has(tagName.toLowerCase());
}
