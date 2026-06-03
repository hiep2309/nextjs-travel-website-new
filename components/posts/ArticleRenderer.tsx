/**
 * Universal multilingual article renderer.
 *
 * Iterates structured `sections` and renders each block for the active locale.
 * Layout is identical across vi / en / ko because structure (order, images,
 * dividers) is language-neutral — only the text changes. Semantic tags are
 * emitted inside `.post-body-html` so existing typography CSS applies unchanged.
 */
"use client";

import FlexibleImage from "@/components/ui/FlexibleImage";
import type { AppLocale } from "@/i18n/routing";
import {
  pickList,
  pickText,
  type ArticleSection,
} from "@/lib/posts/articleSections";

type Props = {
  sections: ArticleSection[];
  locale: AppLocale;
  className?: string;
};

function ArticleImage({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="relative my-5 block aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/12 bg-slate-800">
      <FlexibleImage src={src} alt={alt} sizes="(max-width: 768px) 100vw, 48rem" />
    </span>
  );
}

export default function ArticleRenderer({ sections, locale, className }: Props) {
  if (!sections?.length) return null;

  return (
    <div
      className={`post-body-html mt-4 text-[15px] leading-relaxed text-white/[0.88] ${className ?? ""}`}
      data-ui-locale={locale}
    >
      {sections.map((section) => {
        switch (section.type) {
          case "heading": {
            const text = pickText(section.translations, locale);
            if (!text) return null;
            const Tag = (`h${section.level}` as "h2" | "h3" | "h4");
            return <Tag key={section.id} dangerouslySetInnerHTML={{ __html: text }} />;
          }

          case "paragraph": {
            const text = pickText(section.translations, locale);
            if (!text) return null;
            return <p key={section.id} dangerouslySetInnerHTML={{ __html: text }} />;
          }

          case "quote": {
            const text = pickText(section.translations, locale);
            if (!text) return null;
            const cite = section.cite ? pickText(section.cite, locale) : "";
            return (
              <blockquote key={section.id}>
                <p dangerouslySetInnerHTML={{ __html: text }} />
                {cite ? <cite>{cite}</cite> : null}
              </blockquote>
            );
          }

          case "list": {
            const items = pickList(section.translations, locale);
            if (!items.length) return null;
            const ListTag = section.ordered ? "ol" : "ul";
            return (
              <ListTag key={section.id}>
                {items.map((item, i) => (
                  <li key={`${section.id}-${i}`} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ListTag>
            );
          }

          case "image": {
            const alt = section.alt ? pickText(section.alt, locale) : "";
            const caption = section.caption ? pickText(section.caption, locale) : "";
            return (
              <figure key={section.id} className="my-5">
                <ArticleImage src={section.src} alt={alt} />
                {caption ? (
                  <figcaption className="mt-2 text-center text-xs text-white/55">
                    {caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          }

          case "gallery": {
            if (!section.images.length) return null;
            return (
              <div
                key={section.id}
                className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {section.images.map((img, i) => (
                  <ArticleImage
                    key={`${section.id}-${i}`}
                    src={img.src}
                    alt={img.alt ? pickText(img.alt, locale) : ""}
                  />
                ))}
              </div>
            );
          }

          case "divider":
            return <hr key={section.id} className="my-8 border-white/10" />;

          default:
            return null;
        }
      })}
    </div>
  );
}
