/** Gemini models — prefer stable flash models with free-tier quota. */
export const GEMINI_MODEL_DEFAULT = "gemini-flash-latest";
export const GEMINI_MODEL_PREMIUM = "gemini-2.5-flash";

export const GEMINI_MODEL_CANDIDATES = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash",
] as const;

export const PLANNER_TEMPERATURE = 0.65;

/** Free tier limits. */
export const FREE_DAILY_GENERATE_LIMIT = 3;
export const FREE_MAX_DAYS = 5;
export const PREMIUM_MAX_DAYS = 14;

/** Client debounce between generate clicks. */
export const GENERATE_DEBOUNCE_MS = 2500;

/** In-memory L1 cache TTL. Firestore L2 TTL is longer. */
export const MEMORY_CACHE_TTL_MS = 60 * 60 * 1000;
export const FIRESTORE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function selectGeminiModel(premiumMode?: boolean): string {
  if (premiumMode) {
    return process.env.GEMINI_MODEL_PREMIUM?.trim() || GEMINI_MODEL_PREMIUM;
  }
  return process.env.GEMINI_MODEL?.trim() || GEMINI_MODEL_DEFAULT;
}

/** Scale output budget by trip length; disable thinking overhead on 2.5 models. */
export function plannerMaxTokens(premiumMode?: boolean, days = 3): number {
  const base = premiumMode ? 4096 : 3072;
  return Math.min(8192, base + days * 350);
}

export function plannerGenerationConfig(premiumMode: boolean, days: number) {
  return {
    temperature: PLANNER_TEMPERATURE,
    maxOutputTokens: plannerMaxTokens(premiumMode, days),
    responseMimeType: "application/json" as const,
    // Gemini 2.5 "thinking" tokens can eat the budget and truncate JSON output.
    thinkingConfig: { thinkingBudget: 0 },
  };
}
