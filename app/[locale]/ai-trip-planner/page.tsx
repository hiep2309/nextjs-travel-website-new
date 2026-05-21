/**
 * AI Trip Planner — Gemini-powered itinerary generator.
 */
import type { Metadata } from "next";
import AiTripPlannerClient from "@/components/planner/AiTripPlannerClient";
import { initPageLocale } from "@/lib/i18n/server";
import { generatePageMetadata, PAGE_META } from "@/lib/i18n/pageMetadata";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generatePageMetadata(params.locale, PAGE_META.aiPlanner);
}

export default function AiTripPlannerPage({ params }: Props) {
  initPageLocale(params.locale);
  return <AiTripPlannerClient />;
}
