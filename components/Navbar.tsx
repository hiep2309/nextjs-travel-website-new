/**
 * Thanh điều hướng chính ??i18n via next-intl, LocaleSwitcher, auth menu.
 */
"use client";

import Image from "next/image";
import { LogIn, Menu, Settings, Compass, LogOut, LayoutDashboard, Bookmark } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { User } from "firebase/auth";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import FlexibleImage from "@/components/ui/FlexibleImage";
import NotificationBell from "@/components/NotificationBell";

function userInitials(user: User) {
  const raw = user.displayName?.trim() || user.email?.split("@")[0] || "U";
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  return raw.slice(0, 2).toUpperCase();
}

function roleLabel(role: string | null, t: (key: string) => string) {
  if (role === "admin") return t("admin");
  return t("member");
}

function UserAvatar({
  user,
  className = "h-9 w-9 text-xs",
}: {
  user: User;
  className?: string;
}) {
  if (user.photoURL) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-full border border-white/20 ${className}`}>
        <FlexibleImage src={user.photoURL} alt="" sizes="44px" className="object-cover" />
      </div>
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 font-bold text-white ${className}`}
    >
      {userInitials(user)}
    </span>
  );
}

const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "destinations", href: "/explore" },
  { key: "tours", href: "/tours" },
  { key: "guides", href: "/guides" },
  { key: "blog", href: "/explore" },
  { key: "aiPlanner", href: "/ai-trip-planner", badge: true },
] as const;

const Navbar = () => {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMobile = () => setOpen(false);
  const { user, role, loading, logout } = useAuth();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setOpenMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="pointer-events-auto fixed top-0 left-0 z-[1100] w-full border-b border-white/10 bg-slate-950 shadow-lg shadow-black/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <Image src="/logo.png" alt="VN Insight" fill className="object-contain" />
            </div>
            <span className="text-sm font-black text-white md:text-base">VN INSIGHT</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-300 transition hover:text-blue-400"
              >
                {t(item.key)}
                {"badge" in item && item.badge ? (
                  <span className="rounded-full bg-violet-600/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    {t("new")}
                  </span>
                ) : null}
              </Link>
            ))}
            {!loading && user && role === "admin" && (
              <Link href="/dashboard" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
                {t("dashboard")}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden sm:flex">
              <LocaleSwitcher />
            </div>

            <NotificationBell />

            <div className="hidden items-center gap-4 md:flex">
              {loading ? (
                <div className="text-sm text-gray-400">{t("loading")}</div>
              ) : user ? (
                <div className="relative z-[1001]" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setOpenMenu((v) => !v)}
                    className="rounded-full transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    aria-expanded={openMenu}
                    aria-haspopup="true"
                  >
                    <UserAvatar user={user} className="h-9 w-9 text-xs" />
                  </button>
                  {openMenu && (
                    <div
                      className="absolute right-0 top-full z-[1001] mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/20 bg-slate-950 p-1.5 text-white shadow-2xl shadow-black/60"
                      role="menu"
                    >
                      <div className="rounded-xl bg-slate-900 p-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} className="h-11 w-11 text-sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">{user.email}</p>
                            <p className="text-xs text-white/90">{roleLabel(role, t)}</p>
                          </div>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setOpenMenu(false)}
                          className="mt-3 block rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-blue-500"
                        >
                          {t("viewProfile")}
                        </Link>
                      </div>
                      <div className="mt-1 space-y-0.5 px-0.5 py-1">
                        {role === "admin" && (
                          <Link
                            href="/dashboard"
                            onClick={() => setOpenMenu(false)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/15"
                            role="menuitem"
                          >
                            <LayoutDashboard className="size-4 shrink-0 text-white" aria-hidden />
                            {t("dashboard")}
                          </Link>
                        )}
                        <Link
                          href="/saved-itineraries"
                          onClick={() => setOpenMenu(false)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                          role="menuitem"
                        >
                          <Bookmark className="size-4 shrink-0 text-violet-300" aria-hidden />
                          {t("savedItineraries")}
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setOpenMenu(false)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                          role="menuitem"
                        >
                          <Settings className="size-4 shrink-0 text-white" aria-hidden />
                          {t("settings")}
                        </Link>
                        <Link
                          href="/explore"
                          onClick={() => setOpenMenu(false)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                          role="menuitem"
                        >
                          <Compass className="size-4 shrink-0 text-white" aria-hidden />
                          {t("explore")}
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(false);
                            void logout();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                          role="menuitem"
                        >
                          <LogOut className="size-4 shrink-0" aria-hidden />
                          {t("logout")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white"
                  >
                    <LogIn size={16} />
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    {t("getStarted")}
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-white -mr-2 hover:bg-white/10 touch-manipulation lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav-panel"
              aria-label={open ? t("closeMenu") : t("openMenu")}
            >
              <Menu size={26} aria-hidden />
            </button>
          </div>
        </div>

        {open && (
          <div
            id="mobile-nav-panel"
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-white/10 bg-slate-900 px-4 py-4 lg:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={closeMobile}
                className="flex items-center gap-2 py-2 font-medium text-gray-300 hover:text-blue-400 touch-manipulation"
              >
                {t(item.key)}
                {"badge" in item && item.badge ? (
                  <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {t("new")}
                  </span>
                ) : null}
              </Link>
            ))}
            {!loading && user && role === "admin" && (
              <Link
                href="/dashboard"
                onClick={closeMobile}
                className="block py-2 font-semibold text-amber-300 hover:text-amber-200"
              >
                {t("dashboard")}
              </Link>
            )}

            <div className="space-y-3 border-t border-white/10 pt-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400">{t("language")}</p>
              <LocaleSwitcher />

              {user ? (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
                    <UserAvatar user={user} className="h-10 w-10 text-xs" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{user.email}</p>
                      <p className="text-xs text-white/90">{roleLabel(role, t)}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={closeMobile}
                    className="block w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-violet-900/30"
                  >
                    {t("viewProfile")}
                  </Link>
                  <Link
                    href="/saved-itineraries"
                    onClick={closeMobile}
                    className="block w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    {t("savedItineraries")}
                  </Link>
                  {role === "admin" && (
                    <Link
                      href="/dashboard"
                      onClick={closeMobile}
                      className="block w-full rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-center text-sm font-semibold text-amber-200"
                    >
                      {t("dashboard")}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMobile();
                    }}
                    className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20"
                  >
                    {t("logout")}
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobile} className="block py-2 text-gray-300 hover:text-white">
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobile}
                    className="flex min-h-[48px] items-center justify-center rounded-full bg-blue-600 py-3 text-center font-bold text-white"
                  >
                    {t("getStarted")}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="h-16" />
    </>
  );
};

export default Navbar;
