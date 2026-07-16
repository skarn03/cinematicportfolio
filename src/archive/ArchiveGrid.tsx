import { motion } from "framer-motion";
import { chapterById, chapters, type Photo, type Film } from "../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

export type GridEntry = { kind: "photo"; photo: Photo } | { kind: "video"; film: Film };
type DisplayItem = GridEntry | { kind: "quote"; text: string };

export type ArchiveView = "curated" | "contact-sheet";

// A repeating rhythm, not a random one — the same statement piece recurs
// every 8–10 images instead of the grid ever reading as uniform squares.
const SPAN_PATTERN = ["hero", "", "", "tall", "", "", "wide", "", "", ""] as const;
const SPAN_CLASS: Record<(typeof SPAN_PATTERN)[number], string> = {
  hero: "col-span-2 row-span-2",
  tall: "row-span-2",
  wide: "col-span-2",
  "": "",
};

type Border = "none" | "museum" | "print" | "negative" | "polaroid";
const BORDER_CYCLE: Border[] = ["none", "museum", "print", "negative", "polaroid"];

function frameLabel(photo: Photo): string {
  const chapter = chapterById(photo.chapter);
  const position = chapter.photos.findIndex((p) => p.id === photo.id) + 1;
  return `${chapter.name.toUpperCase()} · ${String(position).padStart(2, "0")}`;
}

function Sprockets() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-1 pt-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className="h-1 w-0.5 rounded-[1px] bg-ink/70" />
      ))}
    </div>
  );
}

function PhotoCell({
  photo,
  index,
  view,
  onOpen,
}: {
  photo: Photo;
  index: number;
  view: ArchiveView;
  onOpen: () => void;
}) {
  const border = view === "curated" ? BORDER_CYCLE[index % BORDER_CYCLE.length] : "none";
  const rotate = index % 2 === 0 ? -1 : 1;
  const stagger = view === "curated" ? [0, 10, -6][index % 3] : 0;

  const frame = (
    <img
      src={photo.src}
      alt={photo.title}
      loading="lazy"
      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${view === "contact-sheet" ? "aspect-4/5" : ""}`}
      style={{ objectPosition: photo.focalPoint }}
    />
  );

  const wrapped =
    border === "print" ? (
      <div className="h-full w-full bg-warm-white p-2">{frame}</div>
    ) : border === "polaroid" ? (
      <div className="h-full w-full bg-warm-white p-1.5 pb-5">{frame}</div>
    ) : border === "negative" ? (
      <div className="relative h-full w-full border border-ink/80 bg-ink">
        <Sprockets />
        {frame}
      </div>
    ) : border === "museum" ? (
      <div className="h-full w-full ring-1 ring-inset ring-warm-white/25">{frame}</div>
    ) : (
      frame
    );

  return (
    <motion.button
      type="button"
      data-cursor-hover
      onClick={onOpen}
      className={`group relative w-full cursor-pointer overflow-hidden bg-soft-black text-left ${view === "contact-sheet" ? "aspect-4/5" : "h-full"}`}
      style={{ y: stagger }}
      whileHover={{
        y: stagger - 6,
        rotate: view === "curated" ? rotate : 0,
        boxShadow: "0 20px 45px -12px rgba(0,0,0,0.65)",
        transition: { duration: 0.35, ease: EASE },
      }}
    >
      {wrapped}
      {/* the spotlight — a soft glow that only appears on hover, as if a
          light found this one print on the wall */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle at 50% 35%, rgba(255,235,190,0.14), transparent 65%)" }}
      />
      <div className="pointer-events-none absolute left-1.5 top-1.5 font-mono text-[7px] uppercase tracking-wider text-warm-white/35 transition-colors duration-300 group-hover:text-warm-white/70">
        {frameLabel(photo)}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/90 to-transparent px-2 pb-2 pt-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="font-mono text-[7px] uppercase tracking-cinema text-warm-white/50">Curator&rsquo;s Note</p>
        <p className="mt-1 line-clamp-3 font-serif-display text-xs italic text-warm-white/90">{photo.story}</p>
      </div>
    </motion.button>
  );
}

function VideoCell({ film, view, onOpen }: { film: Film; view: ArchiveView; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      data-cursor-hover
      onClick={onOpen}
      className={`group relative w-full cursor-pointer overflow-hidden border border-warm-white/25 bg-soft-black text-left ${view === "contact-sheet" ? "aspect-4/5" : "h-full"}`}
      whileHover={{ boxShadow: "0 20px 45px -12px rgba(0,0,0,0.65)", transition: { duration: 0.35, ease: EASE } }}
    >
      <img src={film.poster} alt={`${film.title} — poster`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      <Sprockets />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/90 via-ink/40 to-transparent px-3 pb-3 pt-10">
        <p className="font-mono text-[8px] uppercase tracking-cinema text-warm-white/60">Film</p>
        <p className="mt-0.5 truncate font-serif-display text-sm italic text-warm-white">{film.title}</p>
      </div>
    </motion.button>
  );
}

function QuoteBreak({ text }: { text: string }) {
  return (
    <div className="col-span-full flex items-center justify-center px-6 py-14 md:py-20">
      <p className="max-w-2xl text-center font-serif-display text-2xl italic leading-snug text-warm-white/70 md:text-3xl">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}

/** The actual browsing surface. Contact Sheet is the fast, uniform mode;
 * Curated interleaves a repeating hero rhythm, staggered rows, varied
 * print treatments, and the occasional full-width quote — the "someone
 * actually chose this order" feeling the flat grid didn't have. */
export default function ArchiveGrid({
  entries,
  onOpenPhoto,
  onOpenVideo,
  view,
}: {
  entries: GridEntry[];
  onOpenPhoto: (photo: Photo) => void;
  onOpenVideo: (film: Film) => void;
  view: ArchiveView;
}) {
  if (entries.length === 0) {
    return <p className="px-8 py-16 text-center font-mono text-xs uppercase tracking-cinema text-warm-white/40">No frames match.</p>;
  }

  const curated = view === "curated";
  const display: DisplayItem[] = [];
  let quoteCount = 0;
  entries.forEach((entry, i) => {
    display.push(entry);
    if (curated && (i + 1) % 12 === 0) {
      display.push({ kind: "quote", text: chapters[quoteCount % chapters.length].headline });
      quoteCount++;
    }
  });

  const cols = curated ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5" : "grid-cols-4 sm:grid-cols-8 md:grid-cols-12";
  const gap = curated ? "gap-3 md:gap-4" : "gap-1 md:gap-1.5";

  return (
    <div
      className={`grid px-6 pb-16 md:px-16 lg:px-24 ${cols} ${gap}`}
      style={{ gridAutoFlow: curated ? "dense" : "row", gridAutoRows: curated ? "minmax(clamp(110px, 16vw, 200px), auto)" : undefined }}
    >
      {display.map((item, i) => {
        if (item.kind === "quote") return <QuoteBreak key={`quote-${i}`} text={item.text} />;
        if (item.kind === "video") {
          return (
            <div key={item.film.id} className={curated ? "col-span-2 row-span-2" : ""}>
              <VideoCell film={item.film} view={view} onOpen={() => onOpenVideo(item.film)} />
            </div>
          );
        }
        const span = curated ? SPAN_CLASS[SPAN_PATTERN[i % SPAN_PATTERN.length]] : "";
        return (
          <div key={item.photo.id} className={span}>
            <PhotoCell photo={item.photo} index={i} view={view} onOpen={() => onOpenPhoto(item.photo)} />
          </div>
        );
      })}
    </div>
  );
}
