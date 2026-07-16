import { useRef, useState, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import Kicker from "../Kicker";
import PhotoLabel from "../PhotoLabel";
import CinematicFullscreen from "../gallery/CinematicFullscreen";
import FloatingPrint from "../gallery/FloatingPrint";
import EditorialSpread from "../gallery/EditorialSpread";
import Diptych from "../gallery/Diptych";
import ViewfinderReveal from "../gallery/ViewfinderReveal";
import BurstSequence from "../gallery/BurstSequence";
import { useLightbox } from "../Lightbox";
import { useRegisterChapterSection, useChapterTheme } from "../ChapterTheme";
import StreetsAtmosphere from "../layers/StreetsAtmosphere";
import { chapters, type Photo } from "../../data/media";
import { notebookNotes } from "../../data/notebook";

const streets = chapters[3];
const ALL = streets.photos;
const byId = (id: string): Photo => {
  const found = ALL.find((p) => p.id === id);
  if (!found) throw new Error(`Streets: missing photo ${id}`);
  return found;
};

// The single strongest frame opens the chapter full-screen; the keeper
// the editor actually circled gets pulled out and shown large at the
// close. A handful more — the strongest of a second roll shot around
// the same corners — get their own individual moments rather than
// disappearing into the sheet with everything else.
const OPENER = byId("streets-market-silhouettes");
const KEEPER = byId("streets-market-couple-b");
const BELLS = byId("streets-bells-passerby");
const WASA_PASA = byId("streets-wasapasa-shopfront");
const CORNER_CROSSING = byId("streets-corner-crossing");
const HONACHA_A = byId("streets-honacha-walker");
const HONACHA_B = byId("streets-honacha-cyclist");
// The rest of that same burst — four passersby at one corner, seconds
// apart — scrubbed through as its own sequence rather than shown all at
// once (see BurstSequence).
const BURST_FRAMES = [
  byId("streets-corner-passenger"),
  byId("streets-corner-pink-cap"),
  byId("streets-corner-yellow-cap"),
  byId("streets-corner-riders"),
];
const PULLED_IDS = new Set([OPENER, KEEPER, BELLS, WASA_PASA, CORNER_CROSSING, HONACHA_A, HONACHA_B, ...BURST_FRAMES].map((p) => p.id));
const STRIP = ALL.filter((p) => !PULLED_IDS.has(p.id));
// A real editor's pass on the remaining roll — two frames crossed out.
const REJECTED_IDS = ["streets-elder-walker", "streets-utse-tassels"];

function RejectMark() {
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-20">
      <motion.path
        d="M 12 12 L 88 88"
        stroke="#c1443a"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.65 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
      <motion.path
        d="M 88 12 L 12 88"
        stroke="#c1443a"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.65 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4, delay: 0.45 }}
      />
    </svg>
  );
}

/** Chapter Four — Streets. A contact sheet on a light table, not a
 * scrolling filmstrip. Hover any frame and a loupe follows the cursor,
 * magnifying exactly what a real loupe would; one frame from Thamel is
 * circled in grease pencil, two are crossed out — an editor's real pass
 * on a real roll shot in Kathmandu, not a gallery grid. */
