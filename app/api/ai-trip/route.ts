import { NextResponse } from "next/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { checkPlannerQuota, consumePlannerGeneration, getPlannerUsage } from "@/lib/planner/plannerUsage";
import {
  FREE_DAILY_GENERATE_LIMIT,
  FREE_MAX_DAYS,
  PREMIUM_MAX_DAYS,
} from "@/lib/planner/plannerConfig";
import { mapPlannerError } from "@/lib/planner/plannerErrors";
import { buildPlanCacheKey, getCachedTripPlan } from "@/lib/planner/planCacheStore";
import { generateTripPlan, isGeminiConfigured } from "@/lib/planner/tripPlanAi";
import {
  PACE_OPTIONS,
  TRANSPORT_OPTIONS,
  TRAVEL_STYLES,
  type Pace,
  type PlannerFormData,
  type Transportation,
  type TravelStyle,
} from "@/lib/planner/types";
import { extractBearerToken, verifyIdToken } from "@/lib/server/verifyIdToken";

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
  const premiumMode = Boolean(b.premiumMode);

  if (!destination || !budget) return null;
  const maxDays = premiumMode ? PREMIUM_MAX_DAYS : FREE_MAX_DAYS;
  if (!Number.isFinite(days) || days < 1 || days > maxDays) return null;
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
    premiumMode,
  };
}

function sseLine(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: Request) {
  const token = extractBearerToken(req);
  const user = token ? await verifyIdToken(token) : null;

  const payload: Record<string, unknown> = {
    ok: true,
    configured: isGeminiConfigured(),
    freeMaxDays: FREE_MAX_DAYS,
    dailyLimit: FREE_DAILY_GENERATE_LIMIT,
  };

  if (user) {
    payload.usage = await getPlannerUsage(user.uid);
  }

  return NextResponse.json(payload);
}

export async function POST(req: Request) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Authentication required", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const user = await verifyIdToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid session", code: "UNAUTHORIZED" }, { status: 401 });
    }

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

    const wantsStream =
      req.headers.get("accept")?.includes("text/event-stream") ||
      (body as Record<string, unknown>).stream === true;

    const locale = data.locale ?? "vi";
    const cacheKey = buildPlanCacheKey(data, locale, Boolean(data.premiumMode));
    const cached = await getCachedTripPlan(cacheKey);

    if (cached) {
      const usage = await getPlannerUsage(user.uid);
      const cachedResult = {
        plan: cached.plan,
        meta: {
          source: "cache" as const,
          cacheLayer: cached.source,
          cachedAt: cached.cachedAt,
          usage,
        },
      };

      if (wantsStream) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(sseLine("status", { phase: "cache_hit" })));
            controller.enqueue(encoder.encode(sseLine("done", cachedResult)));
            controller.close();
          },
        });
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      }

      return NextResponse.json(cachedResult);
    }

    const quota = await checkPlannerQuota(user.uid);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "Daily generation limit reached",
          code: "DAILY_LIMIT",
          usage: quota.usage,
        },
        { status: 429 },
      );
    }

    if (wantsStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (event: string, payload: unknown) => {
            controller.enqueue(encoder.encode(sseLine(event, payload)));
          };

          try {
            send("status", { phase: "started" });
            send("status", { phase: "generating" });

            const result = await generateTripPlan(data, locale, {
              premiumMode: data.premiumMode,
            });

            if (result.meta.source === "ai") {
              await consumePlannerGeneration(user.uid);
            }

            const usage = await getPlannerUsage(user.uid);
            send("done", {
              plan: result.plan,
              meta: { ...result.meta, usage },
            });
          } catch (err) {
            console.error("[api/ai-trip:stream]", err);
            const mapped = mapPlannerError(err);
            send("error", { error: mapped.message, code: mapped.code });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const result = await generateTripPlan(data, locale, { premiumMode: data.premiumMode });

    if (result.meta.source === "ai") {
      await consumePlannerGeneration(user.uid);
    }

    const usage = await getPlannerUsage(user.uid);
    return NextResponse.json(
      { ...result, meta: { ...result.meta, usage } },
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[api/ai-trip]", err);
    const mapped = mapPlannerError(err);
    return NextResponse.json(
      { error: mapped.message, code: mapped.code },
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
