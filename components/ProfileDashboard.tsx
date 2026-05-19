/**
 * Trang hồ sơ đầy đủ — avatar, thống kê, tab Đã lưu / Đã xem / Đánh giá / Blog của tôi.
 *
 * Gộp dữ liệu local (`userActivityStorage`) và Firestore (role, ảnh Google…).
 */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  BookOpen,
  Camera,
  ChevronRight,
  Clock,
  Compass,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  PenSquare,
  Shield,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { reload, updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import { buildDestinationPageModel } from "@/lib/destinationPageModel";
import { BLUR_DATA_URL_LIGHT } from "@/lib/imagePlaceholder";
import { getProvinceBySlug } from "@/lib/provinceSlug";
import { useAuth } from "@/hooks/useAuth";
import type { MergedProfile } from "@/hooks/useUserProfile";
import {
  formatRelativeTimeVi,
  getDestinationHistory,
  getPostHistory,
  getSavedDestinationSlugs,
  getSavedPosts,
  getUserDestinationRatings,
  getUserPostRatings,
} from "@/lib/userActivityStorage";

const glass = "rounded-2xl border border-white/15 bg-white/[0.06] shadow-xl backdrop-blur-xl";

type TabId = "saved" | "history" | "reviews";
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
  return "/signup_pic.jpg";
}

type ActivityItem = { label: string; title: string; href: string; at: number; thumb: string };

