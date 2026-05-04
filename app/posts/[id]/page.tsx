"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
          setPost(snap.data() as Post);
        }
      } catch {
        setErr("Lỗi tải bài viết.");
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-16 pt-24 text-white">
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
            <p className="text-sm text-white/60">{post.region || "Việt Nam"}</p>
            <h1 className="mt-2 text-3xl font-bold">{post.title || post.name}</h1>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-white/85">{post.description || ""}</p>
          </>
        )}
      </div>
    </div>
  );
}
