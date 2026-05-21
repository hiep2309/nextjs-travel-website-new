/**
 * Trang đăng nhập — render form component `Login`.
 */
import type { Metadata } from "next";
import Login from "@/components/Login";
import { initPageLocale } from "@/lib/i18n/server";
import { generatePageMetadata, PAGE_META } from "@/lib/i18n/pageMetadata";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generatePageMetadata(params.locale, PAGE_META.login);
}

export default function LoginPage({ params }: Props) {
  initPageLocale(params.locale);
  return <Login />;
}
