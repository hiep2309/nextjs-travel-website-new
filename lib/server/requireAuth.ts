import "server-only";
import { NextResponse } from "next/server";
import { extractBearerToken, verifyIdToken, type VerifiedUser } from "@/lib/server/verifyIdToken";

/** Require a valid Firebase ID token on API routes. */
export async function requireAuth(req: Request): Promise<VerifiedUser | NextResponse> {
  const token = extractBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const user = await verifyIdToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  return user;
}

export function isAuthResponse(result: VerifiedUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
