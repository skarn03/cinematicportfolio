import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FieldNotebookMargin, { type NotebookNote } from "../FieldNotebookMargin";
import type { Photo } from "../../data/media";

/** Format 3 — Cinematic Fullscreen. The photograph fills the screen. One
 * sentence. A very subtle scroll-linked drift, nothing else — no label,
 * no frame, no chrome. Meant to feel like a paused film, not a page. An
 * optional notebook margin note can be pinned to a corner when this is
 * used as a chapter's opening frame. */
export default function CinematicFullscreen({
  photo,
  onOpen,
  note,
  noteDock = "bottom",
  noteAlign = "left",
}: {
  photo: Photo;
  onOpen: () => void;
  note?: NotebookNote;
  noteDock?: "top" | "bottom";
  noteAlign?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.35, 0.55, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="relative flex h-[100vh] w-full items-end justify-center overflow-hidden bg-ink">
      <motion.img
        data-cursor-hover
        src={photo.src}
        alt={photo.title}
        loading="lazy"
        onClick={onOpen}
        className="absolute inset-0 h-full w-full cursor-pointer object-cover"
        style={{ objectPosition: photo.focalPoint, scale }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
      {note && <FieldNotebookMargin note={note} dock={noteDock} align={noteAlign} tone="dark" />}
      <motion.p
        className="relative z-10 mb-16 max-w-lg px-6 text-center font-serif-display text-2xl italic text-warm-white md:mb-24 md:text-3xl"
        style={{ opacity: textOpacity }}
      >
        {photo.story}
      </motion.p>
    </div>
  );
}
