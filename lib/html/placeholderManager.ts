/** Placeholder tokens — must not appear in normal travel copy. */
export const TAG_OPEN = "[[TAG_";
export const TAG_CLOSE = "]]";

const TAG_REGEX = /\[\[TAG_(\d+)\]\]/g;

export type ProtectedHtml = {
  /** HTML with tags replaced by [[TAG_n]] placeholders. */
  text: string;
  /** Original tags in placeholder order. */
  tags: string[];
};

/** Replace HTML tags with numbered placeholders; translate only the returned `text`. */
export function protectHtmlTags(html: string): ProtectedHtml {
  const tags: string[] = [];
  const text = html.replace(/<[^>]+>/g, (tag) => {
    const id = tags.length;
    tags.push(tag);
    return `${TAG_OPEN}${id}${TAG_CLOSE}`;
  });
  return { text, tags };
}

/** Restore placeholders to original HTML tags. */
export function restoreHtmlTags(text: string, tags: string[]): string {
  return text.replace(TAG_REGEX, (_, rawIndex: string) => {
    const index = Number(rawIndex);
    return Number.isFinite(index) ? (tags[index] ?? "") : "";
  });
}

/** Count placeholders in a protected or translated string. */
export function countPlaceholders(text: string): number {
  return (text.match(TAG_REGEX) ?? []).length;
}

/** Ensure every placeholder index 0..tags.length-1 exists exactly once after translation. */
export function placeholdersRestoredCorrectly(text: string, tagCount: number): boolean {
  if (tagCount === 0) return !text.includes(TAG_OPEN);
  const seen = new Set<number>();
  for (const match of text.matchAll(TAG_REGEX)) {
    const index = Number(match[1]);
    if (!Number.isFinite(index) || index < 0 || index >= tagCount || seen.has(index)) {
      return false;
    }
    seen.add(index);
  }
  return seen.size === tagCount;
}
