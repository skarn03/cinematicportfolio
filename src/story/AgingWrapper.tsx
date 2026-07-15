import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";

/** Nothing anyone has really tried: earlier chapters don't just leave the
 * viewport, they age. The further the visitor scrolls past a chapter, the
 * more its color drains, the more a fine scratch-grain settles over it,
 * and the more its bottom corner reads as lifted — like a print that's
 * been sitting out. Driven entirely by scroll position relative to this
 * wrapper's own bottom edge, so it costs nothing extra to compute and
 * never touches `repeat`. */
export default function AgingWrapper({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["end start", "end -420%"] });

  const sepia = useTransform(scrollYProgress, [0, 1], [0, 0.38]);
  const brightness = useTransform(scrollYProgress, [0, 1], [1, 0.87]);
  const contrast = useTransform(scrollYProgress, [0, 1], [1, 0.93]);
  const filter = useMotionTemplate`sepia(${sepia}) brightness(${brightness}) contrast(${contrast})`;
  const grainOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.13]);
  const cornerScale = useTransform(scrollYProgress, [0.3, 1], [0, 1]);

  return (
    <motion.div ref={ref} className="relative" style={{ filter }}>
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: grainOpacity,
          backgroundImage: "repeating-linear-gradient(115deg, #000 0px, transparent 1px, transparent 4px)",
        }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 right-0 origin-bottom-right"
        style={{
          scale: cornerScale,
          width: 70,
          height: 70,
          background: "linear-gradient(135deg, transparent 45%, rgba(0,0,0,0.22) 46%, rgba(0,0,0,0.1) 60%, transparent 62%)",
        }}
      />
    </motion.div>
  );
}
