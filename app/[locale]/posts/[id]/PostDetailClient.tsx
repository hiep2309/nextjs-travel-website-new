/**
 * Client: chi tiết bài viết — đọc Firestore, viewCount, lưu local, đánh giá.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const POST_SAVED_TOAST_KEY = "vninsight_post_saved";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { Bookmark, Eye, Pencil, Star, Trash2 } from "lucide-react";
import { deleteDoc, doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { useRouter } from "@/lib/i18n/navigation";
import { canDeletePost, canEditPost } from "@/lib/posts/permissions";
import { db } from "@/lib/firebase";
import {
  getUserPostRating,
  isPostSaved,
  recordPostView,
  setUserPostRating,
  toggleSavedPost,
} from "@/lib/userActivityStorage";
import { useAuth } from "@/hooks/useAuth";
import { resolvePostCoverImage } from "@/lib/posts/coverImage";
import { Skeleton } from "@/components/ui/Skeleton";
import { absoluteUrl } from "@/lib/siteUrl";
import { resolvePostType } from "@/lib/postCategories";
import { usePostTypeLabels } from "@/hooks/usePostTypeLabels";
import { useLocalizedPost } from "@/hooks/useLocalizedPost";
import { normalizeTravelPost } from "@/lib/firestore/multilingual";
import type { TravelPost } from "@/lib/travelPost";

function resolvePostId(postIdProp: string | undefined, params: ReturnType<typeof useParams>) {
  if (postIdProp?.trim()) return postIdProp.trim();
  const raw = params?.id;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return "";
}

export default function PostDetailClient({ postId: postIdProp }: { postId?: string } = {}) {
  const t = useTranslations("Posts");
  const tc = useTranslations("Common");
  const { label: labelForPostType } = usePostTypeLabels();
  const params = useParams();
  const id = resolvePostId(postIdProp, params);
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const activityUid = user?.uid ?? null;
  const recordedViewKeyRef = useRef<string | null>(null);
  const [post, setPost] = useState<TravelPost | null>(null);
  const localized = useLocalizedPost(post);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const [myStars, setMyStars] = useState<number | null>(null);
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    if (!id || typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(POST_SAVED_TOAST_KEY) === id) {
        sessionStorage.removeItem(POST_SAVED_TOAST_KEY);
        showToast(t("savedAfterEdit"));
      }
    } catch {
      /* ignore */
    }
  }, [id, showToast, t]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setErr(t("notFound"));
      setPost(null);
      return;
    }
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const snap = await getDoc(doc(db, "posts", id));
        if (!snap.exists()) {
          setErr(t("notFound"));
          setPost(null);
        } else {
          const normalized = normalizeTravelPost(snap.id, snap.data() as Record<string, unknown>);
          setPost(normalized);

          const canBumpViews =
            normalized.status === "approved" || normalized.status === "pending";
          if (canBumpViews) {
            void (async () => {
              try {
                await updateDoc(doc(db, "posts", id), { viewCount: increment(1) });
                setPost((prev) =>
                  prev ? { ...prev, viewCount: (prev.viewCount ?? 0) + 1 } : prev,
                );
              } catch (e) {
                if (process.env.NODE_ENV === "development") {
                  console.warn("[posts] Không tăng được viewCount (kiểm tra Firestore rules / quyền):", e);
                }
              }
            })();
          }
        }
      } catch {
        setErr(t("loadError"));
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, t]);

  useEffect(() => {
    if (!id || !post || authLoading) return;
    const key = `${id}\0${activityUid ?? ""}`;
    if (recordedViewKeyRef.current === key) return;
    recordedViewKeyRef.current = key;
    const title = localized.title || t("defaultTitle");
    const image = post.image || null;
    recordPostView({ id, title, image }, activityUid);
  }, [id, post, authLoading, activityUid, localized.title, t]);

  useEffect(() => {
    if (!id || authLoading) return;
    setSaved(isPostSaved(id, activityUid));
    setMyStars(post ? getUserPostRating(id, activityUid) : null);
  }, [id, post, authLoading, activityUid]);

  const postMeta =
    post && id
      ? {
          id,
          title: localized.title || t("defaultTitle"),
          image: post.image || null,
        }
      : null;

  const handleToggleSave = () => {
    if (!postMeta) return;
    const next = toggleSavedPost(postMeta, activityUid);
    setSaved(next);
    showToast(next ? t("saveToast") : t("unsaveToast"));
  };

  const handleDelete = async () => {
    if (!id || !post) return;
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await deleteDoc(doc(db, "posts", id));
      showToast(t("deletedOk"));
      router.push("/create-post");
    } catch {
      showToast(t("deleteErr"));
    }
  };

  const applyRating = (stars: number) => {
    if (!postMeta) return;
    setUserPostRating(postMeta, stars, activityUid);
    setMyStars(stars);
    showToast(t("rateToast", { stars }));
  };

  const postType = post ? resolvePostType(post) : null;
  const backHref =
    postType === "tour_share"
      ? "/tours"
      : postType?.startsWith("guide_")
        ? "/guides"
        : "/explore";
  const backLabel =
    postType === "tour_share"
      ? t("backTours")
      : postType?.startsWith("guide_")
        ? t("backGuides")
        : t("backDestinations");
  const coverSrc = post ? resolvePostCoverImage(post) : "";
  const jsonLd =
    post && id
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: localized.title,
          description: (localized.description || "").slice(0, 500),
          image: post.image?.startsWith("http") ? post.image : absoluteUrl("/signup_pic.jpg"),
          mainEntityOfPage: absoluteUrl(`/posts/${id}`),
        }
      : null;

  return (
    <div className="min-h-screen px-4 pb-16 pt-24 text-white">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-white/20 bg-slate-900/95 px-5 py-2.5 text-sm shadow-xl"
          role="status"
        >
          {toast}
        </div>
      ) : null}
      <div className="mx-auto max-w-3xl">
        <Link href={backHref} className="mb-6 inline-block text-sm text-amber-300 hover:underline">
          ← {backLabel}
        </Link>
        {loading && (
          <div className="space-y-6" aria-busy="true">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-10 w-full max-w-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        )}
        {err && <p className="text-red-300">{err}</p>}
        {!loading && post && (
          <>
            {post.status === "pending" ? (
              <div
                className="mb-4 rounded-xl border border-amber-500/45 bg-amber-500/15 px-4 py-3 text-sm leading-relaxed text-amber-50"
                role="status"
              >
                {role === "admin" ? (
                  <>
                    <p>
                      Bản xem trước — bài đang chờ duyệt. Kiểm tra nội dung rồi quay lại dashboard để duyệt hoặc từ
                      chối.
                    </p>
                    <Link
                      href="/dashboard#pending-posts"
                      className="mt-2 inline-block text-sm font-semibold text-amber-200 underline hover:text-white"
                    >
                      ← Về dashboard (bài chờ duyệt)
                    </Link>
                  </>
                ) : (
                  t("pendingNotice")
                )}
              </div>
            ) : null}
            {(canEditPost(role, user?.uid, post.authorId, post.status) ||
              canDeletePost(role, user?.uid, post.authorId)) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {canEditPost(role, user?.uid, post.authorId, post.status) ? (
                  <Link
                    href={`/create-post?edit=${id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    <Pencil className="size-4" />
                    {t("editPost")}
                  </Link>
                ) : null}
                {canDeletePost(role, user?.uid, post.authorId) ? (
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/25"
                  >
                    <Trash2 className="size-4" />
                    {t("deletePost")}
                  </button>
                ) : null}
              </div>
            )}
            <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-800">
              {coverSrc ? (
                <FlexibleImage
                  src={coverSrc}
                  alt=""
                  sizes="(max-width: 768px) 100vw, 48rem"
                  priority
                />
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <p className="text-white/60">{post.region || tc("vietnam")}</p>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/70">
                <Eye className="size-3.5 opacity-80" aria-hidden />
                {(post.viewCount ?? 0).toLocaleString("vi-VN")} {tc("views")}
              </span>
              {postType ? (
                <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-200/90">
                  {labelForPostType(postType)}
                </span>
              ) : null}
              {post.travelTime ? (
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-white/70">
                  {post.travelTime}
                </span>
              ) : null}
              {post.tags?.length ? (
                <span className="text-white/45">{post.tags.slice(0, 6).join(" · ")}</span>
              ) : null}
              <button
                type="button"
                onClick={handleToggleSave}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/25"
              >
                <Bookmark className={`size-4 ${saved ? "fill-violet-200" : ""}`} />
                {saved ? t("saved") : t("savePost")}
              </button>
            </div>
            <h1 className="mt-2 text-3xl font-bold">{localized.title || t("defaultTitle")}</h1>
            {localized.contentHtml ? (
              <div
                className="post-body-html mt-4 text-[15px] leading-relaxed text-white/[0.88]"
                dangerouslySetInnerHTML={{ __html: localized.contentHtml }}
              />
            ) : (
              <p className="mt-4 whitespace-pre-wrap leading-relaxed text-white/85">
                {localized.description || ""}
              </p>
            )}

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400/90">{t("yourRating")}</p>
              <p className="mt-1 text-sm text-white/55">
                {myStars ? t("ratedHint", { stars: myStars }) : t("rateHint")}
              </p>
              <div
                className="mt-3 flex gap-1"
                onMouseLeave={() => setHoverStar(null)}
                role="group"
                aria-label={t("rateAria")}
              >
                {[1, 2, 3, 4, 5].map((s) => {
                  const active = (hoverStar ?? myStars ?? 0) >= s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverStar(s)}
                      onFocus={() => setHoverStar(s)}
                      onBlur={() => setHoverStar(null)}
                      onClick={() => applyRating(s)}
                      className="rounded-md p-1 text-amber-400 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      aria-label={`${s} sao`}
                    >
                      <Star className={`size-8 ${active ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
