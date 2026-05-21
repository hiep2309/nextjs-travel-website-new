import type { CardBadgeVariant } from "@/lib/cards/types";
import { badgeStyles } from "@/components/ui/cardStyles";

type Props = {
  children: React.ReactNode;
  variant?: CardBadgeVariant;
  className?: string;
  size?: "sm" | "md";
};

export default function CardBadge({
  children,
  variant = "amber",
  className = "",
  size = "sm",
}: Props) {
  const sizeClass =
    size === "md"
      ? "px-2 py-0.5 text-[11px] font-bold uppercase"
      : "px-1.5 py-0.5 text-[10px] font-bold uppercase";

  return (
    <span
      className={`inline-block w-fit rounded-md border ${badgeStyles[variant]} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}
