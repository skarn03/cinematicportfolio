import { motion, type MotionValue } from "framer-motion";

/** The small caps, wide-tracking chapter label — typography doing the job
 * a section heading/nav item would elsewhere, without looking like either.
 * The rule draws itself in on scroll, a small piece of ceremony before
 * each chapter's first word. Pass `accent` (a live theme color) to have the
 * rule line color-grade itself with whichever chapter is active, instead
 * of a fixed tone. */
export default function Kicker({
  number,
  children,
  tone = "dark",
  accent,
  className = "",
}: {
  number: string;
  children: string;
  tone?: "dark" | "light";
  accent?: MotionValue<string>;
  className?: string;
}) {
  return (
    <motion.div
      className={`flex items-center gap-3 ${tone === "dark" ? "text-charcoal/60" : "text-warm-white/70"} ${className}`}
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
    >
      <motion.span className="font-serif-display text-sm italic" style={accent ? { color: accent } : undefined}>
        {number}
      </motion.span>
      <motion.span
        className={`h-px opacity-50 ${accent ? "" : "bg-current"}`}
        style={accent ? { backgroundColor: accent } : undefined}
        initial={{ width: 0 }}
        whileInView={{ width: 32 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
      />
      <span className="text-[10px] uppercase tracking-cinema">{children}</span>
    </motion.div>
  );
}
