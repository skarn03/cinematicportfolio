import { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useLightbox } from "../Lightbox";
import FloatingArchive from "../FloatingArchive";
import { requestContact } from "../../lib/contactBus";
import { closingImage, ambientVideo, photos } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

/** Chapter Nine — the front page of the last edition. The newspaper closes
 * the way the earlier version did (masthead, fold crease, byline) up until
 * the visitor actually reaches the bottom — at which point the page empties
 * out entirely rather than shrinking straight back into the camera. One
 * line, then a blinking prompt.
 *
 * That prompt no longer rewinds straight away — it opens the same 3D
 * contact scene reachable from the persistent shortcut elsewhere in the
 * portfolio (see contactBus.ts), since arriving at the true end of the
 * roll is exactly the moment a visitor is most likely to want to reach
 * out. `onArrive` (the rewind-to-the-beginning mechanic) is handed to the
 * contact scene as its own "continue" action from there, rather than
 * fired directly. */
export default function Home({ onArrive }: { onArrive: () => void }) {
  const open = useLightbox();
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const scale = useTransform(scrollYProgress, [0.55, 0.95], [1, 0.22]);
  const radius = useTransform(scrollYProgress, [0.55, 0.95], [0, 8]);
  const opacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);
  const saturate = useTransform(scrollYProgress, [0.3, 0.7], [1, 0.35]);
  const brightness = useTransform(scrollYProgress, [0.3, 0.7], [1, 0.8]);
  const blur = useTransform(scrollYProgress, [0.7, 0.95], [0, 3]);
  const imageFilter = useMotionTemplate`saturate(${saturate}) brightness(${brightness}) blur(${blur}px)`;
  // The fold — a crease shadow across the photo that deepens as the page
  // closes, as if the whole edition were being shut for the night.
  const foldOpacity = useTransform(scrollYProgress, [0.35, 0.75], [0, 0.55]);
  const ambientOpacity = useTransform(scrollYProgress, [0.85, 1], [0.1, 0]);

  return (
    <section ref={ref} id="home-section" data-cursor-kind="photo" className="relative h-[220vh] w-full bg-charcoal">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        <motion.video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover blur-[2px]"
          style={{ opacity: ambientOpacity }}
          src={ambientVideo}
          autoPlay
          muted
          loop
          playsInline
        />

        <motion.div className="pointer-events-none absolute top-8 z-10 flex flex-col items-center md:top-12" style={{ opacity }}>
          <p className="font-mono text-[9px] uppercase tracking-cinema text-warm-white/40">Final Edition &middot; Chapter X</p>
          <div className="mt-2 flex items-center gap-4">
            <span className="h-px w-10 bg-warm-white/30 md:w-16" />
            <h2 className="font-serif-display text-2xl italic text-warm-white md:text-4xl">Saika Cinematics</h2>
            <span className="h-px w-10 bg-warm-white/30 md:w-16" />
          </div>
        </motion.div>

        <motion.div className="relative w-[84vw] max-w-2xl overflow-hidden shadow-2xl shadow-black/50" style={{ scale, borderRadius: radius, opacity }}>
          <motion.img
            src={closingImage.src}
            alt={closingImage.title}
            onClick={() => open(closingImage.src, closingImage.title)}
            className="aspect-3/2 w-full cursor-pointer object-cover"
            style={{ filter: imageFilter, objectPosition: closingImage.focalPoint }}
          />
          {/* the fold crease */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-1/2 h-10 -translate-y-1/2"
            style={{
              opacity: foldOpacity,
              background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.55) 50%, transparent)",
            }}
          />
        </motion.div>

        <motion.div className="pointer-events-none absolute bottom-16 max-w-sm px-6 text-center" style={{ opacity }}>
          <span className="mx-auto mb-3 block h-px w-12 bg-warm-white/30" />
          <p className="font-serif-display text-xl italic text-warm-white/80 md:text-2xl">{closingImage.story}</p>
          <p className="mt-3 font-mono text-[9px] uppercase tracking-cinema text-warm-white/40">&mdash; Sahil Karn, Staff Photographer</p>
        </motion.div>

        {/* This looks like a cover page — masthead, photo, byline — and a
            visitor who doesn't already know the roll keeps going past
            "Chapter X" has no reason to scroll further. A quiet, moving
            cue at the very bottom (below the byline, never competing with
            it) says there's more without breaking the front-page stillness
            above it. Shares the same fade as the rest of the page, so it
            never lingers once the closing sequence actually begins. */}
        <motion.div className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 md:bottom-6" style={{ opacity }}>
          <span className="font-mono text-[8px] uppercase tracking-cinema text-warm-white/35">Keep scrolling</span>
          <motion.svg
            width="14"
            height="8"
            viewBox="0 0 14 8"
            fill="none"
            animate={{ y: [0, 5, 0], opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-warm-white" />
          </motion.svg>
        </motion.div>

        {/* The empty page — everything above has faded to nothing by the
            time this arrives, so it reads as the page itself going quiet,
            not a new screen replacing an old one. */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-charcoal px-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, delay: 0.4, ease: EASE }}
            >
              <FloatingArchive />
              <motion.p
                className="max-w-sm font-serif-display text-xl italic text-warm-white/70 md:text-2xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, delay: 1.6, ease: EASE }}
              >
                That's the roll — {photos.length} frames kept, plenty more that didn't make it.
              </motion.p>

              <motion.button
                type="button"
                data-cursor-hover
                onClick={() => requestContact({ origin: "journey", onContinue: onArrive })}
                className="mt-10 flex items-center gap-1 bg-transparent font-mono text-[11px] uppercase tracking-cinema text-warm-white/50 transition-colors hover:text-warm-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 3, ease: EASE }}
              >
                One more roll?
                <span className="animate-blink-caret ml-1 inline-block h-3.5 w-[2px] bg-warm-white/70" aria-hidden />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The arrival trigger — deliberately a few viewport-heights tall
          rather than a 1px line at the exact document edge, since a
          sub-pixel target at the true bottom of the page can fail to ever
          reach IntersectionObserver's amount:1 threshold (rounding at the
          scroll max). A generous amount:0.3 on a real-sized target fires
          reliably instead. Reaching it only reveals the empty page — the
          actual rewind waits for the click above. */}
      <motion.div
        onViewportEnter={() => setRevealed(true)}
        viewport={{ once: true, amount: 0.3 }}
        className="absolute bottom-0 h-[10vh] w-full"
      />
    </section>
  );
}
