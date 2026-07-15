/** The one thing every museum-mode format shares: a small typed card,
 * silent until hovered. Museums don't caption a photograph before you've
 * looked at it — the title fades in only once you're already standing in
 * front of it. Full story text lives in the Lightbox, one click further
 * in, never here. */
export default function MuseumLabel({
  title,
  index,
  chapterNumber,
  tone = "dark",
  align = "left",
}: {
  title: string;
  index: number;
  chapterNumber: string;
  tone?: "dark" | "light";
  align?: "left" | "right";
}) {
  return (
    <div
      className={`pointer-events-none max-w-70 opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100 ${
        align === "right" ? "text-right" : "text-left"
      } ${tone === "dark" ? "text-warm-white" : "text-charcoal"}`}
    >
      <p className="font-serif-display text-lg italic leading-tight">{title}</p>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-cinema opacity-45">
        {chapterNumber}.{String(index).padStart(2, "0")}
      </p>
    </div>
  );
}
