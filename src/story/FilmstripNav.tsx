import { useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { useActiveChapter, useChapterSections } from "./ChapterTheme";
import { chapters, type ChapterId } from "../data/media";

const EXTRA: { number: string; targetId: string }[] = [
  { number: "IX", targetId: "cinema-section" },
  { number: "X", targetId: "home-section" },
];

/** The one object that appears, identically, on every chapter — a strip
 * of sprocketed frames down the right edge, one per chapter, the current
 * one lit. This is the site's signature: not a decoration bolted onto an
 * editorial layout, but the actual physical object — a roll of film — the
 * whole site is pretending to be. Doubles as navigation: click a frame,
 * jump straight to it. `mix-blend-difference` so it reads against any
 * chapter's background, light or dark, without per-chapter styling. */
export default function FilmstripNav() {
  const activeChapter = useActiveChapter();
  const sections = useChapterSections();
  const [active, setActive] = useState<ChapterId>(activeChapter.get());
  useMotionValueEvent(activeChapter, "change", (id) => setActive(id));

  const jumpTo = (id: ChapterId) => sections.get(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const jumpToId = (targetId: string) => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <nav
      aria-label="Chapters"
      className="pointer-events-auto fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-2 mix-blend-difference lg:flex"
    >
      {chapters.map((c) => (
        <button key={c.id} type="button" data-cursor-hover onClick={() => jumpTo(c.id)} className="group flex items-center gap-2">
          <span
            className={`font-mono text-[8px] uppercase tracking-wider text-warm-white transition-opacity ${
              active === c.id ? "opacity-90" : "opacity-0 group-hover:opacity-50"
            }`}
          >
            {c.number}
          </span>
          <motion.span
            className="block h-4 w-6 rounded-[1px] border border-warm-white/30"
            animate={{
              backgroundColor: active === c.id ? "rgba(250,245,236,0.35)" : "rgba(250,245,236,0)",
              borderColor: active === c.id ? "rgba(250,245,236,0.9)" : "rgba(250,245,236,0.3)",
            }}
            transition={{ duration: 0.4 }}
          />
        </button>
      ))}
      {EXTRA.map((e) => (
        <button key={e.targetId} type="button" data-cursor-hover onClick={() => jumpToId(e.targetId)} className="group flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-wider text-warm-white opacity-0 transition-opacity group-hover:opacity-50">{e.number}</span>
          <span className="block h-4 w-6 rounded-[1px] border border-warm-white/30" />
        </button>
      ))}
    </nav>
  );
}
