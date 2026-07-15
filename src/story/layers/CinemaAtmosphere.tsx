import { motion, useTransform } from "framer-motion";
import { useCursor } from "../CursorContext";
import AtmosphereBoundary from "../AtmosphereBoundary";

const MOTES = Array.from({ length: 18 }, (_, i) => {
  const duration = 4 + ((i * 13) % 30) / 10;
  return {
    id: i,
    t: i / 18,
    duration,
    // A fraction of this item's own duration, never larger in magnitude —
    // see DustLayer for why an oversized negative delay on a repeating
    // animation crashes the Web Animations API.
    delay: (-((i * 7) % 100) / 100) * duration,
    size: 1.5 + ((i * 11) % 20) / 10,
  };
});

/** Cinematography's own environment: the curtains actually open once (a
 * letterbox reveal rather than a fade), dust drifts through a projector
 * beam that cuts across the dark, and a small lens-flare chain leans
 * toward the cursor the way real flare drifts opposite the light source. */
function CinemaAtmosphereInner() {
  const { x, y } = useCursor();
  const flareLeft = useTransform(x, [-1, 1], ["30%", "70%"]);
  const flareTop = useTransform(y, [-1, 1], ["20%", "50%"]);
  const flare2Left = useTransform(x, [-1, 1], ["45%", "55%"]);
  const flare2Top = useTransform(y, [-1, 1], ["35%", "65%"]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {/* The projector beam — a soft cone with its own dust, independent of
          the ambient dust drifting everywhere else. */}
      <div
        className="absolute left-[8%] top-[6%] h-[70%] w-[60%] opacity-[0.05]"
        style={{
          background: "linear-gradient(115deg, transparent 30%, rgba(255,243,214,0.9) 48%, transparent 70%)",
        }}
      />
      {MOTES.map((m) => (
        <motion.span
          key={m.id}
          className="absolute rounded-full bg-warm-white"
          style={{ left: `${10 + m.t * 55}%`, top: `${8 + m.t * 62}%`, width: m.size, height: m.size }}
          animate={{ opacity: [0, 0.5, 0], x: [0, 12, 0], y: [0, -10, 0] }}
          transition={{ duration: m.duration, delay: m.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* A small flare chain that leans toward the cursor. */}
      <motion.div
        className="absolute h-40 w-40 rounded-full blur-2xl mix-blend-screen"
        style={{ left: flareLeft, top: flareTop, x: "-50%", y: "-50%", background: "radial-gradient(circle, rgba(255,243,214,0.35), transparent 70%)" }}
      />
      <motion.div
        className="absolute h-12 w-12 rounded-full blur-xl mix-blend-screen"
        style={{ left: flare2Left, top: flare2Top, x: "-50%", y: "-50%", background: "radial-gradient(circle, rgba(217,168,86,0.4), transparent 70%)" }}
      />

      {/* The curtains opening — a real letterbox reveal, once. */}
      <motion.div
        className="absolute inset-x-0 top-0 bg-ink"
        initial={{ height: "50%" }}
        whileInView={{ height: "0%" }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.4, ease: [0.87, 0, 0.13, 1] }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 bg-ink"
        initial={{ height: "50%" }}
        whileInView={{ height: "0%" }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.4, ease: [0.87, 0, 0.13, 1] }}
      />
    </div>
  );
}

export default function CinemaAtmosphere() {
  return (
    <AtmosphereBoundary>
      <CinemaAtmosphereInner />
    </AtmosphereBoundary>
  );
}
