import type { ReactNode } from "react";
import { initPageLocale } from "@/lib/i18n/server";
import { generatePageMetadata, PAGE_META } from "@/lib/i18n/pageMetadata";

type Props = { children: ReactNode; params: { locale: string } };

export async function generateMetadata({ params }: Props) {
  return generatePageMetadata(params.locale, PAGE_META.profile);
}

export default function ProfileLayout({ children, params }: Props) {
  initPageLocale(params.locale);
  return children;
}
