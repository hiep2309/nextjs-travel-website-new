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

// (Optional) Analytics – chỉ dùng khi cần
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBfQOD4mloHI53IMZM8K3JMAN4m1Rlatm0",
  authDomain: "vietnam-insight.firebaseapp.com",
  projectId: "vietnam-insight",
  storageBucket: "vietnam-insight.firebasestorage.app",
  messagingSenderId: "138579778908",
  appId: "1:138579778908:web:3024fb1731c22fdecff599",
  measurementId: "G-9XH0GS9DDY",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
