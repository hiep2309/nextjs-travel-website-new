"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { pickLocalized } from "@/lib/i18n/content";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Eye, ExternalLink, Loader2, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { canDeletePost, canEditPost } from "@/lib/posts/permissions";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { postBelongsToSection, resolvePostType, type PostSection, sectionForPostType } from "@/lib/postCategories";
import { usePostTypeLabels } from "@/hooks/usePostTypeLabels";
import { normalizeTravelPost } from "@/lib/firestore/multilingual";
import type { TravelPost } from "@/lib/travelPost";

type FilterKey = "all" | PostSection;

type Props = {
  authorId: string;
  refreshKey?: number;
};

export default function MyPostsPanel({ authorId, refreshKey = 0 }: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("CreatePost");
  const tp = useTranslations("Posts");
  const tc = useTranslations("Common");
  const { role, user } = useAuth();
  const { label: labelForPostType, sectionLabel } = usePostTypeLabels();

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: tc("all") },
    { key: "destinations", label: sectionLabel("destinations") },
    { key: "tours", label: sectionLabel("tours") },
    { key: "guides", label: sectionLabel("guides") },
  ];

  const statusLabel = (status?: string) => {
    if (status === "approved")
      return { text: tp("approved"), className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200" };
    if (status === "pending")
      return { text: tp("pending"), className: "border-amber-500/40 bg-amber-500/15 text-amber-200" };
    if (status === "rejected")
      return { text: tp("rejected"), className: "border-red-500/40 bg-red-500/15 text-red-300" };
    return { text: status || "—", className: "border-white/20 bg-white/5 text-white/50" };
  };

  const [posts, setPosts] = useState<TravelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "posts"), where("authorId", "==", authorId));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => normalizeTravelPost(d.id, d.data() as Record<string, unknown>));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [authorId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const filtered = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((p) => postBelongsToSection(p, filter));
  }, [posts, filter]);

  const handleDelete = async (postId: string) => {
    if (!window.confirm(tp("confirmDelete"))) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      window.alert(tp("deleteErr"));
    }
  };

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: posts.length, destinations: 0, tours: 0, guides: 0 };
    for (const p of posts) {
      c[sectionForPostType(resolvePostType(p))] += 1;
    }
    return c;
  }, [posts]);

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.06] shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300/90">{t("myPosts")}</h3>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1 text-[10px] font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50"
          aria-label={t("refreshList")}
        >
          <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} aria-hidden />
          {t("refresh")}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-3 py-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
              filter === f.key
                ? "bg-violet-600/40 text-white ring-1 ring-violet-400/50"
                : "text-white/55 hover:bg-white/10"
            }`}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      <div className="max-h-[min(420px,50vh)] overflow-y-auto p-3">
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-8 text-sm text-white/50">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {tc("loading")}
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-xs text-white/45">
            {posts.length === 0 ? t("emptyAll") : t("emptyFilter")}
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((p) => {
              const type = resolvePostType(p);
              const st = statusLabel(p.status);
              return (
                <li key={p.id}>
                  <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-2">
                  <Link
                    href={`/posts/${p.id}`}
                    className="flex min-w-0 flex-1 gap-3 transition hover:opacity-90"
                  >
                    <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                      {p.image?.trim() ? (
                        <Image src={p.image} alt="" fill className="object-cover" sizes="64px" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-xs font-bold leading-snug text-white">
                        {pickLocalized(p.title || p.name, locale) || t("noTitle")}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-200">
                          {labelForPostType(type)}
                        </span>
                        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${st.className}`}>
                          {st.text}
                        </span>
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-[10px] text-white/40">
                        <span>{p.region || "—"}</span>
                        {p.status === "approved" ? (
                          <span className="inline-flex items-center gap-0.5">
                            <Eye className="size-3" aria-hidden />
                            {(p.viewCount ?? 0).toLocaleString("vi-VN")}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <ExternalLink className="mt-1 size-3.5 shrink-0 text-white/30" aria-hidden />
                  </Link>
                  <div className="flex shrink-0 flex-col gap-1">
                    {canEditPost(role, user?.uid, p.authorId, p.status) ? (
                      <Link
                        href={`/create-post?edit=${p.id}`}
                        className="rounded-lg border border-white/15 p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                        aria-label={tp("editPost")}
                        title={tp("editPost")}
                      >
                        <Pencil className="size-3.5" />
                      </Link>
                    ) : null}
                    {canDeletePost(role, user?.uid, p.authorId) ? (
                      <button
                        type="button"
                        onClick={() => void handleDelete(p.id)}
                        className="rounded-lg border border-red-500/30 p-1.5 text-red-300 hover:bg-red-500/15"
                        aria-label={tp("deletePost")}
                        title={tp("deletePost")}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    ) : null}
                  </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
