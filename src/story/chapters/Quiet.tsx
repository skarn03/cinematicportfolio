import { motion } from "framer-motion";
import { useLightbox } from "../Lightbox";
import { useRegisterChapterSection, useChapterTheme } from "../ChapterTheme";
import FieldNotebookMargin from "../FieldNotebookMargin";
import LightTable from "../gallery/LightTable";
import { notebookNotes } from "../../data/notebook";
import { chapters } from "../../data/media";

const quiet = chapters[6];
const [primary, secondary, tertiary, quaternary] = quiet.photos;
const EASE = [0.65, 0, 0.35, 1] as const;
const RULED_PAPER = { backgroundImage: "repeating-linear-gradient(180deg, transparent 0px, transparent 33px, rgba(58,50,38,0.055) 34px)" };

/** Four paper-corner mounts, the way prints were held in an album before
 * adhesive existed. */
function PhotoCorners() {
  const base = "absolute z-10 h-5 w-5 bg-warm-white shadow-sm md:h-6 md:w-6";
  return (
    <>
      <span className={`${base} left-0 top-0`} style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
      <span className={`${base} right-0 top-0`} style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
      <span className={`${base} bottom-0 left-0`} style={{ clipPath: "polygon(0 100%, 100% 100%, 0 0)" }} />
      <span className={`${base} bottom-0 right-0`} style={{ clipPath: "polygon(100% 100%, 0 100%, 100% 0)" }} />
    </>
  );
}

function CoffeeRing({ className }: { className: string }) {
  return (
    <div className={`pointer-events-none absolute rounded-full border-[7px] border-[#8a6a3f]/[0.08] ${className}`}>
      <div className="absolute -inset-1.5 rounded-full border border-[#8a6a3f]/[0.06]" />
    </div>
  );
}

function SpiralBinding() {
  return (
    <div className="pointer-events-none absolute -left-3 top-8 bottom-8 flex flex-col justify-between md:-left-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="h-3 w-3 rounded-full border-2 border-charcoal/15 bg-warm-white shadow-sm" />
      ))}
    </div>
  );
}

/** Chapter Six — Quiet. Not one crowded notebook page anymore — three,
 * turned one at a time. The first holds a single interior, alone, the way
 * the rest of this chapter's silence deserves. The second pairs a print
 * with its own handwritten note. The third is a single small photograph
 * tucked into the very last page. */
export default function Quiet() {
  const open = useLightbox();
  const theme = useChapterTheme();
  const sectionRef = useRegisterChapterSection("quiet");
  return (
    <section ref={sectionRef} data-cursor-kind="journal" className="relative flex w-full flex-col items-center gap-16 overflow-hidden bg-charcoal px-6 py-20 md:gap-24 md:px-12 md:py-28">
      {/* Page one — the primary interior, alone. */}
      <motion.div
        className="relative w-full max-w-2xl bg-warm-white p-8 shadow-2xl shadow-black/50 md:p-14"
        style={RULED_PAPER}
        initial={{ opacity: 0, y: 30, rotate: -0.6 }}
        whileInView={{ opacity: 1, y: 0, rotate: -0.6 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <SpiralBinding />
        <CoffeeRing className="right-10 top-6 h-16 w-16 md:right-16 md:top-10" />

        <motion.p className="relative font-mono text-[9px] uppercase tracking-cinema" style={{ color: theme.earth }}>
          {quiet.archiveLabel}
        </motion.p>
        <motion.p
          className="relative mt-5 max-w-md font-serif-display text-2xl italic text-charcoal md:text-4xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          {quiet.headline}
        </motion.p>

        <motion.div
          className="relative mx-auto mt-12 max-w-md"
          initial={{ opacity: 0, y: 24, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
        >
          <div data-cursor-hover onClick={() => open(primary.src, primary.title)} className="relative cursor-pointer p-1.5">
            <PhotoCorners />
            <img src={primary.src} alt={primary.title} loading="lazy" className="aspect-4/5 w-full object-cover shadow-lg shadow-charcoal/20" style={{ objectPosition: primary.focalPoint }} />
            <FieldNotebookMargin note={notebookNotes.quiet} dock="top" align="right" rotate={-1.5} tone="dark" />
          </div>
          <p className="mt-3 -rotate-1 font-hand text-xl text-charcoal/70">{primary.story}</p>
        </motion.div>
      </motion.div>

      {/* Page two — a print, and the note beside it. */}
      <motion.div
        className="relative w-full max-w-2xl bg-warm-white p-8 shadow-2xl shadow-black/50 md:p-14"
        style={RULED_PAPER}
        initial={{ opacity: 0, y: 30, rotate: 0.5 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0.5 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <SpiralBinding />
        <div className="relative mx-auto max-w-sm">
          <motion.div
            className="relative bg-off-white p-5 shadow-xl shadow-charcoal/15"
            initial={{ opacity: 0, y: 20, rotate: -6 }}
            whileInView={{ opacity: 1, y: 0, rotate: -2 }}
            whileHover={{ rotate: 0, scale: 1.03, boxShadow: "0 20px 40px rgba(58,50,38,0.3)", transition: { duration: 0.5, ease: EASE } }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          >
            <motion.p
              className="overflow-hidden font-hand text-xl leading-tight text-charcoal/80"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ clipPath: "inset(0 0% 0 0)" }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.1, delay: 0.5, ease: "easeInOut" }}
            >
              {tertiary.story}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* The second print doesn't sit taped to the page — it rests on the
          light table instead, the way the quietest print of the four
          deserves a moment of actual inspection. */}
      <LightTable photos={[secondary]} onOpen={() => open(secondary.src, secondary.title)} tone="dark" />

      {/* Page three — a small photograph, tucked into the last page. */}
      <motion.div
        className="relative w-full max-w-xs bg-warm-white p-6 shadow-2xl shadow-black/50"
        style={RULED_PAPER}
        initial={{ opacity: 0, y: 30, rotate: -1 }}
        whileInView={{ opacity: 1, y: 0, rotate: -1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-7 w-7 bg-[#e8dfc8] shadow-[-2px_-2px_5px_rgba(0,0,0,0.15)]"
          style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
        />
        <div data-cursor-hover onClick={() => open(quaternary.src, quaternary.title)} className="relative cursor-pointer p-1">
          <PhotoCorners />
          <img
            src={quaternary.src}
            alt={quaternary.title}
            loading="lazy"
            className="aspect-4/5 w-full object-cover shadow-lg shadow-charcoal/20"
            style={{ objectPosition: quaternary.focalPoint }}
          />
        </div>
        <p className="relative mt-6 text-center font-mono text-[9px] tracking-cinema text-charcoal/30">&mdash; {quiet.number} &mdash;</p>
      </motion.div>
    </section>
  );
}
