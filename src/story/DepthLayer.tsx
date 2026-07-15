import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCursor } from "./CursorContext";

/**
 * One plane of depth in the background — scroll moves it at its own speed,
 * the cursor nudges it a little further, and both are pure GPU transforms
 * (translate only, nothing that touches layout). Stack several of these
 * with different speeds and the flat background stops reading as a
 * backdrop and starts reading as a space the visitor is moving through.
 *
 * Scroll is measured against the whole document, not this element's own
 * bounding box — this layer is typically rendered inside a `fixed`-position
 * ambient container, whose own rect never moves relative to the viewport,
 * so an element-relative `useScroll({ target })` would silently never fire.
 */
export default function DepthLayer({
  scrollSpeed = 0,
  cursorSpeed = 0,
  className = "",
  style,
  children,
}: {
  /** fraction of the full page scroll translated as drift — 0.05 is
   * subtle, 0.3 is a strong foreground layer */
  scrollSpeed?: number;
  /** px of translate per full cursor swing from center to edge */
  cursorSpeed?: number;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const { scrollYProgress } = useScroll();
  const scrollY = useTransform(scrollYProgress, [0, 1], ["0%", `-${scrollSpeed * 100}%`]);
  const { x: cursorX, y: cursorY } = useCursor();
  const parX = useTransform(cursorX, (v) => v * cursorSpeed);
  const parY = useTransform(cursorY, (v) => v * cursorSpeed);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={style}>
      <motion.div className="absolute inset-0" style={{ y: scrollY, willChange: "transform" }}>
        <motion.div className="absolute inset-0" style={{ x: parX, y: parY, willChange: "transform" }}>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
