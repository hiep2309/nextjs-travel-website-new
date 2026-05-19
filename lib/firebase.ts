/**
 * Khởi tạo Firebase (Auth, Firestore, Storage) — singleton app để tránh lặp `initializeApp`.
 *
 * Chức năng:
 * - `auth`: đăng nhập email/Google.
 * - `db`: đọc/ghi bài viết, người dùng.
 * - `storage`: upload ảnh bài đăng.
 *
 * Lưu ý: cấu hình project công khai trên client; quyền thật sự do Security Rules trên Console.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { firebaseConfig } from "@/lib/firebaseConfig";

// (Optional) Analytics – chỉ dùng khi cần
// import { getAnalytics } from "firebase/analytics";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
