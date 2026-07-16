import { motion } from "framer-motion";
import MuseumLabel from "./MuseumLabel";
import type { Photo } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

function Bracket({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const pos =
    corner === "tl"
      ? "left-6 top-6 border-l border-t"
      : corner === "tr"
        ? "right-6 top-6 border-r border-t"
        : corner === "bl"
          ? "left-6 bottom-6 border-l border-b"
          : "right-6 bottom-6 border-r border-b";
  return <motion.span className={`pointer-events-none absolute z-10 h-6 w-6 border-warm-white/80 ${pos}`} />;
}

/** Format 12 — Viewfinder Reveal. The frame starts held to a small central
 * rectangle, the way a photograph looks the instant before the shutter
 * opens — AF brackets pulsing at its corners — then the aperture opens to
 * the full composition as the visitor scrolls it into view. The same
 * language the camera intro's own viewfinder speaks, carried into the
 * story itself. */
export default function ViewfinderReveal({
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
    <div className="relative flex w-full flex-col items-center gap-6 bg-ink px-6 py-24 md:py-32">
      <motion.div
        className="relative aspect-video w-full max-w-4xl overflow-hidden shadow-2xl shadow-black/60"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.6 }}
      >
        <motion.img
          data-cursor-hover
          src={photo.src}
          alt={photo.title}
          loading="lazy"
          onClick={onOpen}
          className="absolute inset-0 h-full w-full cursor-pointer object-cover"
          style={{ objectPosition: photo.focalPoint }}
          initial={{ clipPath: "inset(38% 38% 38% 38%)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 1.6, delay: 0.5, ease: EASE }}
        />

        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.4, delay: 1.7 }}
        >
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: 2, ease: "easeInOut" }}>
            <Bracket corner="tl" />
            <Bracket corner="tr" />
            <Bracket corner="bl" />
            <Bracket corner="br" />
          </motion.div>
        </motion.div>
      </motion.div>
      <MuseumLabel title={photo.title} index={index} chapterNumber={chapterNumber} tone={tone} />
    </div>
  );
}
