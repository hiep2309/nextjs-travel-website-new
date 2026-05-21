/** Detect Gemini / API quota and rate-limit errors. */
export function isQuotaError(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "QUOTA") {
    return true;
  }

  const msg = err instanceof Error ? err.message : String(err ?? "");
  const lower = msg.toLowerCase();

  return (
    /429/.test(msg) ||
    /resource_exhausted/i.test(msg) ||
    /quota exceeded/i.test(lower) ||
    /rate limit/i.test(lower) ||
    /too many requests/i.test(lower) ||
    /exceeded your current quota/i.test(lower)
  );
}

export function isRetryablePlannerError(code: string | undefined): boolean {
  return code === "QUOTA" || code === "PARSE_FAILED" || code === "TRUNCATED" || code === "EMPTY";
}

/** Default cooldown after quota hit (ms). */
export const QUOTA_RETRY_COOLDOWN_MS = 30_000;

export function getQuotaRetryRemainingMs(until: number | null): number {
  if (!until) return 0;
  return Math.max(0, until - Date.now());
}
