/**
 * Hook theo dõi phiên đăng nhập Firebase + vai trò trong Firestore (`users/{uid}.role`).
 *
 * Chức năng:
 * - `loading`: chờ lần đầu `onAuthStateChanged`.
 * - Sau khi có user, `role` được nạp bất đồng bộ; UI không khóa chờ role (tránh kẹt loading).
 */
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { logout } from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Bật UI ngay — không chờ Firestore (tránh "Loading..." kẹt vĩnh viễn nếu getDoc treo/lỗi mạng)
        setLoading(false);
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
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, role, loading, logout };
};