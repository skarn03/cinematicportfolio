import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { photos, films, chapterById, type ChapterId, type Photo, type Film } from "../data/media";
import { categoriesFor, locationFor, type Category } from "../data/archiveCategories";
import { subscribeArchive } from "../lib/archiveBus";
import CinemaScreeningRoom from "../story/CinemaScreeningRoom";
import ArchiveAtmosphere from "../story/layers/ArchiveAtmosphere";
import ArchiveFilters from "./ArchiveFilters";
import ArchiveGrid, { type GridEntry, type ArchiveView } from "./ArchiveGrid";
import ArchiveLightbox from "./ArchiveLightbox";

const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * The Archive — a second, faster way through the same collection, reached
 * from anywhere via the persistent "Open Archive" shortcut and closed
 * back to exactly where the visitor was, the same scroll-preserving
 * pattern already proven in ContactScene.tsx (see that file's own comment
 * for why there's no `overflow: hidden` toggle here either).
 */
export default function ArchiveRoom() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ArchiveView>("curated");
  const [chapter, setChapter] = useState<ChapterId | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [location, setLocation] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [openPhoto, setOpenPhoto] = useState<Photo | null>(null);
  const [openVideo, setOpenVideo] = useState<Film | null>(null);
  const savedScrollRef = useRef(0);

  useEffect(() => subscribeArchive(() => setOpen(true)), []);

  // Scroll save-on-open / restore-on-close only — kept separate from the
  // Escape-key handler below so opening/closing the photo lightbox (which
  // doesn't touch the underlying page's scroll at all, the overlay has its
  // own independent scroll context) never re-triggers this restore early.
  useEffect(() => {
    if (!open) return;
    savedScrollRef.current = window.scrollY;
    return () => {
      (document.activeElement as HTMLElement | null)?.blur?.();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedScrollRef.current, left: 0, behavior: "instant" });
        });
      });
    };
  }, [open]);

  // Escape closes whichever layer is actually on top first — the photo,
  // then the room itself — which needs the *current* openPhoto/openVideo,
  // not whatever they were when the room first opened.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openPhoto) return setOpenPhoto(null);
      if (openVideo) return setOpenVideo(null);
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openPhoto, openVideo]);

  const entries = useMemo<GridEntry[]>(() => {
    const q = search.trim().toLowerCase();

    const photoEntries: GridEntry[] = photos
      .filter((p) => chapter === "all" || p.chapter === chapter)
      .filter((p) => category === "all" || categoriesFor(p).includes(category))
      .filter((p) => location === "all" || locationFor(p.chapter) === location)
      .filter((p) => {
        if (!q) return true;
        const c = chapterById(p.chapter);
        return p.title.toLowerCase().includes(q) || p.story.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.archiveLabel.toLowerCase().includes(q);
      })
      .map((photo) => ({ kind: "photo", photo }) as const);

    const videoMatchesChapter = chapter === "all";
    const videoMatchesCategory = category === "all" || category === "video";
    const videoMatchesLocation = location === "all" || location === locationFor("cinematography");
    const videoMatchesSearch = !q || films[0].title.toLowerCase().includes(q) || films[0].channel.toLowerCase().includes(q);
    const videoEntries: GridEntry[] =
      videoMatchesChapter && videoMatchesCategory && videoMatchesLocation && videoMatchesSearch ? [{ kind: "video", film: films[0] } as const] : [];

    return [...videoEntries, ...photoEntries];
  }, [chapter, category, location, search]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          data-lenis-prevent
          className="fixed inset-0 z-95 overflow-y-auto overscroll-contain bg-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <ArchiveAtmosphere />

          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-warm-white/10 bg-ink/90 px-4 py-3 backdrop-blur-sm md:px-8">
            <button
              type="button"
              data-cursor-hover
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-cinema text-warm-white/70 hover:text-warm-white"
            >
              &larr; Walk Through
            </button>
            <div className="flex items-center gap-5">
              <span className="hidden font-mono text-[9px] uppercase tracking-cinema text-warm-white/30 sm:inline">{entries.length} Frames</span>
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-cinema">
                <button
                  type="button"
                  data-cursor-hover
                  onClick={() => setView("curated")}
                  className={`flex items-center gap-1.5 transition-colors ${view === "curated" ? "text-warm-white" : "text-warm-white/40 hover:text-warm-white/70"}`}
                >
                  <span className={`inline-block h-1.5 w-1.5 rounded-full border ${view === "curated" ? "border-warm-white bg-warm-white" : "border-warm-white/40"}`} />
                  Curated
                </button>
                <button
                  type="button"
                  data-cursor-hover
                  onClick={() => setView("contact-sheet")}
                  className={`flex items-center gap-1.5 transition-colors ${view === "contact-sheet" ? "text-warm-white" : "text-warm-white/40 hover:text-warm-white/70"}`}
                >
                  <span className={`inline-block h-1.5 w-1.5 rounded-full border ${view === "contact-sheet" ? "border-warm-white bg-warm-white" : "border-warm-white/40"}`} />
                  Contact Sheet
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-baseline justify-center gap-3 px-6 pb-1 pt-5 text-center md:px-16 lg:px-24">
            <p className="font-mono text-[10px] uppercase tracking-cinema text-warm-white/40">The Archive</p>
            <p className="font-serif-display text-sm italic text-warm-white/60">
              {photos.length} photographs &middot; {films.length} film
            </p>
          </div>

          <ArchiveFilters
            chapter={chapter}
            onChapter={setChapter}
            category={category}
            onCategory={setCategory}
            location={location}
            onLocation={setLocation}
            search={search}
            onSearch={setSearch}
          />

          <ArchiveGrid entries={entries} onOpenPhoto={setOpenPhoto} onOpenVideo={setOpenVideo} view={view} />

          <AnimatePresence>{openPhoto && <ArchiveLightbox photo={openPhoto} onClose={() => setOpenPhoto(null)} />}</AnimatePresence>
          <AnimatePresence>
            {openVideo && <CinemaScreeningRoom title={openVideo.title} youtubeId={openVideo.youtubeId} onClose={() => setOpenVideo(null)} />}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
