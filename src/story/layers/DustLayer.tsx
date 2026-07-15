import { motion } from "framer-motion";
import DepthLayer from "../DepthLayer";

function makeDust(count: number, seedOffset: number) {
  return Array.from({ length: count }, (_, i) => {
    const n = i + seedOffset;
    const duration = 20 + ((n * 53) % 26);
    return {
      id: n,
      left: (n * 137.5) % 100,
      size: 2 + ((n * 37) % 5),
      duration,
      // Kept as a fraction of this item's own duration (never larger in
      // magnitude) — a negative delay that outsizes the duration breaks
      // the Web Animations API's keyframe-offset math on a repeating
      // animation and crashes the render entirely.
      delay: -((n * 19) % 100) / 100 * duration,
      drift: 16 + ((n * 29) % 28),
    };
  });
}

/** Motes that never settle — the foreground-most layer in most stacks, so
 * it drifts faster and reacts to the cursor more than anything behind it. */
export default function DustLayer({
  count = 14,
  color = "bg-gold/60",
  seedOffset = 0,
  cursorSpeed = 26,
}: {
  count?: number;
  color?: string;
  seedOffset?: number;
  cursorSpeed?: number;
}) {
  const dust = makeDust(count, seedOffset);
  return (
    <DepthLayer scrollSpeed={0.15} cursorSpeed={cursorSpeed} className="z-10">
      {dust.map((d) => (
        <motion.span
          key={d.id}
          className={`absolute rounded-full ${color}`}
          style={{ left: `${d.left}%`, width: d.size, height: d.size, bottom: -24 }}
          animate={{
            y: ["0vh", "-118vh"],
            x: [0, d.drift, -d.drift, 0],
            opacity: [0, 0.55, 0.4, 0],
          }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </DepthLayer>
  );
}
