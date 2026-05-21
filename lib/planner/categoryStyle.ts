import {
  Camera,
  Coffee,
  Landmark,
  MapPin,
  Mountain,
  Sparkles,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from "lucide-react";

export type CategoryStyle = {
  icon: LucideIcon;
  accent: string;
  ring: string;
  badge: string;
};

const DEFAULT: CategoryStyle = {
  icon: MapPin,
  accent: "from-violet-500 to-blue-600",
  ring: "ring-violet-400/40",
  badge: "bg-violet-500/15 text-violet-200 border-violet-400/30",
};

const RULES: { match: RegExp; style: CategoryStyle }[] = [
  {
    match: /food|ẩm thực|nhà hàng|quán|café|coffee|bữa/i,
    style: {
      icon: UtensilsCrossed,
      accent: "from-amber-500 to-orange-600",
      ring: "ring-amber-400/40",
      badge: "bg-amber-500/15 text-amber-100 border-amber-400/30",
    },
  },
  {
    match: /beach|biển|đảo|sea|swim/i,
    style: {
      icon: Waves,
      accent: "from-sky-500 to-cyan-600",
      ring: "ring-sky-400/40",
      badge: "bg-sky-500/15 text-sky-100 border-sky-400/30",
    },
  },
  {
    match: /culture|văn hóa|di tích|museum|chùa|đền|phố cổ|heritage/i,
    style: {
      icon: Landmark,
      accent: "from-fuchsia-500 to-violet-600",
      ring: "ring-fuchsia-400/40",
      badge: "bg-fuchsia-500/15 text-fuchsia-100 border-fuchsia-400/30",
    },
  },
  {
    match: /adventure|trek|leo|phiêu lưu|núi|hiking/i,
    style: {
      icon: Mountain,
      accent: "from-emerald-500 to-teal-600",
      ring: "ring-emerald-400/40",
      badge: "bg-emerald-500/15 text-emerald-100 border-emerald-400/30",
    },
  },
  {
    match: /photo|chụp|view|sunset|sunrise|cảnh/i,
    style: {
      icon: Camera,
      accent: "from-rose-500 to-pink-600",
      ring: "ring-rose-400/40",
      badge: "bg-rose-500/15 text-rose-100 border-rose-400/30",
    },
  },
  {
    match: /café|coffee|nghỉ|relax|chill/i,
    style: {
      icon: Coffee,
      accent: "from-amber-600 to-yellow-700",
      ring: "ring-amber-400/40",
      badge: "bg-amber-500/15 text-amber-100 border-amber-400/30",
    },
  },
  {
    match: /hidden|gem|độc đáo|local/i,
    style: {
      icon: Sparkles,
      accent: "from-violet-500 to-indigo-600",
      ring: "ring-violet-400/40",
      badge: "bg-violet-500/15 text-violet-100 border-violet-400/30",
    },
  },
];

export function getCategoryStyle(category: string): CategoryStyle {
  const c = category.trim();
  if (!c) return DEFAULT;
  for (const rule of RULES) {
    if (rule.match.test(c)) return rule.style;
  }
  return DEFAULT;
}
