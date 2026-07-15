import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const EASE = [0.65, 0, 0.35, 1] as const;

/** A rangefinder's double image — the split-focus patch a Leica shows in
 * its viewfinder, summoned by pressing "L" and gone again in a couple of
 * seconds. Nothing here announces itself; it's only for whoever happens to
 * try. */
function RangefinderOverlay() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-70 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative h-[46vmin] w-[46vmin] rounded-full border border-warm-white/25">
        <div className="absolute left-1/2 top-1/2 h-[22vmin] w-[30vmin] -translate-x-1/2 -translate-y-1/2 border border-warm-white/70">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-warm-white/30" />
          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-warm-white/30" />
        </div>
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[8px] uppercase tracking-cinema text-warm-white/40">
          1:1 &middot; 50mm
        </span>
      </div>
    </motion.div>
  );
}

/** The Konami code, still working the way it always has — a short,
 * handwritten-feeling note about how the whole roll got made, torn from
 * the same page as everything else. */
function JournalNote({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-70 flex items-center justify-center bg-ink/70 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClose}
    >
      <motion.div
        className="max-w-sm bg-off-white p-8 text-center shadow-2xl shadow-black/50"
        initial={{ opacity: 0, y: 20, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: -1 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <p className="font-hand text-2xl leading-snug text-charcoal/80">
          Not every frame makes the roll. This one only keeps what still felt true a few days later.
        </p>
        <p className="mt-5 font-mono text-[9px] uppercase tracking-cinema text-charcoal/30">Click anywhere to close</p>
      </motion.div>
    </motion.div>
  );
}

/** Two small things that don't announce themselves: press "L" for a
 * rangefinder flash, or the Konami code for a note about the roll itself.
 * Both are self-dismissing and neither is wired to any real EXIF/GPS data
 * that doesn't exist — they're atmosphere, not fabricated metadata. */
export default function HiddenDiscoveries() {
  const [showRangefinder, setShowRangefinder] = useState(false);
  const [showJournal, setShowJournal] = useState(false);

  useEffect(() => {
    let progress = 0;
    let rangefinderTimer: ReturnType<typeof setTimeout>;

    const isTypingTarget = (el: EventTarget | null) => {
      const tag = (el as HTMLElement)?.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement)?.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      if (e.key.toLowerCase() === "l" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setShowRangefinder(true);
        clearTimeout(rangefinderTimer);
        rangefinderTimer = setTimeout(() => setShowRangefinder(false), 1800);
      }

      const expected = KONAMI[progress];
      const matches = e.key === expected || e.key.toLowerCase() === expected.toLowerCase();
      progress = matches ? progress + 1 : e.key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        setShowJournal(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(rangefinderTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {showRangefinder && <RangefinderOverlay key="rangefinder" />}
      {showJournal && <JournalNote key="journal" onClose={() => setShowJournal(false)} />}
    </AnimatePresence>
  );
}
