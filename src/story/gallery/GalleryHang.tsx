import { motion } from "framer-motion";
import MuseumLabel from "./MuseumLabel";
import type { Photo } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

/** Format 9 — Gallery Hang. The print doesn't sit on the page, it hangs
 * from it — two thin wires running up out of frame to a pin, the way a
 * real print hangs on a real gallery wall. A slow, continuous sway (never
 * a hover-triggered bounce) is the only thing that ever moves. */
export default function GalleryHang({
  photo,
  index,
  chapterNumber,
  onOpen,
  tone = "dark",
}: {
  photo: Photo;
  index: number;
  chapterNumber: string;
  onOpen: () => void;
  tone?: "dark" | "light";
}) {
  return (
    <div className="flex w-full flex-col items-center gap-6 px-6 py-24 md:py-32">
      <motion.div
        className="relative"
        style={{ transformOrigin: "top center" }}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <motion.div
          animate={{ rotate: [-0.7, 0.7, -0.7] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* the wires */}
          <svg width="100%" height="64" viewBox="0 0 200 64" preserveAspectRatio="none" className="absolute -top-16 left-0 h-16 w-full opacity-40">
            <line x1="30" y1="0" x2="94" y2="64" stroke="currentColor" strokeWidth="0.6" className={tone === "dark" ? "text-warm-white" : "text-charcoal"} />
            <line x1="170" y1="0" x2="106" y2="64" stroke="currentColor" strokeWidth="0.6" className={tone === "dark" ? "text-warm-white" : "text-charcoal"} />
          </svg>

          <div className="bg-warm-white p-2 shadow-2xl shadow-black/40 md:p-3">
            <img
              data-cursor-hover
              src={photo.src}
              alt={photo.title}
              loading="lazy"
              onClick={onOpen}
              className="max-h-[64vh] w-auto max-w-[85vw] cursor-pointer object-cover md:max-h-[76vh] md:max-w-[50vw]"
              style={{ objectPosition: photo.focalPoint, aspectRatio: photo.aspect }}
            />
          </div>
        </motion.div>
      </motion.div>
      <MuseumLabel title={photo.title} index={index} chapterNumber={chapterNumber} tone={tone} />
    </div>
  );
}
