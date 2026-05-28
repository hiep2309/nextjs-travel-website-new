"use client";

type CommentUserNameProps = {
  name: string;
  onClick?: () => void;
  variant?: "author" | "mention";
};

/** Facebook-style bold display name — optional click to reply. */
export default function CommentUserName({ name, onClick, variant = "author" }: CommentUserNameProps) {
  const label = name.trim() || "Thành viên";
  const className =
    variant === "mention"
      ? "font-semibold text-amber-300/95 hover:text-amber-200"
      : "font-semibold text-white hover:text-amber-100";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`text-sm ${className} transition`}>
        {variant === "mention" ? `@${label}` : label}
      </button>
    );
  }

  return <span className={`text-sm ${className}`}>{label}</span>;
}
