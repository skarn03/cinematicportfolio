import { motion } from "framer-motion";

const FRAME_COUNT = 18;

/** The beat between "the story's over" and "back at the camera" — a strip
 * of frames spooling backward across black, the visual equivalent of
 * physically winding a roll back rather than the page just cutting or
 * jumping to the top. Plays once per click, no `repeat`, so it never joins
 * the WAAPI-risk category the rest of the atmosphere layers have to avoid. */
export default function RewindOverlay() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-90 flex flex-col items-center justify-center gap-5 bg-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative h-16 w-[72vw] max-w-xl overflow-hidden">
        <motion.div
          className="absolute inset-y-0 flex items-center gap-2"
          initial={{ x: "-55%" }}
          animate={{ x: "5%" }}
          transition={{ duration: 1.15, ease: [0.7, 0, 0.84, 0] }}
        >
          {Array.from({ length: FRAME_COUNT }).map((_, i) => (
            <span key={i} className="h-11 w-16 shrink-0 rounded-[2px] border border-warm-white/20 bg-warm-white/5" />
          ))}
        </motion.div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-ink to-transparent" />
      </div>
      <motion.p
        className="font-mono text-[10px] uppercase tracking-cinema text-warm-white/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Rewinding the roll&hellip;
      </motion.p>
    </motion.div>
  );
}
