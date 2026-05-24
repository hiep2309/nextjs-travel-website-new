import "server-only";
import { getAdminAuth } from "@/lib/server/firebaseAdmin";
import { firebaseConfig } from "@/lib/firebaseConfig";

export type VerifiedUser = {
  uid: string;
  email?: string;
};

/** Verify Firebase ID token — Admin SDK first, REST fallback. */
export async function verifyIdToken(idToken: string): Promise<VerifiedUser | null> {
  const token = idToken.trim();
  if (!token) return null;

  const auth = getAdminAuth();
  if (auth) {
    try {
      const decoded = await auth.verifyIdToken(token);
      return { uid: decoded.uid, email: decoded.email };
    } catch {
      /* fall through to REST */
    }
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      },
    );
    const payload = (await res.json()) as {
      users?: { localId?: string; email?: string }[];
      error?: { message?: string };
    };
    if (!res.ok || !payload.users?.[0]?.localId) return null;
    const user = payload.users[0];
    return { uid: user.localId!, email: user.email };
  } catch {
    return null;
  }
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}
