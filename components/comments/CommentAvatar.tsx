import FlexibleImage from "@/components/ui/FlexibleImage";

type CommentAvatarProps = {
  src: string | null | undefined;
  name: string;
  size?: "sm" | "md";
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export default function CommentAvatar({ src, name, size = "md" }: CommentAvatarProps) {
  const dim = size === "sm" ? "size-8" : "size-10";
  const text = size === "sm" ? "text-xs" : "text-sm";

  if (src?.startsWith("http")) {
    return (
      <div className={`relative ${dim} shrink-0 overflow-hidden rounded-full ring-2 ring-white/10`}>
        <FlexibleImage src={src} alt="" sizes="40px" className="size-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-amber-500 ${text} font-bold text-white ring-2 ring-white/10`}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
