import { motion } from "framer-motion";
import DepthLayer from "../DepthLayer";

// Positive delays only — see CloudShadowLayer for why a negative delay on
// a repeating animation is unsafe here.
const SHAFTS = [
  { left: "12%", rotate: 12, width: 18, duration: 9, delay: 0 },
  { left: "58%", rotate: -8, width: 24, duration: 12, delay: 4 },
  { left: "80%", rotate: 15, width: 14, duration: 10.5, delay: 7 },
];

/** Soft shafts of light drifting through the frame — a mid layer, warmer
 * and a little faster than the cloud shadows behind it. */
export default function VolumetricLightLayer({ color = "rgba(255,243,214,0.14)" }: { color?: string }) {
  return (
    <DepthLayer scrollSpeed={0.08} cursorSpeed={14} className="z-0 mix-blend-screen">
      {SHAFTS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute -top-1/4 h-[150%]"
          style={{
            left: s.left,
            width: `${s.width}vw`,
            background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
            transform: `rotate(${s.rotate}deg)`,
          }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </DepthLayer>
  );
}
