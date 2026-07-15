import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionTemplate, type MotionValue } from "framer-motion";
import { useCursor } from "../CursorContext";
import { useLightbox } from "../Lightbox";
import Triptych from "../gallery/Triptych";
import { useRegisterChapterSection, useChapterTheme } from "../ChapterTheme";
import FieldNotebookMargin from "../FieldNotebookMargin";
import { notebookNotes } from "../../data/notebook";
import { chapters } from "../../data/media";

const dusk = chapters[7];
const [hero, bench, dandelion, lanterns] = dusk.photos;
const LETTERS = ["D", "U", "S", "K"];
const EASE = [0.65, 0, 0.35, 1] as const;

/** One letter of the wordmark — not colored type sitting over the photo,
 * but a window cut into it. All four letters share one background image at
 * 400% width, each offset to its own slice, so together they read as one
 * continuous photograph interrupted by glass letterforms. */
function Letter({
  char,
  index,
  bgY,
  tiltX,
  tiltY,
}: {
  char: string;
  index: number;
  bgY: MotionValue<number>;
  tiltX: MotionValue<number>;
  tiltY: MotionValue<number>;
}) {
  const bgPos = useMotionTemplate`${(index / (LETTERS.length - 1)) * 100}% ${bgY}%`;
  return (
    <motion.span
      className="inline-block select-none bg-cover font-serif-display text-[26vw] font-semibold italic leading-none md:text-[19vw]"
      style={{
        backgroundImage: `url(${hero.src})`,
        backgroundSize: "400% 100%",
        backgroundPosition: bgPos,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        rotateX: tiltX,
        rotateY: tiltY,
      }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1, delay: index * 0.08, ease: EASE }}
    >
      {char}
    </motion.span>
  );
}

/** Chapter Seven — Dusk. The headline isn't printed over the photograph,
 * it's cut out of it: four letterforms sharing one continuous slice of the
 * silhouette-and-sky photograph, tilting slightly toward the cursor like
 * glass panes. The rest of the day's last light — a bench, a field, paper
 * lanterns — sits underneath as a quiet close to the roll. */
export default function Dusk() {
  const open = useLightbox();
  const theme = useChapterTheme();
  const sectionRef = useRegisterChapterSection("dusk");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [35, 65]);
  const { x, y } = useCursor();
  const tiltX = useTransform(y, [-1, 1], [6, -6]);
  const tiltY = useTransform(x, [-1, 1], [-6, 6]);

  return (
    <section ref={sectionRef} data-cursor-kind="photo" className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-ink py-24">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${hero.src})`, backgroundSize: "cover" }} />
      <FieldNotebookMargin note={notebookNotes.dusk} dock="top" align="left" rotate={1.5} tone="dark" />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-warm-white/10"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.2, ease: EASE }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[40%] h-px bg-warm-white/10"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.2, delay: 0.15, ease: EASE }}
      />

      <motion.div
        className="pointer-events-none absolute inset-y-0 z-10 w-[45vw] -skew-x-12"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.highlight}33, transparent)` }}
        initial={{ opacity: 0, left: "-50%" }}
        whileInView={{ opacity: [0, 1, 0], left: "105%" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 2.6, delay: 0.7, ease: "easeInOut" }}
      />

      <div
        data-cursor-hover
        onClick={() => open(hero.src, hero.title)}
        className="relative z-10 flex cursor-pointer items-center justify-center"
        style={{ perspective: 1400 }}
      >
        {LETTERS.map((char, i) => (
          <Letter key={i} char={char} index={i} bgY={bgY} tiltX={tiltX} tiltY={tiltY} />
        ))}
      </div>

      <motion.p
        className="pointer-events-none relative z-10 mt-6 font-mono text-[9px] uppercase tracking-cinema text-warm-white/40"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.5 }}
      >
        Chapter {dusk.number} &middot; {dusk.name}
      </motion.p>

      <div className="relative z-10 mt-16 w-full">
        <Triptych
          photos={[bench, dandelion, lanterns]}
          caption="Whoever sat there last left before the good light arrived — by the time the lanterns came on, the street had already changed hands."
          onOpen={(p) => open(p.src, p.title)}
        />
      </div>
    </section>
  );
}
