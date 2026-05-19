/**
 * Locale layout — next-intl messages, lang attribute, AppShell.
 */
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { bodyFontClassName } from "../fonts";
import AppShell from "@/components/AppShell";
import { routing, type AppLocale } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/siteUrl";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as AppLocale;
  if (!routing.locales.includes(locale)) return {};
  const t = await getTranslations({ locale, namespace: "Meta" });
  const site = getSiteUrl();

  return {
    metadataBase: new URL(site),
    title: {
      default: t("defaultTitle"),
      template: `%s | ${t("siteName")}`,
    },
    description: t("defaultDescription"),
    alternates: {
      canonical: `${site}/${locale}`,
      languages: {
        "vi-VN": `${site}/vi`,
        en: `${site}/en`,
        ko: `${site}/ko`,
        "x-default": `${site}/vi`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "vi" ? "vi_VN" : locale === "ko" ? "ko_KR" : "en_US",
      siteName: t("siteName"),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const locale = params.locale as AppLocale;
  if (!routing.locales.includes(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${bodyFontClassName} flex min-h-screen flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
