import { requestContact } from "../lib/contactBus";

/** The persistent way in — present throughout the whole 2D journey, never
 * styled as a button because this isn't a call-to-action banner, it's a
 * small fixed detail the way a film edge carries a frame number. Reads
 * against any chapter's background via `mix-blend-difference`, the same
 * trick FilmstripNav and the custom cursor already use, so it never needs
 * its own per-chapter color. */
export default function ContactShortcut() {
  return (
    <button
      type="button"
      data-cursor-hover
      onClick={() => requestContact({ origin: "shortcut" })}
      className="pointer-events-auto fixed bottom-5 left-5 z-40 mix-blend-difference"
    >
      <span className="flex items-center gap-1.5 border-b border-warm-white/40 pb-0.5 font-mono text-[10px] uppercase tracking-cinema text-warm-white transition-colors hover:border-warm-white hover:text-warm-white">
        Let&rsquo;s create
      </span>
    </button>
  );
}
