import { NextResponse } from "next/server";
import { generateTripPlan, isGeminiConfigured } from "@/lib/gemini";
import { routing, type AppLocale } from "@/i18n/routing";
import {
  PACE_OPTIONS,
  TRANSPORT_OPTIONS,
  TRAVEL_STYLES,
  type Pace,
  type PlannerFormData,
  type Transportation,
  type TravelStyle,
} from "@/lib/planner/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function validateBody(body: unknown): PlannerFormData | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const destination = String(b.destination ?? "").trim();
  const days = Number(b.days);
  const budget = String(b.budget ?? "").trim();
  const travelStyle = String(b.travelStyle ?? "") as TravelStyle;
  const travelers = Number(b.travelers);
  const transportation = String(b.transportation ?? "") as Transportation;
  const pace = String(b.pace ?? "") as Pace;

  if (!destination || !budget) return null;
  if (!Number.isFinite(days) || days < 1 || days > 14) return null;
  if (!Number.isFinite(travelers) || travelers < 1 || travelers > 20) return null;
  if (!TRAVEL_STYLES.includes(travelStyle)) return null;
  if (!TRANSPORT_OPTIONS.includes(transportation)) return null;
  if (!PACE_OPTIONS.includes(pace)) return null;

  const rawLocale = String(b.locale ?? "vi");
  const locale = routing.locales.includes(rawLocale as AppLocale)
    ? (rawLocale as AppLocale)
    : "vi";

  return {
    destination,
    days: Math.round(days),
    budget,
    travelStyle,
    travelers: Math.round(travelers),
    transportation,
    pace,
    locale,
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isGeminiConfigured(),
  });
}

export async function POST(req: Request) {
  if (!isGeminiConfigured()) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const data = validateBody(body);
    if (!data) {
      return NextResponse.json({ error: "Invalid planner input" }, { status: 400 });
    }

    const plan = await generateTripPlan(data, data.locale);
    return NextResponse.json({ plan }, { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[api/ai-trip]", err);
    const message = err instanceof Error ? err.message : "Failed to generate itinerary";
    const status =
      message.includes("GEMINI_API_KEY") ? 503 : message.includes("quota") ? 429 : 500;
    return NextResponse.json({ error: message }, { status, headers: { "Content-Type": "application/json" } });
  }
}
