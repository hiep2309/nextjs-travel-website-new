"use client";

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export type UserNotification = {
  id: string;
  userId: string;
  type: string;
  postId?: string;
  title?: string;
  read?: boolean;
  createdAt?: { seconds?: number };
};

export function useNotifications(maxItems = 20) {
  const { user } = useAuth();
  const [items, setItems] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(maxItems),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<UserNotification, "id">),
          })),
        );
        setLoading(false);
      },
      () => {
        setItems([]);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user?.uid, maxItems]);

  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    const unread = items.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markRead(n.id)));
  };

  return { items, loading, unreadCount, markRead, markAllRead };
}
