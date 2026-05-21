/** Remove `undefined` recursively — Firestore rejects undefined field values. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function sanitizeForFirestore<T>(value: T): T {
  if (value === undefined) return value;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item)) as T;
  }
  if (!isPlainObject(value)) return value;

  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (nested === undefined) continue;
    out[key] = sanitizeForFirestore(nested);
  }
  return out as T;
}
