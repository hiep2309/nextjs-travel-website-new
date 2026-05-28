/** One view bump per post per browser tab session. */
const SESSION_KEY_PREFIX = "vninsight:view-bump:";
const INFLIGHT_KEY_PREFIX = "vninsight:view-bump-inflight:";

export const VIEW_COUNT_BUMPED_EVENT = "vninsight:view-count-bumped";

export type ViewCountBumpedDetail = {
  postId: string;
  viewCount: number;
};

function sessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function sessionSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function sessionRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function shouldBumpPostView(postId: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionGet(`${SESSION_KEY_PREFIX}${postId}`) !== "1";
}

/** Prevent parallel bump writes (React Strict Mode double mount). */
export function tryAcquireViewBump(postId: string): boolean {
  if (typeof window === "undefined") return false;
  if (!shouldBumpPostView(postId)) return false;
  const inflightKey = `${INFLIGHT_KEY_PREFIX}${postId}`;
  if (sessionGet(inflightKey) === "1") return false;
  sessionSet(inflightKey, "1");
  return true;
}

export function releaseViewBumpInflight(postId: string): void {
  sessionRemove(`${INFLIGHT_KEY_PREFIX}${postId}`);
}

export function markPostViewBumped(postId: string, viewCount: number): void {
  if (typeof window === "undefined") return;
  sessionSet(`${SESSION_KEY_PREFIX}${postId}`, "1");
  releaseViewBumpInflight(postId);
  window.dispatchEvent(
    new CustomEvent<ViewCountBumpedDetail>(VIEW_COUNT_BUMPED_EVENT, {
      detail: { postId, viewCount },
    }),
  );
}

export function clearPostViewBumpMark(postId: string): void {
  sessionRemove(`${SESSION_KEY_PREFIX}${postId}`);
  releaseViewBumpInflight(postId);
}
