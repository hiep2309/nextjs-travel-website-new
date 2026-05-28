import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AppLocale } from "@/i18n/routing";
import {
  buildGlossaryPrompt,
  buildLocalizationStylePrompt,
  buildPlatformContextPrompt,
  localeLabel,
  type ExtendedTargetLocale,
} from "@/lib/glossary/glossary";

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash",
] as const;

export type GeminiTranslateContext = "plain" | "html-protected" | "html-block";

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY?.trim() || null;
}

export function isGeminiTranslationAvailable(): boolean {
  return Boolean(getApiKey());
}

/** Slightly warmer output for Korean/English tourism copy. */
function temperatureForLocale(to: ExtendedTargetLocale): number {
  if (to === "ko" || to === "en") return 0.22;
  return 0.15;
}

function buildPrompt(
  text: string,
  from: AppLocale,
  to: ExtendedTargetLocale,
  context: GeminiTranslateContext,
): string {
  const platform = buildPlatformContextPrompt();
  const style = buildLocalizationStylePrompt(to);
  const glossary = buildGlossaryPrompt(from, to);

  const placeholderRules =
    context === "html-protected"
      ? `
HTML placeholders:
- Text may contain [[TAG_0]], [[TAG_1]], … — copy each placeholder EXACTLY (do not translate or reorder).
- Only translate human-readable words between placeholders.`
      : context === "html-block"
        ? `
HTML fragment:
- Preserve every tag, attribute, class, and URL exactly.
- Translate only visible text between tags — keep the same structure and line breaks.
- Output ONLY the translated HTML fragment (no markdown fences).`
        : "";

  return `You are a senior localization editor for a Vietnam travel website (VN Insight).

Task: Localize (not word-for-word translate) from ${localeLabel(from)} to ${localeLabel(to)}.
${platform}
${style}
${glossary}

Core rules:
- Sound natural to ${to === "ko" ? "Korean tourists" : to === "en" ? "international travelers" : "readers"} — prioritize readability and tourism terminology over literal accuracy.
- Preserve meaning, tips, and practical details; do not add or remove facts.
- Keep Vietnamese place names recognizable (Hạ Long, Hải Phòng, Sa Pa, Đà Nẵng, Huế, Hội An, Ninh Bình).
- Preserve brand "VN Insight", URLs, numbers, prices (VND), and addresses.
- Do NOT output explanations, notes, or markdown — translated content ONLY.
${placeholderRules}

Source:
"""
${text}
"""`;
}

async function generatePlainText(
  apiKey: string,
  prompt: string,
  to: ExtendedTargetLocale,
): Promise<string> {
  let lastError: Error | null = null;
  const temperature = temperatureForLocale(to);

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature, maxOutputTokens: 8192 },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text()?.trim();
      if (text) return stripCodeFences(text);
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
          generationConfig: { temperature, maxOutputTokens: 8192 },
        }),
      });
      const payload = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(payload.error?.message ?? res.statusText);
      const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
      if (text) return stripCodeFences(text);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Gemini translation failed");
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:html)?\s*([\s\S]*?)```\s*$/i);
  if (fenced) return fenced[1].trim();
  return trimmed.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

/** Low-level Gemini call — throws if API key missing or all models fail. */
export async function callGeminiTranslate(
  text: string,
  from: AppLocale,
  to: ExtendedTargetLocale,
  context: GeminiTranslateContext = "plain",
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const prompt = buildPrompt(text, from, to, context);
  return generatePlainText(apiKey, prompt, to);
}
