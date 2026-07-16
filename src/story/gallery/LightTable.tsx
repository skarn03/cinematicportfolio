import { useRef, useState, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { Photo } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

/** One print resting on the table — its own slight rotation, its own drop
 * shadow onto the glass beneath it. */
function Print({ photo, rotate, onOpen, onMove, onLeave }: { photo: Photo; rotate: number; onOpen: () => void; onMove: (e: MouseEvent<HTMLDivElement>) => void; onLeave: () => void }) {
  return (
    <motion.div
      data-cursor-hover
      className="relative w-full max-w-sm cursor-pointer bg-warm-white p-2 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.6)]"
      style={{ rotate }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.9, ease: EASE }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onOpen}
    >
      <img
        src={photo.src}
        alt={photo.title}
        loading="lazy"
        className="w-full object-cover"
        style={{ objectPosition: photo.focalPoint, aspectRatio: photo.aspect }}
      />
    </motion.div>
  );
}

/** Format 13 — Light Table. One or two prints laid flat on an illuminated
 * table rather than hung or framed — a warm glow underneath, and a loupe
 * that follows the cursor across whichever print it's over, the same
 * inspection gesture as the contact sheet in Streets, just for a single
 * print resting rather than a whole grid. */
export default function LightTable({
  photos,
  caption,
  onOpen,
  tone = "dark",
}: {
  photos: [Photo] | [Photo, Photo];
  caption?: string;
  onOpen: (photo: Photo) => void;
  tone?: "dark" | "light";
}) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [loupe, setLoupe] = useState<{ src: string; bgX: number; bgY: number } | null>(null);
  const loupeX = useMotionValue(0);
  const loupeY = useMotionValue(0);
  const springX = useSpring(loupeX, { stiffness: 500, damping: 42 });
  const springY = useSpring(loupeY, { stiffness: 500, damping: 42 });

  const handleMove = (e: MouseEvent<HTMLDivElement>, src: string) => {
    const frameRect = e.currentTarget.getBoundingClientRect();
    const tableRect = tableRef.current?.getBoundingClientRect();
    if (!tableRect) return;
    loupeX.set(e.clientX - tableRect.left);
    loupeY.set(e.clientY - tableRect.top);
    setLoupe({ src, bgX: ((e.clientX - frameRect.left) / frameRect.width) * 100, bgY: ((e.clientY - frameRect.top) / frameRect.height) * 100 });
  };

  return (
    <div className="relative flex w-full flex-col items-center gap-6 px-6 py-24 md:py-32">
      <div
        ref={tableRef}
        className="relative flex w-full max-w-3xl flex-col items-center gap-10 rounded-sm p-8 md:flex-row md:justify-center md:gap-8 md:p-14"
        style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(255,231,180,0.16), transparent 65%)" }}
        onMouseLeave={() => setLoupe(null)}
      >
        {photos.map((photo, i) => (
          <Print
            key={photo.id}
            photo={photo}
            rotate={i === 0 ? -2 : 2.5}
            onOpen={() => onOpen(photo)}
            onMove={(e) => handleMove(e, photo.src)}
            onLeave={() => setLoupe(null)}
          />
        ))}

        {loupe && (
          <motion.div
            className="pointer-events-none absolute z-30 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-warm-white/70 shadow-2xl"
            style={{
              left: springX,
              top: springY,
              backgroundImage: `url(${loupe.src})`,
              backgroundSize: "400%",
              backgroundPosition: `${loupe.bgX}% ${loupe.bgY}%`,
            }}
          />
        )}
      </div>
      {caption && (
        <p className={`max-w-md px-6 text-center font-serif-display text-lg italic md:text-xl ${tone === "dark" ? "text-warm-white/60" : "text-charcoal/60"}`}>
          {caption}
        </p>
      )}
      <p className={`font-mono text-[9px] uppercase tracking-cinema ${tone === "dark" ? "text-warm-white/30" : "text-charcoal/30"}`}>On the light table &middot; move to inspect</p>
    </div>
  );
}
