import { NextResponse } from "next/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { requireAuth, isAuthResponse } from "@/lib/server/requireAuth";
import { translateMany, translateText, isGeminiTranslationAvailable } from "@/lib/translation";

function parseLocale(raw: string | null, fallback: AppLocale = "vi"): AppLocale {
  if (raw && routing.locales.includes(raw as AppLocale)) return raw as AppLocale;
  return fallback;
}

/** Authenticated Gemini translation API (cached server-side). */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isAuthResponse(authResult)) return authResult;

  if (!isGeminiTranslationAvailable()) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const from = parseLocale(searchParams.get("from"), "vi");
  const to = parseLocale(searchParams.get("to"), "en");

  if (!q || q.length > 5000) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const result = await translateText({ text: q, from, to, context: "travel-post" });
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
    const authResult = await requireAuth(req);
    if (isAuthResponse(authResult)) return authResult;

    if (!isGeminiTranslationAvailable()) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 503 });
    }

    const body = (await req.json()) as {
      texts?: unknown;
      from?: string;
      to?: string;
    };

    const texts = Array.isArray(body.texts)
      ? body.texts.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      : [];

    if (!texts.length || texts.some((t) => t.length > 5000)) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const from = parseLocale(body.from ?? null, "vi");
    const to = parseLocale(body.to ?? null, "en");

    const translated = await translateMany(texts, from, to, { context: "travel-post" });
    return NextResponse.json({ texts: translated, from, to });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
