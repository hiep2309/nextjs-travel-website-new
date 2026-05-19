"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Eye } from "lucide-react";
import { useLocalizedPost } from "@/hooks/useLocalizedPost";
import type { TravelPost } from "@/lib/travelPost";

export function CommunityTourCard({ post }: { post: TravelPost }) {
  const t = useTranslations("Tours");
  const tc = useTranslations("Common");
  const { title, description } = useLocalizedPost(post);

  return (
    <Link
      href={`/posts/${post.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141b2e]/90 transition hover:border-amber-500/35 sm:flex-row"
    >
      <span className="relative aspect-[16/10] shrink-0 bg-slate-800 sm:aspect-auto sm:h-40 sm:w-52">
        {post.image?.trim() ? (
          <Image src={post.image} alt="" fill className="object-cover" sizes="208px" />
        ) : null}
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-center p-5">
        <span className="w-fit rounded-md border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-200">
          {t("community")}
        </span>
        <h3 className="mt-2 text-lg font-bold">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-[#b4bfce]">{description}</p>
        <p className="mt-3 flex flex-wrap gap-3 text-xs text-[#8892a8]">
          <span>{post.region || tc("vietnam")}</span>
          {post.travelTime ? <span>{post.travelTime}</span> : null}
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3.5" aria-hidden />
            {(post.viewCount ?? 0).toLocaleString("vi-VN")} {tc("views")}
          </span>
        </p>
      </div>
    </Link>
  );
}
