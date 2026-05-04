"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, LayoutDashboard, LogOut, PenSquare, Shield, User } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";

const glass = "rounded-2xl border border-white/20 bg-white/[0.07] shadow-xl backdrop-blur-xl";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading } = useUserProfile();
  const { logout } = useAuth();

  useEffect(() => {
    if (!loading && !profile) {
      router.replace("/login");
    }
  }, [loading, profile, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 pt-20 text-white">
        <p className="text-sm text-white/60">Đang tải hồ sơ…</p>
      </div>
    );
  }

  const avatarSrc =
    profile.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`;

  const isAdmin = profile.role === "admin";

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.18),transparent)]" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">VN Insight</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Trang cá nhân</h1>
        <p className="mt-2 text-sm text-white/65">Thông tin tài khoản và lối tắt sử dụng dịch vụ.</p>

        <div className={`${glass} mt-8 p-6 sm:p-8`}>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20 sm:h-28 sm:w-28">
              <Image
                src={avatarSrc}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
                unoptimized
              />
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
              {profile.email ? (
                <p className="mt-2 truncate text-sm text-white/60">{profile.email}</p>
              ) : null}
              <p className="mt-3 text-xs text-white/45">UID: {profile.uid}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/explore"
            className={`${glass} flex items-center gap-3 p-4 transition hover:border-white/35 hover:bg-white/[0.1]`}
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
              <Compass className="size-5" aria-hidden />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Khám phá</p>
              <p className="text-xs text-white/55">Xem bài viết du lịch</p>
            </div>
          </Link>

          <Link
            href="/create-post"
            className={`${glass} flex items-center gap-3 p-4 transition hover:border-white/35 hover:bg-white/[0.1]`}
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <PenSquare className="size-5" aria-hidden />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Đăng bài</p>
              <p className="text-xs text-white/55">Chia sẻ trải nghiệm</p>
            </div>
          </Link>

          {isAdmin ? (
            <Link
              href="/dashboard"
              className={`${glass} flex items-center gap-3 p-4 transition hover:border-white/35 hover:bg-white/[0.1] sm:col-span-2`}
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-200">
                <LayoutDashboard className="size-5" aria-hidden />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Dashboard</p>
                <p className="text-xs text-white/55">Kiểm duyệt bài viết</p>
              </div>
            </Link>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-500/10 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
        >
          <LogOut className="size-4" aria-hidden />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
