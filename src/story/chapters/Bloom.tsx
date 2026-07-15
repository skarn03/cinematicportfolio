import { useEffect, useState } from "react";
import { motion, useTransform } from "framer-motion";
import ParallaxLayer from "../ParallaxLayer";
import { useLightbox } from "../Lightbox";
import { useCursor } from "../CursorContext";
import { useRegisterChapterSection, useChapterTheme } from "../ChapterTheme";
import BloomAtmosphere from "../layers/BloomAtmosphere";
import MuseumWall from "../gallery/MuseumWall";
import OversizedCrop from "../gallery/OversizedCrop";
import EditorialSpread from "../gallery/EditorialSpread";
import Triptych from "../gallery/Triptych";
import FloatingPrint from "../gallery/FloatingPrint";
import CinematicFullscreen from "../gallery/CinematicFullscreen";
import FieldNotebookMargin from "../FieldNotebookMargin";
import { notebookNotes } from "../../data/notebook";
import { chapters, ambientVideo } from "../../data/media";

const bloom = chapters[0];
const [hero, blossomInHand, canopySky, girlAndDog, treeA, treeB, treeC, fountain, reachLake] = bloom.photos;
const EASE = [0.65, 0, 0.35, 1] as const;

function Bracket({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const pos =
    corner === "tl"
      ? "left-0 top-0 border-l border-t"
      : corner === "tr"
        ? "right-0 top-0 border-r border-t"
        : corner === "bl"
          ? "left-0 bottom-0 border-l border-b"
          : "right-0 bottom-0 border-r border-b";
  return (
    <motion.span
      className={`absolute h-6 w-6 border-warm-white/70 ${pos}`}
      initial={{ opacity: 0, scale: 1.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
    />
  );
}

/** Chapter One — Bloom. Opens exactly like the camera that fell into it: a
 * viewfinder holding one photograph, corner brackets, an exposure readout,
 * a focus point that tracks the cursor. The rest of the roll — eight more
 * frames from the same spring — drifts below it like prints spread out to
 * dry, each at its own depth and angle. */
export default function Bloom() {
  const open = useLightbox();
  const { x, y } = useCursor();
  const theme = useChapterTheme();
  const sectionRef = useRegisterChapterSection("bloom");
  const focusLeft = useTransform(x, [-1, 1], ["18%", "82%"]);
  const focusTop = useTransform(y, [-1, 1], ["18%", "82%"]);
  // The hero photograph "wakes up" a few seconds after it first appears —
  // not by faking motion inside the frame (nothing in it actually moves),
  // but by letting the whole image breathe: a very slow, never-repeating
  // zoom, the ambient texture layer quietly deepening, and one soft pass
  // of light. It should feel like a memory settling in, not a video
  // starting.
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAwake(true), 3400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={sectionRef} data-cursor-kind="photo" className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-ink pt-6 md:pt-12">
      <BloomAtmosphere />
      <div className="relative flex w-full flex-1 items-center justify-center p-6 md:p-12">
        <FieldNotebookMargin note={notebookNotes.bloom} dock="bottom" align="right" rotate={-1.5} tone="dark" />
        <motion.div
          className="pointer-events-none absolute left-6 top-6 z-20 md:left-12 md:top-12"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        >
          <p className="font-serif-display text-sm italic tracking-wide text-warm-white/90">Saika Cinematics</p>
          <p className="mt-1 text-[9px] uppercase tracking-cinema text-warm-white/40">Chapter {bloom.number} &middot; {bloom.name}</p>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute right-6 top-6 z-20 text-right font-mono text-[10px] text-warm-white/50 md:right-12 md:top-12"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
        >
          <p>f/2.8</p>
          <p>1/125</p>
          <p className="flex items-center justify-end gap-1.5">
            ISO 200
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: theme.earth }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </p>
        </motion.div>

        <motion.p
          className="pointer-events-none absolute bottom-6 left-6 z-20 font-mono text-[10px] text-warm-white/40 md:bottom-12 md:left-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          01 / {String(bloom.photos.length).padStart(2, "0")}
        </motion.p>

        <motion.div
          className="relative h-[68vh] w-full max-w-5xl overflow-hidden md:h-[74vh]"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(75% at 50% 50%)" }}
            transition={{ duration: 1.5, delay: 0.55, ease: EASE }}
          >
            <ParallaxLayer strength={0.08} className="absolute inset-0">
              <motion.img
                data-cursor-hover
                src={hero.src}
                alt={hero.title}
                onClick={() => open(hero.src, hero.title)}
                className="h-full w-full cursor-pointer object-cover"
                style={{ objectPosition: hero.focalPoint }}
                initial={{ scale: 1.15 }}
                animate={{ scale: awake ? 1.05 : 1 }}
                transition={awake ? { duration: 22, ease: "linear" } : { duration: 2.4, delay: 0.55, ease: EASE }}
              />
            </ParallaxLayer>
            <motion.video
              className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-screen"
              style={{ opacity: awake ? 0.22 : 0.12 }}
              transition={{ duration: 3, ease: EASE }}
              src={ambientVideo}
              autoPlay
              muted
              loop
              playsInline
            />
            {/* One soft pass of light, the moment the photograph wakes —
                never repeats. */}
            <motion.div
              className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-warm-white/15 to-transparent"
              initial={{ left: "-40%", opacity: 0 }}
              animate={awake ? { left: "110%", opacity: [0, 1, 0] } : {}}
              transition={{ duration: 2.2, ease: "easeInOut" }}
            />
            <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-ink/60" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: "repeating-linear-gradient(0deg, #000 0px, transparent 1px, transparent 3px)" }}
            />
          </motion.div>

          <Bracket corner="tl" />
          <Bracket corner="tr" />
          <Bracket corner="bl" />
          <Bracket corner="br" />

          <motion.div
            className="pointer-events-none absolute z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-sm border"
            style={{ left: focusLeft, top: focusTop, borderColor: theme.earth }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 bg-ink/70 px-5 py-4 backdrop-blur-sm md:px-8 md:py-5"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 1.5, ease: EASE }}
          >
            <p className="max-w-xl font-serif-display text-2xl italic leading-snug text-warm-white md:text-4xl">{bloom.headline}</p>
          </motion.div>
        </motion.div>
      </div>

      {/* The rest of the roll — one photograph at a time, each in its own
          format. Only the three tree frames (a genuine sequence: "a step
          closer... a step further") are shown together, as a triptych. */}
      <MuseumWall photo={blossomInHand} index={2} chapterNumber={bloom.number} glow={bloom.palette.accent} onOpen={() => open(blossomInHand.src, blossomInHand.title)} />
      <OversizedCrop photo={canopySky} onOpen={() => open(canopySky.src, canopySky.title)} />
      <EditorialSpread photo={girlAndDog} index={4} chapterNumber={bloom.number} textSide="right" onOpen={() => open(girlAndDog.src, girlAndDog.title)} />
      <Triptych
        photos={[treeA, treeB, treeC]}
        caption="The same tree, three times — by the third frame it stopped being a photograph of a tree."
        onOpen={(p) => open(p.src, p.title)}
      />
      <FloatingPrint photo={fountain} index={8} chapterNumber={bloom.number} onOpen={() => open(fountain.src, fountain.title)} />
      <CinematicFullscreen photo={reachLake} onOpen={() => open(reachLake.src, reachLake.title)} />
    </section>
  );
}
