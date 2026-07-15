import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useMotionValue, useScroll, useVelocity, type MotionValue } from "framer-motion";

type Rhythm = {
  velocity: MotionValue<number>;
  idle: MotionValue<boolean>;
};

const RhythmContext = createContext<Rhythm | null>(null);

const IDLE_AFTER_MS = 5000;

/** How fast the visitor is actually moving through the site, and whether
 * they've stopped altogether — the two signals a handful of ambient
 * systems (Happy Accidents' cadence, the settle-in moment) read to decide
 * how much is happening on screen. Idle is measured against scroll and
 * pointer movement together, since either one is "the visitor is still
 * here." */
export function SiteRhythmProvider({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const idle = useMotionValue(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const markActive = () => {
      idle.set(false);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => idle.set(true), IDLE_AFTER_MS);
    };
    markActive();
    window.addEventListener("scroll", markActive, { passive: true });
    window.addEventListener("mousemove", markActive, { passive: true });
    window.addEventListener("wheel", markActive, { passive: true });
    window.addEventListener("touchmove", markActive, { passive: true });
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener("scroll", markActive);
      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("wheel", markActive);
      window.removeEventListener("touchmove", markActive);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <RhythmContext.Provider value={{ velocity, idle }}>{children}</RhythmContext.Provider>;
}

export function useSiteRhythm() {
  const ctx = useContext(RhythmContext);
  if (!ctx) throw new Error("useSiteRhythm must be used inside SiteRhythmProvider");
  return ctx;
}
