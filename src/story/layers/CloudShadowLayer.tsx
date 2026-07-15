import { motion } from "framer-motion";
import DepthLayer from "../DepthLayer";

// Positive delays only — a repeating animation with a negative delay can
// break the Web Animations API's keyframe-offset math ("Offsets must be
// monotonically non-decreasing"), which crashes the whole render.
const SHADOWS = [
  { top: "10%", left: "-10%", w: 60, h: 26, duration: 38, delay: 0 },
  { top: "55%", left: "40%", w: 70, h: 30, duration: 46, delay: 12 },
  { top: "78%", left: "-20%", w: 55, h: 22, duration: 34, delay: 22 },
];

/** Cloud shadows passing over the scene — the slowest layer in any stack,
 * distant enough that only the cursor gives it away as depth rather than a
 * static vignette. */
export default function CloudShadowLayer({ tint = "rgba(58,50,38,0.10)" }: { tint?: string }) {
  return (
    <DepthLayer scrollSpeed={0.04} cursorSpeed={6} className="z-0">
      {SHADOWS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-[50%] blur-3xl"
          style={{ top: s.top, left: s.left, width: `${s.w}vw`, height: `${s.h}vw`, background: tint }}
          animate={{ x: ["0vw", "30vw", "0vw"] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </DepthLayer>
  );
}
