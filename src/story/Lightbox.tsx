import { createContext, useContext, useEffect, useState, type ReactNode, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type Active = { src: string; alt: string } | null;

const LightboxContext = createContext<((src: string, alt: string) => void) | null>(null);

/** Every one of the 39 photographs passes through here when opened full
 * screen, which makes this the one place worth spending "optics" on
 * rather than retrofitting every thumbnail across nine chapters. A soft
 * sheen tracks the cursor like light catching glass, and a very faint
 * chromatic fringe blooms near it — two hue-shifted copies of the same
 * image, offset a couple of pixels and masked to the cursor's radius.
 * This is a CSS approximation of a lens imperfection, not a real optical
 * simulation — good enough to feel like glass, not good enough to claim
 * more than that.
 *
 * Double-click zooms to the point you clicked, Lightroom-style; double-
 * click again to back out. While zoomed, the lens sheen/fringe layers are
 * hidden rather than left scaled incorrectly against the zoomed image. */
function LensPhoto({ src, alt }: { src: string; alt: string }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
    setZoomed((z) => !z);
  };

  const mask = `radial-gradient(circle 90px at ${pos.x}% ${pos.y}%, black, transparent 70%)`;

  return (
    <motion.div
      key={src}
      className="group relative"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <img
        src={src}
        alt={alt}
        className={`max-h-[92vh] max-w-[92vw] object-contain shadow-2xl shadow-black/60 transition-transform duration-500 ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        style={{ transform: zoomed ? "scale(2.2)" : "scale(1)", transformOrigin: `${origin.x}% ${origin.y}%`, transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
      />
      {!zoomed && (
        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[8px] uppercase tracking-cinema text-warm-white opacity-0 transition-opacity duration-500 group-hover:opacity-40">
          Double-click to inspect
        </p>
      )}
      {active && !zoomed && (
        <>
          <img
            src={src}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-screen"
            style={{ filter: "hue-rotate(-18deg) saturate(1.6)", opacity: 0.3, transform: "translateX(-2px)", WebkitMaskImage: mask, maskImage: mask }}
          />
          <img
            src={src}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-screen"
            style={{ filter: "hue-rotate(18deg) saturate(1.6)", opacity: 0.3, transform: "translateX(2px)", WebkitMaskImage: mask, maskImage: mask }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(circle 140px at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.16), transparent 70%)`, mixBlendMode: "overlay" }}
          />
        </>
      )}
    </motion.div>
  );
}

/** Wraps the whole story so any photograph, anywhere, can drop into a
 * full-screen view with the same click — one shared piece of chrome instead
 * of a bespoke modal per chapter. */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Active>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <LightboxContext.Provider value={(src, alt) => setActive({ src, alt })}>
      {children}
      {createPortal(
        <AnimatePresence>
          {active && (
            <motion.div
              className="fixed inset-0 z-90 flex items-center justify-center bg-black/95 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setActive(null)}
            >
              <LensPhoto src={active.src} alt={active.alt} />
              <button
                type="button"
                onClick={() => setActive(null)}
                className="absolute right-6 top-6 text-[10px] uppercase tracking-cinema text-warm-white/70 transition-colors hover:text-warm-white"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </LightboxContext.Provider>
  );
}

/** Returns a function that opens the shared lightbox — call it from any
 * photo's onClick with that photo's src/alt. */
export function useLightbox() {
  const open = useContext(LightboxContext);
  if (!open) throw new Error("useLightbox must be used inside LightboxProvider");
  return open;
}
