import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AppLocale } from "@/i18n/routing";
import type { TranslationContext } from "@/lib/translation/types";

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash",
] as const;

const LOCALE_LABEL: Record<AppLocale, string> = {
  vi: "Vietnamese",
  en: "English",
  ko: "Korean",
};

function buildTranslationPrompt(
  text: string,
  from: AppLocale,
  to: AppLocale,
  context: TranslationContext,
): string {
  const travelRules =
    context === "travel-post"
      ? `
- Keep Vietnamese place names recognizable (Hạ Long, Sa Pa, Đà Nẵng, Huế, Hội An).
- Preserve brand name "VN Insight".
- Keep a natural travel-blog tone.`
      : "";

  return `You are a professional translator for a Vietnam travel website (VN Insight).

Translate the following text from ${LOCALE_LABEL[from]} to ${LOCALE_LABEL[to]}.
${travelRules}

Rules:
- Output ONLY the translated text — no quotes, labels, markdown, or explanation.
- Preserve numbers, URLs, and line breaks.
- Do not add content that is not in the source.

Source text:
"""
${text}
"""`;
}

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY?.trim() || null;
}

export function isGeminiTranslationAvailable(): boolean {
  return Boolean(getApiKey());
}

async function generatePlainText(apiKey: string, prompt: string): Promise<string> {
  let lastError: Error | null = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text()?.trim();
      if (text) return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
        }),
      });
      const payload = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(payload.error?.message ?? res.statusText);
      const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
      if (text) return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Gemini translation failed");
}

/** Gemini translation for admin/content pipeline. */
export async function translateWithGemini(
  text: string,
  from: AppLocale,
  to: AppLocale,
  context: TranslationContext = "travel-post",
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const prompt = buildTranslationPrompt(text, from, to, context);
  return generatePlainText(apiKey, prompt);
}
