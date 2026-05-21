/**
 * Phần client của trang Explore — tải và hiển thị lưới bài đã duyệt.
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeVietnameseText } from "@/lib/normalizeVn";
import { flattenLocalizedForSearch, normalizeTravelPost } from "@/lib/firestore/multilingual";
import { BLUR_DATA_URL_LIGHT } from "@/lib/imagePlaceholder";
import { ExplorePostCardSkeleton } from "@/components/ui/Skeleton";
import { postBelongsToSection, resolvePostType } from "@/lib/postCategories";
import { usePostTypeLabels } from "@/hooks/usePostTypeLabels";
import { useLocalizedPost } from "@/hooks/useLocalizedPost";
import { sortPostsByViewsThenDate } from "@/lib/posts/sortPosts";
import type { TravelPost } from "@/lib/travelPost";

function ExplorePostCard({
  post,
  onDelete,
}: {
  post: TravelPost;
  onDelete: (postId: string) => void | Promise<void>;
}) {
  const t = useTranslations("Explore");
  const tp = useTranslations("Posts");
  const tc = useTranslations("Common");
  const { role } = useAuth();
  const { title, description } = useLocalizedPost(post);
  const typeLabels = usePostTypeLabels();
  const isAdmin = role === "admin";

  return (
    <article className="relative h-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg transition hover:border-amber-400/40">
      {isAdmin ? (
        <div className="absolute right-3 top-3 z-10 flex flex-wrap justify-end gap-2">
          <Link
            href={`/create-post?edit=${post.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-black/55 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-violet-600/80"
          >
            <Pencil className="size-3.5" aria-hidden />
            {tp("editPost")}
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void onDelete(post.id);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/40 bg-red-950/70 px-2.5 py-1.5 text-xs font-semibold text-red-100 shadow-lg backdrop-blur-sm transition hover:bg-red-600/80"
            aria-label={tp("deletePost")}
          >
            <Trash2 className="size-3.5" aria-hidden />
            {tp("deletePost")}
          </button>
        </div>
      ) : null}
      <Link href={`/posts/${post.id}`} className="group block h-full">
        <div className="relative h-48 bg-slate-800">
          {post.image?.trim() ? (
            <Image
              src={post.image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width:768px)100vw,33vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL_LIGHT}
            />
          ) : null}
        </div>
        <div className="p-4 sm:p-5">
          <p className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/70">
            <span className="rounded-md border border-amber-400/35 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
              {typeLabels.label(resolvePostType(post))}
            </span>
            <span>{post.region || tc("vietnam")}</span>
          </p>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-amber-100">
            {title || tc("notFound")}
          </h3>
          <p className="line-clamp-3 text-sm text-white/75">{description || t("noDesc")}</p>
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-white/55">
            <Eye className="size-3.5 shrink-0" aria-hidden />
            {(post.viewCount ?? 0).toLocaleString()} {tc("views")}
          </p>
        </div>
      </Link>
    </article>
  );
}

export default function ExploreClient() {
  const t = useTranslations("Explore");
  const tp = useTranslations("Posts");
  const tc = useTranslations("Common");
  const searchParams = useSearchParams();
  const selectedProvince = searchParams.get("province") || "";
  const searchQuery = searchParams.get("q") || "";
  const [posts, setPosts] = useState<TravelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, "posts"), where("status", "==", "approved"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => normalizeTravelPost(d.id, d.data() as Record<string, unknown>));
        setPosts(sortPostsByViewsThenDate(data));
      } catch {
        setError(t("loadError"));
      } finally {
        setLoading(false);
      }
    };
    void fetchPosts();
  }, [t]);

  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (!window.confirm(tp("confirmDelete"))) return;
      try {
        await deleteDoc(doc(db, "posts", postId));
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } catch {
        window.alert(tp("deleteErr"));
      }
    },
    [tp],
  );

  const filteredPosts = useMemo(() => {
    let list = posts.filter((p) => postBelongsToSection(p, "destinations"));
    const provinceNeedle = normalizeVietnameseText(selectedProvince);
    if (provinceNeedle) {
      list = list.filter((post) => {
        const region = normalizeVietnameseText(post.region || "");
        const searchable = normalizeVietnameseText(
          flattenLocalizedForSearch(post.title) +
            " " +
            flattenLocalizedForSearch(post.description) +
            " " +
            (post.name ?? ""),
        );
        return region.includes(provinceNeedle) || searchable.includes(provinceNeedle);
      });
    }
    const qNeedle = normalizeVietnameseText(searchQuery.trim());
    if (qNeedle) {
      list = list.filter((post) => {
        const region = normalizeVietnameseText(post.region || "");
        const searchable = normalizeVietnameseText(
          flattenLocalizedForSearch(post.title) +
            " " +
            flattenLocalizedForSearch(post.description) +
            " " +
            (post.name ?? ""),
        );
        return region.includes(qNeedle) || searchable.includes(qNeedle);
      });
    }
    return list;
  }, [posts, selectedProvince, searchQuery]);

  const heading = searchQuery.trim()
    ? t("titleQ", { q: searchQuery.trim() })
    : selectedProvince
      ? t("titleProvince", { province: selectedProvince })
      : t("titleAll");

  const sub = searchQuery.trim() ? t("descSearch") : t("descDefault");

  return (
    <div className="min-h-screen pt-24 pb-14 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/70">{t("eyebrow")}</p>
        <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">{heading}</h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">{sub}</p>
        <div className="mb-8 mt-6 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
            {tc("backHome")}
          </Link>
          {searchQuery.trim() ? (
            <Link
              href="/explore"
              className="inline-flex rounded-full border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-sm text-amber-100 hover:bg-amber-500/15"
            >
              {t("viewAll")}
            </Link>
          ) : null}
        </div>
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExplorePostCardSkeleton key={i} />
            ))}
          </div>
        )}
        {error && <p className="text-red-300">{error}</p>}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-white/80">{t("emptyMatch")}</div>
        )}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <ExplorePostCard key={post.id} post={post} onDelete={handleDeletePost} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
