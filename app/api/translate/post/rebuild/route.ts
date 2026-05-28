import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { canEditPost } from "@/lib/posts/permissions";
import { getAdminFirestore } from "@/lib/server/firebaseAdmin";
import { requireAuth, isAuthResponse } from "@/lib/server/requireAuth";
import { extractPostSourceFields } from "@/lib/translation/extractPostSource";
import { runPostTranslationPipeline } from "@/lib/translation/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Re-run Gemini translation for an existing post (author or admin). */
export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isAuthResponse(authResult)) return authResult;

    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json(
        { error: "FIREBASE_SERVICE_ACCOUNT_JSON is required for rebuild" },
        { status: 503 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const postId =
      body && typeof body === "object" && typeof (body as { postId?: unknown }).postId === "string"
        ? (body as { postId: string }).postId.trim()
        : "";
    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const postRef = db.collection("posts").doc(postId);
    const postSnap = await postRef.get();
    if (!postSnap.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const raw = postSnap.data() as Record<string, unknown>;
    const authorId = typeof raw.authorId === "string" ? raw.authorId : null;

    let role: string | null = null;
    const userSnap = await db.collection("users").doc(authResult.uid).get();
    if (userSnap.exists) {
      role = typeof userSnap.data()?.role === "string" ? userSnap.data()!.role : null;
    }

    if (!canEditPost(role, authResult.uid, authorId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const source = extractPostSourceFields(postId, raw);
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

    await postRef.update({
      ...result.payload,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      ok: true,
      postId,
      geminiConfigured: result.geminiConfigured,
    });
  } catch (err) {
    console.error("[api/translate/post/rebuild]", err);
    const message = err instanceof Error ? err.message : "Rebuild failed";
    const status = message.includes("GEMINI") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
