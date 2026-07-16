import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Kicker from "../Kicker";
import { useLightbox } from "../Lightbox";
import { useRegisterChapterSection, useChapterTheme } from "../ChapterTheme";
import FieldNotebookMargin from "../FieldNotebookMargin";
import { notebookNotes } from "../../data/notebook";
import { chapters } from "../../data/media";

const people = chapters[5];
const [p1, p2, p3, p4, p5] = people.photos;
const EASE = [0.65, 0, 0.35, 1] as const;

// A torn bottom edge — the same ragged silhouette on every print, like
// they were all pulled from the same page of a scrapbook.
const TORN_EDGE =
  "polygon(0% 0%, 100% 0%, 100% 91%, 95% 95%, 89% 91%, 83% 96%, 77% 92%, 71% 97%, 65% 93%, 59% 96%, 53% 91%, 47% 95%, 41% 92%, 35% 97%, 29% 93%, 23% 96%, 17% 91%, 11% 95%, 5% 92%, 0% 96%)";

/** One print taped into the page — torn bottom edge, a strip of tape at
 * each top corner, its real caption scrawled underneath. Every stranger
 * gets their own moment on the page now, not a pile of them at once —
 * only the pair below is deliberately shown together. */
function ScrapPhoto({
  src,
  alt,
  caption,
  size = "md",
  rotate,
  onClick,
}: {
  src: string;
  alt: string;
  caption: string;
  size?: "sm" | "md" | "lg";
  rotate: number;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const width = size === "lg" ? "w-full max-w-[85vw] md:max-w-3xl" : size === "sm" ? "w-full max-w-[75vw] md:max-w-md" : "w-full max-w-[70vw] md:max-w-none";

  return (
    <div ref={ref} className={`relative mx-auto ${width}`}>
      <motion.div
        style={{ y }}
        initial={{ opacity: 0, y: 36, rotate: rotate + 5 }}
        whileInView={{ opacity: 1, y: 0, rotate }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <div className="relative">
          <span className="absolute -top-3 left-2 h-5 w-14 -rotate-6 bg-off-white/70 shadow-sm" />
          <span className="absolute -top-3 right-2 h-5 w-14 rotate-6 bg-off-white/70 shadow-sm" />
          <motion.div
            data-cursor-hover
            onClick={onClick}
            className="cursor-pointer bg-warm-white p-1.5 shadow-xl shadow-charcoal/25"
            style={{ clipPath: TORN_EDGE }}
            whileHover={{ scale: 1.03, zIndex: 20, transition: { duration: 0.5, ease: EASE } }}
          >
            <img src={src} alt={alt} className="w-full object-cover" style={{ aspectRatio: "4 / 5" }} />
          </motion.div>
          <p className="mt-3 max-w-70 font-hand text-xl text-charcoal/70" style={{ rotate: `${rotate * -0.4}deg` }}>
            {caption}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/** Chapter Five — People. Still a scrapbook page, not a magazine spread —
 * but now one stranger gets the page's full attention at a time. Only the
 * pair in the middle (a friend on a bridge, then the shutter catching
 * three versions of the same smile — a "wide, then a detail of the
 * moment") is shown together, deliberately. */
export default function People() {
  const open = useLightbox();
  const theme = useChapterTheme();
  const sectionRef = useRegisterChapterSection("people");
  return (
    <section
      ref={sectionRef}
      data-cursor-kind="portrait"
      className="relative w-full px-6 py-24 md:px-14 md:py-32"
      style={{ background: "linear-gradient(150deg, #cdb78d 0%, #b99d6e 55%, #ad9163 100%)" }}
    >
      <FieldNotebookMargin note={notebookNotes.people} dock="top" align="right" rotate={1} tone="light" />
      <Kicker number={people.number} accent={theme.earth}>
        {people.archiveLabel}
      </Kicker>
      <p className="mt-6 max-w-lg font-serif-display text-2xl italic text-charcoal md:text-4xl">{people.headline}</p>

      <div className="mt-20 md:mt-28">
        <ScrapPhoto src={p1.src} alt={p1.title} caption={p1.story} size="lg" rotate={-2} onClick={() => open(p1.src, p1.title)} />
      </div>

      <div className="mt-24 md:mt-32">
        <ScrapPhoto src={p2.src} alt={p2.title} caption={p2.story} size="lg" rotate={2.5} onClick={() => open(p2.src, p2.title)} />
      </div>

      <div className="mx-auto mt-24 grid max-w-3xl grid-cols-1 gap-16 sm:grid-cols-2 sm:gap-6 md:mt-32">
        <ScrapPhoto src={p3.src} alt={p3.title} caption={p3.story} size="md" rotate={-3.5} onClick={() => open(p3.src, p3.title)} />
        <ScrapPhoto src={p4.src} alt={p4.title} caption={p4.story} size="md" rotate={3} onClick={() => open(p4.src, p4.title)} />
      </div>

      <div className="mt-24 md:mt-32">
        <ScrapPhoto src={p5.src} alt={p5.title} caption={p5.story} size="sm" rotate={-2} onClick={() => open(p5.src, p5.title)} />
      </div>
    </section>
  );
}
