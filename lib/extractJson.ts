/** Error codes for JSON extraction failures — map to user-facing i18n in the planner UI. */
export type ExtractJsonErrorCode =
  | "EMPTY"
  | "NO_JSON"
  | "TRUNCATED"
  | "MALFORMED"
  | "INVALID_TYPE";

export class ExtractJsonError extends Error {
  readonly code: ExtractJsonErrorCode;

  constructor(message: string, code: ExtractJsonErrorCode) {
    super(message);
    this.name = "ExtractJsonError";
    this.code = code;
  }
}

/** Strip markdown fences and whitespace from raw model output. */
export function cleanAiResponse(text: string): string {
  return text
    .replace(/^\uFEFF/, "")
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();
}

function extractBalancedObject(cleaned: string): string {
  const start = cleaned.indexOf("{");
  if (start === -1) {
    throw new ExtractJsonError("AI response did not contain valid JSON", "NO_JSON");
  }

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return cleaned.slice(start, i + 1);
    }
  }

  throw new ExtractJsonError(
    "AI response was truncated — try fewer days or regenerate",
    "TRUNCATED",
  );
}

/** Fallback: first `{` through last `}` when balanced scan fails. */
function extractFirstLastObject(cleaned: string): string {
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new ExtractJsonError("AI response did not contain valid JSON", "NO_JSON");
  }
  return cleaned.slice(start, end + 1);
}

/**
 * Safely extract a JSON object string from mixed Gemini output.
 * Handles markdown wrappers, leading prose, and trailing commentary.
 */
export function extractJson(text: string): string {
  const cleaned = cleanAiResponse(text);
  if (!cleaned) {
    throw new ExtractJsonError("AI response was empty", "EMPTY");
  }

  try {
    return extractBalancedObject(cleaned);
  } catch (err) {
    if (err instanceof ExtractJsonError && err.code === "TRUNCATED") throw err;
    return extractFirstLastObject(cleaned);
  }
}

/** Extract and parse JSON with readable errors. */
export function parseExtractedJson<T = unknown>(text: string): T {
  const json = extractJson(text);
  try {
    const parsed: unknown = JSON.parse(json);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new ExtractJsonError("AI response was not a JSON object", "INVALID_TYPE");
    }
    return parsed as T;
  } catch (err) {
    if (err instanceof ExtractJsonError) throw err;
    throw new ExtractJsonError("AI returned malformed JSON — please try again", "MALFORMED");
  }
}

/** @deprecated Use cleanAiResponse — kept for backward compatibility. */
export function cleanGeminiJson(raw: string): string {
  return extractJson(raw);
}
