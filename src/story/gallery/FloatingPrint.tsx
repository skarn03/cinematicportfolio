import { motion, useTransform } from "framer-motion";
import { useCursor } from "../CursorContext";
import MuseumLabel from "./MuseumLabel";
import type { Photo } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

/** Format 7 — Floating Print. One photograph, suspended rather than laid
 * flat — it tilts a couple of degrees toward the cursor and its shadow
 * drifts underneath in the opposite direction, so it reads as a physical
 * object hanging just above the page rather than a picture printed on it. */
export default function FloatingPrint({
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
  const { x, y } = useCursor();
  const tiltX = useTransform(y, [-1, 1], [4, -4]);
  const tiltY = useTransform(x, [-1, 1], [-4, 4]);
  const shadowX = useTransform(x, [-1, 1], [18, -18]);
  const shadowY = useTransform(y, [-1, 1], [10, -10]);

  return (
    <div className="group relative flex w-full flex-col items-center gap-5 px-6 py-24 md:py-32" style={{ perspective: 1200 }}>
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1, ease: EASE }}
        style={{ rotateX: tiltX, rotateY: tiltY }}
      >
        <motion.div
          className="pointer-events-none absolute inset-x-6 bottom-[-2rem] h-10 rounded-[100%] bg-black/35 blur-2xl"
          style={{ x: shadowX, y: shadowY }}
        />
        <img
          data-cursor-hover
          src={photo.src}
          alt={photo.title}
          loading="lazy"
          onClick={onOpen}
          className="relative max-h-[68vh] w-auto max-w-[85vw] cursor-pointer object-contain shadow-2xl shadow-black/40 md:max-h-[80vh] md:max-w-[52vw]"
          style={{ objectPosition: photo.focalPoint }}
        />
      </motion.div>
      <MuseumLabel title={photo.title} index={index} chapterNumber={chapterNumber} tone={tone} />
    </div>
  );
}
