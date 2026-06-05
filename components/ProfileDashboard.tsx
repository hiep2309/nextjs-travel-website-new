/**
 * Trang hồ sơ đầy đủ — avatar, thống kê, tab Đã lưu / Đã xem / Đánh giá / Blog của tôi.
 *
 * Gộp dữ liệu local (`userActivityStorage`) và Firestore (role, ảnh Google…).
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Bookmark,
  BookOpen,
  Camera,
  ChevronRight,
  Clock,
  Compass,
  FilePenLine,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  PenSquare,
  Pencil,
  Shield,
  Sparkles,
  Star,
  User,
  UtensilsCrossed,
  Heart,
} from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { reload, updateProfile } from "firebase/auth";
import {
  DISPLAY_NAME_MAX,
  DISPLAY_NAME_MIN,
  validateDisplayName,
} from "@/lib/comments/displayName";
import { DisplayNameUpdateError, updateUserDisplayName } from "@/lib/user";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { prepareImageForUpload } from "@/lib/imageUploadPrep";
import { auth, db, storage } from "@/lib/firebase";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { ContentCardOverlay } from "@/components/cards";
import FlexibleImage from "@/components/ui/FlexibleImage";
import ProfileItinerariesPanel from "@/components/itinerary/ProfileItinerariesPanel";
import ProfilePostDraftsPanel from "@/components/create-post/ProfilePostDraftsPanel";
import ProfileSavedFoodsPanel from "@/components/profile/ProfileSavedFoodsPanel";
import ProfileTripFoodsPanel from "@/components/profile/ProfileTripFoodsPanel";
import { buildDestinationModelForProvince } from "@/hooks/useDestinationPageModel";
import { getProvinceBySlug } from "@/lib/provinceSlug";
import { useAuth } from "@/hooks/useAuth";
import type { MergedProfile } from "@/hooks/useUserProfile";
import { DEFAULT_COVER_IMAGE } from "@/lib/publicAssets";
import {
  getDestinationHistory,
  getPostHistory,
  getSavedDestinationSlugs,
  getSavedPosts,
  getUserDestinationRatings,
  getUserPostRatings,
} from "@/lib/userActivityStorage";
import { getPostDraft, POST_DRAFTS_CHANGED_EVENT } from "@/lib/postDraftStorage";

const glass = "rounded-2xl border border-white/15 bg-white/[0.06] shadow-xl backdrop-blur-xl";

type TabId =
  | "saved"
  | "itineraries"
  | "drafts"
  | "history"
  | "reviews"
  | "savedFoods"
  | "tripFoods";
type FilterId = "all" | "destination" | "post";

type ContentRow = {
  key: string;
  kind: "destination" | "post";
  title: string;
  image: string;
  href: string;
  at: number;
  sub: string;
  chip: string;
  extra?: string;
};

function defaultPostImage() {
  return DEFAULT_COVER_IMAGE;
}

type ActivityItem = { label: string; title: string; href: string; at: number; thumb: string };

type ProfileT = ReturnType<typeof useTranslations<"Profile">>;

function formatRelativeTime(ts: number, t: ProfileT, locale: AppLocale): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 45) return t("justNow");
  const min = Math.floor(sec / 60);
  if (min < 60) return t("minutesAgo", { count: min });
  const h = Math.floor(min / 60);
  if (h < 24) return t("hoursAgo", { count: h });
  const d = Math.floor(h / 24);
  if (d < 7) return t("daysAgo", { count: d });
  const localeTag = locale === "vi" ? "vi-VN" : locale === "ko" ? "ko-KR" : "en-US";
  return new Date(ts).toLocaleDateString(localeTag);
}

function buildActivityFeed(
  uid: string,
  locale: AppLocale,
  tDest: (key: string, values?: Record<string, string | number>) => string,
  tProfile: ProfileT,
): ActivityItem[] {
  const items: ActivityItem[] = [];
  for (const { slug, at } of getDestinationHistory(uid).slice(0, 12)) {
    const p = getProvinceBySlug(slug);
    if (!p) continue;
    const m = buildDestinationModelForProvince(p, locale, tDest);
    items.push({
      label: tProfile("activityViewed"),
      title: m.headline,
      href: `/destinations/${slug}`,
      at,
      thumb: m.heroImage,
    });
  }
  for (const s of getSavedPosts(uid)) {
    items.push({
      label: tProfile("activitySavedPost"),
      title: s.title,
      href: `/posts/${s.id}`,
      at: s.savedAt,
      thumb: s.image || defaultPostImage(),
    });
  }
  for (const { slug, stars, at } of getUserDestinationRatings(uid)) {
    const p = getProvinceBySlug(slug);
    if (!p) continue;
    const m = buildDestinationModelForProvince(p, locale, tDest);
    items.push({
      label: tProfile("activityRated", { stars }),
      title: m.headline,
      href: `/destinations/${slug}`,
      at,
      thumb: m.heroImage,
    });
  }
  for (const r of getUserPostRatings(uid)) {
    items.push({
      label: tProfile("activityRated", { stars: r.stars }),
      title: r.title,
      href: `/posts/${r.id}`,
      at: r.at,
      thumb: r.image || defaultPostImage(),
    });
  }
  return items.sort((a, b) => b.at - a.at).slice(0, 6);
}

const AVATAR_MAX_MB = 5;

export default function ProfileDashboard({ profile }: { profile: MergedProfile }) {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const tProfile = useTranslations("Profile");
  const tDest = useTranslations("Destinations");
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const { logout } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const profileContentRef = useRef<HTMLDivElement>(null);
  const [avatarLocalUrl, setAvatarLocalUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [displayNameDraft, setDisplayNameDraft] = useState(profile.name);
  const [displayNameSaving, setDisplayNameSaving] = useState(false);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState<TabId>("itineraries");
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [counts, setCounts] = useState({
    saved: 0,
    history: 0,
    reviews: 0,
    places: 0,
    drafts: 0,
  });
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

  useEffect(() => {
    setDisplayNameDraft(profile.name);
  }, [profile.name]);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener("storage", bump);
    window.addEventListener(POST_DRAFTS_CHANGED_EVENT, bump);
    const onVis = () => {
      if (document.visibilityState === "visible") bump();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("storage", bump);
      window.removeEventListener(POST_DRAFTS_CHANGED_EVENT, bump);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const avatarSrc =
    avatarLocalUrl ||
    profile.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`;

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(tProfile("avatarInvalidType"));
      return;
    }
    if (file.size > AVATAR_MAX_MB * 1024 * 1024) {
      alert(tProfile("avatarTooLarge", { max: AVATAR_MAX_MB }));
      return;
    }

    const cur = auth.currentUser;
    if (!cur) return;

    setAvatarUploading(true);
    try {
      const prepared = await prepareImageForUpload(file);
      const ext =
        prepared.type === "image/webp"
          ? "webp"
          : prepared.type === "image/png"
            ? "png"
            : "jpg";
      const path = `avatars/${cur.uid}/${Date.now()}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, prepared, { contentType: prepared.type || "image/jpeg" });
      const url = await getDownloadURL(storageRef);
      await updateProfile(cur, { photoURL: url });
      await reload(cur);
      await setDoc(
        doc(db, "users", cur.uid),
        { photoURL: url, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      setAvatarLocalUrl(url);
    } catch (err) {
      console.error("[Profile] avatar upload failed:", err);
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: string }).code)
          : "";
      if (code === "storage/unauthorized") {
        alert(tProfile("avatarPermissionErr"));
      } else {
        alert(tProfile("avatarUploadErr"));
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  const displayNameTrimmed = displayNameDraft.trim().replace(/\s+/g, " ");
  const displayNameChanged = displayNameTrimmed !== profile.name;

  const handleSaveDisplayName = async () => {
    const parsed = validateDisplayName(displayNameDraft);
    if (!parsed.ok) {
      if (parsed.error === "tooShort") {
        alert(tProfile("displayNameErrTooShort", { min: DISPLAY_NAME_MIN }));
      } else if (parsed.error === "tooLong") {
        alert(tProfile("displayNameErrTooLong", { max: DISPLAY_NAME_MAX }));
      } else if (parsed.error === "generic") {
        alert(tProfile("displayNameErrGeneric"));
      } else if (parsed.error === "invalid") {
        alert(tProfile("displayNameErrInvalid"));
      } else {
        alert(tProfile("displayNameErrEmpty"));
      }
      return;
    }

    if (parsed.value === profile.name) return;

    const cur = auth.currentUser;
    if (!cur) return;

    setDisplayNameSaving(true);
    try {
      await updateUserDisplayName(cur, parsed.value);
      setDisplayNameDraft(parsed.value);
      setEditingDisplayName(false);
    } catch (err) {
      if (err instanceof DisplayNameUpdateError && err.code !== "auth") {
        alert(tProfile("displayNameErrGeneric"));
      } else {
        alert(tProfile("displayNameErrSave"));
      }
    } finally {
      setDisplayNameSaving(false);
    }
  };

  const handleCancelDisplayName = () => {
    setDisplayNameDraft(profile.name);
    setEditingDisplayName(false);
  };

  const isAdmin = profile.role === "admin";

  useEffect(() => {
    const uid = profile.uid;
    const savedSlugs = getSavedDestinationSlugs(uid);
    const savedPosts = getSavedPosts(uid);
    const destHistory = getDestinationHistory(uid);
    const postHistory = getPostHistory(uid);
    const destReviews = getUserDestinationRatings(uid);
    const postReviews = getUserPostRatings(uid);

    const destRowsForSlugs = (slugs: string[], subLine: (slug: string) => string) => {
      const out: ContentRow[] = [];
      for (const slug of slugs) {
        const p = getProvinceBySlug(slug);
        if (!p) continue;
        const m = buildDestinationModelForProvince(p, locale, tDest);
        out.push({
          key: `d-${slug}`,
          kind: "destination",
          title: m.headline,
          image: m.heroImage,
          href: `/destinations/${slug}`,
          at: 0,
          sub: subLine(slug),
          chip: tProfile("chipDestination"),
        });
      }
      return out;
    };

    const rel = (at: number) => formatRelativeTime(at, tProfile, locale);

    let list: ContentRow[] = [];

    if (tab === "saved") {
      const destSaved = destRowsForSlugs(savedSlugs, () => tProfile("subSavedToList"));
      const posts: ContentRow[] = savedPosts.map((s) => ({
        key: `p-${s.id}`,
        kind: "post",
        title: s.title,
        image: s.image || defaultPostImage(),
        href: `/posts/${s.id}`,
        at: s.savedAt,
        sub: tProfile("subSavedAt", { time: rel(s.savedAt) }),
        chip: tProfile("chipPost"),
      }));
      list = [...destSaved, ...posts];
    } else if (tab === "history") {
      const dest = destHistory
        .map((h) => {
          const p = getProvinceBySlug(h.slug);
          if (!p) return null;
          const m = buildDestinationModelForProvince(p, locale, tDest);
          return {
            key: `d-${h.slug}-${h.at}`,
            kind: "destination" as const,
            title: m.headline,
            image: m.heroImage,
            href: `/destinations/${h.slug}`,
            at: h.at,
            sub: tProfile("subViewedAt", { time: rel(h.at) }),
            chip: tProfile("chipDestination"),
          };
        })
        .filter(Boolean) as ContentRow[];
      const posts: ContentRow[] = postHistory.map((h) => ({
        key: `p-${h.id}-${h.at}`,
        kind: "post",
        title: h.title,
        image: h.image || defaultPostImage(),
        href: `/posts/${h.id}`,
        at: h.at,
        sub: tProfile("subViewedAt", { time: rel(h.at) }),
        chip: tProfile("chipPost"),
      }));
      list = [...dest, ...posts];
    } else if (tab === "reviews") {
      const dest = destReviews
        .map((r) => {
          const p = getProvinceBySlug(r.slug);
          if (!p) return null;
          const m = buildDestinationModelForProvince(p, locale, tDest);
          return {
            key: `dr-${r.slug}`,
            kind: "destination" as const,
            title: m.headline,
            image: m.heroImage,
            href: `/destinations/${r.slug}`,
            at: r.at,
            sub: tProfile("subRated", { stars: r.stars, time: rel(r.at) }),
            chip: tProfile("chipDestination"),
            extra: `${r.stars}`,
          };
        })
        .filter(Boolean) as ContentRow[];
      const posts: ContentRow[] = postReviews.map((r) => ({
        key: `pr-${r.id}`,
        kind: "post",
        title: r.title,
        image: r.image || defaultPostImage(),
        href: `/posts/${r.id}`,
        at: r.at,
        sub: tProfile("subRated", { stars: r.stars, time: rel(r.at) }),
        chip: tProfile("chipPost"),
        extra: `${r.stars}`,
      }));
      list = [...dest, ...posts];
    } else {
      list = [];
    }

    if (filter === "destination") list = list.filter((r) => r.kind === "destination");
    if (filter === "post") list = list.filter((r) => r.kind === "post");

    const unknownLast = (a: ContentRow, b: ContentRow) => {
      const atA = a.at || 0;
      const atB = b.at || 0;
      if (atA === 0 && atB === 0) return a.title.localeCompare(b.title, locale);
      if (atA === 0) return 1;
      if (atB === 0) return -1;
      return sort === "newest" ? atB - atA : atA - atB;
    };
    list = [...list].sort(unknownLast);

    const uniqDest = new Set([
      ...savedSlugs,
      ...destHistory.map((h) => h.slug),
      ...destReviews.map((r) => r.slug),
    ]);

    setRows(list);
    setCounts({
      saved: savedSlugs.length + savedPosts.length,
      history: destHistory.length + postHistory.length,
      reviews: destReviews.length + postReviews.length,
      places: uniqDest.size,
      drafts: getPostDraft(profile.uid) ? 1 : 0,
    });
  }, [tab, filter, sort, tick, profile.uid, locale, tDest, tProfile]);

  useEffect(() => {
    setActivityFeed(buildActivityFeed(profile.uid, locale, tDest, tProfile));
  }, [tick, profile.uid, locale, tDest, tProfile]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const scrollToProfileContent = () => {
    profileContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTabChange = (nextTab: TabId) => {
    setTab(nextTab);
    if (nextTab === "saved" || nextTab === "history" || nextTab === "reviews") {
      setFilter("all");
    }
    if (nextTab === "savedFoods" || nextTab === "tripFoods") {
      scrollToProfileContent();
    }
  };

  const handleStatNavigate = (target: "saved" | "history" | "reviews" | "places") => {
    if (target === "places") {
      const uid = profile.uid;
      const savedDestinations = getSavedDestinationSlugs(uid);
      const viewedDestinations = getDestinationHistory(uid);
      if (savedDestinations.length > 0) {
        setTab("saved");
        setFilter("destination");
      } else if (viewedDestinations.length > 0) {
        setTab("history");
        setFilter("destination");
      } else {
        setTab("reviews");
        setFilter("destination");
      }
    } else {
      setTab(target);
      setFilter("all");
    }
    scrollToProfileContent();
  };

  const isPlacesStatActive = filter === "destination" && (tab === "saved" || tab === "history" || tab === "reviews");

  const statCards = [
    {
      id: "saved" as const,
      icon: Bookmark,
      label: tProfile("saved"),
      value: counts.saved,
      color: "text-violet-400",
      active: tab === "saved" && filter === "all",
    },
    {
      id: "history" as const,
      icon: History,
      label: tProfile("statHistory"),
      value: counts.history,
      color: "text-blue-400",
      active: tab === "history" && filter === "all",
    },
    {
      id: "reviews" as const,
      icon: Star,
      label: tProfile("reviews"),
      value: counts.reviews,
      color: "text-amber-400",
      active: tab === "reviews" && filter === "all",
    },
    {
      id: "places" as const,
      icon: MapPin,
      label: tProfile("statPlaces"),
      value: counts.places,
      color: "text-teal-400",
      active: isPlacesStatActive,
    },
  ];

  const emptyTitle =
    tab === "saved"
      ? tProfile("emptySaved")
      : tab === "history"
        ? tProfile("emptyViewed")
        : tProfile("emptyReviews");

  const tabs: { id: TabId; label: string; icon: typeof Bookmark }[] = [
    { id: "itineraries", label: tProfile("itineraries"), icon: Sparkles },
    { id: "drafts", label: tProfile("drafts"), icon: FilePenLine },
    { id: "saved", label: tProfile("saved"), icon: Bookmark },
    { id: "history", label: tProfile("viewed"), icon: History },
    { id: "reviews", label: tProfile("reviews"), icon: Star },
    { id: "savedFoods", label: tProfile("savedFoods"), icon: Heart },
    { id: "tripFoods", label: tProfile("tripFoods"), icon: UtensilsCrossed },
  ];

  return (
    <div className="relative min-h-screen pb-16 pt-24 text-white">
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 lg:flex-row lg:px-8">
        {/* Sidebar — desktop only; mobile uses tab pills below profile header */}
        <aside className="hidden shrink-0 lg:block lg:w-64 lg:pt-2">
          <div className={`${glass} p-4`}>
            <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{tProfile("menu")}</p>
            <nav className="mt-3 space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTabChange(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    tab === id
                      ? "bg-gradient-to-r from-violet-600/40 to-blue-600/30 text-white ring-1 ring-violet-400/30"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                  {label}
                </button>
              ))}
            </nav>
            <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
              <Link
                href="/explore"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                <Compass className="size-4" aria-hidden />
                {tNav("explore")}
              </Link>
              <Link
                href="/create-post"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                <PenSquare className="size-4" aria-hidden />
                {tProfile("writePost")}
              </Link>
              {isAdmin ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-amber-200/90 transition hover:bg-amber-500/15"
                >
                  <LayoutDashboard className="size-4" aria-hidden />
                  {tNav("dashboard")}
                </Link>
              ) : null}
            </div>
          </div>

          <div className={`${glass} relative mt-4 overflow-hidden p-5`}>
            <Sparkles className="absolute right-3 top-3 size-8 text-violet-400/30" aria-hidden />
            <p className="text-sm font-bold text-white">{tProfile("plannerPromoTitle")}</p>
            <p className="mt-2 text-xs leading-relaxed text-white/55">{tProfile("plannerPromoDesc")}</p>
            <Link
              href="/ai-trip-planner"
              className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 py-2.5 text-sm font-bold text-white transition hover:from-violet-500 hover:to-blue-500"
            >
              {tProfile("plannerPromoCta")}
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 lg:flex lg:gap-8">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">VN Insight</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{tProfile("title")}</h1>
            <p className="mt-2 max-w-xl text-sm text-white/55">{tProfile("subtitle")}</p>

            {/* Profile header */}
            <div className={`${glass} relative mt-5 overflow-hidden sm:mt-8`}>
              <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
                <div className="relative mx-auto shrink-0 sm:mx-0">
                  <div className="rounded-full bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 p-[3px] shadow-lg shadow-violet-500/25">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full bg-[#0b0e14] sm:h-28 sm:w-28">
                      <FlexibleImage src={avatarSrc} alt="" sizes="112px" className="object-cover" />
                    </div>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarPick}
                  />
                  <button
                    type="button"
                    disabled={avatarUploading}
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-2 ring-[#0b0e14] transition hover:bg-blue-500 disabled:opacity-60"
                    aria-label={tProfile("changeAvatarAria")}
                  >
                    <Camera className="size-4" aria-hidden />
                  </button>
                  {avatarUploading ? (
                    <p className="absolute -bottom-6 left-1/2 w-max -translate-x-1/2 text-[10px] text-white/45">
                      {tProfile("avatarUploading")}
                    </p>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
                          {profile.name}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            isAdmin
                              ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40"
                              : "bg-violet-500/25 text-violet-100 ring-1 ring-violet-400/35"
                          }`}
                        >
                          {isAdmin ? <Shield className="size-3" aria-hidden /> : <User className="size-3" aria-hidden />}
                          {isAdmin ? tNav("admin") : tNav("member")}
                        </span>
                      </div>
                      {profile.email ? (
                        <p className="mt-2 truncate text-sm text-white/50">{profile.email}</p>
                      ) : null}
                      <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-white/45 sm:justify-start">
                        <MapPin className="size-3.5 shrink-0 text-white/35" aria-hidden />
                        {tCommon("vietnam")}
                      </p>
                      <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/45">{tProfile("displayNameHint")}</p>

                      {editingDisplayName ? (
                        <form
                          className="mt-4 max-w-md text-left"
                          onSubmit={(e) => {
                            e.preventDefault();
                            void handleSaveDisplayName();
                          }}
                        >
                          <label htmlFor="profile-display-name" className="sr-only">
                            {tProfile("displayNameLabel")}
                          </label>
                          <input
                            id="profile-display-name"
                            type="text"
                            value={displayNameDraft}
                            onChange={(e) => setDisplayNameDraft(e.target.value)}
                            maxLength={DISPLAY_NAME_MAX}
                            autoComplete="nickname"
                            autoFocus
                            placeholder={tProfile("displayNamePlaceholder")}
                            className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/25"
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              type="submit"
                              disabled={displayNameSaving || !displayNameChanged}
                              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {displayNameSaving ? tProfile("displayNameSaving") : tProfile("displayNameSave")}
                            </button>
                            <button
                              type="button"
                              disabled={displayNameSaving}
                              onClick={handleCancelDisplayName}
                              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                            >
                              {tProfile("displayNameCancel")}
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </div>

                    {!editingDisplayName ? (
                      <button
                        type="button"
                        onClick={() => setEditingDisplayName(true)}
                        className="mx-auto inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-200 sm:mx-0"
                      >
                        <Pencil className="size-4" aria-hidden />
                        {tProfile("displayNameEdit")}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10" />

              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:gap-4 sm:p-6">
                {statCards.map(({ id, icon: Icon, label, value, color, active }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleStatNavigate(id)}
                    aria-current={active ? "true" : undefined}
                    className={`rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                      active
                        ? "border-white/25 bg-white/[0.08] ring-1 ring-white/15"
                        : "border-white/10 bg-black/25 hover:border-white/20 hover:bg-black/35"
                    }`}
                  >
                    <Icon className={`size-5 ${color}`} aria-hidden />
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-white">{value}</p>
                  </button>
                ))}
              </div>
            </div>

            <div ref={profileContentRef} className="scroll-mt-28">

            {/* Tabs + filters (duplicate tab pills for mobile clarity — main tab state from sidebar) */}
            <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-4 lg:hidden">
              {tabs.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTabChange(id)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    tab === id ? "bg-white text-[#0b0e14]" : "bg-white/5 text-white/65 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "itineraries" ? (
              <ProfileItinerariesPanel userId={profile.uid} />
            ) : tab === "drafts" ? (
              <ProfilePostDraftsPanel userId={profile.uid} />
            ) : tab === "savedFoods" ? (
              <ProfileSavedFoodsPanel userId={profile.uid} />
            ) : tab === "tripFoods" ? (
              <ProfileTripFoodsPanel userId={profile.uid} />
            ) : (
              <>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", tProfile("filterAll")],
                    ["destination", tProfile("filterDestination")],
                    ["post", tProfile("filterPost")],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      filter === id ? "bg-violet-600 text-white" : "bg-white/5 text-white/65 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-xs text-white/50">
                <Clock className="size-3.5" aria-hidden />
                <span className="sr-only">{tProfile("sortLabel")}</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
                  className="rounded-lg border border-white/15 bg-[#12161f] px-3 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="newest">{tProfile("sortNewest")}</option>
                  <option value="oldest">{tProfile("sortOldest")}</option>
                </select>
              </label>
            </div>

            {rows.length === 0 ? (
              <div className={`${glass} mt-6 flex flex-col items-center justify-center px-6 py-16 text-center`}>
                <p className="text-sm font-medium text-white/75">{emptyTitle}</p>
                <p className="mt-2 max-w-sm text-xs text-white/45">{tProfile("emptyListHint")}</p>
                <Link
                  href="/explore"
                  className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-500"
                >
                  {tProfile("emptyExploreCta")}
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((row) => (
                  <ContentCardOverlay
                    key={row.key}
                    href={row.href}
                    title={row.title}
                    image={row.image}
                    chip={row.chip}
                    sub={row.sub}
                    extra={row.extra}
                    showSavedIcon={tab === "saved"}
                    showRating={tab === "reviews" && Boolean(row.extra)}
                  />
                ))}
              </div>
            )}
            </>
            )}

            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-500/10 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 sm:w-auto sm:px-10"
            >
              <LogOut className="size-4" aria-hidden />
              {tNav("logout")}
            </button>
          </div>

          {/* Right column */}
          <aside className="mt-12 w-full shrink-0 space-y-6 lg:mt-8 lg:w-72 xl:w-80">
            <div className={`${glass} p-5`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/90">{tProfile("recentActivity")}</h3>
              <ul className="mt-4 space-y-4">
                {activityFeed.length === 0 ? (
                  <li className="text-xs text-white/45">{tProfile("emptyActivity")}</li>
                ) : (
                  activityFeed.map((a, i) => (
                    <li key={`${a.href}-${a.at}-${i}`}>
                      <Link href={a.href} className="flex gap-3 rounded-xl p-1 transition hover:bg-white/5">
                        <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg">
                          {a.thumb.trim() ? (
                            <FlexibleImage src={a.thumb} alt="" sizes="64px" className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 bg-white/10" aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-violet-300/90">{a.label}</p>
                          <p className="mt-0.5 line-clamp-2 text-sm font-medium text-white/85">{a.title}</p>
                          <p className="mt-0.5 text-[11px] text-white/40">{formatRelativeTime(a.at, tProfile, locale)}</p>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className={`${glass} overflow-hidden`}>
              <div className="relative h-28 bg-gradient-to-br from-blue-600/40 to-violet-600/30">
                <BookOpen className="absolute bottom-3 right-4 size-10 text-white/25" aria-hidden />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase text-amber-400/90">{tProfile("shareJourney")}</p>
                <p className="mt-2 text-sm text-white/55">{tProfile("shareJourneyDesc")}</p>
                <Link
                  href="/create-post"
                  className="mt-4 flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {tProfile("writeBtn")}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
