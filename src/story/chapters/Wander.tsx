import { motion, useScroll, useVelocity, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import LightLeak from "../LightLeak";
import WaterWipe from "../WaterWipe";
import GalleryHang from "../gallery/GalleryHang";
import Diptych from "../gallery/Diptych";
import EditorialSpread from "../gallery/EditorialSpread";
import CinematicFullscreen from "../gallery/CinematicFullscreen";
import { useLightbox } from "../Lightbox";
import { useRegisterChapterSection } from "../ChapterTheme";
import WanderAtmosphere from "../layers/WanderAtmosphere";
import FieldNotebookMargin from "../FieldNotebookMargin";
import { notebookNotes } from "../../data/notebook";
import { chapters } from "../../data/media";

const wander = chapters[2];
const [hero, forestPath, boardwalkA, boardwalkB, pergola, pineLake] = wander.photos;
const MARKS = [
  { top: "8%", left: "6%" },
  { top: "14%", left: "92%" },
  { top: "88%", left: "10%" },
  { top: "80%", left: "94%" },
];

function RegistrationMark({ top, left }: { top: string; left: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="absolute opacity-20" style={{ top, left }}>
      <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <line x1="9" y1="0" x2="9" y2="18" stroke="currentColor" strokeWidth="0.6" />
      <line x1="0" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}

/** Chapter Three — Wander. The word is the design: a photograph of the
 * golden-hour lake plays literally inside the letterforms of "WANDER" (an
 * SVG text mask, the same technique that used to hold video, now holding a
 * still), and the whole wordmark blurs in proportion to how fast the
 * visitor is actually scrolling. The rest of the roll reads as a strip of
 * evidence underneath — footsteps, boardwalks, a kayak — rather than a
 * gallery grid. */
export default function Wander() {
  const open = useLightbox();
  const sectionRef = useRegisterChapterSection("wander");
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { stiffness: 300, damping: 40 });
  const blurAmount = useTransform(smoothVelocity, (v) => Math.min(Math.abs(v) / 60, 14));
  const skewAmount = useTransform(smoothVelocity, (v) => Math.max(-8, Math.min(8, v / 180)));
  const typeFilter = useMotionTemplate`blur(${blurAmount}px)`;
  const { scrollYProgress: wipeProgress } = useScroll({ target: sectionRef, offset: ["start end", "start start"] });

  return (
    <section ref={sectionRef} data-cursor-kind="map" className="relative w-full overflow-hidden bg-warm-white py-24 md:py-32">
      <LightLeak />
      <WanderAtmosphere />
      <WaterWipe progress={wipeProgress} />
      <FieldNotebookMargin note={notebookNotes.wander} dock="top" align="left" rotate={-1} tone="light" />
      {MARKS.map((m, i) => (
        <RegistrationMark key={i} top={m.top} left={m.left} />
      ))}

      <div
        className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 font-mono text-[10px] uppercase tracking-cinema text-charcoal/30 md:block"
        style={{ writingMode: "vertical-rl" }}
      >
        {wander.archiveLabel}
      </div>

      <motion.div
        className="relative mx-auto aspect-1000/260 w-full max-w-6xl px-4"
        style={{ filter: typeFilter, skewX: skewAmount }}
        initial={{ opacity: 0, scale: 1.06 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
      >
        <svg width="0" height="0" className="absolute">
          <defs>
            <mask id="wander-text-mask" maskContentUnits="objectBoundingBox">
              <rect width="1" height="1" fill="black" />
              <g transform="translate(0.5, 0.66) scale(0.26, 1) translate(-0.5, -0.66)">
                <text x="0.5" y="0.66" textAnchor="middle" fontSize="0.56" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontWeight="600" fill="white">
                  WANDER
                </text>
              </g>
            </mask>
          </defs>
        </svg>
        <img
          src={hero.src}
          alt={hero.title}
          className="h-full w-full object-cover"
          style={{
            objectPosition: hero.focalPoint,
            WebkitMaskImage: "url(#wander-text-mask)",
            maskImage: "url(#wander-text-mask)",
          }}
        />
      </motion.div>

      <motion.p
        className="mx-auto mt-8 max-w-lg px-6 text-center font-serif-display text-2xl italic text-charcoal md:text-4xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        {wander.headline}
      </motion.p>

      <div className="mt-16 md:mt-24">
        <GalleryHang photo={forestPath} index={2} chapterNumber={wander.number} onOpen={() => open(forestPath.src, forestPath.title)} tone="light" />
        <Diptych
          a={boardwalkA}
          b={boardwalkB}
          relation={["I", "II"]}
          caption="The same bridge, two steps apart — every ten steps the light changed its mind about the season."
          onOpenA={() => open(boardwalkA.src, boardwalkA.title)}
          onOpenB={() => open(boardwalkB.src, boardwalkB.title)}
          tone="light"
        />
        <EditorialSpread photo={pergola} index={5} chapterNumber={wander.number} textSide="left" onOpen={() => open(pergola.src, pergola.title)} tone="light" />
        <CinematicFullscreen photo={pineLake} onOpen={() => open(pineLake.src, pineLake.title)} />
      </div>
    </section>
  );
}
