"use client";

import { useCallback, useEffect, useState } from "react";
import { getQuotaRetryRemainingMs, QUOTA_RETRY_COOLDOWN_MS } from "@/lib/planner/quota";

export function usePlannerCooldown() {
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!cooldownUntil) {
      setRemainingMs(0);
      return;
    }
    const tick = () => setRemainingMs(getQuotaRetryRemainingMs(cooldownUntil));
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const startCooldown = useCallback((ms = QUOTA_RETRY_COOLDOWN_MS) => {
    setCooldownUntil(Date.now() + ms);
  }, []);

  const clearCooldown = useCallback(() => setCooldownUntil(null), []);

  return {
    isCoolingDown: remainingMs > 0,
    remainingSec: Math.ceil(remainingMs / 1000),
    startCooldown,
    clearCooldown,
  };
}
