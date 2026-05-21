/**
 * Saved itinerary detail — timeline, costs, continue planning.
 */
import type { Metadata } from "next";
import SavedItineraryDetailClient from "@/components/itinerary/SavedItineraryDetailClient";
import SavedItinerariesGuard from "@/components/itinerary/SavedItinerariesGuard";
import { initPageLocale } from "@/lib/i18n/server";
import { generatePageMetadata, PAGE_META } from "@/lib/i18n/pageMetadata";

type Props = { params: { locale: string; id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generatePageMetadata(params.locale, PAGE_META.savedItineraries);
}

export default function SavedItineraryDetailPage({ params }: Props) {
  initPageLocale(params.locale);
  return (
    <SavedItinerariesGuard>
      <SavedItineraryDetailClient id={params.id} />
    </SavedItinerariesGuard>
  );
}
