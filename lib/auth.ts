/**
 * Hàm bọc Firebase Auth — đăng ký, đăng nhập, đăng xuất.
 *
 * Sau đăng ký/đăng nhập gọi `createUserProfile` để đảm bảo có document `users/{uid}` (idempotent).
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { createUserProfile } from "./user";
import { auth } from "./firebase";

/** Đăng ký email/mật khẩu và tạo profile Firestore lần đầu. */
export const register = async (email: string, password: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(res.user);
  return res;
};

/** Đăng nhập; gọi `createUserProfile` để bù document nếu tài khoản cũ chưa có bản ghi users. */
export const login = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  await createUserProfile(res.user);
  return res;
};

/** Đăng xuất phiên hiện tại. */
export const logout = () => {
  return signOut(auth);
};