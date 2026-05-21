/** Strip HTML to plain text for machine translation. */
export function stripHtmlToPlain(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Convert plain paragraphs back to simple HTML. */
export function plainToSimpleHtml(plain: string): string {
  const p = plain.trim();
  if (!p) return "";
  return p
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}
