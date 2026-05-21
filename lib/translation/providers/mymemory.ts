import type { AppLocale } from "@/i18n/routing";

const MYMEMORY_LANG: Record<AppLocale, string> = {
  vi: "vi",
  en: "en",
  ko: "ko",
};

/** Free-tier MyMemory translation (server-side). */
export async function translateWithMyMemory(
  text: string,
  from: AppLocale,
  to: AppLocale,
): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${MYMEMORY_LANG[from]}|${MYMEMORY_LANG[to]}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
  };

  let out = data.responseData?.translatedText?.trim() || text;
  if (out.toUpperCase() === out && out.includes("MYMEMORY WARNING")) {
    out = text;
  }
  return out;
}
