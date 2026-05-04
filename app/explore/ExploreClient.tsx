"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeVietnameseText } from "@/lib/normalizeVn";

type TravelPost = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  region?: string;
  country?: string;
  createdAt?: { seconds?: number };
};

export default function ExploreClient() {
  const searchParams = useSearchParams();
  const selectedProvince = searchParams.get("province") || "";
  const [posts, setPosts] = useState<TravelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, "posts"), where("status", "==", "approved"));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as TravelPost[];
        const sorted = data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setPosts(sorted);
      } catch {
        setError("Không thể tải bài viết lúc này.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!selectedProvince) return posts;
    const needle = normalizeVietnameseText(selectedProvince);
    if (!needle) return posts;
    return posts.filter((post) => {
      const region = normalizeVietnameseText(post.region || "");
      const title = normalizeVietnameseText(post.title || "");
      const name = normalizeVietnameseText(post.name || "");
      return region.includes(needle) || title.includes(needle) || name.includes(needle);
    });
  }, [posts, selectedProvince]);

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-14 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/70">Vietnam Insight</p>
        <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
          {selectedProvince ? `Bài viết về ${selectedProvince}` : "Tất cả bài viết du lịch"}
        </h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          Tổng hợp review, kinh nghiệm và gợi ý lịch trình.
        </p>
        <div className="mb-8 mt-6">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
          >
            Quay lại trang chủ
          </Link>
        </div>
        {loading && <p className="text-white/70">Đang tải…</p>}
        {error && <p className="text-red-300">{error}</p>}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-white/80">
            Chưa có bài viết phù hợp.
          </div>
        )}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="group block">
                <article className="h-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg transition group-hover:border-amber-400/40">
                  <div className="relative h-48">
                    <Image
                      src={post.image || "/signup_pic.jpg"}
                      alt={post.title || post.name || "Post"}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px)100vw,33vw"
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="mb-2 text-xs uppercase tracking-[0.15em] text-white/70">
                      {post.region || "Việt Nam"}
                    </p>
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{post.title || post.name || "Untitled"}</h3>
                    <p className="line-clamp-3 text-sm text-white/75">{post.description || "Chưa có mô tả."}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
