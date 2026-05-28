/**
 * UI chi tiết địa điểm (theo tỉnh) — locale-aware via next-intl + localized province catalog.
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  BookOpen,
  Bookmark,
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  Share2,
  Sparkles,
  Star,
  Check,
} from "lucide-react";
import type { ProvinceDef } from "@/lib/vietnamProvinces";
import { TRAVEL_IMAGE_URLS } from "@/lib/travelImageUrls";
import { DestinationRelatedCard, PostCardVertical } from "@/components/cards";
import { relatedDestinationToCard, travelPostToContentCard } from "@/lib/cards/adapters";
import { ExplorePostCardSkeleton } from "@/components/ui/Skeleton";
import ProvinceImageViewer from "@/components/gallery/ProvinceImageViewer";
import { useLocalizedPost } from "@/hooks/useLocalizedPost";
import { usePostTypeLabels } from "@/hooks/usePostTypeLabels";
import { useProvincePosts } from "@/hooks/useProvincePosts";
import { resolvePostType } from "@/lib/postCategories";
import { collectImagesFromPosts } from "@/lib/posts/postsByProvince";
import { getPostViewCount } from "@/lib/posts/sortPosts";
import type { TravelPost } from "@/lib/travelPost";
import { useAuth } from "@/hooks/useAuth";
import { useDestinationPageModel } from "@/hooks/useDestinationPageModel";
import {
  getSavedDestinationSlugs,
  getUserDestinationRating,
  recordDestinationView,
  setUserDestinationRating,
  toggleSavedDestinationSlug,
} from "@/lib/userActivityStorage";

const ACCENT = {
  purple: "border-violet-500/35 bg-violet-500/10 text-violet-100",
  pink: "border-pink-500/35 bg-pink-500/10 text-pink-100",
  orange: "border-orange-500/35 bg-orange-500/10 text-orange-100",
};

type Props = { province: ProvinceDef };

function DestinationProvincePostCard({ post }: { post: TravelPost }) {
  const t = useTranslations("Explore");
  const tc = useTranslations("Common");
  const { title, description } = useLocalizedPost(post);
  const typeLabels = usePostTypeLabels();
  const card = travelPostToContentCard(post, {
    title: title || tc("notFound"),
    description,
    badge: typeLabels.label(resolvePostType(post)),
    badgeVariant: "amber",
  });

  return (
    <PostCardVertical
      card={card}
      emptyDescription={t("noDesc")}
      regionFallback={tc("vietnam")}
    />
  );
}

function numberLocale(locale: AppLocale): string {
  if (locale === "vi") return "vi-VN";
  if (locale === "ko") return "ko-KR";
  return "en-US";
}

export default function DestinationDetailClient({ province }: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Destinations");
  const tc = useTranslations("Common");
  const data = useDestinationPageModel(province);
  const fmt = numberLocale(locale);
  const { user } = useAuth();
  const activityUid = user?.uid ?? null;
  const [saved, setSaved] = useState(false);
  const [myStars, setMyStars] = useState<number | null>(null);
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const { posts: provincePosts, loading: postsLoading } = useProvincePosts(province.name);

  const regionViewCount = useMemo(
    () => provincePosts.reduce((sum, post) => sum + getPostViewCount(post), 0),
    [provincePosts],
  );

  const provinceImages = useMemo(() => collectImagesFromPosts(provincePosts), [provincePosts]);
  const galleryPreview = provinceImages.slice(0, 4);
  const galleryHref = `/destinations/${data.slug}/gallery`;

  const viewerLabels = {
    close: t("galleryClose"),
    zoomOut: t("galleryZoomOut"),
    zoomIn: t("galleryZoomIn"),
    fullscreen: t("galleryFullscreen"),
    exitFullscreen: t("galleryExitFullscreen"),
    download: t("galleryDownload"),
    counter: (current: number, total: number) => t("galleryCounter", { current, total }),
  };

  useEffect(() => {
    recordDestinationView(data.slug, activityUid);
    setMyStars(getUserDestinationRating(data.slug, activityUid));
  }, [data.slug, activityUid]);

  useEffect(() => {
    try {
      setSaved(getSavedDestinationSlugs(activityUid).includes(data.slug));
    } catch {
      setSaved(false);
    }
  }, [data.slug, activityUid]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const toggleSave = useCallback(() => {
    const next = toggleSavedDestinationSlug(data.slug, activityUid);
    setSaved(next);
    showToast(next ? t("saveToast") : t("unsaveToast"));
  }, [data.slug, showToast, activityUid, t]);

  const applyMyRating = useCallback(
    (stars: number) => {
      setUserDestinationRating(data.slug, stars, activityUid);
      setMyStars(stars);
      showToast(t("rateToast", { stars }));
    },
    [data.slug, showToast, activityUid, t],
  );

  const share = useCallback(async () => {
    const url = window.location.href;
    const title = data.headline;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      /* user cancelled */
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast(t("copyOk"));
    } catch {
      showToast(t("copyFail"));
    }
  }, [data.headline, showToast, t]);

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.quickInfo.location)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: data.headline,
    description: data.localized.summary,
    touristType: data.localized.region,
  };

  return (
    <div className="min-h-screen pb-20 pt-20 text-slate-100 sm:pt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-white/20 bg-slate-900/95 px-5 py-2.5 text-sm shadow-xl"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <section className="relative">
        <div className="relative h-[min(52vh,480px)] w-full sm:h-[min(58vh,560px)]">
          {data.heroImage.trim() ? (
            <FlexibleImage
              src={data.heroImage}
              alt=""
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-slate-800" aria-hidden />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/75 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav className="-mt-28 flex flex-wrap gap-y-1 pb-4 text-[11px] font-medium text-white/65 sm:-mt-32 sm:text-xs">
            <Link href="/" className="hover:text-amber-400">
              {t("breadcrumbHome")}
            </Link>
            <ChevronRight className="mx-1 size-3.5 shrink-0 opacity-50" aria-hidden />
            <Link href="/explore" className="hover:text-amber-400">
              {t("breadcrumbExplore")}
            </Link>
            <ChevronRight className="mx-1 size-3.5 shrink-0 opacity-50" aria-hidden />
            <span className="text-white/50">{data.localized.region}</span>
            <ChevronRight className="mx-1 size-3.5 shrink-0 opacity-50" aria-hidden />
            <span className="text-amber-200/90">{data.headline}</span>
          </nav>

          <div className="max-w-3xl pb-10">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {data.headline}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-amber-400" />
                {data.localized.name}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-amber-400" />
                {data.readMinutes} {tc("readMin")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-4 text-amber-400" />
                {regionViewCount > 0
                  ? `${regionViewCount.toLocaleString(fmt)} ${tc("views")}`
                  : t("viewsNone")}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-500"
              >
                <Bookmark className={`size-4 ${saved ? "fill-white" : ""}`} />
                {saved ? t("saved") : t("save")}
              </button>
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                <Share2 className="size-4" />
                {t("share")}
              </button>
              <div className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm font-bold text-amber-200">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {data.rating.toFixed(1)}
                <span className="font-normal text-amber-200/80">
                  ({data.ratingCount.toLocaleString(fmt)} {t("reviews")})
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 sm:px-6 lg:px-8">
        <article className="min-w-0 space-y-12">
          <section id="gioi-thieu" className="scroll-mt-28">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <BookOpen className="size-5 text-amber-400" />
              {t("intro")}
            </h2>
            <p className="leading-relaxed text-slate-300">{data.intro}</p>
          </section>

          <section id="vi-sao" className="scroll-mt-28">
            <h2 className="mb-6 text-xl font-bold text-white">
              {t("whyExplore", { name: data.localized.name })}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {data.whyCards.map((c) => (
                <div key={c.key} className={`rounded-2xl border p-5 ${ACCENT[c.accent]}`}>
                  <Sparkles className="mb-3 size-6 opacity-90" />
                  <h3 className="mb-2 font-bold">{c.title}</h3>
                  <p className="text-sm leading-relaxed opacity-90">{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="trai-nghiem" className="scroll-mt-28">
            <h2 className="mb-6 text-xl font-bold text-white">{t("mustDo")}</h2>
            {postsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <ExplorePostCardSkeleton key={i} />
                ))}
              </div>
            ) : provincePosts.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-8 text-center text-sm text-slate-400">
                {t("noProvincePosts")}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {provincePosts.map((post) => (
                  <DestinationProvincePostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>

          <section id="kinh-nghiem" className="scroll-mt-28">
            <h2 className="mb-6 text-xl font-bold text-white">{t("travelTips")}</h2>
            <ul className="space-y-3">
              {data.tips.map((tip) => (
                <li
                  key={tip}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-slate-300"
                >
                  <Check className="mt-0.5 size-5 shrink-0 text-emerald-400" aria-hidden />
                  <span className="text-sm leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="hinh-anh" className="scroll-mt-28">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">{t("gallery")}</h2>
              {provinceImages.length > 0 ? (
                <Link href={galleryHref} className="text-sm font-semibold text-amber-400 hover:underline">
                  {t("viewAllGallery")}
                </Link>
              ) : null}
            </div>
            {postsLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-white/10" />
                ))}
              </div>
            ) : galleryPreview.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-8 text-center text-sm text-slate-400">
                {t("noProvinceGallery")}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {galleryPreview.map(({ url, postId }) => {
                  const imageIndex = provinceImages.findIndex(
                    (img) => img.url === url && img.postId === postId,
                  );
                  return (
                    <button
                      key={`${postId}-${url}`}
                      type="button"
                      onClick={() => setViewerIndex(imageIndex >= 0 ? imageIndex : 0)}
                      className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
                    >
                      <FlexibleImage
                        src={url}
                        alt=""
                        className="object-cover transition group-hover:scale-105"
                        sizes="200px"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section id="lien-quan" className="scroll-mt-28">
            <h2 className="mb-6 text-xl font-bold text-white">{t("relatedSection")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.related.map((r) => (
                <DestinationRelatedCard key={r.slug} card={relatedDestinationToCard(r)} />
              ))}
            </div>
          </section>
        </article>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400/90">{t("quickInfo")}</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">{t("location")}</dt>
                <dd className="mt-0.5 text-slate-200">{data.quickInfo.location}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t("idealTimeLabel")}</dt>
                <dd className="mt-0.5 text-slate-200">{data.quickInfo.idealTime}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t("suitabilityLabel")}</dt>
                <dd className="mt-0.5 text-slate-200">{data.quickInfo.suitability}</dd>
              </div>
            </dl>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-amber-400/50 bg-amber-400/10 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20"
            >
              {t("viewOnMap")}
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400/90">{t("tocTitle")}</h3>
            <ol className="mt-4 space-y-2">
              {data.toc.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollToId(item.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <span className="font-mono text-xs text-amber-400/80">{item.num}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/25 to-slate-900/80">
            <div className="relative h-32">
              <FlexibleImage
                src={TRAVEL_IMAGE_URLS.oldTown}
                alt=""
                className="object-cover opacity-90"
                sizes="340px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">{t("tourSuggestTitle")}</p>
              <p className="mt-2 text-lg font-bold text-white">{t("tourSuggestBody")}</p>
              <p className="mt-1 text-sm text-slate-400">{t("tourSuggestDesc")}</p>
              <Link
                href="/tours"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-bold text-slate-900 transition hover:bg-white/90"
              >
                {t("viewTours")}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400/90">{t("communityReviews")}</h3>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-black text-white">{data.rating.toFixed(1)}</span>
              <span className="pb-1 text-sm text-slate-400">/ 5</span>
            </div>
            <div className="mt-2 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`size-4 ${s <= Math.round(data.rating) ? "fill-amber-400 text-amber-400" : "text-slate-600"}`}
                />
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {data.starBreakdown.map((row) => (
                <div key={row.star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-slate-500">{row.star}</span>
                  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-amber-500/70" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-500">{row.pct}%</span>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-300/90">{t("yourRating")}</p>
              <p className="mt-1 text-xs text-slate-400">
                {myStars ? t("rateSaved", { stars: myStars }) : t("rateHint")}
              </p>
              <div
                className="mt-3 flex gap-1"
                onMouseLeave={() => setHoverStar(null)}
                role="group"
                aria-label={t("rateStarsGroup")}
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
                      onClick={() => applyMyRating(s)}
                      className="rounded-md p-1 text-amber-400 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      aria-label={t("starAria", { n: s })}
                    >
                      <Star className={`size-7 ${active ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Link
            href="/explore"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            {t("backToList")}
          </Link>
        </aside>
      </div>

      {viewerIndex !== null && provinceImages.length > 0 ? (
        <ProvinceImageViewer
          images={provinceImages}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          labels={viewerLabels}
        />
      ) : null}
    </div>
  );
}
