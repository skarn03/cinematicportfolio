import { motion } from "framer-motion";
import { chapterById, type Photo } from "../data/media";
import { locationFor } from "../data/archiveCategories";

const EASE = [0.65, 0, 0.35, 1] as const;

/** The Archive's own lightbox — the room dims, the print enlarges, a
 * museum label appears beside it. Only real fields ever show here: title,
 * chapter, a place where one is actually confirmed, and the photo's own
 * story text as the field note. No camera, lens, or settings — none of
 * that survives on any file here, and inventing it for a mode built for
 * clients deciding whether to hire the work would be dishonest in a way
 * atmosphere copy isn't. */
export default function ArchiveLightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  const chapter = chapterById(photo.chapter);
  const place = locationFor(photo.chapter);

  return (
    <motion.div
      className="fixed inset-0 z-90 flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm md:p-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
    >
      <motion.div
        className="flex w-full max-w-5xl flex-col items-center gap-6 md:flex-row md:items-center md:gap-10"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.4, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.src}
          alt={photo.title}
          className="max-h-[70vh] w-auto max-w-full object-contain shadow-2xl shadow-black/60 md:max-h-[80vh]"
          style={{ objectPosition: photo.focalPoint }}
        />
        <div className="max-w-xs shrink-0 text-warm-white/90">
          <p className="font-serif-display text-2xl italic">{photo.title}</p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-cinema text-warm-white/50">
            {chapter.archiveLabel}
            {place && ` · ${place}`}
          </p>
          <p className="mt-5 font-serif-display text-base italic leading-relaxed text-warm-white/70">{photo.story}</p>
        </div>
      </motion.div>

      <button
        type="button"
        data-cursor-hover
        onClick={onClose}
        className="absolute right-6 top-6 text-[10px] uppercase tracking-cinema text-warm-white/70 hover:text-warm-white"
      >
        Close
      </button>
    </motion.div>
  );
}
