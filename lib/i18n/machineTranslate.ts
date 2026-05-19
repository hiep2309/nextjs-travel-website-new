import type { AppLocale } from "@/i18n/routing";

const clientCache = new Map<string, string>();

function cacheKey(text: string, from: string, to: string) {
  return `${from}|${to}|${text.length}|${text.slice(0, 120)}`;
}

/** Client-side call to `/api/translate` with in-memory cache. */
export async function translateTextClient(
  text: string,
  target: AppLocale,
  source: AppLocale = "vi",
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || target === source) return trimmed;

  const key = cacheKey(trimmed, source, target);
  const hit = clientCache.get(key);
  if (hit) return hit;

  const chunkSize = 480;
  if (trimmed.length <= chunkSize) {
    const out = await fetchChunk(trimmed, source, target);
    clientCache.set(key, out);
    return out;
  }

  const parts: string[] = [];
  for (let i = 0; i < trimmed.length; i += chunkSize) {
    parts.push(trimmed.slice(i, i + chunkSize));
  }
  const translated = (await Promise.all(parts.map((p) => fetchChunk(p, source, target)))).join("");
  clientCache.set(key, translated);
  return translated;
}

async function fetchChunk(text: string, from: string, to: string): Promise<string> {
  try {
    const params = new URLSearchParams({ q: text, from, to });
    const res = await fetch(`/api/translate?${params}`);
    if (!res.ok) return text;
    const data = (await res.json()) as { text?: string };
    return data.text?.trim() || text;
  } catch {
    return text;
  }
}

export function stripHtmlToPlain(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function plainToSimpleHtml(plain: string): string {
  const p = plain.trim();
  if (!p) return "";
  return p
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}