function buildActivityFeed(uid: string): ActivityItem[] {
  const items: ActivityItem[] = [];
  for (const { slug, at } of getDestinationHistory(uid).slice(0, 12)) {
    const p = getProvinceBySlug(slug);
    if (!p) continue;
    const m = buildDestinationPageModel(p);
    items.push({
      label: "Đã xem",
      title: m.headline,
      href: `/destinations/${slug}`,
      at,
      thumb: m.heroImage,
    });
  }
  for (const s of getSavedPosts(uid)) {
    items.push({
      label: "Bài đã lưu",
      title: s.title,
      href: `/posts/${s.id}`,
      at: s.savedAt,
      thumb: s.image || defaultPostImage(),
    });
  }
  for (const { slug, stars, at } of getUserDestinationRatings(uid)) {
    const p = getProvinceBySlug(slug);
    if (!p) continue;
    const m = buildDestinationPageModel(p);
    items.push({
      label: `Đánh giá ${stars}★`,
      title: m.headline,
      href: `/destinations/${slug}`,
      at,
      thumb: m.heroImage,
    });
  }
  for (const r of getUserPostRatings(uid)) {
    items.push({
      label: `Đánh giá ${r.stars}★`,
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
  const { logout } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarLocalUrl, setAvatarLocalUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState<TabId>("saved");
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [counts, setCounts] = useState({
    saved: 0,
    history: 0,
    reviews: 0,
    places: 0,
  });
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener("storage", bump);
    const onVis = () => {
      if (document.visibilityState === "visible") bump();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("storage", bump);
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
      alert("Vui lòng chọn một file ảnh.");
      return;
    }
    if (file.size > AVATAR_MAX_MB * 1024 * 1024) {
      alert(`Ảnh tối đa ${AVATAR_MAX_MB}MB.`);
      return;
    }

    const cur = auth.currentUser;
    if (!cur) return;

    setAvatarUploading(true);
    try {
      const rawExt = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "");
      const ext = rawExt.slice(0, 6) || "jpg";
      const path = `avatars/${cur.uid}/${Date.now()}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type || "image/jpeg" });
      const url = await getDownloadURL(storageRef);
      await updateProfile(cur, { photoURL: url });
      await reload(cur);
      await setDoc(
        doc(db, "users", cur.uid),
        { photoURL: url },
        { merge: true },
      );
      setAvatarLocalUrl(url);
    } catch (err) {
      console.error(err);
      alert("Không đổi được ảnh. Kiểm tra kết nối và quyền Storage của dự án Firebase.");
    } finally {
      setAvatarUploading(false);
    }
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
        const m = buildDestinationPageModel(p);
        out.push({
          key: `d-${slug}`,
          kind: "destination",
          title: m.headline,
          image: m.heroImage,
          href: `/destinations/${slug}`,
          at: 0,
          sub: subLine(slug),
          chip: "ĐỊA ĐIỂM",
        });
      }
      return out;
    };

    let list: ContentRow[] = [];

    if (tab === "saved") {
      const destSaved = destRowsForSlugs(savedSlugs, () => "Đã lưu vào danh sách");
      const posts: ContentRow[] = savedPosts.map((s) => ({
        key: `p-${s.id}`,
        kind: "post",
        title: s.title,
        image: s.image || defaultPostImage(),
        href: `/posts/${s.id}`,
        at: s.savedAt,
        sub: `Đã lưu ${formatRelativeTimeVi(s.savedAt)}`,
        chip: "BÀI VIẾT",
      }));
      list = [...destSaved, ...posts];
    } else if (tab === "history") {
      const dest = destHistory
        .map((h) => {
          const p = getProvinceBySlug(h.slug);
          if (!p) return null;
          const m = buildDestinationPageModel(p);
          return {
            key: `d-${h.slug}-${h.at}`,
            kind: "destination" as const,
            title: m.headline,
            image: m.heroImage,
            href: `/destinations/${h.slug}`,
            at: h.at,
            sub: `Xem ${formatRelativeTimeVi(h.at)}`,
            chip: "ĐỊA ĐIỂM",
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
        sub: `Xem ${formatRelativeTimeVi(h.at)}`,
        chip: "BÀI VIẾT",
      }));
      list = [...dest, ...posts];
    } else {
      const dest = destReviews
        .map((r) => {
          const p = getProvinceBySlug(r.slug);
          if (!p) return null;
          const m = buildDestinationPageModel(p);
          return {
            key: `dr-${r.slug}`,
            kind: "destination" as const,
            title: m.headline,
            image: m.heroImage,
            href: `/destinations/${r.slug}`,
            at: r.at,
            sub: `Bạn chấm ${r.stars} sao · ${formatRelativeTimeVi(r.at)}`,
            chip: "ĐỊA ĐIỂM",
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
        sub: `Bạn chấm ${r.stars} sao · ${formatRelativeTimeVi(r.at)}`,
        chip: "BÀI VIẾT",
        extra: `${r.stars}`,
      }));
      list = [...dest, ...posts];
    }

    if (filter === "destination") list = list.filter((r) => r.kind === "destination");
    if (filter === "post") list = list.filter((r) => r.kind === "post");

    const unknownLast = (a: ContentRow, b: ContentRow) => {
      const atA = a.at || 0;
      const atB = b.at || 0;
      if (atA === 0 && atB === 0) return a.title.localeCompare(b.title, "vi");
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
    });
  }, [tab, filter, sort, tick, profile.uid]);

  useEffect(() => {
    setActivityFeed(buildActivityFeed(profile.uid));
  }, [tick, profile.uid]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const tabs: { id: TabId; label: string; icon: typeof Bookmark }[] = [
    { id: "saved", label: "Đã lưu", icon: Bookmark },
    { id: "history", label: "Đã xem", icon: History },
    { id: "reviews", label: "Đánh giá", icon: Star },
  ];

  return (
    <div className="relative min-h-screen pb-16 pt-24 text-white">
      <div className="relative mx-auto max-w-7xl gap-8 px-4 lg:flex lg:px-8">
        {/* Sidebar */}
        <aside className="mb-8 shrink-0 lg:mb-0 lg:w-64 lg:pt-2">
          <div className={`${glass} p-4`}>
            <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Menu</p>
            <nav className="mt-3 space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    tab === id ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
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
                Khám phá
              </Link>
              <Link
                href="/create-post"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                <PenSquare className="size-4" aria-hidden />
                Đăng bài
              </Link>
              {isAdmin ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-amber-200/90 transition hover:bg-amber-500/15"
                >
                  <LayoutDashboard className="size-4" aria-hidden />
                  Dashboard
                </Link>
              ) : null}
            </div>
          </div>

          <div className={`${glass} relative mt-4 overflow-hidden p-5`}>
            <Sparkles className="absolute right-3 top-3 size-8 text-amber-400/30" aria-hidden />
            <p className="text-sm font-bold text-white">Lên lịch chuyến tiếp theo</p>
            <p className="mt-2 text-xs leading-relaxed text-white/55">
              Gợi ý điểm đến, tour và cẩm nang trên VN Insight.
            </p>
            <Link
              href="/explore"
              className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              Khám phá ngay
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 lg:flex lg:gap-8">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">VN Insight</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Trang cá nhân</h1>
            <p className="mt-2 max-w-xl text-sm text-white/55">
              Xem lại địa điểm và bài viết đã lưu, lịch sử xem gần đây, cùng các đánh giá bạn đã ghi nhận.
            </p>

            {/* Profile header */}
            <div className={`${glass} mt-8 p-6 sm:p-8`}>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="relative mx-auto shrink-0 sm:mx-0">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-white/25">
                    <Image
                      src={avatarSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="112px"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL_LIGHT}
                    />
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
                    className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-2 ring-black/50 transition hover:bg-blue-500 disabled:opacity-60"
                    aria-label="Đổi ảnh đại diện"
                  >
                    <Camera className="size-4" aria-hidden />
                  </button>
                  <p className="mt-2 text-center text-[11px] text-white/45 sm:text-left">
                    {avatarUploading ? "Đang tải ảnh…" : "Chọn ảnh từ thư viện thiết bị"}
                  </p>
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h2 className="text-xl font-bold sm:text-2xl">{profile.name}</h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        isAdmin
                          ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40"
                          : "bg-white/10 text-white/80 ring-1 ring-white/20"
                      }`}
                    >
                      {isAdmin ? <Shield className="size-3" aria-hidden /> : <User className="size-3" aria-hidden />}
                      {isAdmin ? "Quản trị viên" : "Thành viên"}
                    </span>
                  </div>
                  {profile.email ? <p className="mt-2 truncate text-sm text-white/55">{profile.email}</p> : null}
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/40 sm:text-left">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    Việt Nam
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-center sm:text-left">
                      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-white/40 sm:justify-start">
                        <Bookmark className="size-3" aria-hidden />
                        Đã lưu
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">{counts.saved}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-center sm:text-left">
                      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-white/40 sm:justify-start">
                        <History className="size-3" aria-hidden />
                        Lịch sử xem
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">{counts.history}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-center sm:text-left">
                      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-white/40 sm:justify-start">
                        <Star className="size-3" aria-hidden />
                        Đánh giá
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">{counts.reviews}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-center sm:text-left">
                      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-white/40 sm:justify-start">
                        <BookOpen className="size-3" aria-hidden />
                        Địa điểm
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">{counts.places}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs + filters (duplicate tab pills for mobile clarity — main tab state from sidebar) */}
            <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-4 lg:hidden">
              {tabs.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    tab === id ? "bg-white text-[#0b0e14]" : "bg-white/5 text-white/65 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "Tất cả"],
                    ["destination", "Địa điểm"],
                    ["post", "Bài viết"],
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
                <span className="sr-only">Sắp xếp</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
                  className="rounded-lg border border-white/15 bg-[#12161f] px-3 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
              </label>
            </div>

            {rows.length === 0 ? (
              <div className={`${glass} mt-6 flex flex-col items-center justify-center px-6 py-16 text-center`}>
                <p className="text-sm font-medium text-white/75">Chưa có mục nào trong danh sách này.</p>
                <p className="mt-2 max-w-sm text-xs text-white/45">
                  Lưu địa điểm hoặc bài viết, xem trang chi tiết để lưu lịch sử và chấm sao — dữ liệu được giữ trên
                  trình duyệt của bạn.
                </p>
                <Link
                  href="/explore"
                  className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-500"
                >
                  Đi khám phá
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((row) => (
                  <Link
                    key={row.key}
                    href={row.href}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-amber-400/35 hover:bg-white/[0.07]"
                  >
                    <div className="relative aspect-[16/11] w-full">
                      {row.image.trim() ? (
                        <Image
                          src={row.image}
                          alt=""
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width:640px)100vw,360px"
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL_LIGHT}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-white/[0.08]" aria-hidden />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/50 to-transparent" />
                      <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white/90 backdrop-blur-sm">
                        {row.chip}
                      </span>
                      {tab === "reviews" && row.extra ? (
                        <span className="absolute right-3 top-3 inline-flex items-center gap-0.5 rounded-md bg-amber-500/90 px-2 py-0.5 text-[11px] font-bold text-[#0b0e14]">
                          <Star className="size-3 fill-[#0b0e14]" aria-hidden />
                          {row.extra}
                        </span>
                      ) : null}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-base font-bold leading-snug text-white group-hover:text-amber-200">
                          {row.title}
                        </p>
                        <p className="mt-1 text-xs text-white/55">{row.sub}</p>
                      </div>
                    </div>
                    {tab === "saved" ? (
                      <Bookmark className="absolute bottom-3 right-3 size-5 text-white/80 drop-shadow-md" fill="currentColor" aria-hidden />
                    ) : null}
                  </Link>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-500/10 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 sm:w-auto sm:px-10"
            >
              <LogOut className="size-4" aria-hidden />
              Đăng xuất
            </button>
          </div>

          {/* Right column */}
          <aside className="mt-12 w-full shrink-0 space-y-6 lg:mt-8 lg:w-72 xl:w-80">
            <div className={`${glass} p-5`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/90">Hoạt động gần đây</h3>
              <ul className="mt-4 space-y-4">
                {activityFeed.length === 0 ? (
                  <li className="text-xs text-white/45">Chưa có hoạt động. Hãy mở vài trang địa điểm hoặc bài viết.</li>
                ) : (
                  activityFeed.map((a, i) => (
                    <li key={`${a.href}-${a.at}-${i}`}>
                      <Link href={a.href} className="flex gap-3 rounded-xl p-1 transition hover:bg-white/5">
                        <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg">
                          {a.thumb.trim() ? (
                            <Image
                              src={a.thumb}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="64px"
                              placeholder="blur"
                              blurDataURL={BLUR_DATA_URL_LIGHT}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-white/10" aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-violet-300/90">{a.label}</p>
                          <p className="mt-0.5 line-clamp-2 text-sm font-medium text-white/85">{a.title}</p>
                          <p className="mt-0.5 text-[11px] text-white/40">{formatRelativeTimeVi(a.at)}</p>
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
                <p className="text-xs font-bold uppercase text-amber-400/90">Chia sẻ hành trình</p>
                <p className="mt-2 text-sm text-white/55">Viết bài hoặc khám phá điểm đến mới trên nền tảng.</p>
                <Link
                  href="/create-post"
                  className="mt-4 flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Viết bài
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
