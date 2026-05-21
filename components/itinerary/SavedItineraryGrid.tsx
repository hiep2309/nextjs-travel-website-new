"use client";

import { motion } from "framer-motion";
import SavedItineraryCard from "./SavedItineraryCard";
import type { SavedItineraryRecord } from "@/lib/itinerary/types";
import { Skeleton } from "@/components/ui/Skeleton";

type Props = {
  items: SavedItineraryRecord[];
  loading: boolean;
  view: "grid" | "list";
  onDelete: (id: string) => void;
};

export default function SavedItineraryGrid({ items, loading, view, onDelete }: Props) {
  if (loading) {
    return (
      <div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}
    >
      {items.map((item, index) => (
        <SavedItineraryCard
          key={item.id}
          item={item}
          index={index}
          view={view}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
}
