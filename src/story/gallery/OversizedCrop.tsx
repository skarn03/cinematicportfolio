import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Photo } from "../../data/media";

/** Format 8 — Oversized Crop. The photograph opens tightly cropped —
 * over-scaled, only part of the composition visible — and scrolling
 * slowly zooms back out to the full frame. Forces a second, closer look
 * at the composition before the whole picture is even available. */
export default function OversizedCrop({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.7, 1.02]);
  const textOpacity = useTransform(scrollYProgress, [0.6, 0.85], [0, 1]);

  return (
    <div ref={ref} className="relative h-[170vh] w-full bg-ink">
      <div className="sticky top-0 flex h-screen w-full items-end justify-center overflow-hidden">
        <motion.img
          data-cursor-hover
          src={photo.src}
          alt={photo.title}
          loading="lazy"
          onClick={onOpen}
          className="absolute inset-0 h-full w-full cursor-pointer object-cover"
          style={{ objectPosition: photo.focalPoint, scale }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
        <motion.p
          className="relative z-10 mb-14 max-w-md px-6 text-center font-mono text-[10px] uppercase tracking-cinema text-warm-white/50"
          style={{ opacity: textOpacity }}
        >
          {photo.title}
        </motion.p>
      </div>
    </div>
  );
}
