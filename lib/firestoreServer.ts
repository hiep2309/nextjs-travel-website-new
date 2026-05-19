/**
 * Đọc Firestore từ Server Components / `generateMetadata` (không phải `use client`).
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "@/lib/firebaseConfig";

function getServerDb() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

export type PostSeoMeta = {
  title: string;
  description: string;
  image?: string;
  /** Bài pending: không index; draft/rejected tương tự */
  robotsNoIndex: boolean;
};

export async function getPostSeoMeta(id: string): Promise<PostSeoMeta | null> {
  if (!id) return null;
  try {
    const snap = await getDoc(doc(getServerDb(), "posts", id));
    if (!snap.exists()) return null;
    const d = snap.data();
    const title = String(d.title || d.name || "Bài viết").trim() || "Bài viết";
    const description = String(d.description || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 280);
    const image = typeof d.image === "string" && d.image.startsWith("http") ? d.image : undefined;
    const status = typeof d.status === "string" ? d.status : "";

    const robotsNoIndex =
      status === "pending" || status === "draft" || status === "rejected" || status === "deleted";

    return {
      title,
      description: description || `${title} — VietNam Insight`,
      image,
      robotsNoIndex,
    };
  } catch {
    return null;
  }
}
