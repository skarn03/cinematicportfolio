import { motion } from "framer-motion";
import AtmosphereBoundary from "../AtmosphereBoundary";
import { chapters } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;
const wanderPhotoCount = chapters[2].photos.length;

/** A hand-drawn route — one continuous dashed line, drawn once as the
 * chapter comes into view. No marker riding along it (a moving marker tied
 * to the same scroll value as nearby labels is what destabilized an
 * earlier version of this idea) — just the line itself, like a route
 * traced in pen after the fact. */
function RouteLine() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-40">
      <motion.path
        d="M 8 18 C 22 30, 18 48, 34 52 C 52 57, 48 74, 68 78 C 78 80, 82 86, 92 88"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.3"
        strokeDasharray="1.4 1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      />
    </svg>
  );
}

function Stamp({ top, left, rotate, label }: { top: string; left: string; rotate: number; label: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-dashed text-center"
      style={{ top, left, rotate, borderColor: "currentColor" }}
      initial={{ opacity: 0, scale: 1.6 }}
      whileInView={{ opacity: 0.35, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <span className="font-mono text-[7px] uppercase leading-tight tracking-wider">{label}</span>
    </motion.div>
  );
}

function WanderAtmosphereInner() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-charcoal/50">
      <RouteLine />
      <Stamp top="6%" left="82%" rotate={-12} label="On Foot" />
      <Stamp top="84%" left="4%" rotate={8} label="Roll 03" />

      {/* A torn corner from the same page as the rest of the notebook —
          honest about what it actually is: a frame count, not a fabricated
          boarding pass or GPS reading. */}
      <motion.div
        className="absolute bottom-10 right-8 w-32 border-y border-dashed border-current/40 bg-warm-white/5 px-3 py-2 backdrop-blur-[1px] md:right-14"
        initial={{ opacity: 0, x: 24, rotate: 8 }}
        whileInView={{ opacity: 0.7, x: 0, rotate: 4 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
      >
        <p className="text-[7px] uppercase tracking-cinema opacity-60">Field Notes</p>
        <p className="mt-1 font-mono text-[9px]">ROLL 03 &middot; {wanderPhotoCount} FRAMES</p>
      </motion.div>
    </div>
  );
}

/** Wander's own margins — a route traced by hand, a couple of stamps, a
 * ticket stub, coordinates in the corners. Nothing that repeats forever;
 * this chapter is a notebook page, not a weather system. */
export default function WanderAtmosphere() {
  return (
    <AtmosphereBoundary>
      <WanderAtmosphereInner />
    </AtmosphereBoundary>
  );
}
