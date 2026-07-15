import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useMotionValue, animate, type MotionValue } from "framer-motion";
import { chapters, type ChapterId, type Palette } from "../data/media";

type ThemeMotionValues = Record<keyof Palette, MotionValue<string>>;
type RegisterFn = (id: ChapterId, el: HTMLElement | null) => void;

const ThemeContext = createContext<ThemeMotionValues | null>(null);
const RegisterContext = createContext<RegisterFn | null>(null);
const ActiveChapterContext = createContext<MotionValue<ChapterId> | null>(null);
const SectionsContext = createContext<Map<ChapterId, HTMLElement> | null>(null);

const initialPalette = chapters[0].palette;
const PALETTE_KEYS = Object.keys(initialPalette) as (keyof Palette)[];

/** The color-grade for the whole page — a small set of animated values
 * (background, earth, accent, highlight, shadow, text) that slowly retarget
 * to whichever chapter's photographs the visitor has actually scrolled to.
 * Every consumer (background wash, cursor, kicker rule, progress dots)
 * reads the same live values, so the environment always agrees with
 * itself about what chapter it's in — and the transition between them is
 * one continuous animation, not a hard cut. */
export function ChapterThemeProvider({ children }: { children: ReactNode }) {
  const values: ThemeMotionValues = {
    background: useMotionValue(initialPalette.background),
    earth: useMotionValue(initialPalette.earth),
    accent: useMotionValue(initialPalette.accent),
    highlight: useMotionValue(initialPalette.highlight),
    shadow: useMotionValue(initialPalette.shadow),
    text: useMotionValue(initialPalette.text),
  };

  const sectionsRef = useRef(new Map<ChapterId, HTMLElement>());
  const activeRef = useRef<ChapterId>(chapters[0].id);
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const activeChapter = useMotionValue<ChapterId>(chapters[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const applyActive = (id: ChapterId) => {
      if (id === activeRef.current) return;
      activeRef.current = id;
      activeChapter.set(id);
      const palette = chapters.find((c) => c.id === id)?.palette;
      if (!palette) return;
      for (const key of PALETTE_KEYS) {
        animate(valuesRef.current[key], palette[key], { duration: 1.8, ease: [0.65, 0, 0.35, 1] });
      }
    };

    // A zero-height line across the exact vertical middle of the viewport
    // (rootMargin shrinks the root to that single line) — whichever
    // chapter's section currently straddles it is "active." Ratio-based
    // thresholds don't work here: a chapter section is routinely many
    // screens tall, so its intersection ratio (visible area over its own
    // total area) can never climb anywhere near 25%, and the indicator
    // would just freeze on the first chapter. Crossing a line has no such
    // problem — it doesn't care how tall the section is.
    //
    // This provider mounts once, at the top of the whole app, long before
    // `Story` (and its chapter sections) ever exist — they only appear
    // once the camera intro finishes. So the observer can't just observe
    // whatever is in `sectionsRef` the moment this effect fires; sections
    // registered afterward are picked up by `register()` itself below,
    // via the same long-lived observer instance kept in `observerRef`.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.chapterId as ChapterId | undefined;
          if (id) applyActive(id);
        }
      },
      { threshold: 0, rootMargin: "-50% 0px -50% 0px" },
    );
    observerRef.current = observer;
    sectionsRef.current.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, []);

  const register: RegisterFn = (id, el) => {
    if (!el) return;
    el.dataset.chapterId = id;
    sectionsRef.current.set(id, el);
    observerRef.current?.observe(el);
  };

  return (
    <ThemeContext.Provider value={values}>
      <ActiveChapterContext.Provider value={activeChapter}>
        <SectionsContext.Provider value={sectionsRef.current}>
          <RegisterContext.Provider value={register}>{children}</RegisterContext.Provider>
        </SectionsContext.Provider>
      </ActiveChapterContext.Provider>
    </ThemeContext.Provider>
  );
}

/** Read the live, animating palette — bind any of the six channels
 * directly to a style prop (`style={{ color: theme.earth }}`) and it will
 * ease itself whenever the active chapter changes. */
export function useChapterTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useChapterTheme must be used inside ChapterThemeProvider");
  return ctx;
}

/** The currently active chapter id, as a live MotionValue — mostly useful
 * for a handful of consumers (the cursor, ambient particle speed) that need
 * to react to *which* chapter is active, not just its colors. Quiet is the
 * one chapter that asks the rest of the page to slow down while it's on
 * screen, and this is how that request gets out. */
export function useActiveChapter() {
  const ctx = useContext(ActiveChapterContext);
  if (!ctx) throw new Error("useActiveChapter must be used inside ChapterThemeProvider");
  return ctx;
}

/** The registered chapter-section elements, keyed by id — mostly useful
 * for a persistent nav (the filmstrip rail) that needs to jump the visitor
 * straight to a chapter rather than only ever reading which one is
 * active. */
export function useChapterSections() {
  const ctx = useContext(SectionsContext);
  if (!ctx) throw new Error("useChapterSections must be used inside ChapterThemeProvider");
  return ctx;
}

/** Call once per chapter, attach the returned ref to that chapter's root
 * element — this is how the provider knows which palette to reach for. */
export function useRegisterChapterSection(id: ChapterId): RefObject<HTMLElement | null> {
  const register = useContext(RegisterContext);
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    register?.(id, ref.current);
  }, [register, id]);
  return ref;
}
