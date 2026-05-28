const GENERIC_NAMES = new Set(["thành viên", "member", "user", "회원", "thanh vien"]);

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 40;

export type DisplayNameValidationError = "empty" | "tooShort" | "tooLong" | "generic" | "invalid";

export function validateDisplayName(
  raw: string,
): { ok: true; value: string } | { ok: false; error: DisplayNameValidationError } {
  const value = raw.trim().replace(/\s+/g, " ");
  if (!value) return { ok: false, error: "empty" };
  if (value.length < DISPLAY_NAME_MIN) return { ok: false, error: "tooShort" };
  if (value.length > DISPLAY_NAME_MAX) return { ok: false, error: "tooLong" };
  if (isGenericDisplayName(value)) return { ok: false, error: "generic" };
  if (/[\x00-\x1F<>]/.test(value)) return { ok: false, error: "invalid" };
  return { ok: true, value };
}

export function isGenericDisplayName(name: string | undefined | null): boolean {
  const value = name?.trim().toLowerCase() ?? "";
  return !value || GENERIC_NAMES.has(value);
}

export function nameFromEmail(email: string | null | undefined): string {
  if (!email?.includes("@")) return "";
  const local = email.split("@")[0]?.trim();
  if (!local) return "";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Prefer live profile name, then stored comment name, then email local-part. */
export function pickDisplayName(
  storedName: string | undefined | null,
  profileName?: string | null,
  email?: string | null,
  fallback = "Thành viên",
): string {
  if (profileName && !isGenericDisplayName(profileName)) return profileName.trim();
  if (storedName && !isGenericDisplayName(storedName)) return storedName.trim();
  const fromEmail = nameFromEmail(email);
  if (fromEmail) return fromEmail;
  if (storedName?.trim()) return storedName.trim();
  if (profileName?.trim()) return profileName.trim();
  return fallback;
}
