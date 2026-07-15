/** A specimen label — the kind of small typed card a museum pins beside a
 * print. Reveals a photo's real title and its plate number (chapter +
 * position on the roll) on hover, nothing invented. Pure CSS opacity
 * transition on a `group`-hover parent, deliberately not Framer: no
 * `repeat`, no `animate()`, nothing that touches WAAPI — this is the
 * cheapest possible way to make every photograph feel individually
 * catalogued rather than interchangeable. */
export default function PhotoLabel({
  title,
  index,
  chapterNumber,
  tone = "dark",
  note,
}: {
  title: string;
  index: number;
  chapterNumber: string;
  tone?: "dark" | "light";
  /** A real line from that photo's own story, shown as a whisper — small,
   * handwritten, and only for whoever bothers to hover long enough to
   * read it. Never invented; always the same text that's already in the
   * manifest. */
  note?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-1 px-2 py-1.5 opacity-0 backdrop-blur-[2px] transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 ${
        tone === "dark" ? "bg-ink/75 text-warm-white" : "bg-warm-white/90 text-charcoal"
      }`}
    >
      <p className="truncate font-serif-display text-[11px] italic leading-tight">{title}</p>
      <p className="mt-0.5 font-mono text-[7px] uppercase tracking-wider opacity-50">
        Plate {chapterNumber}.{String(index).padStart(2, "0")}
      </p>
      {note && <p className="mt-1 truncate font-hand text-[13px] leading-none opacity-70">{note}</p>}
    </div>
  );
}
