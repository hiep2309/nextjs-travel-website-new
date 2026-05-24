import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AppLocale } from "@/i18n/routing";
import { parseExtractedJson, ExtractJsonError } from "@/lib/extractJson";
import {
  PLANNER_CATEGORIES,
  costFormatInstruction,
  getPaceLabel,
  getStyleLabel,
  getTransportLabel,
  localeOutputInstruction,
} from "@/lib/planner/i18n";
import { generateMockTripPlan } from "@/lib/planner/mockItinerary";
import {
  buildPlanCacheKey,
  getCachedTripPlan,
  setCachedTripPlan,
} from "@/lib/planner/planCacheStore";
import { mapPlannerError, PlannerError } from "@/lib/planner/plannerErrors";
import {
  GEMINI_MODEL_CANDIDATES,
  plannerGenerationConfig,
  selectGeminiModel,
} from "@/lib/planner/plannerConfig";
import { isQuotaError } from "@/lib/planner/quota";
import { validateTripPlan, TripPlanValidationError } from "@/lib/planner/validateTripPlan";
import type {
  PlannerFormData,
  TripPlan,
  TripPlanFallbackReason,
  TripPlanMeta,
  TripPlanResult,
} from "@/lib/planner/types";

const JSON_SHAPE = `{"trip_title":string,"destination":string,"total_estimated_cost":string,"days":[{"day":number,"theme":string,"activities":[{"time":string,"place_name":string,"description":string,"estimated_cost":string,"category":string,"tips"?:string}]}],"hidden_gems":[{"name":string,"description":string}],"local_food"?:string[]}`;

export type AiUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export type AiStreamHandlers = {
  onToken?: (chunk: string) => void;
  onUsage?: (usage: AiUsage) => void;
};

function buildPrompt(data: PlannerFormData, locale: AppLocale, premiumMode: boolean): string {
  const categoryList = PLANNER_CATEGORIES.join(", ");
  const maxActivities = premiumMode ? 3 : 2;

  return `You are an expert Vietnam travel planner. Output ONLY valid JSON. No markdown. No story. Short text only.

Schema: ${JSON_SHAPE}

Trip: ${data.destination} | ${data.days} days | ${data.budget} | ${getStyleLabel(locale, data.travelStyle)} | ${data.travelers} travelers | ${getTransportLabel(locale, data.transportation)} | ${getPaceLabel(locale, data.pace)} | lang=${locale}

Rules:
- Real places in Vietnam only
- Exactly ${data.days} day(s), max ${maxActivities} activities/day
- Descriptions: 1 short sentence each
- 2 hidden_gems (short)
- local_food: 2-3 dish names
- category: one of ${categoryList}
- ${costFormatInstruction(locale)}
- Stay within budget
- ${localeOutputInstruction(locale)}

Return JSON only.`;
}

function buildCompactPrompt(data: PlannerFormData, locale: AppLocale): string {
  const categoryList = PLANNER_CATEGORIES.join(", ");
  return `Vietnam trip JSON only. No markdown.

{"trip_title":"","destination":"","total_estimated_cost":"","days":[{"day":1,"theme":"","activities":[{"time":"","place_name":"","description":"","estimated_cost":"","category":"","tips":""}]}],"hidden_gems":[{"name":"","description":""}]}

${data.destination} | ${data.days} days | ${data.budget} | lang=${locale}
Exactly ${data.days} days, 2 activities/day, short text. category: ${categoryList}. ${costFormatInstruction(locale)}. ${localeOutputInstruction(locale)}`;
}

export function parseTripPlanJson(raw: string): TripPlan {
  const parsed = parseExtractedJson<unknown>(raw);
  return validateTripPlan(parsed);
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new PlannerError("GEMINI_API_KEY is not configured", "API_KEY");
  return key;
}

function normalizeUsage(meta?: {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}): AiUsage | undefined {
  if (!meta) return undefined;
  return {
    prompt_tokens: meta.promptTokenCount,
    completion_tokens: meta.candidatesTokenCount,
    total_tokens: meta.totalTokenCount,
  };
}

function logTokenUsage(
  usage: AiUsage | undefined,
  context: { model: string; destination: string; days: number; premiumMode: boolean },
): void {
  if (!usage) return;
  console.info("[gemini:usage]", {
    model: context.model,
    destination: context.destination,
    days: context.days,
    premium: context.premiumMode,
    prompt_tokens: usage.prompt_tokens ?? 0,
    completion_tokens: usage.completion_tokens ?? 0,
    total_tokens: usage.total_tokens ?? 0,
  });
}

function modelCandidates(preferred: string): string[] {
  return [preferred, ...GEMINI_MODEL_CANDIDATES.filter((m) => m !== preferred)];
}

async function generateWithSdk(
  apiKey: string,
  modelName: string,
  prompt: string,
  premiumMode: boolean,
  days: number,
): Promise<{ text: string; model: string; usage?: AiUsage }> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: plannerGenerationConfig(premiumMode, days),
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text()?.trim() ?? "";
  if (!text) throw new PlannerError("Empty response from Gemini", "EMPTY");
  const usage = normalizeUsage(response.usageMetadata);
  return { text, model: modelName, usage };
}

