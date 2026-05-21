import { GoogleGenerativeAI, SchemaType, type GenerateContentResult, type GenerationConfig } from "@google/generative-ai";

import type { AppLocale } from "@/i18n/routing";

import { parseExtractedJson } from "@/lib/extractJson";

import {

  PLANNER_CATEGORIES,

  costFormatInstruction,

  getPaceLabel,

  getStyleLabel,

  getTransportLabel,

  localeOutputInstruction,

} from "@/lib/planner/i18n";

import { generateMockTripPlan } from "@/lib/planner/mockItinerary";

import { buildPlanCacheKey, getCachedPlan, setCachedPlan } from "@/lib/planner/planCache";

import { mapPlannerError, PlannerError } from "@/lib/planner/plannerErrors";

import { isQuotaError } from "@/lib/planner/quota";

import { validateTripPlan } from "@/lib/planner/validateTripPlan";

import type { PlannerFormData, TripPlan, TripPlanFallbackReason, TripPlanResult } from "@/lib/planner/types";



const MODEL = "gemini-2.0-flash" as const;



const JSON_OUTPUT_RULES = `OUTPUT: ONLY compact JSON object. No markdown. No explanation. Start with { end with }.`;



const TRIP_PLAN_SCHEMA: GenerationConfig["responseSchema"] = {

  type: SchemaType.OBJECT,

  properties: {

    trip_title: { type: SchemaType.STRING },

    destination: { type: SchemaType.STRING },

    total_estimated_cost: { type: SchemaType.STRING },

    days: {

      type: SchemaType.ARRAY,

      items: {

        type: SchemaType.OBJECT,

        properties: {

          day: { type: SchemaType.NUMBER },

          theme: { type: SchemaType.STRING },

          activities: {

            type: SchemaType.ARRAY,

            items: {

              type: SchemaType.OBJECT,

              properties: {

                time: { type: SchemaType.STRING },

                place_name: { type: SchemaType.STRING },

                description: { type: SchemaType.STRING },

                estimated_cost: { type: SchemaType.STRING },

                category: { type: SchemaType.STRING },

                tips: { type: SchemaType.STRING },

              },

              required: ["time", "place_name", "description", "estimated_cost", "category"],

            },

          },

        },

        required: ["day", "theme", "activities"],

      },

    },

    hidden_gems: {

      type: SchemaType.ARRAY,

      items: {

        type: SchemaType.OBJECT,

        properties: {

          name: { type: SchemaType.STRING },

          description: { type: SchemaType.STRING },

        },

        required: ["name", "description"],

      },

    },

  },

  required: ["trip_title", "destination", "total_estimated_cost", "days", "hidden_gems"],

};



const GENERATION_CONFIG: GenerationConfig = {

  temperature: 0.55,

  maxOutputTokens: 8192,

  responseMimeType: "application/json",

  responseSchema: TRIP_PLAN_SCHEMA,

};



function buildPrompt(data: PlannerFormData, locale: AppLocale = "vi"): string {

  const categoryList = PLANNER_CATEGORIES.join(", ");

  return `Vietnam travel AI. ${JSON_OUTPUT_RULES}



User: ${data.destination} | ${data.days} days | ${data.budget} | ${getStyleLabel(locale, data.travelStyle)} | ${data.travelers} pax | ${getTransportLabel(locale, data.transportation)} | ${getPaceLabel(locale, data.pace)} | lang=${locale}



Rules:

- Real places in Vietnam

- Exactly ${data.days} day(s), max 3 activities/day, short descriptions (1 sentence)

- 2 hidden_gems, category one of: ${categoryList}

- ${costFormatInstruction(locale)}

- Stay within budget

- ${localeOutputInstruction(locale)}



JSON only.`;

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



type GeminiCandidate = {

  content?: { parts?: { text?: string; thought?: boolean }[] };

  finishReason?: string;

};



function extractResponseText(result: GenerateContentResult): string {

  const response = result.response;

  if (response.promptFeedback?.blockReason) {

    throw new PlannerError(`Content blocked (${response.promptFeedback.blockReason})`, "BLOCKED");

  }

  const candidate = response.candidates?.[0] as GeminiCandidate | undefined;

  if (!candidate) throw new PlannerError("Empty response from Gemini", "EMPTY");

  if (candidate.finishReason === "SAFETY") {

    throw new PlannerError("Response blocked by safety filters", "BLOCKED");

  }

  const text = (candidate.content?.parts ?? [])

    .filter((p) => !p.thought)

    .map((p) => p.text ?? "")

    .join("")

    .trim();

  if (!text) {

    if (candidate.finishReason === "MAX_TOKENS") {

      throw new PlannerError("AI response was truncated", "TRUNCATED");

    }

    throw new PlannerError("Empty response from Gemini", "EMPTY");

  }

  return text;

}



function extractRestText(payload: {

  candidates?: GeminiCandidate[];

  promptFeedback?: { blockReason?: string };

}): string {

  if (payload.promptFeedback?.blockReason) {

    throw new PlannerError(`Content blocked (${payload.promptFeedback.blockReason})`, "BLOCKED");

  }

  const candidate = payload.candidates?.[0];

  if (!candidate) throw new PlannerError("Empty response from Gemini", "EMPTY");

  const text =

    candidate.content?.parts

      ?.filter((p) => !p.thought)

      .map((p) => p.text ?? "")

      .join("")

      .trim() ?? "";

  if (!text) throw new PlannerError("Empty response from Gemini", "EMPTY");

  return text;

}



async function generateWithSdk(apiKey: string, prompt: string): Promise<string> {

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({ model: MODEL, generationConfig: GENERATION_CONFIG });

  return extractResponseText(await model.generateContent(prompt));

}



async function generateWithRest(apiKey: string, prompt: string): Promise<string> {

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({

      contents: [{ role: "user", parts: [{ text: prompt }] }],

      generationConfig: GENERATION_CONFIG,

    }),

  });

  const payload = (await res.json()) as {

    candidates?: GeminiCandidate[];

    promptFeedback?: { blockReason?: string };

    error?: { message?: string; code?: number; status?: string };

  };

  if (!res.ok) {

    const detail = payload.error?.message ?? res.statusText;

    if (res.status === 429 || isQuotaError(new Error(detail))) {

      throw new PlannerError("AI is currently busy. Please try again shortly.", "QUOTA");

    }

    throw new Error(detail || `Gemini HTTP ${res.status}`);

  }

  return extractRestText(payload);

}



async function generateRawText(apiKey: string, prompt: string): Promise<string> {

  try {

    return await generateWithSdk(apiKey, prompt);

  } catch (sdkErr) {

    try {

      return await generateWithRest(apiKey, prompt);

    } catch (restErr) {

      throw mapPlannerError(restErr ?? sdkErr);

    }

  }

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



export async function generateTripPlan(

  data: PlannerFormData,

  locale: AppLocale = "vi",

): Promise<TripPlanResult> {

  const loc = locale ?? data.locale ?? "vi";

  const cacheKey = buildPlanCacheKey(data, loc);



  const cached = getCachedPlan(cacheKey);

  if (cached) {

    return { plan: cached, meta: { source: "cache" } };

  }



  if (!isGeminiConfigured()) {

    return fallbackResult(data, loc, "unconfigured");

  }



  try {

    const raw = await generateRawText(getApiKey(), buildPrompt(data, loc));

    const plan = parseTripPlanJson(raw);

    setCachedPlan(cacheKey, plan);

    return { plan, meta: { source: "ai" } };

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


