"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Star } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getUserPostRating,
  isPostSaved,
  recordPostView,
  setUserPostRating,
  toggleSavedPost,
} from "@/lib/userActivityStorage";

type Post = {
  title?: string;
  name?: string;
  description?: string;
  image?: string;
  region?: string;
};

export default function PostDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const [myStars, setMyStars] = useState<number | null>(null);
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const snap = await getDoc(doc(db, "posts", id));
        if (!snap.exists()) {
          setErr("Không tìm thấy bài viết.");
          setPost(null);
        } else {
          const data = snap.data() as Post;
          setPost(data);
          const title = data.title || data.name || "Bài viết";
          const image = data.image || null;
          recordPostView({ id, title, image });
          setSaved(isPostSaved(id));
          setMyStars(getUserPostRating(id));
        }
      } catch {
        setErr("Lỗi tải bài viết.");
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const postMeta =
    post && id
      ? {
          id,
          title: post.title || post.name || "Bài viết",
          image: post.image || null,
        }
      : null;

  const handleToggleSave = () => {
    if (!postMeta) return;
    const next = toggleSavedPost(postMeta);
    setSaved(next);
    showToast(next ? "Đã lưu bài viết" : "Đã bỏ lưu");
  };

  const applyRating = (stars: number) => {
    if (!postMeta) return;
    setUserPostRating(postMeta, stars);
    setMyStars(stars);
    showToast(`Đã lưu ${stars} sao — xem tại trang cá nhân`);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-16 pt-24 text-white">
      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-white/20 bg-slate-900/95 px-5 py-2.5 text-sm shadow-xl"
          role="status"
        >
          {toast}
        </div>
      ) : null}
      <div className="mx-auto max-w-3xl">
        <Link href="/explore" className="mb-6 inline-block text-sm text-amber-300 hover:underline">
          ← Quay lại khám phá
        </Link>
        {loading && <p>Đang tải…</p>}
        {err && <p className="text-red-300">{err}</p>}
        {!loading && post && (
          <>
            <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl border border-white/15">
              <Image
                src={post.image || "/signup_pic.jpg"}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-white/60">{post.region || "Việt Nam"}</p>
              <button
                type="button"
                onClick={handleToggleSave}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/25"
              >
                <Bookmark className={`size-4 ${saved ? "fill-violet-200" : ""}`} />
                {saved ? "Đã lưu" : "Lưu bài viết"}
              </button>
            </div>
            <h1 className="mt-2 text-3xl font-bold">{post.title || post.name}</h1>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-white/85">{post.description || ""}</p>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400/90">Đánh giá của bạn</p>
              <p className="mt-1 text-sm text-white/55">
                {myStars ? `Đã chấm ${myStars} sao — hiển thị trong Hồ sơ.` : "Chạm sao để lưu điểm của bạn."}
              </p>
              <div
                className="mt-3 flex gap-1"
                onMouseLeave={() => setHoverStar(null)}
                role="group"
                aria-label="Chấm điểm 1–5 sao"
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
                      onClick={() => applyRating(s)}
                      className="rounded-md p-1 text-amber-400 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      aria-label={`${s} sao`}
                    >
                      <Star className={`size-8 ${active ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
