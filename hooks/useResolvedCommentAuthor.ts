"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestoreCollections";
import { isGenericDisplayName, pickDisplayName } from "@/lib/comments/displayName";

type ResolvedAuthor = {
  displayName: string;
  avatar: string | null;
};

/** Resolve comment author label from Firestore `users/{uid}` when stored name is generic. */
export function useResolvedCommentAuthor(
  userId: string,
  storedUsername: string | undefined,
  storedAvatar?: string | null,
  fallback = "Thành viên",
): ResolvedAuthor {
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    (async () => {
      if (!isGenericDisplayName(storedUsername)) {
        setProfileName(null);
        setProfileAvatar(null);
        return;
      }

      try {
        const snap = await getDoc(doc(db, COLLECTIONS.users, userId));
        if (cancelled || !snap.exists()) return;
        const data = snap.data();
        const name = typeof data.name === "string" ? data.name.trim() : "";
        const photo = typeof data.photoURL === "string" ? data.photoURL.trim() : "";
        setProfileName(name || null);
        setProfileAvatar(photo || null);
      } catch {
        if (!cancelled) {
          setProfileName(null);
          setProfileAvatar(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, storedUsername]);

  const displayName = pickDisplayName(storedUsername, profileName, undefined, fallback);
  const avatar = profileAvatar || storedAvatar || null;

  return { displayName, avatar };
}
