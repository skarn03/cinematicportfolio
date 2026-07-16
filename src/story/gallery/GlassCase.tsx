import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { useCursor } from "../CursorContext";
import MuseumLabel from "./MuseumLabel";
import type { Photo } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

/** Format 10 — Glass Case. The photograph sits behind a pane of glass, not
 * printed on paper — a diagonal specular band drifts across it with the
 * cursor, and the "glass" layer parallaxes very slightly against the photo
 * underneath it as the page scrolls past, the way a real reflection would
 * shift against what's behind it. */
export default function GlassCase({
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
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useCursor();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glassY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const highlightX = useTransform(x, [-1, 1], ["-30%", "130%"]);
  const highlightY = useTransform(y, [-1, 1], ["-10%", "60%"]);
  const highlightPos = useMotionTemplate`${highlightX} ${highlightY}`;

  return (
    <div ref={ref} className="flex w-full flex-col items-center gap-6 px-6 py-24 md:py-32">
      <motion.div
        className="relative bg-warm-white p-2 shadow-2xl shadow-black/40 md:p-3"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <img
          data-cursor-hover
          src={photo.src}
          alt={photo.title}
          loading="lazy"
          onClick={onOpen}
          className="max-h-[64vh] w-auto max-w-[85vw] cursor-pointer object-cover md:max-h-[76vh] md:max-w-[54vw]"
          style={{ objectPosition: photo.focalPoint, aspectRatio: photo.aspect }}
        />
        {/* the glass pane — a soft radial gloss that drifts with the
            cursor, plus a very faint scroll-linked vertical offset so it
            never sits perfectly still against the photo beneath it. */}
        <motion.div
          className="pointer-events-none absolute inset-2 md:inset-3"
          style={{
            y: glassY,
            background: useMotionTemplate`radial-gradient(ellipse 60% 40% at ${highlightPos}, rgba(255,255,255,0.22), transparent 70%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-2 bg-gradient-to-br from-white/10 via-transparent to-white/5 md:inset-3" />
      </motion.div>
      <MuseumLabel title={photo.title} index={index} chapterNumber={chapterNumber} tone={tone} />
    </div>
  );
}
