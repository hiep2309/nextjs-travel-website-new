"use client";

import { useEffect, useState } from "react";

/** Match Tailwind `lg` breakpoint (1024px). */
export function useIsMobile(breakpointPx = 1024): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpointPx]);

  return mobile;
}
