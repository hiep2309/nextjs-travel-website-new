"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FoodToastState } from "@/hooks/useFoodActions";

type Props = {
  toast: FoodToastState | null;
  onDismiss?: () => void;
};

export default function FoodToast({ toast, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className={`fixed bottom-6 left-1/2 z-[120] max-w-sm -translate-x-1/2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-xl ${
            toast.isError
              ? "border-red-400/30 bg-red-950/90 text-red-100"
              : "border-violet-400/30 bg-slate-900/95 text-white"
          }`}
          onClick={onDismiss}
        >
          {toast.message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
