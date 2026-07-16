import { requestContact } from "../lib/contactBus";
import { requestArchive } from "../lib/archiveBus";

/** A real, visible navbar — the persistent corner links this replaced
 * (mix-blend-difference text, easy to miss against a busy photograph)
 * weren't holding up as the site's only way to reach Contact or the
 * Archive. This is a plain bar with real contrast and real buttons,
 * always in the same place, left enough room on the right for the
 * Sound toggle (mounted separately in App.tsx, fixed top-right, so it
 * stays visible even during the camera intro this bar doesn't appear
 * in). */
export default function Navbar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-45 flex items-center justify-between gap-4 border-b border-warm-white/10 bg-ink/55 px-4 py-3 backdrop-blur-md md:px-8 md:pr-32">
      <span className="pointer-events-none font-serif-display text-sm italic text-warm-white/90 md:text-base">Saika Cinematics</span>
      <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
        <button
          type="button"
          data-cursor-hover
          onClick={() => requestArchive()}
          className="rounded-full border border-warm-white/35 px-3 py-1.5 font-mono text-[10px] uppercase tracking-cinema text-warm-white/85 transition-colors hover:border-warm-white hover:bg-warm-white hover:text-ink md:px-4 md:text-[11px]"
        >
          Open Archive
        </button>
        <button
          type="button"
          data-cursor-hover
          onClick={() => requestContact({ origin: "shortcut" })}
          className="rounded-full border border-warm-white/35 px-3 py-1.5 font-mono text-[10px] uppercase tracking-cinema text-warm-white/85 transition-colors hover:border-warm-white hover:bg-warm-white hover:text-ink md:px-4 md:text-[11px]"
        >
          Contact
        </button>
      </div>
    </div>
  );
}
