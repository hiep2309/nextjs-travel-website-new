import { NextResponse } from "next/server";

const SERVER_CACHE = new Map<string, string>();

/** Machine translation proxy (MyMemory free tier). Used when posts only have Vietnamese text. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const from = searchParams.get("from") || "vi";
  const to = searchParams.get("to") || "en";

  if (!q || q.length > 5000) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (from === to) {
    return NextResponse.json({ text: q });
  }

  const cacheKey = `${from}|${to}|${q.length}|${q.slice(0, 80)}`;
  const cached = SERVER_CACHE.get(cacheKey);
  if (cached) return NextResponse.json({ text: cached });

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${from}|${to}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
    };
    let text = data.responseData?.translatedText?.trim() || q;
    if (text.toUpperCase() === text && text.includes("MYMEMORY WARNING")) {
      text = q;
    }
    SERVER_CACHE.set(cacheKey, text);
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: q });
  }
}