async function generateWithRest(
  apiKey: string,
  modelName: string,
  prompt: string,
  premiumMode: boolean,
  days: number,
): Promise<{ text: string; model: string; usage?: AiUsage }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: plannerGenerationConfig(premiumMode, days),
    }),
  });

  const payload = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    };
    error?: { message?: string; status?: string };
  };

  if (!res.ok) {
    const detail = payload.error?.message ?? res.statusText;
    if (res.status === 429 || isQuotaError(new Error(detail))) {
      throw new PlannerError("AI is currently busy. Please try again shortly.", "QUOTA");
    }
    throw new Error(detail || `Gemini HTTP ${res.status}`);
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
  if (!text) throw new PlannerError("Empty response from Gemini", "EMPTY");

  return {
    text,
    model: modelName,
    usage: normalizeUsage(payload.usageMetadata),
  };
}

function isModelRetryableError(err: unknown): boolean {
  if (err instanceof PlannerError) {
    return err.code === "QUOTA" || err.code === "EMPTY";
  }
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return (
    isQuotaError(err) ||
    /not found|404|is not supported|invalid model/i.test(msg)
  );
}

export async function generateRawText(
  prompt: string,
  premiumMode = false,
  days = 3,
  handlers?: AiStreamHandlers,
): Promise<{ text: string; model: string; usage?: AiUsage }> {
  const apiKey = getApiKey();
  const preferred = selectGeminiModel(premiumMode);
  let lastError: Error | null = null;
  let sawQuota = false;

  for (const modelName of modelCandidates(preferred)) {
    try {
      const result = await generateWithSdk(apiKey, modelName, prompt, premiumMode, days);
      handlers?.onUsage?.(result.usage ?? {});
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (err instanceof PlannerError && err.code === "BLOCKED") throw err;
      if (isModelRetryableError(err)) {
        sawQuota = sawQuota || isQuotaError(err) || (err instanceof PlannerError && err.code === "QUOTA");
        console.warn(`[gemini] ${modelName} unavailable, trying next model:`, lastError.message);
        continue;
      }
    }

    try {
      const result = await generateWithRest(apiKey, modelName, prompt, premiumMode, days);
      handlers?.onUsage?.(result.usage ?? {});
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (err instanceof PlannerError && err.code === "BLOCKED") throw err;
      if (isModelRetryableError(err)) {
        sawQuota = sawQuota || isQuotaError(err) || (err instanceof PlannerError && err.code === "QUOTA");
        console.warn(`[gemini] ${modelName} REST unavailable, trying next model:`, lastError.message);
        continue;
      }
    }
  }

  if (sawQuota) {
    throw new PlannerError("AI is currently busy. Please try again shortly.", "QUOTA");
  }

  throw lastError ?? new PlannerError("Gemini request failed", "UNKNOWN");
}

function fallbackResult(
  data: PlannerFormData,
  locale: AppLocale,
  reason: TripPlanFallbackReason,
): TripPlanResult {
  return {
    plan: generateMockTripPlan(data, locale),
    meta: { source: "fallback", fallbackReason: reason },
  };
}

export type GenerateTripPlanOptions = {
  premiumMode?: boolean;
  skipCache?: boolean;
  onToken?: (chunk: string) => void;
};

export async function generateTripPlan(
  data: PlannerFormData,
  locale: AppLocale = "vi",
  options: GenerateTripPlanOptions = {},
): Promise<TripPlanResult> {
  const loc = locale ?? data.locale ?? "vi";
  const premiumMode = options.premiumMode ?? data.premiumMode ?? false;
  const cacheKey = buildPlanCacheKey(data, loc, premiumMode);

  if (!options.skipCache) {
    const cached = await getCachedTripPlan(cacheKey);
    if (cached) {
      return {
        plan: cached.plan,
        meta: {
          source: "cache",
          cacheLayer: cached.source,
          cachedAt: cached.cachedAt,
        },
      };
    }
  }

  if (!isGeminiConfigured()) {
    return fallbackResult(data, loc, "unconfigured");
  }

  try {
    const prompt = buildPrompt(data, loc, premiumMode);
    const selectedModel = selectGeminiModel(premiumMode);
    const { text, model, usage } = await generateRawText(prompt, premiumMode, data.days, {
      onUsage: (u) =>
        logTokenUsage(u, {
          model: selectedModel,
          destination: data.destination,
          days: data.days,
          premiumMode,
        }),
    });

    if (usage) {
      logTokenUsage(usage, {
        model,
        destination: data.destination,
        days: data.days,
        premiumMode,
      });
    }

    let plan: TripPlan;
    try {
      plan = parseTripPlanJson(text);
    } catch (parseErr) {
      const retryable =
        parseErr instanceof ExtractJsonError ||
        parseErr instanceof TripPlanValidationError;
      if (!retryable) throw parseErr;

      console.warn("[generateTripPlan] parse failed, retrying compact prompt:", parseErr);
      const retry = await generateRawText(
        buildCompactPrompt(data, loc),
        premiumMode,
        data.days,
      );
      plan = parseTripPlanJson(retry.text);
    }

    await setCachedTripPlan(cacheKey, plan, model);

    const meta: TripPlanMeta = { source: "ai", model };
    if (usage?.total_tokens) meta.tokensUsed = usage.total_tokens;

    return { plan, meta };
  } catch (err) {
    const mapped = mapPlannerError(err);
    const reason: TripPlanFallbackReason = mapped.code === "QUOTA" ? "quota" : "error";
    console.warn("[generateTripPlan] fallback:", mapped.code, mapped.message);
    return fallbackResult(data, loc, reason);
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export { PlannerError, type PlannerErrorCode } from "@/lib/planner/plannerErrors";
