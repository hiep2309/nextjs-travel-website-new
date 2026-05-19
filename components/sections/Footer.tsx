/**
 * Chân trang website — logo, liên kết nhanh, mạng xã hội, nút “về đầu trang”.
 *
 * Client component để xử lý cuộn mượt và tương tác nhỏ.
 */
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  ArrowUp,
  Building2,
  ChevronRight,
  Compass,
  Facebook,
  Headphones,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Shield,
  Twitter,
  Youtube,
} from "lucide-react";


const SectionHeading = ({
  icon: Icon,
  children,
}: {
  icon: typeof Compass;
  children: React.ReactNode;
}) => (
  <div className="mb-5">
    <div className="mb-2 flex items-center gap-2 text-amber-400">
      <Icon className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">{children}</span>
    </div>
    <div className="h-px w-10 bg-amber-400" />
  </div>
);

const FooterLinkList = ({ links }: { links: readonly { label: string; href: string }[] }) => (
  <ul className="space-y-2.5">
    {links.map((item) => (
      <li key={item.label}>
        <Link
          href={item.href}
          className="group flex items-start gap-1.5 text-sm text-gray-400 transition hover:text-white"
        >
          <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-600 group-hover:text-amber-400" />
          <span>{item.label}</span>
        </Link>
      </li>
    ))}
  </ul>
);

const VietnamSilhouette = () => (
  <svg
    className="pointer-events-none absolute right-0 top-1/2 h-48 w-[min(55%,420px)] -translate-y-1/2 text-white/[0.06] sm:h-64"
    viewBox="0 0 400 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      stroke="currentColor"
      strokeWidth="1.2"
      d="M40 160 L80 120 L100 130 L120 90 L140 100 L160 70 L180 85 L200 55 L230 75 L260 45 L290 60 L320 40 L350 55 L370 45"
    />
    <path
      stroke="currentColor"
      strokeWidth="1"
      d="M95 155 L95 95 M95 95 L110 75 L125 95 L125 155 M200 165 L200 110 L215 95 L235 95 L250 115 L250 165"
    />
    <ellipse cx="320" cy="165" rx="28" ry="8" stroke="currentColor" strokeWidth="0.9" />
    <path stroke="currentColor" strokeWidth="0.9" d="M305 158 Q320 145 335 158" />
  </svg>
);

const Footer = () => {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  const EXPLORE_LINKS = [
    { label: t("linkDestinations"), href: "/explore" },
    { label: t("linkTours"), href: "/tours" },
    { label: t("linkGuides"), href: "/guides" },
    { label: t("linkExperiences"), href: "/explore" },
  ] as const;

  const COMPANY_LINKS = [
    { label: t("linkAbout"), href: "#" },
    { label: t("linkContact"), href: "#" },
  ] as const;

  const SUPPORT_LINKS = [
    { label: t("linkHelp"), href: "#" },
    { label: t("linkPrivacy"), href: "#" },
  ] as const;

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#0D1117] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-16 sm:px-6 lg:px-8 lg:pb-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          {/* Featured card */}
          <div className="lg:col-span-3">
            <Link
              href="/explore"
              className="group relative block aspect-[4/5] max-h-[340px] overflow-hidden rounded-2xl sm:max-h-none sm:aspect-[3/4] lg:aspect-square"
            >
              <Image
                src="https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80"
                alt="Vietnam terraced rice fields"
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-caveat text-2xl text-amber-400 sm:text-3xl">{t("discoverTitle")}</p>
                <p className="mt-2 text-lg font-bold leading-snug text-white">{t("discoverDesc")}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition group-hover:text-amber-400">
                  {t("exploreNow")}
                  <span className="text-amber-400">→</span>
                </span>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-5 lg:gap-6">
            <div>
              <SectionHeading icon={Compass}>{t("explore")}</SectionHeading>
              <FooterLinkList links={EXPLORE_LINKS} />
            </div>
            <div>
              <SectionHeading icon={Building2}>{t("company")}</SectionHeading>
              <FooterLinkList links={COMPANY_LINKS} />
            </div>
            <div>
              <SectionHeading icon={Headphones}>{t("support")}</SectionHeading>
              <FooterLinkList links={SUPPORT_LINKS} />
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4 xl:col-span-4">
            <SectionHeading icon={Mail}>{t("stayInspired")}</SectionHeading>
            <p className="mb-5 text-sm leading-relaxed text-gray-400">{t("newsletterDesc")}</p>
            <form
              className="flex max-w-md"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                type="email"
                required
                placeholder={t("emailPlaceholder")}
                className="min-w-0 flex-1 rounded-l-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none ring-amber-400/0 transition focus:ring-2 focus:ring-amber-400/40"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center justify-center rounded-r-xl bg-amber-400 px-4 text-amber-950 transition hover:bg-amber-300"
                aria-label={t("subscribe")}
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              {(
                [
                  { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                  { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                  { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                  { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
                ] as const
              ).map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-gray-400 transition hover:border-amber-400/60 hover:text-amber-400"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="my-14 border-t border-white/10" />

        {/* Value props */}
        <div className="relative overflow-hidden py-2">
          <VietnamSilhouette />
          <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {[
              {
                Icon: Shield,
                title: t("trustedTitle"),
                text: t("trustedDesc"),
              },
              {
                Icon: Headphones,
                title: t("support247Title"),
                text: t("support247Desc"),
              },
              {
                Icon: MapPin,
                title: t("localTitle"),
                text: t("localDesc"),
              },
              {
                Icon: Heart,
                title: t("craftedTitle"),
                text: t("craftedDesc"),
              },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-400/40 text-amber-400">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="my-10 border-t border-white/10" />

        {/* Bottom bar */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-bold text-white">{t("basedIn")}</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 lg:order-none">
            <span suppressHydrationWarning>{t("rights", { year })}</span>
          </p>
          <button
            type="button"
            onClick={scrollTop}
            className="flex items-center justify-center gap-3 self-center text-sm text-gray-400 transition hover:text-white lg:self-auto"
          >
            <span>{t("backToTop")}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-amber-400 hover:text-amber-400">
              <ArrowUp className="h-4 w-4" strokeWidth={2} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
