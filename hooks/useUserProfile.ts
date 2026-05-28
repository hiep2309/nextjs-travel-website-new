/**
 * Gộp thông tin hiển thị hồ sơ: Firebase Auth (`useAuth`) + Firestore `users/{uid}`.
 */
"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { pickDisplayName } from "@/lib/comments/displayName";

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
  const [firestorePhoto, setFirestorePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setFirestoreName(null);
      setFirestorePhoto(null);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        if (!snap.exists()) {
          setFirestoreName(null);
          setFirestorePhoto(null);
          return;
        }
        const d = snap.data();
        setFirestoreName(typeof d.name === "string" ? d.name : null);
        setFirestorePhoto(typeof d.photoURL === "string" && d.photoURL.trim() ? d.photoURL.trim() : null);
      },
      () => {
        setFirestoreName(null);
        setFirestorePhoto(null);
      },
    );

    return () => unsub();
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
    name: pickDisplayName(user.displayName, firestoreName, user.email, "Thành viên"),
    photoURL: firestorePhoto || user.photoURL,
    role: role || "user",
  };

  return { profile, loading: false };
}
