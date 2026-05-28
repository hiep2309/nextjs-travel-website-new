import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestoreCollections";
import {
  isGenericDisplayName,
  nameFromEmail,
  pickDisplayName,
} from "@/lib/comments/displayName";
import type { CommentAuthor } from "@/lib/comments/types";

/** Build author snapshot for new comments — always fetch fresh name from Firestore. */
export async function resolveCommentAuthor(user: User): Promise<CommentAuthor> {
  let profileName = "";
  let profilePhoto = user.photoURL;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.users, user.uid));
    if (snap.exists()) {
      const data = snap.data();
      if (typeof data.name === "string") profileName = data.name.trim();
      if (typeof data.photoURL === "string" && data.photoURL.trim()) {
        profilePhoto = data.photoURL.trim();
      }
    }
  } catch {
    /* use auth fallbacks */
  }

  const username = pickDisplayName(
    user.displayName,
    profileName,
    user.email,
    "Thành viên",
  );

  const avatar =
    profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff`;

  return {
    uid: user.uid,
    username,
    userAvatar: avatar,
  };
}

export { isGenericDisplayName, pickDisplayName, nameFromEmail };
