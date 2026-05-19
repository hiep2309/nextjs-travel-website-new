/**

 * Trang Guides / Cẩm nang — bài `guide_*` từ Firestore + mẫu tĩnh, lọc theo chip.

 */

"use client";



import { useEffect, useMemo, useState } from "react";


import Image from "next/image";

import { Eye } from "lucide-react";

import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";

import {

  MOCK_GUIDES,

  CATEGORY_CHIPS,

  labelForCategory,

  type GuideCategory,

  type GuideEntry,

} from "@/lib/guidesContent";

import {

  labelForPostType,

  postBelongsToSection,

  postMatchesGuideChip,

  resolvePostType,

} from "@/lib/postCategories";

import type { TravelPost } from "@/lib/travelPost";
import { useLocale, useTranslations } from "next-intl";
import { pickLocalized } from "@/lib/i18n/content";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

function postsToGuides(posts: TravelPost[], locale: AppLocale, fallbackTitle: string): GuideEntry[] {
  return posts
    .filter((p) => postBelongsToSection(p, "guides"))
    .map((p) => {
      const type = resolvePostType(p);
      const chip =
        type === "guide_handbook"
          ? "handbook"
          : type === "guide_hotel"
            ? "hotel"
            : type === "guide_notes"
              ? "notes"
              : "transport";
      const desc = pickLocalized(p.description, locale);
      const title = pickLocalized(p.title || p.name, locale) || fallbackTitle;
      return {
        id: `fs-${p.id}`,
        source: "firestore" as const,
        title,
        excerpt: desc.trim().slice(0, 160) + (desc.length > 160 ? "…" : ""),

        category: chip,

        readMinutes: Math.max(3, Math.min(20, Math.round((desc.length || 200) / 400))),

        dateDisplay: p.createdAt?.seconds

          ? new Date(p.createdAt.seconds * 1000).toLocaleDateString("vi-VN")

          : "—",

        image: p.image || "",

        href: `/posts/${p.id}`,

        viewCount: typeof p.viewCount === "number" ? p.viewCount : 0,

      };

    });

}



export default function GuidesPage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("GuidesPage");
  const tn = useTranslations("Nav");
  const tc = useTranslations("Common");

  const [chip, setChip] = useState<GuideCategory>("all");

  const [remote, setRemote] = useState<TravelPost[]>([]);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    let alive = true;

    (async () => {

      try {

        const q = query(collection(db, "posts"), where("status", "==", "approved"));

        const snap = await getDocs(q);

        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as TravelPost[];

        if (alive)

          setRemote(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));

      } catch {

        if (alive) setRemote([]);

      } finally {

        if (alive) setLoading(false);

      }

    })();

    return () => {

      alive = false;

    };

  }, []);



  const merged = useMemo(
    () => [...postsToGuides(remote, locale, t("communityShare")), ...MOCK_GUIDES],
    [remote, locale, t],
  );



  const filtered = useMemo(() => {

    if (chip === "all") return merged;

    return merged.filter((g) => {

      if (g.source === "firestore") {

        const post = remote.find((p) => `fs-${p.id}` === g.id);

        return post ? postMatchesGuideChip(post, chip) : false;

      }

      return g.category === chip;

    });

  }, [merged, chip, remote]);



  return (

    <div className="min-h-screen pb-16 pt-28 text-white">

      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">

        <nav className="text-sm text-[#8892a8]">

          <Link href="/" className="hover:text-amber-400">
            {tn("home")}
          </Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-white">{tn("guides")}</span>
        </nav>

        <header className="mx-auto mt-8 max-w-2xl text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
          <p className="mt-3 text-sm text-[#9aa5bc] sm:text-base">{t("desc")}</p>

        </header>



        <div className="mt-10 flex flex-wrap justify-center gap-2">

          {CATEGORY_CHIPS.map((c) => (

            <button

              key={c.key}

              type="button"

              aria-pressed={chip === c.key}

              onClick={() => setChip(c.key)}

              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${

                chip === c.key

                  ? "bg-amber-500 text-[#0b1121]"

                  : "border border-white/15 bg-[#141b2e] text-[#cad3e2]"

              }`}

            >

              {c.label}

            </button>

          ))}

        </div>



        {loading && <p className="mt-8 text-center text-[#8892a8]">Đang tải bài từ cộng đồng…</p>}



        <div className="mt-10 space-y-5">

          {filtered.map((g) => {

            const catLabel =

              g.source === "firestore"

                ? labelForPostType(

                    resolvePostType(remote.find((p) => `fs-${p.id}` === g.id) ?? {}),

                  )

                : labelForCategory(g.category);

            return (

              <article

                key={g.id}

                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141b2e]/90 shadow-lg transition hover:border-amber-500/30"

              >

                <Link href={g.href} className="flex flex-col sm:flex-row">

                  <span className="relative aspect-[16/10] shrink-0 bg-slate-800 sm:aspect-auto sm:h-48 sm:w-64">

                    {g.image.trim() ? (

                      <Image src={g.image} alt="" fill className="object-cover" sizes="256px" />

                    ) : null}

                  </span>

                  <div className="flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-6">

                    <span className="inline-block w-fit rounded-md border border-amber-500/45 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold uppercase text-amber-300">

                      {catLabel}

                    </span>

                    <h2 className="mt-3 text-xl font-bold sm:text-2xl">{g.title}</h2>

                    <p className="mt-2 line-clamp-2 text-sm text-[#b4bfce]">{g.excerpt}</p>

                    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8892a8]">

                      <span>

                        {g.readMinutes} phút đọc · {g.dateDisplay}

                      </span>

                      {g.source === "firestore" ? (

                        <span className="inline-flex items-center gap-1">

                          <Eye className="size-3.5" aria-hidden />

                          {(g.viewCount ?? 0).toLocaleString("vi-VN")} lượt xem

                        </span>

                      ) : null}

                    </p>

                  </div>

                </Link>

              </article>

            );

          })}

          {!loading && filtered.length === 0 ? (

            <p className="rounded-2xl border border-white/10 py-14 text-center text-[#9aa5bc]">

              Chưa có bài cẩm nang trong mục này.

            </p>

          ) : null}

        </div>

      </div>

    </div>

  );

}


