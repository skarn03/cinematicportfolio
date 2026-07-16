import { motion } from "framer-motion";

const EASE = [0.65, 0, 0.35, 1] as const;

export type NotebookNote = {
  /** chapter or frame title, set in the handwritten font */
  heading: string;
  /** only ever a real, visually-verifiable place — omit rather than guess */
  place?: string;
  /** date · time · lens · aperture · ISO — atmosphere, not a factual EXIF
   * claim (no real EXIF survives on any file here); an explicit, one-time
   * exception to the "never invent specifics" rule, scoped to exactly this
   * decorative line */
  metadata?: string;
  /** one to three short observational lines, written around the photo, not about it */
  lines: string[];
  /** e.g. "01 / 09" — position within this chapter's own roll */
  frame: string;
};

/** A page torn from the notebook actually carried on the walk. Pinned to a
 * corner of a hero image like a margin note, not a caption sitting under it.
 * `dock`/`align` let every chapter place it somewhere different — top-left,
 * bottom-right, wherever the photograph has room to breathe. */
export default function FieldNotebookMargin({
  note,
  dock = "bottom",
  align = "left",
  rotate = -1.2,
  tone = "dark",
  className = "",
}: {
  note: NotebookNote;
  dock?: "top" | "bottom";
  align?: "left" | "right";
  rotate?: number;
  tone?: "dark" | "light";
  className?: string;
}) {
  const dockClass = dock === "top" ? "top-6 md:top-10" : "bottom-6 md:bottom-10";
  const alignClass = align === "left" ? "left-6 md:left-10 items-start text-left" : "right-6 md:right-10 items-end text-right";
  const panel =
    tone === "dark"
      ? "bg-ink/55 text-warm-white/90 backdrop-blur-sm"
      : "bg-warm-white/70 text-charcoal/90 backdrop-blur-sm";
  const dim = tone === "dark" ? "text-warm-white/45" : "text-charcoal/45";

  return (
    <motion.div
      className={`pointer-events-none absolute z-20 flex max-w-[13rem] flex-col gap-1.5 px-4 py-3 md:max-w-[15rem] ${dockClass} ${alignClass} ${panel} ${className}`}
      style={{ rotate: `${rotate}deg` }}
      initial={{ opacity: 0, y: dock === "top" ? -10 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
    >
      <p className="font-hand text-2xl leading-none">{note.heading}</p>
      {note.place && <p className={`text-[10px] uppercase tracking-cinema ${dim}`}>{note.place}</p>}
      {note.metadata && <p className={`font-mono text-[9px] tracking-wide ${dim}`}>{note.metadata}</p>}
      <div className="mt-1 flex flex-col gap-0.5">
        {note.lines.map((line, i) => (
          <p key={i} className="font-hand text-lg leading-tight">
            {line}
          </p>
        ))}
      </div>
      <p className={`mt-1 font-mono text-[9px] tracking-wide ${dim}`}>FRAME {note.frame}</p>
    </motion.div>
  );
}
