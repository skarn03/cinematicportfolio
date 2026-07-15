import { motion } from "framer-motion";
import { photos } from "../data/media";

const PICK_INDICES = [1, 6, 12, 18, 23, 29, 34];
const PICKS = PICK_INDICES.map((i) => photos[i % photos.length]);
const OFFSETS = [
  { left: "6%", size: 60, delay: 0 },
  { left: "20%", size: 46, delay: 0.45 },
  { left: "37%", size: 70, delay: 0.15 },
  { left: "54%", size: 50, delay: 0.6 },
  { left: "69%", size: 58, delay: 0.3 },
  { left: "83%", size: 42, delay: 0.75 },
  { left: "46%", size: 54, delay: 0.95 },
];

/** The roll's own photographs, rising once and only once as the page
 * empties out — a last look at everything the visitor scrolled past,
 * drifting up and out of frame rather than simply vanishing. Real frames
 * pulled from the manifest, not placeholders; no `repeat`, so this plays a
 * single time and is done. */
export default function FloatingArchive() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PICKS.map((p, i) => {
        const o = OFFSETS[i % OFFSETS.length];
        return (
          <motion.img
            key={p.id}
            src={p.src}
            alt=""
            className="absolute bottom-0 rounded-sm object-cover shadow-lg shadow-black/40"
            style={{ left: o.left, width: o.size, aspectRatio: "4 / 5" }}
            initial={{ y: "8vh", opacity: 0 }}
            animate={{ y: "-115vh", opacity: [0, 0.5, 0] }}
            transition={{ duration: 5.5, delay: o.delay, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}
