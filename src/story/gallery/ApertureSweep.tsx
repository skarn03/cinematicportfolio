import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useMotionTemplate, animate, useInView } from "framer-motion";

const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * A reveal that isn't a fade-and-rise — a shutter sweep, the way an
 * aperture opens or a clock hand completes a turn. A conic-gradient mask
 * sweeps from twelve o'clock, uncovering the photograph as it goes,
 * rather than the whole frame arriving at once. Driven by Framer's
 * imperative `animate()` on a plain motion value (not the Web Animations
 * API / CSS `@keyframes` path), so it sits outside the WAAPI keyframe-
 * offset crash class the rest of this project's atmosphere layers have to
 * guard against — nothing here is a `repeat: Infinity` animation either,
 * it plays once and stops.
 */
export default function ApertureSweep({
  children,
  className = "",
  delay = 0,
  duration = 1.3,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const sweep = useMotionValue(0);
  const mask = useMotionTemplate`conic-gradient(from -90deg, black ${sweep}deg, transparent ${sweep}deg 360deg)`;

  useEffect(() => {
    if (!inView) return;
    const controls = animate(sweep, 360, { duration, delay, ease: EASE });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ WebkitMaskImage: mask, maskImage: mask }}>{children}</motion.div>
    </div>
  );
}