export default function Streets() {
  const open = useLightbox();
  const theme = useChapterTheme();
  const sectionRef = useRegisterChapterSection("streets");
  const sheetRef = useRef<HTMLDivElement>(null);
  const [loupe, setLoupe] = useState<{ src: string; bgX: number; bgY: number } | null>(null);
  const loupeX = useMotionValue(0);
  const loupeY = useMotionValue(0);
  const springX = useSpring(loupeX, { stiffness: 500, damping: 42 });
  const springY = useSpring(loupeY, { stiffness: 500, damping: 42 });

  const { scrollYProgress } = useScroll({ target: sheetRef, offset: ["start end", "end start"] });
  const sheetRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-2.5, -1, 0.5]);

  const handleFrameMove = (e: MouseEvent<HTMLDivElement>, src: string) => {
    const frameRect = e.currentTarget.getBoundingClientRect();
    const sheetRect = sheetRef.current?.getBoundingClientRect();
    if (!sheetRect) return;
    loupeX.set(e.clientX - sheetRect.left);
    loupeY.set(e.clientY - sheetRect.top);
    setLoupe({
      src,
      bgX: ((e.clientX - frameRect.left) / frameRect.width) * 100,
      bgY: ((e.clientY - frameRect.top) / frameRect.height) * 100,
    });
  };

  return (
    <section ref={sectionRef} data-cursor-kind="rangefinder" className="relative w-full bg-ink py-24 md:py-32">
      <StreetsAtmosphere />
      <div className="mb-10 px-6 md:px-14">
        <Kicker number={streets.number} tone="light" accent={theme.earth}>
          {streets.archiveLabel}
        </Kicker>
        <motion.p
          className="mt-6 max-w-xl font-serif-display text-2xl italic text-warm-white md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1 }}
        >
          {streets.headline}
        </motion.p>
      </div>

      <CinematicFullscreen
        photo={OPENER}
        onOpen={() => open(OPENER.src, OPENER.title)}
        note={notebookNotes.streets}
        noteDock="bottom"
        noteAlign="left"
      />

      <div className="px-4 pt-20 md:px-14 md:pt-28">
        <motion.div
          ref={sheetRef}
          className="relative mx-auto max-w-4xl bg-off-white p-3 shadow-2xl shadow-black/60 md:p-6"
          style={{ rotate: sheetRotate }}
          onMouseLeave={() => setLoupe(null)}
        >
          <div className="mb-3 flex items-center justify-between px-1 font-mono text-[9px] uppercase tracking-wider text-charcoal/50">
            <span>Kathmandu &middot; Thamel</span>
            <span>{STRIP.length} Frames</span>
          </div>

          <div className="grid grid-cols-3 gap-1 sm:grid-cols-3 md:grid-cols-3">
            {STRIP.map((frame, i) => (
              <motion.div
                key={frame.id}
                data-cursor-hover
                className="group relative aspect-4/5 cursor-pointer overflow-hidden bg-soft-black"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: (i % 9) * 0.04 }}
                onMouseMove={(e) => handleFrameMove(e, frame.src)}
                onClick={() => open(frame.src, frame.title)}
              >
                <img
                  src={frame.src}
                  alt={frame.title}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale-[0.5] transition-[filter] duration-500 group-hover:grayscale-0"
                  style={{ objectPosition: frame.focalPoint }}
                />
                <span className="absolute bottom-1 right-1 z-10 bg-ink/50 px-1 font-mono text-[7px] text-warm-white/80 transition-opacity duration-300 group-hover:opacity-0">
                  {String(i + 1).padStart(2, "0")}A
                </span>
                <PhotoLabel title={frame.title} index={i + 1} chapterNumber={streets.number} tone="dark" note={frame.story} />
                {REJECTED_IDS.includes(frame.id) && <RejectMark />}
              </motion.div>
            ))}
          </div>

          {loupe && (
            <motion.div
              className="pointer-events-none absolute z-30 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-charcoal/70 shadow-2xl"
              style={{
                left: springX,
                top: springY,
                backgroundImage: `url(${loupe.src})`,
                backgroundSize: "400%",
                backgroundPosition: `${loupe.bgX}% ${loupe.bgY}%`,
              }}
            />
          )}
        </motion.div>
      </div>

      <p className="mt-6 px-6 text-center font-mono text-[9px] uppercase tracking-cinema text-warm-white/30 md:px-14">
        Hover any frame &middot; the loupe finds the grain
      </p>

      <Diptych
        a={HONACHA_A}
        b={HONACHA_B}
        relation={["I", "II"]}
        caption="The same alley, two moments apart — whatever was inside Honacha, nobody that day seemed to be going in."
        onOpenA={() => open(HONACHA_A.src, HONACHA_A.title)}
        onOpenB={() => open(HONACHA_B.src, HONACHA_B.title)}
        tone="dark"
      />

      <EditorialSpread photo={WASA_PASA} index={16} chapterNumber={streets.number} textSide="right" onOpen={() => open(WASA_PASA.src, WASA_PASA.title)} tone="dark" />
      <EditorialSpread photo={BELLS} index={17} chapterNumber={streets.number} textSide="left" onOpen={() => open(BELLS.src, BELLS.title)} tone="dark" />

      <BurstSequence
        photos={BURST_FRAMES}
        caption="Four passersby, the same corner, seconds apart — by the last frame the building had started to feel like the fixed point and everyone else like weather."
        onOpen={(p) => open(p.src, p.title)}
      />

      <ViewfinderReveal photo={CORNER_CROSSING} index={18} chapterNumber={streets.number} onOpen={() => open(CORNER_CROSSING.src, CORNER_CROSSING.title)} tone="dark" />

      {/* The one the editor actually circled, pulled off the sheet and
          given the room a keeper deserves. */}
      <FloatingPrint photo={KEEPER} index={19} chapterNumber={streets.number} onOpen={() => open(KEEPER.src, KEEPER.title)} />
    </section>
  );
}
