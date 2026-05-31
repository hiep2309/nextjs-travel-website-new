import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { extractPostSourceFields } from "@/lib/translation/extractPostSource";
import { runPostTranslationPipeline } from "@/lib/translation/pipeline";
import { getAdminFirestore } from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type BatchBody = {
  dryRun?: boolean;
  postId?: string;
};

function isAuthorized(req: Request): boolean {
  const expected = process.env.ADMIN_SCRIPT_KEY?.trim();
  if (!expected) return process.env.NODE_ENV === "development";
  const key = req.headers.get("x-admin-script-key")?.trim();
  return Boolean(key && key === expected);
}

function needsTranslation(raw: Record<string, unknown>): boolean {
  const tr = raw.translations;
  if (tr && typeof tr === "object" && !Array.isArray(tr)) {
    const map = tr as Record<string, { title?: string; content?: string }>;
    const enOk = Boolean(map.en?.title?.trim() && map.en?.content?.trim());
    const koOk = Boolean(map.ko?.title?.trim() && map.ko?.content?.trim());
    return !enOk || !koOk;
  }
  const title = raw.title;
  if (!title || typeof title !== "object") return true;
  const t = title as Record<string, string>;
  return !t.en?.trim() || !t.ko?.trim();
}

/** Batch-translate existing posts missing en/ko (server-side, Admin SDK). */
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_JSON is required" },
      { status: 503 },
    );
  }

  if (!process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 503 });
  }

  let body: BatchBody = {};
  try {
    body = (await req.json()) as BatchBody;
  } catch {
    /* empty body ok */
  }

  const dryRun = Boolean(body.dryRun);
  const postId = typeof body.postId === "string" ? body.postId.trim() : "";

  const docs = postId
    ? [await db.collection("posts").doc(postId).get()].filter((d) => d.exists)
    : (await db.collection("posts").get()).docs;

  let translated = 0;
  let skipped = 0;
  let failed = 0;
  const errors: { id: string; error: string }[] = [];

  for (const snap of docs) {
    const id = snap.id;
    const raw = snap.data() as Record<string, unknown>;

    if (!needsTranslation(raw)) {
      skipped += 1;
      continue;
    }

    const source = extractPostSourceFields(id, raw);
    if (!source.title.trim() || !source.contentHtml.trim()) {
      skipped += 1;
      continue;
    }

    if (dryRun) {
      translated += 1;
      continue;
    }

    try {
      const result = await runPostTranslationPipeline(
        {
          title: source.title,
          description: source.description,
          contentHtml: source.contentHtml,
          sourceLocale: source.sourceLocale,
        },
        {
          sourceLocale: source.sourceLocale,
          existingSlugs: source.existingSlugs,
        },
      );

      await db.collection("posts").doc(id).update({
        ...result.payload,
        updatedAt: FieldValue.serverTimestamp(),
      });
      translated += 1;
    } catch (err) {
      failed += 1;
      errors.push({
        id,
        error: err instanceof Error ? err.message : "Translation failed",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    scanned: docs.length,
    translated,
    skipped,
    failed,
    errors: errors.slice(0, 20),
  });
}
