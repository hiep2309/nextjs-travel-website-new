import { NextResponse } from "next/server";
import { routing, type AppLocale } from "@/i18n/routing";
import type { LocalizedSlug } from "@/lib/i18n/types";
import {
  POST_DESCRIPTION_MAX,
  POST_HTML_MAX,
  POST_TITLE_MAX,
} from "@/lib/postContentLimits";
import { runPostTranslationPipeline } from "@/lib/translation/pipeline";
import type { TranslationProvider } from "@/lib/translation/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function parseLocale(raw: unknown, fallback: AppLocale = "vi"): AppLocale {
  if (typeof raw === "string" && routing.locales.includes(raw as AppLocale)) {
    return raw as AppLocale;
  }
  return fallback;
}

function parseProvider(raw: unknown): TranslationProvider {
  if (raw === "gemini" || raw === "mymemory" || raw === "auto") return raw;
  return "auto";
}

function parseSlugs(raw: unknown): LocalizedSlug | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const map = raw as Record<string, unknown>;
  const out: LocalizedSlug = {};
  for (const loc of routing.locales) {
    const v = map[loc];
    if (typeof v === "string" && v.trim()) out[loc] = v.trim();
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

type PostBody = {
  title?: unknown;
  description?: unknown;
  contentHtml?: unknown;
  sourceLocale?: unknown;
  provider?: unknown;
  existingSlugs?: unknown;
  slugSuffix?: unknown;
};

function validatePostBody(body: unknown): { ok: true; data: NonNullable<ReturnType<typeof parseValidBody>> } | { ok: false; error: string } {
  const parsed = parseValidBody(body);
  if (!parsed) return { ok: false, error: "Invalid post translation input" };
  return { ok: true, data: parsed };
}

function parseValidBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const b = body as PostBody;

  const title = String(b.title ?? "").trim();
  const description = String(b.description ?? "").trim();
  const contentHtml = String(b.contentHtml ?? "").trim();

  if (!title) return null;
  if (title.length > POST_TITLE_MAX) return null;
  if (!description) return null;
  if (description.length > POST_DESCRIPTION_MAX) return null;
  if (!contentHtml) return null;
  if (contentHtml.length > POST_HTML_MAX) return null;

  const plain = contentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!plain) return null;

  return {
    title,
    description,
    contentHtml,
    sourceLocale: parseLocale(b.sourceLocale),
    provider: parseProvider(b.provider),
    existingSlugs: parseSlugs(b.existingSlugs),
    slugSuffix:
      typeof b.slugSuffix === "string" && b.slugSuffix.trim()
        ? b.slugSuffix.trim().slice(0, 24)
        : undefined,
  };
}

/** AI translation pipeline for Firestore posts (title + description + HTML → vi/en/ko). */
export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const validated = validatePostBody(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const result = await runPostTranslationPipeline(
      {
        title: data.title,
        description: data.description,
        contentHtml: data.contentHtml,
        sourceLocale: data.sourceLocale,
      },
      {
        sourceLocale: data.sourceLocale,
        provider: data.provider,
        existingSlugs: data.existingSlugs,
        slugSuffix: data.slugSuffix,
      },
    );

    return NextResponse.json(
      {
        payload: result.payload,
        geminiConfigured: result.geminiConfigured,
      },
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[api/translate/post]", err);
    const message = err instanceof Error ? err.message : "Translation pipeline failed";
    const status = message.includes("GEMINI") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/translate/post",
    method: "POST",
    body: {
      title: "string",
      description: "string",
      contentHtml: "string",
      sourceLocale: "vi | en | ko",
      provider: "auto | gemini | mymemory",
    },
  });
}
