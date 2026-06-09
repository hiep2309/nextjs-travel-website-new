/**
 * Hook theo dõi phiên đăng nhập Firebase + vai trò trong Firestore (`users/{uid}.role`).
 *
 * Chức năng:
 * - `loading`: chờ lần đầu `onAuthStateChanged`.
 * - Sau khi có user, `role` được nạp bất đồng bộ; UI không khóa chờ role (tránh kẹt loading).
 */
import { useCallback, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { logout as signOut } from '@/lib/auth';
import { useRouter } from '@/i18n/navigation';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await signOut();
    router.push('/');
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        void (async () => {
          try {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setRole(userSnap.data().role || "user");
            } else {
              setRole("user");
            }
          } catch (error) {
            console.error("Lỗi lấy role:", error);
            setRole("user");
          }
        })();
      } else {
        setUser(null);
        setRole(null);
      }
    });

    let cancelled = false;
    void Promise.race([
      auth.authStateReady(),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 10_000);
      }),
    ]).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { user, role, loading, logout };
};