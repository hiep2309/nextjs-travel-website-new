/**
 * Thao tác profile người dùng trên Firestore — tạo document khi đăng ký lần đầu.
 */
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { reload, updateProfile, type User } from "firebase/auth";
import { db } from "./firebase";
import {
  validateDisplayName,
  type DisplayNameValidationError,
} from "@/lib/comments/displayName";

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

export class DisplayNameUpdateError extends Error {
  constructor(public readonly code: DisplayNameValidationError | "auth") {
    super(code);
    this.name = "DisplayNameUpdateError";
  }
}

/** Lưu tên hiển thị cá nhân — Firestore `users/{uid}.name` + Auth `displayName`. */
export async function updateUserDisplayName(user: User, rawName: string): Promise<string> {
  const parsed = validateDisplayName(rawName);
  if (!parsed.ok) throw new DisplayNameUpdateError(parsed.error);

  const name = parsed.value;
  try {
    await updateProfile(user, { displayName: name });
    await reload(user);
    await setDoc(
      doc(db, "users", user.uid),
      { name, updatedAt: new Date().toISOString() },
      { merge: true },
    );
  } catch {
    throw new DisplayNameUpdateError("auth");
  }

  return name;
}