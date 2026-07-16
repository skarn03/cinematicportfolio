import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Photo } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

/** Format 11 — Slide Projector. A short run of related frames, advanced
 * one hard cut at a time by clicking — not scrubbed continuously the way
 * `BurstSequence` is. Each advance is a beat: a white click-flash, the
 * outgoing slide drops away, the next one drops in, the lens judders once
 * and settles. A projector changes slides; it doesn't crossfade them. */
export default function SlideProjector({
  photos,
  caption,
  onOpen,
}: {
  photos: Photo[];
  caption: string;
  onOpen: (photo: Photo) => void;
}) {
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const photo = photos[index];

  const advance = () => {
    if (photos.length < 2) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 110);
    setIndex((i) => (i + 1) % photos.length);
  };

  return (
    <div className="flex w-full flex-col items-center gap-5 px-6 py-24 md:py-32">
      <motion.div
        data-cursor-hover
        onClick={advance}
        className="relative aspect-4/3 w-full max-w-2xl cursor-pointer overflow-hidden bg-ink shadow-2xl shadow-black/60"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={photo.id}
            src={photo.src}
            alt={photo.title}
            loading="lazy"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(photo);
            }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: photo.focalPoint }}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-ink/70" />
        <motion.div
          className="pointer-events-none absolute inset-0 bg-white"
          animate={{ opacity: flash ? 0.9 : 0 }}
          transition={{ duration: flash ? 0.05 : 0.3 }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 font-mono text-[9px] uppercase tracking-cinema text-warm-white/60">
          <span>Slide Projector</span>
          <span>
            {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </span>
        </div>
      </motion.div>

      <p className="max-w-md px-6 text-center font-serif-display text-lg italic text-warm-white/60 md:text-xl">{caption}</p>
      <p className="font-mono text-[9px] uppercase tracking-cinema text-warm-white/30">Click the slide to advance</p>
    </div>
  );
}
