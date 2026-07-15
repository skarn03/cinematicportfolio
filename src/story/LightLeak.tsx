import { motion } from "framer-motion";

/** A warm light-leak sweep, used sparingly at a handful of chapter
 * boundaries — the sort of imperfection that reads as film, not template. */
export default function LightLeak() {
  return (
    <motion.div
      className="light-leak pointer-events-none absolute inset-0 z-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: [0, 0.7, 0] }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 2.4, ease: "easeInOut" }}
    />
  );
}
