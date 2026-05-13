/**
 * Thao tác profile người dùng trên Firestore — tạo document khi đăng ký lần đầu.
 */
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

/**
 * Tạo document `users/{uid}` nếu chưa tồn tại (idempotent — không ghi đè user cũ).
 *
 * @param customName — tên từ form đăng ký, ưu tiên hơn `displayName` của OAuth.
 */
export const createUserProfile = async (user: User, customName?: string) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      name: customName || user.displayName || "User",
      role: "user",
      createdAt: serverTimestamp(),
    });
  }
};