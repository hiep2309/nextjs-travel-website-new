/**
 * Dashboard quản trị — chỉ dùng cho user có `role === "admin"` trong Firestore.
 *
 * Chức năng:
 * - Thống kê minh họa, danh sách bài chờ duyệt (duyệt / xóa).
 * - Bảng bài mới nhất, người dùng; liên kết xem trước bài trước khi duyệt.
 * - User thường chỉ thấy giao diện “không có quyền” hoặc được hướng dẫn.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { pickLocalized } from "@/lib/i18n/content";
import type { LocalizedSlug, LocalizedString } from "@/lib/i18n/types";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  Eye,
  ExternalLink,
  FileText,
  FolderOpen,
  LayoutGrid,
  LogOut,
  MapPin,
  MoreVertical,
  PenSquare,
  Pencil,
  Plane,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { BLUR_DATA_URL_LIGHT } from "@/lib/imagePlaceholder";
import { useAuth } from "@/hooks/useAuth";
import { notifyPostApproved } from "@/lib/posts/notifyAuthor";
import { extractPostSourceFields } from "@/lib/translation/extractPostSource";
import { requestPostTranslation } from "@/lib/translation/requestPostTranslation";

type PostRow = {
  id: string;
  title?: LocalizedString | string;
  name?: LocalizedString | string;
  description?: LocalizedString | string;
  contentHtml?: LocalizedString | string;
  slugs?: LocalizedSlug;
  sourceLocale?: AppLocale;
  image?: string;
  authorName?: string;
  authorId?: string;
  status?: string;
  region?: string;
  createdAt?: { seconds?: number; toDate?: () => Date };
};

type UserRow = {
  id: string;
  role?: string;
};

const SIDEBAR_W = "lg:w-64";

function formatRelativeTime(seconds?: number): string {
  if (!seconds) return "—";
  const d = Math.max(0, Math.floor(Date.now() / 1000) - seconds);
  if (d < 60) return "Vừa xong";
  if (d < 3600) return `${Math.floor(d / 60)} phút trước`;
  if (d < 86400) return `${Math.floor(d / 3600)} giờ trước`;
  return `${Math.floor(d / 86400)} ngày trước`;
}

function formatDate(seconds?: number): string {
  if (!seconds) return "—";
  const date = new Date(seconds * 1000);
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Đường chart giả lập (SVG) — không có Analytics API trong dự án */
function TrafficSparkline() {
  const pts =
    "0,42 12,38 24,45 36,32 48,40 60,28 72,35 84,22 96,30 108,25 120,18 132,24 144,15 156,20 168,12 180,16 192,8 200,12";
  return (
    <div className="relative h-48 w-full rounded-xl bg-gradient-to-b from-blue-50/80 to-white">
      <svg
        className="h-full w-full text-blue-500"
        viewBox="0 0 200 50"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59 130 246 / 0.35)" />
            <stop offset="100%" stopColor="rgb(59 130 246 / 0.02)" />
          </linearGradient>
        </defs>
        <polygon fill="url(#dashFill)" points={`0,50 ${pts} 200,50`} />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pts}
        />
      </svg>
      <p className="absolute bottom-3 left-3 text-[11px] text-slate-400">
        Dữ liệu minh họa — tích hợp Analytics sau
      </p>
    </div>
  );
}

function postDisplayTitle(
  post: Pick<PostRow, "title" | "name">,
  locale: AppLocale,
  fallback: string,
): string {
  return pickLocalized(post.title ?? post.name, locale) || fallback;
}

