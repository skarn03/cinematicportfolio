import { motion } from "framer-motion";
import DepthLayer from "../DepthLayer";
import AtmosphereBoundary from "../AtmosphereBoundary";

// Positive delays only, bounded by each item's own duration — see
// DustLayer for why an oversized negative delay on a repeating animation
// crashes the Web Animations API.
function makePetals(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const duration = 14 + ((i * 37) % 16);
    return {
      id: i,
      left: (i * 41.3) % 100,
      size: 10 + ((i * 17) % 14),
      duration,
      delay: (((i * 23) % 100) / 100) * duration,
      sway: 14 + ((i * 13) % 22),
      spin: (i % 2 === 0 ? 1 : -1) * (60 + ((i * 31) % 180)),
      hue: i % 3,
    };
  });
}

const PETALS = makePetals(16);
const PETAL_COLORS = ["rgba(233,180,178,0.55)", "rgba(244,213,214,0.5)", "rgba(197,150,150,0.4)"];

function Petal({ p }: { p: ReturnType<typeof makePetals>[number] }) {
  return (
    <motion.span
      className="absolute rounded-[60%_40%_60%_40%]"
      style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.72, top: -20, background: PETAL_COLORS[p.hue] }}
      animate={{
        y: ["0vh", "112vh"],
        x: [0, p.sway, -p.sway * 0.6, p.sway * 0.4, 0],
        rotate: [0, p.spin],
        opacity: [0, 0.9, 0.9, 0],
      }}
      transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

function BloomAtmosphereInner() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft diagonal sunlight, two beams crossing at different angles. */}
      <motion.div
        className="absolute -inset-y-1/4 left-[10%] w-[35%] -rotate-[18deg]"
        style={{ background: "linear-gradient(180deg, rgba(255,245,225,0.22), transparent 70%)" }}
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -inset-y-1/4 left-[62%] w-[22%] -rotate-[12deg]"
        style={{ background: "linear-gradient(180deg, rgba(255,245,225,0.16), transparent 75%)" }}
        animate={{ opacity: [0.5, 0.25, 0.5] }}
        transition={{ duration: 9, delay: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Petals, drifting the full height of the chapter. */}
      <DepthLayer scrollSpeed={0.06} cursorSpeed={10}>
        {PETALS.map((p) => (
          <Petal key={p.id} p={p} />
        ))}
      </DepthLayer>

      {/* Pollen — smaller, slower, warmer than the petals. */}
      <DepthLayer scrollSpeed={0.1} cursorSpeed={18}>
        {Array.from({ length: 20 }, (_, i) => {
          const duration = 22 + ((i * 31) % 20);
          const delay = (((i * 17) % 100) / 100) * duration;
          return (
            <motion.span
              key={i}
              className="absolute rounded-full bg-[#e9c98a]/70"
              style={{ left: `${(i * 53.7) % 100}%`, width: 2 + ((i * 7) % 3), height: 2 + ((i * 7) % 3), bottom: -16 }}
              animate={{ y: ["0vh", "-108vh"], x: [0, (i % 2 === 0 ? 1 : -1) * (10 + (i % 20)), 0], opacity: [0, 0.7, 0.5, 0] }}
              transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
            />
          );
        })}
      </DepthLayer>
    </div>
  );
}

/** Bloom's own weather: petals falling the full height of the frame, warm
 * diagonal sunlight, and pollen drifting slower and lower than the
 * petals — the one chapter in the story where the air itself is doing
 * something. */
export default function BloomAtmosphere() {
  return (
    <AtmosphereBoundary>
      <BloomAtmosphereInner />
    </AtmosphereBoundary>
  );
}
