/**
 * Saved itineraries dashboard — list, search, filter.
 */
import type { Metadata } from "next";
import SavedItinerariesClient from "@/components/itinerary/SavedItinerariesClient";
import SavedItinerariesGuard from "@/components/itinerary/SavedItinerariesGuard";
import { initPageLocale } from "@/lib/i18n/server";
import { generatePageMetadata, PAGE_META } from "@/lib/i18n/pageMetadata";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generatePageMetadata(params.locale, PAGE_META.savedItineraries);
}

export default function SavedItinerariesPage({ params }: Props) {
  initPageLocale(params.locale);
  return (
    <SavedItinerariesGuard>
      <SavedItinerariesClient />
    </SavedItinerariesGuard>
  );
}
