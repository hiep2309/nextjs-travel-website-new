"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationBell() {
  const t = useTranslations("Notifications");
  const { user } = useAuth();
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
        aria-label={t("aria")}
        aria-expanded={open}
      >
        <Bell className="size-5" strokeWidth={1.75} />
        {unreadCount > 0 ? (
          <span className="absolute right-0.5 top-0.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-[1002] mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-2xl shadow-black/60"
          role="menu"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
            <p className="text-sm font-semibold text-white">{t("title")}</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-[11px] font-semibold text-violet-300 hover:text-violet-200"
              >
                {t("markAllRead")}
              </button>
            ) : null}
          </div>
          <ul className="max-h-72 overflow-y-auto p-1">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-white/50">{t("empty")}</li>
            ) : (
              items.map((n) => {
                const isApproved = n.type === "post_approved";
                const href = n.postId ? `/posts/${n.postId}` : "/profile";
                return (
                  <li key={n.id}>
                    <Link
                      href={href}
                      onClick={() => {
                        void markRead(n.id);
                        setOpen(false);
                      }}
                      className={`block rounded-xl px-3 py-2.5 text-left transition hover:bg-white/10 ${
                        n.read ? "opacity-70" : "bg-violet-500/10"
                      }`}
                    >
                      <p className="text-xs font-semibold text-white">
                        {isApproved ? t("postApprovedTitle") : n.type}
                      </p>
                      {n.title ? (
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-white/65">{n.title}</p>
                      ) : null}
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
