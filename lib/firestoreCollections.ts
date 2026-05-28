/**
 * Firestore collections + multilingual document schema reference.
 */
export const COLLECTIONS = {
  users: "users",
  posts: "posts",
  comments: "comments",
  commentLikes: "commentLikes",
  commentReports: "commentReports",
  savedItineraries: "saved_itineraries",
  tripPlanCache: "trip_plan_cache",
  plannerDailyUsage: "planner_daily_usage",
} as const;

/**
 * Canonical `posts/{id}` multilingual shape:
 *
 * ```json
 * {
 *   "sourceLocale": "vi",
 *   "title": { "vi": "...", "en": "...", "ko": "..." },
 *   "description": { "vi": "...", "en": "...", "ko": "..." },
 *   "contentHtml": { "vi": "<p>…</p>", "en": "<p>…</p>", "ko": "<p>…</p>" },
 *   "translations": {
 *     "vi": { "title": "…", "description": "…", "content": "<p>…</p>" },
 *     "ko": { "title": "…", "description": "…", "content": "<p>…</p>" }
 *   },
 *   "slugs": { "vi": "ha-noi-3-ngay-abc", "en": "hanoi-3-days-abc", "ko": "…" },
 *   "seo": {
 *     "vi": { "title": "… | VN Insight", "description": "…" },
 *     "en": { "title": "…", "description": "…" }
 *   },
 *   "translationStatus": { "vi": "published", "en": "machine", "ko": "machine" },
 *   "region": "Đà Nẵng",
 *   "postType": "destination_share",
 *   "status": "approved",
 *   "updatedAt": "<Timestamp>"
 * }
 * ```
 *
 * Legacy fields (`name`, `slug` string) are normalized on read — do not write on create/update.
 *
 * Future: `destinations/{id}` with `name`, `summary` as LocalizedString maps.
 */
export const MULTILINGUAL_SCHEMA_VERSION = 2 as const;
