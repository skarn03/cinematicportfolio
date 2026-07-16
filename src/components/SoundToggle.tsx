import { useEffect, useRef } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { useAmbientSound } from "../hooks/useAmbientSound";
import { useActiveChapter } from "../story/ChapterTheme";

const WIND_CHAPTERS = new Set(["wander", "dusk"]);

/** Which chapter-linked texture (if any) sound should be wearing right
 * now — the base drone never stops, this only crossfades what sits on top
 * of it. `useActiveChapter` covers the eight photo chapters; the cinema
 * chapter isn't one of those (no palette of its own), so its own visibility
 * is tracked separately here via a plain IntersectionObserver, retried
 * until `#cinema-section` actually exists — it mounts well after this
 * component does, once the camera intro finishes. */
function useAmbientLayer(playing: boolean, setLayer: (l: "none" | "wind" | "projector") => void) {
  const activeChapter = useActiveChapter();
  const inCinemaRef = useRef(false);

  const apply = () => {
    if (!playing) return;
    if (inCinemaRef.current) return setLayer("projector");
    setLayer(WIND_CHAPTERS.has(activeChapter.get()) ? "wind" : "none");
  };

  useMotionValueEvent(activeChapter, "change", apply);

  useEffect(() => {
    if (!playing) return;
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const poll = setInterval(() => {
      const el = document.getElementById("cinema-section");
      if (!el) return;
      clearInterval(poll);
      observer = new IntersectionObserver(
        ([entry]) => {
          inCinemaRef.current = entry.isIntersecting;
          apply();
        },
        { threshold: 0, rootMargin: "-50% 0px -50% 0px" },
      );
      observer.observe(el);
    }, 400);
    return () => {
      clearInterval(poll);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default function SoundToggle() {
  const { playing, toggle, setLayer } = useAmbientSound();
  useAmbientLayer(playing, setLayer);

  return (
    <button
      onClick={toggle}
      data-cursor-hover
      className="group flex items-center gap-2 text-charcoal/70 transition-colors hover:text-charcoal"
      aria-label={playing ? "Mute ambient sound" : "Play ambient sound"}
    >
      <span className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-[2px] bg-current"
            animate={
              playing
                ? { height: ["30%", "100%", "50%", "80%", "30%"] }
                : { height: "20%" }
            }
            transition={
              playing
                ? { duration: 1.2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          />
        ))}
      </span>
      <span className="hidden text-[10px] tracking-cinema uppercase sm:inline">
        {playing ? "Sound On" : "Sound Off"}
      </span>
    </button>
  );
}
