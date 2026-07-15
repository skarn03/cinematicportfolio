import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";
import { subscribeCursorHover } from "../lib/cursorBus";
import { useChapterTheme, useActiveChapter } from "../story/ChapterTheme";

type CursorKind = "photo" | "video" | "journal" | "map" | "portrait" | "rangefinder";

/** A handful of tiny glyphs that stand in for the ring when the cursor
 * knows what it's actually looking at — a focus square over a photograph,
 * a compass over a travel page, an eye-AF box over a portrait. None of
 * these are decoration for its own sake; each one is the same visual
 * language the camera itself already speaks (see CameraModel's AF
 * brackets), just following the visitor instead of living on the lens. */
function CursorGlyph({ kind, color }: { kind: CursorKind; color: string }) {
  const stroke = color;
  switch (kind) {
    case "video":
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <circle cx="17" cy="17" r="3" fill="#c9683f" />
          <text x="17" y="30" textAnchor="middle" fontSize="6" fontFamily="monospace" fill={stroke} letterSpacing="1">
            REC
          </text>
        </svg>
      );
    case "journal":
      return (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M8 22 L20 10 L24 14 L12 26 L7 27 Z" stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M18 12 L22 16" stroke={stroke} strokeWidth="1.3" />
        </svg>
      );
    case "map":
      return (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="11" stroke={stroke} strokeWidth="1.1" />
          <path d="M15 8 L18 15 L15 22 L12 15 Z" fill={stroke} opacity="0.7" />
        </svg>
      );
    case "portrait":
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <rect x="6" y="6" width="22" height="22" rx="2" stroke={stroke} strokeWidth="1" opacity="0.7" />
          <circle cx="17" cy="17" r="3.5" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    case "rangefinder":
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <path d="M4 4 L4 11 M4 4 L11 4" stroke={stroke} strokeWidth="1.2" />
          <path d="M30 4 L30 11 M30 4 L23 4" stroke={stroke} strokeWidth="1.2" />
          <path d="M4 30 L4 23 M4 30 L11 30" stroke={stroke} strokeWidth="1.2" />
          <path d="M30 30 L30 23 M30 30 L23 30" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    case "photo":
    default:
      return (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M2 8 L2 2 L8 2" stroke={stroke} strokeWidth="1.3" />
          <path d="M22 2 L28 2 L28 8" stroke={stroke} strokeWidth="1.3" />
          <path d="M28 22 L28 28 L22 28" stroke={stroke} strokeWidth="1.3" />
          <path d="M8 28 L2 28 L2 22" stroke={stroke} strokeWidth="1.3" />
        </svg>
      );
  }
}

export default function CustomCursor() {
  const theme = useChapterTheme();
  const activeChapter = useActiveChapter();
  const [quiet, setQuiet] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [domHover, setDomHover] = useState(false);
  const [busHover, setBusHover] = useState(false);
  const [kind, setKind] = useState<CursorKind | null>(null);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  // Quiet asks even the cursor to slow down — a softer spring while it's
  // the active chapter, back to normal everywhere else.
  const ringX = useSpring(dotX, { damping: quiet ? 42 : 30, stiffness: quiet ? 120 : 250, mass: 0.5 });
  const ringY = useSpring(dotY, { damping: quiet ? 42 : 30, stiffness: quiet ? 120 : 250, mass: 0.5 });

  useMotionValueEvent(activeChapter, "change", (id) => setQuiet(id === "quiet"));
  useEffect(() => subscribeCursorHover(setBusHover), []);

  useEffect(() => {
    const isFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setEnabled(isFine);
    if (!isFine) return;

    const move = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const overInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverTarget = target.closest("a, button, [data-cursor-hover]");
      setDomHover(Boolean(hoverTarget));
      const kindTarget = target.closest<HTMLElement>("[data-cursor-kind]");
      setKind(hoverTarget ? ((kindTarget?.dataset.cursorKind as CursorKind) ?? null) : null);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", overInteractive, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", overInteractive);
    };
  }, [dotX, dotY]);

  if (!enabled) return null;

  const hovering = domHover || busHover;

  return (
    <>
      <motion.div className="cursor-dot" style={{ x: dotX, y: dotY, opacity: kind ? 0 : 1 }} />
      <motion.div
        className="cursor-ring"
        style={{ x: ringX, y: ringY, borderColor: theme.earth, borderWidth: kind ? 0 : 1 }}
        animate={{
          scale: hovering ? 1.8 : quiet ? 1.3 : 1,
          opacity: hovering && !kind ? 0.4 : quiet ? 0.55 : 1,
        }}
        transition={{ duration: quiet ? 1.1 : 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatePresence>
          {hovering && kind && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <CursorGlyph kind={kind} color="#faf5ec" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
