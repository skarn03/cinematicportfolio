import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

type CursorContextValue = {
  /** -1..1, smoothed, relative to viewport center */
  x: MotionValue<number>;
  y: MotionValue<number>;
};

const CursorContext = createContext<CursorContextValue | null>(null);

/**
 * One mousemove listener for the entire story, not one per background layer.
 * Every `DepthLayer` reads from these same two spring-smoothed motion
 * values, so ten layers reacting to the cursor costs the same as one.
 */
export function CursorProvider({ children }: { children: ReactNode }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 35, damping: 18, mass: 0.7 });
  const y = useSpring(rawY, { stiffness: 35, damping: 18, mass: 0.7 });
  const value = useRef({ x, y }).current;

  useEffect(() => {
    const isFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFine) return;
    const move = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}

/** Falls back to real (but frozen at 0) motion values outside the provider,
 * rather than throwing — background atmosphere degrading to "still" is
 * fine; a crash isn't. The fallback values are still valid MotionValues, so
 * every consumer can call useTransform on them unconditionally. */
export function useCursor(): CursorContextValue {
  const ctx = useContext(CursorContext);
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  return ctx ?? { x: fallbackX, y: fallbackY };
}
