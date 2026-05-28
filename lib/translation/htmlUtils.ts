/**
 * Legacy HTML helpers — prefer `@/lib/html/*` for new code.
 */
export { stripHtmlToPlain } from "@/lib/html/htmlValidator";
export { protectHtmlTags, restoreHtmlTags } from "@/lib/html/placeholderManager";
export { splitHtmlIntoBlocks } from "@/lib/html/htmlExtractor";

/** @deprecated Pre-translation pipeline replaces plain-to-HTML rebuild. */
export function plainToSimpleHtml(plain: string): string {
  const p = plain.trim();
  if (!p) return "";
  return p
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}
