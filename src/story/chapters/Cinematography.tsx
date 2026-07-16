import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import CinemaAtmosphere from "../layers/CinemaAtmosphere";
import CinemaScreeningRoom from "../CinemaScreeningRoom";
import { films } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;
const film = films[0];

function SprocketRow({ position }: { position: "top" | "bottom" }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 z-20 flex justify-between px-3 ${position === "top" ? "top-1.5" : "bottom-1.5"}`}>
      {Array.from({ length: 28 }).map((_, i) => (
        <span key={i} className="h-2 w-1.5 rounded-[1px] bg-ink/70" />
      ))}
    </div>
  );
}

/** The projection wall — a single real film, presented as a poster until
 * asked to run. No hover-scrub preview (that trick needs a raw video file
 * to seek through; this is a YouTube embed, played straight through once
 * it's actually opened, the way any cinema screen works). */
function Screen({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      type="button"
      data-cursor-hover
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute inset-0 h-full w-full cursor-pointer overflow-hidden text-left"
    >
      <img
        src={film.poster}
        alt={`${film.title} — poster`}
        className="absolute inset-0 h-full w-full scale-105 object-cover transition-transform duration-700"
        style={{ transform: hovered ? "scale(1.1)" : "scale(1.05)" }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/10 to-ink/30 transition-opacity duration-500" style={{ opacity: hovered ? 0.9 : 0.75 }} />

      <motion.div
        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-warm-white/60 bg-ink/40 backdrop-blur-sm md:h-20 md:w-20"
        animate={{ scale: hovered ? 1.08 : 1, opacity: hovered ? 1 : 0.85 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <svg width="20" height="22" viewBox="0 0 20 22" fill="none" className="ml-1">
          <path d="M1 1L19 11L1 21V1Z" fill="#faf5ec" />
        </svg>
      </motion.div>

      <div className="absolute bottom-8 left-5 z-10 md:bottom-12 md:left-10">
        <p className="font-serif-display text-xl italic text-warm-white md:text-3xl">{film.title}</p>
        <p className="mt-1.5 text-[10px] uppercase tracking-cinema text-warm-white/60">{film.channel}</p>
      </div>
    </motion.button>
  );
}

/** Chapter Eight — one real film gets the whole projection wall to itself.
 * A photograph is a word; this is the full sentence. */
export default function Cinematography() {
  const [open, setOpen] = useState(false);

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
          One short film — a full sentence, where a photograph is only ever a word.
        </motion.p>
      </div>

      <motion.div
        className="relative mx-auto mt-14 aspect-video w-[92vw] max-w-5xl select-none overflow-hidden bg-ink shadow-2xl shadow-black/60"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <SprocketRow position="top" />
        <SprocketRow position="bottom" />
        <Screen onOpen={() => setOpen(true)} />
      </motion.div>

      <p className="mt-6 px-6 text-center font-mono text-[9px] uppercase tracking-cinema text-warm-white/30 md:px-14">Click to play</p>

      {createPortal(
        <AnimatePresence>
          {open && <CinemaScreeningRoom title={film.title} youtubeId={film.youtubeId} onClose={() => setOpen(false)} />}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}
