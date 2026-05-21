import { NextResponse } from "next/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { translateMany, translateText } from "@/lib/translation";

function parseLocale(raw: string | null, fallback: AppLocale = "vi"): AppLocale {
  if (raw && routing.locales.includes(raw as AppLocale)) return raw as AppLocale;
  return fallback;
}

/** Machine translation API — Gemini when configured, MyMemory fallback. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const from = parseLocale(searchParams.get("from"), "vi");
  const to = parseLocale(searchParams.get("to"), "en");
  const provider = searchParams.get("provider") === "mymemory" ? "mymemory" : "auto";

  if (!q || q.length > 5000) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const result = await translateText({ text: q, from, to, provider, context: "travel-post" });
    return NextResponse.json({
      text: result.text,
      provider: result.provider,
      cached: result.cached,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message, text: q }, { status: 500 });
  }
}

/** Batch translate — body: `{ texts: string[], from, to }` */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      texts?: unknown;
      from?: string;
      to?: string;
      provider?: string;
    };

    const texts = Array.isArray(body.texts)
      ? body.texts.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      : [];

    if (!texts.length || texts.some((t) => t.length > 5000)) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const from = parseLocale(body.from ?? null, "vi");
    const to = parseLocale(body.to ?? null, "en");
    const provider = body.provider === "mymemory" ? "mymemory" : "auto";

    const translated = await translateMany(texts, from, to, { provider, context: "travel-post" });
    return NextResponse.json({ texts: translated, from, to });
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
}
