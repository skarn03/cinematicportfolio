import { motion } from "framer-motion";
import AtmosphereBoundary from "../AtmosphereBoundary";

/** A shadow crossing the frame, the way a passerby's would fall across a
 * street photographer's shot — a soft, blurred, elongated shape, nothing
 * literal. Positive delay only, bounded by its own duration. */
function PassingShadow({ top, duration, delay, width }: { top: string; duration: number; delay: number; width: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute h-24 -skew-x-12 rounded-full bg-black/25 blur-xl"
      style={{ top, width }}
      initial={{ x: "-20vw" }}
      animate={{ x: "120vw" }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay: duration * 0.6, ease: "linear" }}
    />
  );
}

/** A chalk mark, scrawled once — a quick circle and an arrow, the kind of
 * thing a street vendor draws to point at their own sign. Drawn once,
 * never repeated. */
function ChalkMark({ top, left }: { top: string; left: string }) {
  return (
    <svg viewBox="0 0 60 40" className="pointer-events-none absolute w-24 opacity-25" style={{ top, left }}>
      <motion.path
        d="M 10 20 C 10 10, 25 8, 30 15 C 35 22, 25 32, 15 28 C 8 25, 8 22, 10 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      <motion.path
        d="M 34 18 L 52 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.4, delay: 1.1, ease: "easeInOut" }}
      />
    </svg>
  );
}

function StreetsAtmosphereInner() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-warm-white">
      {/* A faint architectural grid — the city's own structure showing
          through. */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px 7.6923%), repeating-linear-gradient(to bottom, currentColor 0 1px, transparent 1px 9.0909%)",
        }}
      />

      <PassingShadow top="18%" duration={16} delay={0} width={140} />
      <PassingShadow top="62%" duration={22} delay={7} width={200} />
      <PassingShadow top="40%" duration={19} delay={13} width={110} />

      <ChalkMark top="8%" left="4%" />
    </div>
  );
}

/** Streets' own texture — a faint grid holding the block together, chalk
 * scrawled once near the top corner, and the odd shadow of someone just
 * out of frame crossing the light. */
export default function StreetsAtmosphere() {
  return (
    <AtmosphereBoundary>
      <StreetsAtmosphereInner />
    </AtmosphereBoundary>
  );
}
