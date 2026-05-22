/**
 * Nháp bài viết trong `localStorage` theo Firebase uid (chỉ client).
 * Một nháp đang soạn / lần lưu gần nhất — tương thích khóa cũ `vninsight_create_post_draft:{uid}`.
 */

import type { PostType } from "@/lib/postCategories";

const LEGACY_DRAFT_PREFIX = "vninsight_create_post_draft:";
const DRAFT_KEY_PREFIX = "vninsight_post_draft:";

export const POST_DRAFTS_CHANGED_EVENT = "vninsight-post-drafts-changed";

export type PostDraft = {
  title: string;
  destination: string;
  postType?: PostType | "";
  travelTime?: string;
  tagsRaw?: string;
  html: string;
  imageUrls: string[];
  updatedAt: number;
};

function draftKey(uid: string) {
  return `${DRAFT_KEY_PREFIX}${uid}`;
}

function legacyDraftKey(uid: string) {
  return `${LEGACY_DRAFT_PREFIX}${uid}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function notifyDraftsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(POST_DRAFTS_CHANGED_EVENT));
}

function migrateLegacyDraft(uid: string): PostDraft | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(legacyDraftKey(uid));
  if (!raw) return null;
  const legacy = safeParse<{
    title?: string;
    destination?: string;
    postType?: PostType;
    travelTime?: string;
    tagsRaw?: string;
    html?: string;
    imageUrls?: string[];
  }>(raw, {});
  const draft: PostDraft = {
    title: legacy.title?.trim() ?? "",
    destination: legacy.destination?.trim() ?? "",
    postType: legacy.postType ?? "",
    travelTime: legacy.travelTime ?? "",
    tagsRaw: legacy.tagsRaw ?? "",
    html: legacy.html ?? "",
    imageUrls: Array.isArray(legacy.imageUrls) ? legacy.imageUrls.filter(Boolean) : [],
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(draftKey(uid), JSON.stringify(draft));
    localStorage.removeItem(legacyDraftKey(uid));
  } catch {
    /* ignore */
  }
  return draft;
}

export function postDraftExcerpt(html: string, max = 160): string {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!plain) return "";
  return plain.slice(0, max) + (plain.length > max ? "…" : "");
}

export function isPostDraftEmpty(draft: PostDraft): boolean {
  return (
    !draft.title.trim() &&
    !draft.destination.trim() &&
    !draft.html.replace(/<[^>]+>/g, "").trim() &&
    draft.imageUrls.length === 0
  );
}

/** Đọc nháp hiện tại (null nếu chưa có hoặc rỗng). */
export function getPostDraft(uid: string): PostDraft | null {
  if (typeof window === "undefined" || !uid) return null;
  let raw = localStorage.getItem(draftKey(uid));
  if (!raw) {
    const migrated = migrateLegacyDraft(uid);
    if (!migrated || isPostDraftEmpty(migrated)) return null;
    return migrated;
  }
  const draft = safeParse<PostDraft>(raw, null as unknown as PostDraft);
  if (!draft || typeof draft !== "object") return null;
  if (isPostDraftEmpty(draft)) return null;
  return {
    title: draft.title ?? "",
    destination: draft.destination ?? "",
    postType: draft.postType ?? "",
    travelTime: draft.travelTime ?? "",
    tagsRaw: draft.tagsRaw ?? "",
    html: draft.html ?? "",
    imageUrls: Array.isArray(draft.imageUrls) ? draft.imageUrls.filter(Boolean) : [],
    updatedAt: typeof draft.updatedAt === "number" ? draft.updatedAt : Date.now(),
  };
}

/** Danh sách nháp (hiện tại tối đa 1 bản). */
export function listPostDrafts(uid: string): PostDraft[] {
  const draft = getPostDraft(uid);
  return draft ? [draft] : [];
}

export function savePostDraft(
  uid: string,
  input: Omit<PostDraft, "updatedAt">,
): PostDraft {
  const draft: PostDraft = {
    title: input.title ?? "",
    destination: input.destination ?? "",
    postType: input.postType ?? "",
    travelTime: input.travelTime ?? "",
    tagsRaw: input.tagsRaw ?? "",
    html: input.html ?? "",
    imageUrls: Array.isArray(input.imageUrls) ? input.imageUrls.filter(Boolean) : [],
    updatedAt: Date.now(),
  };
  if (typeof window !== "undefined" && uid) {
    localStorage.setItem(draftKey(uid), JSON.stringify(draft));
    localStorage.removeItem(legacyDraftKey(uid));
    notifyDraftsChanged();
  }
  return draft;
}

export function removePostDraft(uid: string): void {
  if (typeof window === "undefined" || !uid) return;
  localStorage.removeItem(draftKey(uid));
  localStorage.removeItem(legacyDraftKey(uid));
  notifyDraftsChanged();
}
