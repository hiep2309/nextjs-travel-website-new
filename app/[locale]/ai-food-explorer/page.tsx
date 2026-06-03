/**
 * AI Food Explorer — discover Vietnamese cuisine through AI-style recommendations.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import FoodExplorerClient from "@/components/food/FoodExplorerClient";
import { initPageLocale } from "@/lib/i18n/server";
import { generatePageMetadata, PAGE_META } from "@/lib/i18n/pageMetadata";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generatePageMetadata(params.locale, PAGE_META.aiFood);
}

export default function AiFoodExplorerPage({ params }: Props) {
  initPageLocale(params.locale);
  return (
    <Suspense fallback={null}>
      <FoodExplorerClient />
    </Suspense>
  );
}
