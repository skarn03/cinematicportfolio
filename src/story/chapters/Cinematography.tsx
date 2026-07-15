import { useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useMotionTemplate, useTransform } from "framer-motion";
import CinemaAtmosphere from "../layers/CinemaAtmosphere";
import { films, type Film } from "../../data/media";

const [filmA, filmB] = films;

function SprocketRow({ position }: { position: "top" | "bottom" }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 z-20 flex justify-between px-3 ${position === "top" ? "top-1.5" : "bottom-1.5"}`}>
      {Array.from({ length: 28 }).map((_, i) => (
        <span key={i} className="h-2 w-1.5 rounded-[1px] bg-ink/70" />
      ))}
    </div>
  );
}

/** Half of the split screen — a poster that becomes its trailer on hover,
 * clipped to whatever the divider currently allows through. */
function ScreenHalf({
  film,
  side,
  clipPath,
  onOpen,
}: {
  film: Film;
  side: "left" | "right";
  clipPath: ReturnType<typeof useMotionTemplate>;
  onOpen: (film: Film) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      type="button"
      data-cursor-hover
      onClick={() => onOpen(film)}
      onMouseEnter={() => {
        setHovered(true);
        videoRef.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        setHovered(false);
        videoRef.current?.pause();
      }}
      className="absolute inset-0 h-full w-full cursor-pointer overflow-hidden text-left"
      style={{ clipPath }}
    >
      <img src={film.poster} alt={`${film.title} poster`} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700" style={{ opacity: hovered ? 0 : 1 }} />
      <video ref={videoRef} src={film.video} muted loop playsInline className="absolute inset-0 h-full w-full scale-105 object-cover transition-opacity duration-700" style={{ opacity: hovered ? 1 : 0 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/5 to-transparent" />
      <div className={`absolute bottom-8 z-10 md:bottom-12 ${side === "left" ? "left-5 md:left-10" : "right-5 text-right md:right-10"}`}>
        <p className="font-serif-display text-lg italic text-warm-white md:text-2xl">{film.title}</p>
        <p className="mt-1 text-[10px] uppercase tracking-cinema text-warm-white/60">
          {film.year} &middot; {film.duration}
        </p>
      </div>
    </motion.button>
  );
}

function CinemaMode({ film, onClose }: { film: Film; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-80 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <video src={film.video} controls autoPlay playsInline poster={film.poster} className="max-h-full w-full" />
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

/** Chapter Eight — the two films aren't tiles in a grid, they're a single
 * projection wall split down the middle. Drag the divider and the wall
 * itself redistributes — more of one film, less of the other — rather
 * than anything simply enlarging. */
export default function Cinematography() {
  const [openFilm, setOpenFilm] = useState<Film | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const dividerX = useMotionValue(50);
  const leftInset = useTransform(dividerX, (v) => 100 - v);
  const leftClip = useMotionTemplate`inset(0 ${leftInset}% 0 0)`;
  const rightClip = useMotionTemplate`inset(0 0 0 ${dividerX}%)`;
  const handleLeft = useMotionTemplate`${dividerX}%`;

  const updateFromClientX = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    dividerX.set(Math.min(90, Math.max(10, pct)));
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };
  const stopDragging = () => {
    draggingRef.current = false;
  };

  return (
    <section id="cinema-section" data-cursor-kind="video" className="relative w-full bg-charcoal py-24 md:py-32">
      <CinemaAtmosphere />

      <div className="relative z-10 px-6 md:px-14">
        <p className="font-mono text-[9px] uppercase tracking-cinema text-warm-white/40">IX &middot; Cinematography</p>
        <motion.p
          className="mt-6 max-w-lg font-serif-display text-2xl italic text-warm-white md:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9 }}
        >
          Two short films — a full sentence, where a photograph is only ever a word.
        </motion.p>
      </div>

      <motion.div
        ref={containerRef}
        className="relative mx-auto mt-14 aspect-video w-[92vw] max-w-5xl select-none overflow-hidden bg-ink shadow-2xl shadow-black/60"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
      >
        <SprocketRow position="top" />
        <SprocketRow position="bottom" />

        <ScreenHalf film={filmA} side="left" clipPath={leftClip} onOpen={setOpenFilm} />
        <ScreenHalf film={filmB} side="right" clipPath={rightClip} onOpen={setOpenFilm} />

        {/* the seam */}
        <motion.div className="pointer-events-none absolute inset-y-0 z-20 w-px bg-warm-white/60" style={{ left: handleLeft }} />
        <motion.div
          data-cursor-hover
          className="absolute top-1/2 z-30 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-warm-white/50 bg-ink/70 backdrop-blur-sm"
          style={{ left: handleLeft }}
          onPointerDown={handlePointerDown}
        >
          <span className="text-xs text-warm-white/80">&#8596;</span>
        </motion.div>
      </motion.div>

      <p className="mt-6 px-6 text-center font-mono text-[9px] uppercase tracking-cinema text-warm-white/30 md:px-14">
        Drag the seam &middot; one wall, two films
      </p>

      {createPortal(
        <AnimatePresence>{openFilm && <CinemaMode film={openFilm} onClose={() => setOpenFilm(null)} />}</AnimatePresence>,
        document.body,
      )}
    </section>
  );
}
