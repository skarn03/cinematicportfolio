import type { SocialIcon } from "../data/contact";

/** The one social glyph the site still shows — the same restrained,
 * hand-drawn register as the rest of the site's iconography (see
 * CustomCursor's glyphs), not a dropped-in icon-font sprite sheet. */
export default function SocialGlyph({ icon: _icon, className }: { icon: SocialIcon; className?: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
