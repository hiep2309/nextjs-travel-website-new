"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export type MergedProfile = {
  uid: string;
  email: string | null;
  name: string;
  photoURL: string | null;
  role: string;
};

export function useUserProfile(): { profile: MergedProfile | null; loading: boolean } {
  const { user, role, loading: authLoading } = useAuth();
  const [firestoreName, setFirestoreName] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setFirestoreName(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (cancelled) return;
        if (snap.exists()) {
          const d = snap.data();
          setFirestoreName(typeof d.name === "string" ? d.name : null);
        } else {
          setFirestoreName(null);
        }
      } catch {
        if (!cancelled) setFirestoreName(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  if (authLoading) {
    return { profile: null, loading: true };
  }

  if (!user) {
    return { profile: null, loading: false };
  }

  const profile: MergedProfile = {
    uid: user.uid,
    email: user.email,
    name: firestoreName || user.displayName || "Thành viên",
    photoURL: user.photoURL,
    role: role || "user",
  };

  return { profile, loading: false };
}
