import { useRef, useState, type MouseEvent } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import Kicker from "../Kicker";
import { useLightbox } from "../Lightbox";
import { useRegisterChapterSection, useChapterTheme } from "../ChapterTheme";
import ReflectionsAtmosphere from "../layers/ReflectionsAtmosphere";
import FieldNotebookMargin from "../FieldNotebookMargin";
import GlassCase from "../gallery/GlassCase";
import { notebookNotes } from "../../data/notebook";
import { chapters } from "../../data/media";

const reflections = chapters[1];
const [printA, printB] = reflections.photos;
const EASE = [0.65, 0, 0.35, 1] as const;

/** A print resolving out of the developer bath — inverted and flat at the
 * edge of the viewport, full color and contrast only once it's actually
 * been "in the tray" long enough. Scroll IS the development timer.
 *
 * Once it's developed, the water this chapter is named for gets one more
 * moment: hovering the print itself ripples it, as if the surface were
 * still wet — an SVG `feTurbulence`/`feDisplacementMap` filter (defined
 * once, below), revealed only in a soft circle that follows the cursor. A
 * second, filtered copy of the same image crossfades in under a plain CSS
 * opacity transition, so the reveal itself stays smooth without animating
 * anything inside the filter. */
function DevelopingPrint({
  src,
  alt,
  story,
  onClick,
  rotate,
  delay,
}: {
  src: string;
  alt: string;
  story: string;
  onClick: () => void;
  rotate: number;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "start 25%"] });
  const invert = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const grayscale = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const contrast = useTransform(scrollYProgress, [0, 1], [2.4, 1]);
  const filter = useMotionTemplate`invert(${invert}) grayscale(${grayscale}) contrast(${contrast})`;
  const imgOpacity = useTransform(scrollYProgress, [0, 0.12], [0, 1]);
  const sheen = useTransform(scrollYProgress, [0, 0.6, 1], ["-40%", "60%", "140%"]);

  const [ripplePos, setRipplePos] = useState({ x: 50, y: 50 });
  const [rippling, setRippling] = useState(false);
  const handleRippleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };
  const rippleMask = `radial-gradient(circle 90px at ${ripplePos.x}% ${ripplePos.y}%, black, transparent 72%)`;

  return (
    <motion.div
      ref={ref}
      data-cursor-hover
      className="relative w-full max-w-[85vw] cursor-pointer overflow-hidden bg-black/50 p-3 shadow-2xl shadow-black/70 md:max-w-[38vw]"
      style={{ rotate }}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      onClick={onClick}
    >
      <div className="pointer-events-none absolute inset-0 z-10 ring-1 ring-inset ring-[#8aa898]/30" />
      <div
        className="relative overflow-hidden"
        onMouseMove={handleRippleMove}
        onMouseEnter={() => setRippling(true)}
        onMouseLeave={() => setRippling(false)}
      >
        <motion.img src={src} alt={alt} loading="lazy" className="aspect-4/5 w-full object-cover" style={{ filter, opacity: imgOpacity }} />
        <img
          src={src}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 aspect-4/5 h-full w-full object-cover transition-opacity duration-500"
          style={{
            filter: "url(#reflections-ripple-filter)",
            opacity: rippling ? 0.85 : 0,
            WebkitMaskImage: rippleMask,
            maskImage: rippleMask,
          }}
        />
        <motion.div
          className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
          style={{ left: sheen, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)" }}
        />
      </div>
      <p className="mt-2 px-1 font-serif-display text-sm italic text-warm-white/60">{story}</p>
    </motion.div>
  );
}

function TimerDial({ tint }: { tint: string }) {
  return (
    <motion.div
      className="relative h-16 w-16 shrink-0 rounded-full border border-warm-white/15"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1, delay: 0.4 }}
    >
      <motion.div
        className="absolute left-1/2 top-1/2 h-6 w-px origin-bottom -translate-x-1/2 -translate-y-full"
        style={{ backgroundColor: tint }}
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[8px] text-warm-white/40">3:00</span>
    </motion.div>
  );
}

/** Chapter Two — Reflections. The two quietest photographs in the whole
 * collection get the quietest treatment: a darkroom, not a moody video
 * loop. Both prints resolve out of the developer bath as the visitor
 * scrolls past them, under a cool tray-light rather than the traditional
 * red — these are daylight reflections, not night film, and the tint says
 * so. */
export default function Reflections() {
  const open = useLightbox();
  const theme = useChapterTheme();
  const sectionRef = useRegisterChapterSection("reflections");
  const tint = "#8aa898";

  return (
    <section ref={sectionRef} data-cursor-kind="photo" className="relative min-h-screen w-full overflow-hidden py-24 md:py-32" style={{ background: "#0c1513" }}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="reflections-ripple-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="7" result="ripple-noise" />
            <feDisplacementMap in="SourceGraphic" in2="ripple-noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <ReflectionsAtmosphere />
      <FieldNotebookMargin note={notebookNotes.reflections} dock="top" align="right" rotate={1} tone="dark" />
      <motion.div
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full blur-[110px]"
        style={{ background: `radial-gradient(circle, ${tint}55, transparent 70%)` }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 px-6 md:px-14">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Kicker number={reflections.number} tone="light" accent={theme.earth}>
            {reflections.archiveLabel}
          </Kicker>
          <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-wider" style={{ color: `${tint}cc` }}>
            <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: tint }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
            Tray Light On
          </span>
        </div>
        <motion.p
          className="mt-6 max-w-md font-serif-display text-2xl italic text-warm-white md:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9 }}
        >
          {reflections.headline}
        </motion.p>
        {/* The headline's own reflection — a mirrored duplicate fading
            into the dark below it, the same idea as the two prints above,
            just applied to type instead of a photograph. */}
        <motion.p
          aria-hidden
          className="pointer-events-none max-w-md scale-y-[-1] transform-gpu font-serif-display text-2xl italic text-warm-white/25 blur-[1px] md:text-4xl"
          style={{ maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 75%)", WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 75%)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          {reflections.headline}
        </motion.p>
      </div>

      <div className="relative z-10 mt-16 flex flex-col items-center gap-14 px-6 md:mt-24 md:flex-row md:items-start md:justify-center md:gap-12 md:px-14">
        <DevelopingPrint src={printA.src} alt={printA.title} story={printA.story} onClick={() => open(printA.src, printA.title)} rotate={-3} delay={0} />
      </div>

      <div className="relative z-10 mt-16 flex items-center justify-center gap-3 md:mt-20">
        <TimerDial tint={tint} />
        <p className="font-mono text-[8px] uppercase tracking-wider text-warm-white/30">Developer &middot; 20&deg;C</p>
      </div>

      {/* The second print doesn't develop in the tray with the first — it's
          already dry, already under glass, its own kind of stillness. */}
      <GlassCase photo={printB} index={2} chapterNumber={reflections.number} onOpen={() => open(printB.src, printB.title)} tone="dark" />
    </section>
  );
}
