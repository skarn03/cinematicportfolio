import { motion } from "framer-motion";
import type { Photo } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

/** Format 5 — Diptych. Two photographs designed to be read together —
 * a relation, not a random pair — with one shared caption instead of two
 * separate ones. Museum spacing, perfect alignment. */
export default function Diptych({
  a,
  b,
  relation,
  caption,
  onOpenA,
  onOpenB,
  tone = "dark",
}: {
  a: Photo;
  b: Photo;
  /** the relationship label shown between them, e.g. "Wide" / "Detail" */
  relation?: [string, string];
  caption: string;
  onOpenA: () => void;
  onOpenB: () => void;
  tone?: "dark" | "light";
}) {
  return (
    <div className="w-full px-6 py-24 md:px-16 md:py-32">
      <div className="mx-auto flex max-w-[92vw] flex-col items-center gap-6 md:flex-row md:items-start md:justify-center md:gap-5">
        {[
          { photo: a, onOpen: onOpenA, label: relation?.[0] },
          { photo: b, onOpen: onOpenB, label: relation?.[1] },
        ].map(({ photo, onOpen, label }, i) => (
          <motion.div
            key={photo.id}
            className="group relative"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, delay: i * 0.15, ease: EASE }}
          >
            {/* Same paper-margin print mount as Editorial Spread, and the
                same fit-inside-the-viewport sizing — the pair is meant to
                be compared at a glance, not scrolled between. */}
            <div className="bg-warm-white p-2 shadow-2xl shadow-black/30 md:p-3">
              <img
                data-cursor-hover
                src={photo.src}
                alt={photo.title}
                loading="lazy"
                onClick={onOpen}
                className="max-h-[64vh] w-auto max-w-[85vw] cursor-pointer object-cover md:max-h-[80vh] md:max-w-[44vw]"
                style={{ objectPosition: photo.focalPoint, aspectRatio: photo.aspect }}
              />
            </div>
            {label && (
              <span
                className={`pointer-events-none absolute left-4 top-4 font-mono text-[8px] uppercase tracking-cinema opacity-0 transition-opacity duration-500 group-hover:opacity-70 ${
                  tone === "dark" ? "text-warm-white" : "text-charcoal"
                }`}
              >
                {label}
              </span>
            )}
          </motion.div>
        ))}
      </div>
      <motion.p
        className={`mx-auto mt-8 max-w-lg text-center font-serif-display text-lg italic md:mt-10 md:text-xl ${
          tone === "dark" ? "text-warm-white/60" : "text-charcoal/60"
        }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, delay: 0.4 }}
      >
        {caption}
      </motion.p>
    </div>
  );
}
