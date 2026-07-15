import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Wraps an image (or any block) in a scroll-linked drift — the layer moves
 * slightly slower or faster than the page around it, the cheapest and most
 * reliable way to make a flat photograph read as having depth. The ref that
 * measures scroll position stays on the untransformed outer element, so the
 * drift never feeds back into its own measurement; the child is pre-scaled
 * by exactly enough to cover the drift range without ever showing an edge.
 */
export default function ParallaxLayer({
  strength = 0.1,
  className = "",
  children,
}: {
  strength?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength * 50}%`, `${strength * 50}%`]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div className="h-full w-full" style={{ y, scale: 1 + strength }}>
        {children}
      </motion.div>
    </div>
  );
}
