/**
 * Trang đăng ký.
 */
import type { Metadata } from "next";
import Register from "@/components/Register";
import { initPageLocale } from "@/lib/i18n/server";
import { generatePageMetadata, PAGE_META } from "@/lib/i18n/pageMetadata";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generatePageMetadata(params.locale, PAGE_META.register);
}

export default function RegisterPage({ params }: Props) {
  initPageLocale(params.locale);
  return <Register />;
}
