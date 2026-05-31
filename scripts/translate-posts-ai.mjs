/**
 * Batch-translate existing posts missing en/ko via server Admin API.
 *
 * Usage:
 *   npm run dev                                    # terminal 1
 *   npm run translate:posts:dry                    # terminal 2
 *   npm run translate:posts
 *   node scripts/translate-posts-ai.mjs --id=POST_ID
 *
 * `.env.local`:
 *   GEMINI_API_KEY=...
 *   FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
 *   NEXT_PUBLIC_SITE_URL=http://localhost:3000
 *   ADMIN_SCRIPT_KEY=your-secret-key               # optional in dev
 */
import { loadScriptEnv } from "./lib/firebase-script.mjs";

const DRY_RUN = process.argv.includes("--dry-run");
const ID_FILTER = process.argv.find((a) => a.startsWith("--id="))?.slice(5)?.trim();

async function main() {
  loadScriptEnv();

  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.error("Missing GEMINI_API_KEY in .env.local");
    process.exit(1);
  }

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const scriptKey = process.env.ADMIN_SCRIPT_KEY?.trim() ?? "";

  console.log(`Site: ${baseUrl}`);
  console.log(DRY_RUN ? "[DRY RUN]" : "[LIVE]");

  const headers = { "Content-Type": "application/json" };
  if (scriptKey) headers["x-admin-script-key"] = scriptKey;

  const res = await fetch(`${baseUrl}/api/admin/batch-translate-posts`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      dryRun: DRY_RUN,
      postId: ID_FILTER || undefined,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || res.statusText || `HTTP ${res.status}`);
  }

  console.log(JSON.stringify(json, null, 2));
}

main().catch((err) => {
  if (err?.cause?.code === "ECONNREFUSED" || String(err?.message).includes("fetch failed")) {
    console.error("\nCannot reach Next.js. Run `npm run dev` in another terminal first.");
  } else {
    console.error(err.message || err);
  }
  process.exit(1);
});
