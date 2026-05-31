import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PostLocaleWritePayload } from "@/lib/firestore/multilingual";
import { extractPostSourceFields } from "@/lib/translation/extractPostSource";
import { requestPostTranslation } from "@/lib/translation/requestPostTranslation";

export class TranslateExistingPostError extends Error {
  code: "not_found" | "missing_source" | "api";

  constructor(code: TranslateExistingPostError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

/** Translate an existing post via `/api/translate/post` and persist to Firestore (client SDK). */
export async function translateExistingPost(postId: string): Promise<PostLocaleWritePayload> {
  const id = postId.trim();
  if (!id) throw new TranslateExistingPostError("not_found", "Post not found");

  const snap = await getDoc(doc(db, "posts", id));
  if (!snap.exists()) {
    throw new TranslateExistingPostError("not_found", "Post not found");
  }

  const source = extractPostSourceFields(id, snap.data() as Record<string, unknown>);
  if (!source.title.trim() || !source.contentHtml.trim()) {
    throw new TranslateExistingPostError("missing_source", "Missing title or body");
  }

  let payload: PostLocaleWritePayload;
  try {
    payload = await requestPostTranslation({
      title: source.title,
      description: source.description,
      contentHtml: source.contentHtml,
      sourceLocale: source.sourceLocale,
      existingSlugs: source.existingSlugs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    throw new TranslateExistingPostError("api", message);
  }

  await updateDoc(doc(db, "posts", id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });

  return payload;
}
