/**
 * Bọc đăng xuất Firebase Auth — các luồng đăng nhập/đăng ký dùng trực tiếp `firebase/auth` trong `Login` / `Register`.
 */
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

/** Đăng xuất phiên hiện tại. */
export const logout = () => {
  return signOut(auth);
};
