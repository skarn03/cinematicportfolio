import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from "framer-motion";
import type { Photo } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

/** One frame's own cross-fade window — split into its own component
 * (rather than calling `useTransform` inside the parent's `.map()`) so
 * each frame's hook call belongs to a stable component instance instead
 * of a loop iteration. */
function BurstFrame({
  photo,
  index,
  total,
  scrollYProgress,
  onOpen,
}: {
  photo: Photo;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  onOpen: (photo: Photo) => void;
}) {
  const segment = 1 / total;
  const start = index * segment;
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, start - segment * 0.5), start, start + segment * 0.7, start + segment],
    [0, 1, 1, index === total - 1 ? 1 : 0],
  );
  return (
    <motion.img
      data-cursor-hover
      src={photo.src}
      alt={photo.title}
      loading="lazy"
      onClick={() => onOpen(photo)}
      className="absolute inset-0 h-full w-full cursor-pointer object-cover"
      style={{ objectPosition: photo.focalPoint, opacity }}
    />
  );
}

/**
 * A new format, not a reuse of any other primitive on the site — for the
 * one moment in the whole roll that's genuinely a burst: the same corner,
 * four passersby, shot seconds apart. Instead of a static grid or a
 * contact sheet, scrolling *scrubs through the burst itself* — the frames
 * cross-fade one into the next exactly like winding through a strip of
 * negatives on a light table, with a frame counter and a scrub bar
 * standing in for the sprocket holes. Nothing else in the story moves
 * like this.
 */
export default function BurstSequence({
  photos,
  caption,
  onOpen,
}: {
  photos: Photo[];
  caption: string;
  onOpen: (photo: Photo) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(photos.length - 1, Math.floor(v * photos.length));
    if (next !== active) setActive(next);
  });

  const barWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="relative w-full" style={{ height: `${photos.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-ink px-6">
        <div className="relative aspect-video w-full max-w-4xl overflow-hidden shadow-2xl shadow-black/60">
          {photos.map((photo, i) => (
            <BurstFrame key={photo.id} photo={photo} index={i} total={photos.length} scrollYProgress={scrollYProgress} onOpen={onOpen} />
          ))}

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 font-mono text-[9px] uppercase tracking-cinema text-warm-white/70">
            <span>Burst &middot; Same Corner</span>
            <span>
              {String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-warm-white/15">
            <motion.div className="h-full bg-warm-white/70" style={{ width: barWidth }} />
          </div>
        </div>

        <motion.p
          className="mt-8 max-w-lg px-6 text-center font-serif-display text-lg italic text-warm-white/60 md:text-xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {caption}
        </motion.p>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-cinema text-warm-white/30">Keep scrolling &middot; the corner keeps moving</p>
      </div>
    </div>
  );
}
