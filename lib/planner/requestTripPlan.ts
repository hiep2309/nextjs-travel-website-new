import { auth } from "@/lib/firebase";
import type { AppLocale } from "@/i18n/routing";
import { PlannerError, type PlannerErrorCode } from "@/lib/planner/plannerErrors";
import type { PlannerFormData, TripPlanMeta, TripPlanResult } from "@/lib/planner/types";

export type TripPlanApiResponse = TripPlanResult & {
  error?: string;
  code?: PlannerErrorCode;
  usage?: TripPlanMeta["usage"];
};

async function getAuthHeader(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) throw new PlannerError("Please sign in to generate itineraries", "UNAUTHORIZED");
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export type StreamTripPlanHandlers = {
  onStatus?: (phase: string) => void;
  onToken?: (text: string) => void;
};

export async function requestTripPlan(
  form: PlannerFormData,
  locale: AppLocale = "vi",
  handlers?: StreamTripPlanHandlers,
): Promise<TripPlanResult> {
  const headers = await getAuthHeader();
  const useStream = Boolean(handlers?.onToken || handlers?.onStatus);

  const res = await fetch("/api/ai-trip", {
    method: "POST",
    headers: {
      ...headers,
      Accept: useStream ? "text/event-stream" : "application/json",
    },
    body: JSON.stringify({ ...form, locale, stream: useStream }),
    cache: "no-store",
  });

  if (useStream && res.headers.get("content-type")?.includes("text/event-stream") && res.body) {
    return readSseTripPlan(res.body, handlers);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const raw = await res.text();

  if (!contentType.includes("application/json")) {
    const snippet = raw.replace(/\s+/g, " ").slice(0, 80);
    throw new PlannerError(
      res.ok
        ? "Server returned non-JSON response"
        : `API error (${res.status}): ${snippet || "HTML error page"}`,
      "UNKNOWN",
    );
  }

  let data: TripPlanApiResponse;
  try {
    data = JSON.parse(raw) as TripPlanApiResponse;
  } catch {
    throw new PlannerError("Invalid JSON from API", "UNKNOWN");
  }

  if (!res.ok) {
    throw new PlannerError(data.error || `Request failed (${res.status})`, data.code ?? "UNKNOWN");
  }
  if (!data.plan) {
    throw new PlannerError("AI returned empty itinerary", "INVALID_PLAN");
  }

  return {
    plan: data.plan,
    meta: data.meta ?? ({ source: "ai" } satisfies TripPlanMeta),
  };
}

async function readSseTripPlan(
  body: ReadableStream<Uint8Array>,
  handlers?: StreamTripPlanHandlers,
): Promise<TripPlanResult> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: TripPlanResult | null = null;
  let streamError: PlannerError | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const lines = chunk.split("\n");
      let event = "message";
      let dataLine = "";

      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) dataLine += line.slice(5).trim();
      }

      if (!dataLine) continue;

      try {
        const parsed = JSON.parse(dataLine) as Record<string, unknown>;

        if (event === "status" && typeof parsed.phase === "string") {
          handlers?.onStatus?.(parsed.phase);
        } else if (event === "token" && typeof parsed.text === "string") {
          handlers?.onToken?.(parsed.text);
        } else if (event === "done" && parsed.plan) {
          result = {
            plan: parsed.plan as TripPlanResult["plan"],
            meta: (parsed.meta as TripPlanMeta) ?? { source: "ai" },
          };
        } else if (event === "error") {
          streamError = new PlannerError(
            String(parsed.error ?? "Stream failed"),
            (parsed.code as PlannerErrorCode) ?? "UNKNOWN",
          );
        }
      } catch {
        /* ignore partial SSE */
      }
    }
  }

  if (streamError) throw streamError;
  if (!result?.plan) {
    throw new PlannerError("AI returned empty itinerary", "INVALID_PLAN");
  }

  return result;
}

export { PlannerError, type PlannerErrorCode };
