import { auth } from "@/lib/firebase";

/** Bearer token headers for authenticated translation API calls. */
export async function getTranslationAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentication required");
  }

  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}