export default function DashboardPage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Dashboard");
  const tp = useTranslations("Posts");
  const { user, role, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [allPosts, setAllPosts] = useState<PostRow[]>([]);
  const [usersList, setUsersList] = useState<UserRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (role !== "admin") {
      setLoadingData(false);
      return;
    }
    let alive = true;
    (async () => {
      setLoadingData(true);
      try {
        const [postsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, "posts")),
          getDocs(collection(db, "users")),
        ]);
        if (!alive) return;
        setAllPosts(
          postsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PostRow, "id">) })),
        );
        setUsersList(usersSnap.docs.map((d) => ({ id: d.id, role: d.data().role as string | undefined })));
      } catch {
        if (alive) setBanner({ type: "err", text: "Không tải được dữ liệu dashboard." });
      } finally {
        if (alive) setLoadingData(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [role]);

  const pendingPosts = useMemo(() => allPosts.filter((p) => p.status === "pending"), [allPosts]);
  const approvedPosts = useMemo(() => allPosts.filter((p) => p.status === "approved"), [allPosts]);
  const totalPosts = allPosts.length;

  const roleCounts = useMemo(() => {
    const admins = usersList.filter((u) => u.role === "admin").length;
    const rest = usersList.length - admins;
    return {
      admin: admins,
      user: rest,
      total: usersList.length,
    };
  }, [usersList]);

  const latestPosts = useMemo(() => {
    return [...allPosts]
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      .slice(0, 5);
  }, [allPosts]);

  const pendingPreview = useMemo(() => pendingPosts.slice(0, 4), [pendingPosts]);

  const stats = useMemo(
    () => [
      { label: "Tổng bài viết", value: totalPosts, delta: "+—", up: true },
      { label: "Đã duyệt", value: approvedPosts.length, delta: "+—", up: true },
      { label: "Chờ duyệt", value: pendingPosts.length, delta: pendingPosts.length ? "mới" : "0", up: false },
      { label: "Người dùng", value: roleCounts.total || usersList.length, delta: "+—", up: true },
    ],
    [totalPosts, approvedPosts.length, pendingPosts.length, roleCounts.total, usersList.length],
  );

  const handleTranslatePost = async (postId: string) => {
    const target = allPosts.find((p) => p.id === postId);
    if (!target) return;
    setTranslatingId(postId);
    setBanner(null);
    try {
      const source = extractPostSourceFields(postId, target as Record<string, unknown>);
      if (!source.title.trim() || !source.contentHtml.trim()) {
        setBanner({ type: "err", text: t("translateMissing") });
        return;
      }
      const payload = await requestPostTranslation({
        title: source.title,
        description: source.description,
        contentHtml: source.contentHtml,
        sourceLocale: source.sourceLocale,
        existingSlugs: source.existingSlugs,
      });
      await updateDoc(doc(db, "posts", postId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      setAllPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                title: payload.title,
                description: payload.description,
                contentHtml: payload.contentHtml,
                slugs: payload.slugs,
                sourceLocale: payload.sourceLocale,
              }
            : p,
        ),
      );
      setBanner({ type: "ok", text: t("translateOk") });
    } catch (err) {
      console.error(err);
      setBanner({ type: "err", text: t("translateErr") });
    } finally {
      setTranslatingId(null);
    }
  };

  const handleApprove = async (postId: string) => {
    const target = allPosts.find((p) => p.id === postId);
    try {
      await updateDoc(doc(db, "posts", postId), { status: "approved" });
      setAllPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: "approved" } : p)),
      );
      if (target?.authorId) {
        await notifyPostApproved({
          authorId: target.authorId,
          postId,
          title: target.title,
          name: target.name,
        });
      }
      setBanner({ type: "ok", text: t("approvedOk") });
    } catch {
      setBanner({ type: "err", text: t("approveErr") });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      setAllPosts((prev) => prev.filter((p) => p.id !== postId));
      setBanner({ type: "ok", text: t("deletedOk") });
    } catch {
      setBanner({ type: "err", text: t("deleteErr") });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        <p className="text-sm">Đang xác thực…</p>
      </div>
    );
  }

  const isAdmin = role === "admin";
  const displayName = user.displayName || user.email?.split("@")[0] || "Admin";

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] bg-[#f4f6f9] px-4 py-10 text-slate-800 lg:px-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-xl font-bold">Trang thành viên</h1>
          <p className="mt-2 text-sm text-slate-600">
            Chỉ quản trị viên mới xem được bảng điều khiển đầy đủ.
          </p>
          <Link
            href="/create-post"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <PenSquare className="size-4" />
            Đăng bài mới
          </Link>
          <Link href="/" className="mt-4 block text-sm font-medium text-blue-600 hover:underline">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="fixed inset-x-0 top-16 bottom-0 z-20 flex overflow-hidden bg-[#f4f6f9] text-slate-800">
        {/* Sidebar */}
        <aside
          className={`hidden shrink-0 flex-col border-r border-slate-800/80 bg-[#1e2a3a] text-slate-300 lg:flex ${SIDEBAR_W}`}
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Plane className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white">VN Insight</p>
              <p className="text-[10px] text-slate-500">TravelAdmin</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 text-sm">
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Chung
            </p>
            <Link
              href="/dashboard"
              className="mb-1 flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 font-medium text-white"
            >
              <LayoutGrid className="size-4 shrink-0" />
              Tổng quan
            </Link>

            <p className="mt-5 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Quản lý nội dung
            </p>
            <Link
              href="/explore"
              className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10"
            >
              <FileText className="size-4 shrink-0" />
              Bài viết
            </Link>
            <Link
              href="/create-post"
              className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10"
            >
              <PenSquare className="size-4 shrink-0" />
              Thêm bài
            </Link>
            <button
              type="button"
              className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/10"
              onClick={() => router.push("/explore")}
            >
              <MapPin className="size-4 shrink-0" />
              Điểm đến
            </button>
            <button
              type="button"
              className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/10"
              onClick={() => router.push("/guides")}
            >
              <FolderOpen className="size-4 shrink-0" />
              Hướng dẫn
            </button>

            <p className="mt-5 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Kiểm duyệt
            </p>
            <div className="mb-1 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span className="flex items-center gap-2">
                <FileText className="size-4" />
                Bài chờ duyệt
              </span>
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {pendingPosts.length}
              </span>
            </div>
            <div className="mb-1 flex items-center justify-between rounded-lg px-3 py-2 opacity-60">
              <span className="flex items-center gap-2">
                <span className="text-xs">Bình luận</span>
              </span>
              <span className="text-[10px] text-slate-500">—</span>
            </div>

            <p className="mt-5 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Người dùng
            </p>
            <button
              type="button"
              className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/10"
              onClick={() => router.push("/profile")}
            >
              <Users className="size-4 shrink-0" />
              Hồ sơ & tài khoản
            </button>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 opacity-70">
              <Shield className="size-4 shrink-0" />
              <span>Vai trò (Firestore)</span>
            </div>

            <p className="mt-5 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Hệ thống
            </p>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 opacity-70">
              <BarChart3 className="size-4 shrink-0" />
              Thống kê
            </div>
          </nav>

          <div className="border-t border-white/10 p-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/15 py-2.5 text-xs font-medium text-white hover:bg-white/10"
            >
              <ExternalLink className="size-3.5" />
              Xem website
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="z-20 flex shrink-0 flex-col gap-3 border-b border-slate-200/80 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                readOnly
                placeholder="Tìm kiếm bài viết, điểm đến, người dùng…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none ring-blue-500/20 focus:border-blue-400 focus:ring-2"
              />
            </div>
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Thông báo"
              >
                <Bell className="size-5" />
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {Math.min(9, pendingPosts.length) || 0}
                </span>
              </button>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <div className="relative size-9 overflow-hidden rounded-full ring-2 ring-slate-200">
                  <Image
                    src={
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? "")}`
                    }
                    alt=""
                    fill
                    className="object-cover"
                    sizes="36px"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL_LIGHT}
                  />
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500">Quản trị viên</p>
                </div>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 lg:px-8 lg:py-6">
            <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
              <Link
                href="/explore"
                className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-medium shadow-sm ring-1 ring-slate-200"
              >
                Bài viết
              </Link>
              <Link
                href="/create-post"
                className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-medium shadow-sm ring-1 ring-slate-200"
              >
                Thêm bài
              </Link>
              <Link
                href="/profile"
                className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-medium shadow-sm ring-1 ring-slate-200"
              >
                Hồ sơ
              </Link>
              <Link
                href="/"
                className="shrink-0 rounded-lg bg-[#1e2a3a] px-3 py-2 text-xs font-medium text-white"
              >
                Website
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
              >
                Đăng xuất
              </button>
            </div>
            {banner ? (
              <div
                role="status"
                className={`rounded-xl border px-4 py-3 text-sm ${
                  banner.type === "ok"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {banner.text}
              </div>
            ) : null}

            {loadingData ? (
              <p className="text-sm text-slate-500">Đang tải dữ liệu…</p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                    >
                      <p className="text-xs font-medium text-slate-500">{s.label}</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>
                      <p
                        className={`mt-1 text-xs font-medium ${s.up ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        {s.delta}{" "}
                        <span className="text-slate-400 max-[420px]:hidden">so với tháng trước (minh họa)</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-bold text-slate-900">Lượt truy cập</h2>
                      <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                        30 ngày qua
                      </span>
                    </div>
                    <TrafficSparkline />
                  </div>

                  <div id="pending-posts" className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm scroll-mt-24">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <h2 className="font-bold text-slate-900">Bài viết chờ duyệt</h2>
                      {pendingPosts.length > 0 ? (
                        <span className="text-xs font-medium text-slate-500">{pendingPosts.length} bài</span>
                      ) : null}
                    </div>
                    {pendingPreview.length === 0 ? (
                      <p className="py-8 text-center text-sm text-slate-500">Không có bài chờ.</p>
                    ) : (
                      <ul className="space-y-3">
                        {pendingPreview.map((post) => {
                          const title = postDisplayTitle(post, locale, "Không tiêu đề");
                          const author = post.authorName || post.authorId || "—";
                          return (
                            <li
                              key={post.id}
                              className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:flex-row sm:items-center"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                                {post.image ? (
                                  <Image
                                    src={post.image}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                    placeholder="blur"
                                    blurDataURL={BLUR_DATA_URL_LIGHT}
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/posts/${post.id}`}
                                  className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                                >
                                  {title}
                                </Link>
                                <p className="text-xs text-slate-500">
                                  {author} · {formatRelativeTime(post.createdAt?.seconds)}
                                </p>
                              </div>
                              </div>
                              <div className="flex shrink-0 justify-end gap-1 sm:justify-start">
                                <button
                                  type="button"
                                  onClick={() => void handleTranslatePost(post.id)}
                                  disabled={translatingId === post.id}
                                  className="rounded-lg border border-violet-200 bg-violet-50 p-2 text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                                  aria-label={t("translatePost")}
                                  title={t("translatePost")}
                                >
                                  <Sparkles className={`size-4 ${translatingId === post.id ? "animate-pulse" : ""}`} />
                                </button>
                                <Link
                                  href={`/create-post?edit=${post.id}`}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
                                  aria-label={t("editPost")}
                                  title={t("editPost")}
                                >
                                  <Pencil className="size-4" />
                                </Link>
                                <Link
                                  href={`/posts/${post.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
                                  aria-label={t("previewPost")}
                                  title={t("previewPost")}
                                >
                                  <Eye className="size-4" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(post.id)}
                                  className="rounded-lg bg-emerald-500 p-2 text-white hover:bg-emerald-600"
                                  aria-label={t("approvePost")}
                                >
                                  <Check className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePost(post.id)}
                                  className="rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50"
                                  aria-label={t("deletePost")}
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2">
                    <h2 className="mb-4 font-bold text-slate-900">Bài viết mới nhất</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                            <th className="pb-3 font-medium">Tiêu đề</th>
                            <th className="pb-3 font-medium">Tác giả</th>
                            <th className="pb-3 font-medium">Khu vực</th>
                            <th className="pb-3 font-medium">Trạng thái</th>
                            <th className="pb-3 font-medium">Ngày</th>
                            <th className="pb-3" />
                          </tr>
                        </thead>
                        <tbody>
                          {latestPosts.map((post) => {
                            const title = postDisplayTitle(post, locale, "—");
                            const approved = post.status === "approved";
                            return (
                              <tr key={post.id} className="border-b border-slate-100 last:border-0">
                                <td className="py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                      {post.image ? (
                                        <Image
                                          src={post.image}
                                          alt=""
                                          fill
                                          className="object-cover"
                                          sizes="40px"
                                          placeholder="blur"
                                          blurDataURL={BLUR_DATA_URL_LIGHT}
                                        />
                                      ) : null}
                                    </div>
                                    <span className="line-clamp-1 font-medium text-slate-900">{title}</span>
                                  </div>
                                </td>
                                <td className="py-3 text-slate-600">
                                  {post.authorName || post.authorId || "—"}
                                </td>
                                <td className="py-3 text-slate-600">{post.region || "—"}</td>
                                <td className="py-3">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                      approved
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {approved ? "Đã duyệt" : "Chờ duyệt"}
                                  </span>
                                </td>
                                <td className="py-3 text-slate-600">
                                  {formatDate(post.createdAt?.seconds)}
                                </td>
                                <td className="py-3 text-right">
                                  <div className="inline-flex items-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={() => void handleTranslatePost(post.id)}
                                      disabled={translatingId === post.id}
                                      className="inline-flex rounded-lg p-1.5 text-violet-600 hover:bg-violet-50 disabled:opacity-50"
                                      aria-label={t("translatePost")}
                                      title={t("translatePost")}
                                    >
                                      <Sparkles className={`size-4 ${translatingId === post.id ? "animate-pulse" : ""}`} />
                                    </button>
                                    <Link
                                      href={`/create-post?edit=${post.id}`}
                                      className="inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                                      aria-label={t("editPost")}
                                      title={t("editPost")}
                                    >
                                      <Pencil className="size-4" />
                                    </Link>
                                    <Link
                                      href={`/posts/${post.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                      aria-label={t("previewPost")}
                                    >
                                      <Eye className="size-4" />
                                    </Link>
                                    {post.status === "pending" ? (
                                      <button
                                        type="button"
                                        onClick={() => handleApprove(post.id)}
                                        className="inline-flex rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                                        aria-label={t("approvePost")}
                                      >
                                        <Check className="size-4" />
                                      </button>
                                    ) : null}
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePost(post.id)}
                                      className="inline-flex rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                                      aria-label={t("deletePost")}
                                    >
                                      <Trash2 className="size-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <Link
                      href="/explore"
                      className="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Xem tất cả bài viết
                    </Link>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                      <h2 className="font-bold text-slate-900">Thống kê nhanh</h2>
                      <ul className="mt-4 space-y-3 text-sm">
                        <li className="flex justify-between">
                          <span className="text-slate-600">Bài chờ duyệt</span>
                          <span className="font-semibold text-slate-900">{pendingPosts.length}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-600">Đã duyệt</span>
                          <span className="font-semibold text-slate-900">{approvedPosts.length}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-600">Người dùng (Firestore)</span>
                          <span className="font-semibold text-slate-900">{roleCounts.total}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-slate-600">Tổng bài</span>
                          <span className="font-semibold text-slate-900">{totalPosts}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                      <h2 className="font-bold text-slate-900">Vai trò</h2>
                      <ul className="mt-4 space-y-2 text-sm">
                        <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <span className="text-slate-600">Quản trị</span>
                          <span className="font-bold text-slate-900">{roleCounts.admin}</span>
                        </li>
                        <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <span className="text-slate-600">Thành viên</span>
                          <span className="font-bold text-slate-900">{roleCounts.user}</span>
                        </li>
                      </ul>
                      <button
                        type="button"
                        onClick={() => router.push("/profile")}
                        className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Chi tiết <ChevronRight className="size-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      <LogOut className="size-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
    </div>
    {/* Giữ chỗ trong layout để footer không nhảy lên dưới navbar */}
    <div className="min-h-[calc(100dvh-4rem)]" aria-hidden />
    </>
  );
}
