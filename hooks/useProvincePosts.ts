"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeTravelPost } from "@/lib/firestore/multilingual";
import { filterPostsByProvince } from "@/lib/posts/postsByProvince";
import { sortPostsByViewsThenDate } from "@/lib/posts/sortPosts";
import type { TravelPost } from "@/lib/travelPost";

/** Approved Firestore posts tagged with a Vietnamese province name (`region`). */
export function useProvincePosts(provinceName: string): {
  posts: TravelPost[];
  loading: boolean;
} {
  const [posts, setPosts] = useState<TravelPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "posts"), where("status", "==", "approved"));
        const snap = await getDocs(q);
        const all = snap.docs.map((docSnap) => normalizeTravelPost(docSnap.id, docSnap.data()));
        const matched = sortPostsByViewsThenDate(filterPostsByProvince(all, provinceName));
        if (!cancelled) setPosts(matched);
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [provinceName]);

  return { posts, loading };
}
