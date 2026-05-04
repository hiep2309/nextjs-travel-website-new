"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe, ChevronDown, LogIn, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

type LangCode = "vi" | "en" | "ko" | "ru" | "ja";
type LangOption = { code: LangCode; label: string };

const LANGUAGES: LangOption[] = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "ko", label: "Korean" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
];

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/explore" },
  { label: "Tours", href: "/tours" },
  { label: "Guides", href: "/guides" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LangCode>("vi");
  const menuRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  const closeMobile = () => setOpen(false);

  const { user, role, loading, logout } = useAuth();

  useEffect(() => {
    const code = localStorage.getItem("preferred_lang") as LangCode | null;
    if (code && LANGUAGES.some((l) => l.code === code)) setCurrentLanguage(code);
  }, []);

  const handleLanguageChange = (code: LangCode) => {
    setCurrentLanguage(code);
    setOpenLanguage(false);
    localStorage.setItem("preferred_lang", code);
    if (code === "vi") {
      window.location.href = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      return;
    }
    window.location.href = `https://translate.google.com/translate?sl=auto&tl=${code}&u=${encodeURIComponent(
      window.location.href,
    )}`;
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t)) setOpenMenu(false);
      if (languageRef.current && !languageRef.current.contains(t)) setOpenLanguage(false);
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
      <header className="fixed top-0 left-0 z-50 w-full border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
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
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-gray-300 transition hover:text-blue-400"
              >
                {item.label}
              </Link>
            ))}
            {!loading && user && role === "admin" && (
              <Link href="/dashboard" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="relative hidden sm:flex" ref={languageRef}>
              <button
                type="button"
                onClick={() => setOpenLanguage((v) => !v)}
                className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-2 text-gray-400 transition hover:text-white touch-manipulation"
                aria-expanded={openLanguage}
                aria-haspopup="listbox"
              >
                <Globe size={16} aria-hidden />
                <span className="text-xs font-bold uppercase">{currentLanguage}</span>
                <ChevronDown size={12} aria-hidden />
              </button>
              {openLanguage && (
                <div className="absolute right-0 top-10 z-50 w-40 rounded-xl border border-white/15 bg-slate-900/95 p-1.5 shadow-xl">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                        currentLanguage === lang.code
                          ? "bg-white/20 text-white"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden items-center gap-4 md:flex">
              {loading ? (
                <div className="text-sm text-gray-400">Loading...</div>
              ) : user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setOpenMenu((v) => !v)}
                    className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    aria-expanded={openMenu}
                    aria-haspopup="true"
                  >
                    <Image
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? "")}`}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full border object-cover transition hover:scale-105"
                      unoptimized
                    />
                  </button>
                  {openMenu && (
                    <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white p-3 text-black shadow-2xl">
                      <div className="mb-3 rounded-xl bg-gray-100 p-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? "")}`}
                            alt=""
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-full object-cover"
                            unoptimized
                          />
                          <div>
                            <p className="font-semibold">{user.email}</p>
                            <p className="text-sm text-gray-500">
                              {role === "admin" ? "Quản trị viên" : "Guest User"}
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/profile"
                          className="mt-3 block rounded-xl bg-gray-200 py-2 text-center text-sm font-medium hover:bg-gray-300"
                        >
                          Xem trang cá nhân
                        </Link>
                      </div>
                      <div className="space-y-1">
                        {role === "admin" && (
                          <Link href="/dashboard" className="menu-item block font-semibold text-blue-700">
                            Dashboard
                          </Link>
                        )}
                        <Link href="/profile" className="menu-item block">
                          Cài đặt / Hồ sơ
                        </Link>
                        <Link href="/explore" className="menu-item block">
                          Khám phá
                        </Link>
                        <button type="button" onClick={logout} className="menu-item w-full text-left text-red-500">
                          Đăng xuất
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
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Get Started
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
              aria-label={open ? "Đóng menu" : "Mở menu"}
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
                key={item.label}
                href={item.href}
                onClick={closeMobile}
                className="block py-2 font-medium text-gray-300 hover:text-blue-400 touch-manipulation"
              >
                {item.label}
              </Link>
            ))}
            {!loading && user && role === "admin" && (
              <Link
                href="/dashboard"
                onClick={closeMobile}
                className="block py-2 font-semibold text-amber-300 hover:text-amber-200"
              >
                Dashboard
              </Link>
            )}

            <div className="space-y-3 border-t border-white/10 pt-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400">Ngôn ngữ</p>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`min-h-[44px] rounded-lg px-3 py-2 text-left text-xs touch-manipulation ${
                      currentLanguage === lang.code ? "bg-white/20 text-white" : "bg-white/5 text-gray-300"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {user ? (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3 py-1">
                    <Image
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? "")}`}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full border border-white/20 object-cover"
                      unoptimized
                    />
                    <span className="truncate text-sm text-white">{user.email}</span>
                  </div>
                  <Link
                    href="/profile"
                    onClick={closeMobile}
                    className="block w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Hồ sơ cá nhân
                  </Link>
                  {role === "admin" && (
                    <Link
                      href="/dashboard"
                      onClick={closeMobile}
                      className="block w-full rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-center text-sm font-semibold text-amber-200"
                    >
                      Dashboard
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
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobile} className="block py-2 text-gray-300 hover:text-white">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobile}
                    className="flex min-h-[48px] items-center justify-center rounded-full bg-blue-600 py-3 text-center font-bold text-white"
                  >
                    Get Started
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
