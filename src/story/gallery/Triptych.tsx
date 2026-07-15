import { motion } from "framer-motion";
import type { Photo } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

/** Format 6 — Triptych. Three related photographs, perfectly aligned,
 * museum spacing, one caption underneath all three rather than each
 * repeating itself. */
export default function Triptych({
  photos,
  caption,
  onOpen,
  tone = "dark",
}: {
  photos: [Photo, Photo, Photo];
  caption: string;
  onOpen: (photo: Photo) => void;
  tone?: "dark" | "light";
}) {
  return (
    <div className="w-full px-6 py-24 md:px-16 md:py-32">
      <div className="mx-auto flex max-w-[92vw] flex-col items-center gap-6 md:flex-row md:items-start md:justify-center md:gap-4">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            className="bg-warm-white p-1.5 shadow-2xl shadow-black/30 md:p-2"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: EASE }}
          >
            <img
              data-cursor-hover
              src={photo.src}
              alt={photo.title}
              loading="lazy"
              onClick={() => onOpen(photo)}
              className="max-h-[62vh] w-auto max-w-[85vw] cursor-pointer object-cover md:max-h-[80vh] md:max-w-[30vw]"
              style={{ objectPosition: photo.focalPoint, aspectRatio: photo.aspect }}
            />
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
