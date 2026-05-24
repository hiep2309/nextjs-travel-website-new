import type { AppLocale } from "@/i18n/routing";
import type { LocalizedSlug } from "@/lib/i18n/types";
import type { PostLocaleWritePayload } from "@/lib/firestore/multilingual";
import { getTranslationAuthHeaders } from "@/lib/translation/getAuthHeaders";
import type { TranslationProvider } from "@/lib/translation/types";

export type RequestPostTranslationBody = {
  title: string;
  description: string;
  contentHtml: string;
  sourceLocale?: AppLocale;
  provider?: TranslationProvider;
  existingSlugs?: LocalizedSlug;
  slugSuffix?: string;
};

export type RequestPostTranslationResponse = {
  payload?: PostLocaleWritePayload;
  geminiConfigured?: boolean;
  error?: string;
};

/** Client → `/api/translate/post` — single AI translation request for a full post. */
export async function requestPostTranslation(
  body: RequestPostTranslationBody,
): Promise<PostLocaleWritePayload> {
  const authHeaders = await getTranslationAuthHeaders();
  const res = await fetch("/api/translate/post", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const raw = await res.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      res.ok
        ? "Server returned non-JSON response"
        : `Translation API error (${res.status})`,
    );
  }

  let data: RequestPostTranslationResponse;
  try {
    data = JSON.parse(raw) as RequestPostTranslationResponse;
  } catch {
    throw new Error("Invalid JSON from translation API");
  }

  if (!res.ok || !data.payload) {
    throw new Error(data.error || "Translation failed");
  }

  return data.payload;
}
