/**
 * Normalize article body for Firestore + rendering.
 * TipTap vi → HTML; manual/AI paste → plain text with newlines → structured HTML.
 */

const BLOCK_TAG_RE = /<(p|ul|ol|li|h[1-6]|blockquote|div|table)\b/i;

export function hasBlockHtml(content: string): boolean {
  return BLOCK_TAG_RE.test(content);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isBulletLine(line: string): boolean {
  return /^[-•*–—]\s+/.test(line) || /^[•·]\s*/.test(line);
}

function isOrderedLine(line: string): boolean {
  return /^\d+[.)]\s+/.test(line);
}

function stripBulletPrefix(line: string): string {
  return line
    .replace(/^[-•*–—]\s+/, "")
    .replace(/^[•·]\s*/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

function isSectionLabel(line: string): boolean {
  if (line.length > 96) return false;
  if (/^#{1,6}\s+/.test(line)) return true;
  if (/^\d+[.)]\s+\S/.test(line) && line.length < 120) return true;
  if (/[:：]$/.test(line) && line.split(/\s+/).length <= 12) return true;
  return false;
}

function formatSectionLabel(line: string): string {
  const cleaned = line.replace(/^#{1,6}\s+/, "").trim();
  return `<p><strong>${escapeHtml(cleaned)}</strong></p>`;
}

/** Convert plain text (Gemini / copy-paste) into paragraph + list HTML. */
export function plainTextToArticleHtml(plain: string): string {
  let normalized = plain.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const lineCount = normalized.split("\n").filter((l) => l.trim()).length;
  if (lineCount <= 2 && normalized.length > 280) {
    normalized = injectPlainTextBreaks(normalized);
  }

  const lines = normalized.split("\n").map((l) => l.trim());
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    while (i < lines.length && !lines[i]) i += 1;
    if (i >= lines.length) break;

    const line = lines[i];

    if (isBulletLine(line) || isOrderedLine(line)) {
      const ordered = isOrderedLine(line) && !isBulletLine(line);
      const items: string[] = [];
      while (i < lines.length && lines[i]) {
        const current = lines[i];
        if (ordered && !isOrderedLine(current)) break;
        if (!ordered && !isBulletLine(current) && !isOrderedLine(current)) break;
        if (!ordered && isOrderedLine(current) && items.length > 0) break;
        items.push(stripBulletPrefix(current));
        i += 1;
      }
      const tag = ordered ? "ol" : "ul";
      blocks.push(`<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`);
      continue;
    }

    if (isSectionLabel(line)) {
      blocks.push(formatSectionLabel(line));
      i += 1;
      continue;
    }

    const paragraph: string[] = [line];
    i += 1;
    while (i < lines.length && lines[i]) {
      const next = lines[i];
      if (isBulletLine(next) || isOrderedLine(next) || isSectionLabel(next)) break;
      paragraph.push(next);
      i += 1;
    }
    blocks.push(`<p>${escapeHtml(paragraph.join(" "))}</p>`);
  }

  return blocks.join("");
}

/** Insert line breaks when Gemini returns one long plain-text paragraph. */
function injectPlainTextBreaks(text: string): string {
  return text
    .replace(/(?<=[.!?…])\s+(?=\d+[.)]\s)/gu, "\n\n")
    .replace(/(?<=[.!?…])\s+(?=[^\s\d]{1,28}[:：])/gu, "\n\n")
    .replace(/(?<=[:：])\s+(?=[•·\-–—*]\s*)/gu, "\n")
    .replace(/\s+[•·]\s+/gu, "\n• ")
    .replace(/\s+-\s+(?=[A-Za-zÀ-ỹ가-힣0-9])/gu, "\n- ");
}

/** Ensure content is HTML with paragraphs/lists before save or render. */
export function normalizeArticleContentHtml(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (hasBlockHtml(trimmed)) return trimmed;
  return plainTextToArticleHtml(trimmed);
}
