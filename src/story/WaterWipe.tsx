import { motion, useTransform, type MotionValue } from "framer-motion";

/** The one place two chapters actually touch. Reflections is built on
 * water, so instead of a hard cut into Wander, its own dark teal recedes
 * off the top of the frame like a wave draining away — a signature moment,
 * deliberately built once and not reused as a generic chapter template
 * anywhere else in the site. */
export default function WaterWipe({ progress }: { progress: MotionValue<number> }) {
  const recede = useTransform(progress, [0, 1], [0, 100]);
  const clipPath = useTransform(recede, (r) => `inset(${r}% 0 0 0)`);
  const waveTop = useTransform(recede, (r) => `${r}%`);
  const opacity = useTransform(progress, [0.9, 1], [1, 0]);

  return (
    <motion.div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" style={{ opacity }}>
      <motion.div className="absolute inset-0 bg-[#0c1513]" style={{ clipPath }} />
      <motion.svg
        className="absolute left-0 h-6 w-full text-[#0c1513]"
        style={{ top: waveTop, marginTop: -12 }}
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
      >
        <path d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10 T 125 10 T 150 10 T 175 10 T 200 10 V20 H0 Z" fill="currentColor" />
      </motion.svg>
    </motion.div>
  );
}
