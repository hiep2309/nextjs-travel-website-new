"use client";

type CommentImageGridProps = {
  urls: string[];
};

/** Comment/reply image gallery — plain img for reliable Firebase Storage display. */
export default function CommentImageGrid({ urls }: CommentImageGridProps) {
  const list = urls.filter((u) => typeof u === "string" && u.startsWith("http"));
  if (list.length === 0) return null;

  const gridClass =
    list.length === 1
      ? "grid-cols-1 max-w-sm"
      : list.length === 2
        ? "grid-cols-2 max-w-md"
        : "grid-cols-2 sm:grid-cols-3 max-w-lg";

  return (
    <div className={`mt-2 grid gap-2 ${gridClass}`}>
      {list.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-square overflow-hidden rounded-xl border border-white/10 bg-slate-800/50 transition hover:border-amber-400/40"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </a>
      ))}
    </div>
  );
}
