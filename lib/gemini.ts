import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AppLocale } from "@/i18n/routing";
import type { PlannerFormData, TripPlan } from "@/lib/planner/types";

/** Preferred models — try in order until one succeeds. */
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash",
] as const;

function localeOutputInstruction(locale: AppLocale): string {
  if (locale === "en") {
    return "Write all text fields (trip_title, theme, place_name, description, tips, hidden_gems) in English.";
  }
  if (locale === "ko") {
    return "Write all text fields (trip_title, theme, place_name, description, tips, hidden_gems) in Korean.";
  }
  return "Write place names and descriptions in Vietnamese when destination is in Vietnam.";
}

function buildPrompt(data: PlannerFormData, locale: AppLocale = "vi"): string {
  return `You are a professional Vietnam travel planning AI.

Generate a realistic and optimized travel itinerary.

User Information:

* Destination: ${data.destination}
* Days: ${data.days}
* Budget: ${data.budget}
* Travel Style: ${data.travelStyle}
* Travelers: ${data.travelers}
* Transportation: ${data.transportation}
* Pace: ${data.pace}
* Response language: ${locale}

Requirements:

* Recommend real places in Vietnam
* Include hidden gems
* Include local food recommendations
* Optimize travel routes logically
* Keep activities realistic by time
* Estimate costs accurately in Vietnamese Dong (VND) format like "300.000 VND"
* Ensure the trip stays within budget
* Include transportation suggestions
* Make the itinerary feel premium and cinematic
* ${localeOutputInstruction(locale)}
* Generate exactly ${data.days} day(s) in the days array

IMPORTANT:
Return ONLY valid JSON. No markdown, no explanation.

Required JSON format:
{
  "trip_title": "",
  "destination": "",
  "total_estimated_cost": "",
  "days": [
    {
      "day": 1,
      "theme": "",
      "activities": [
        {
          "time": "",
          "place_name": "",
          "description": "",
          "estimated_cost": "",
          "category": "",
          "tips": ""
        }
      ]
    }
  ],
  "hidden_gems": [
    {
      "name": "",
      "description": ""
    }
  ]
}`;
}

export function cleanGeminiJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/```json/gi, "").replace(/```/g, "");
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain valid JSON");
  }
  return s.slice(start, end + 1);
}

export function parseTripPlanJson(raw: string): TripPlan {
  const json = cleanGeminiJson(raw);
  const parsed = JSON.parse(json) as TripPlan;
  if (!parsed?.days?.length || !parsed.trip_title) {
    throw new Error("AI returned incomplete itinerary");
  }
  return parsed;
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

function mapGeminiError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (/API key not valid|API_KEY_INVALID|invalid api key/i.test(msg)) {
    return new Error("GEMINI_API_KEY is invalid — check your key in .env.local");
  }
  if (/quota|rate limit|429|RESOURCE_EXHAUSTED/i.test(msg)) {
    return new Error("Gemini API quota exceeded. Try again later.");
  }
  if (/not found|404|model.*not/i.test(msg)) {
    return new Error(`Gemini model unavailable: ${msg}`);
  }
  return err instanceof Error ? err : new Error(msg || "Gemini request failed");
}

async function generateWithSdk(apiKey: string, modelName: string, prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text?.trim()) {
    throw new Error("Empty response from Gemini");
  }
  return text;
}

/** REST fallback when SDK model name differs by API version. */
async function generateWithRest(apiKey: string, modelName: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  const payload = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    error?: { message?: string; code?: number };
  };

  if (!res.ok) {
    const detail = payload.error?.message ?? res.statusText;
    throw new Error(detail || `Gemini HTTP ${res.status}`);
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) {
    throw new Error("Empty response from Gemini");
  }
  return text;
}

async function generateRawText(apiKey: string, prompt: string): Promise<string> {
  let lastError: Error | null = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      return await generateWithSdk(apiKey, modelName, prompt);
    } catch (sdkErr) {
      lastError = mapGeminiError(sdkErr);
      try {
        return await generateWithRest(apiKey, modelName, prompt);
      } catch (restErr) {
        lastError = mapGeminiError(restErr);
      }
    }
  }

  throw lastError ?? new Error("All Gemini models failed");
}

export async function generateTripPlan(data: PlannerFormData, locale: AppLocale = "vi"): Promise<TripPlan> {
  const apiKey = getApiKey();
  const prompt = buildPrompt(data, locale);
  const raw = await generateRawText(apiKey, prompt);

  try {
    return parseTripPlanJson(raw);
  } catch {
    return parseTripPlanJson(cleanGeminiJson(raw));
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
