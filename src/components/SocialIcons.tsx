import type { SocialIcon } from "../data/contact";

/** One small line-icon per platform — the same restrained, hand-drawn
 * register as the rest of the site's iconography (see CustomCursor's
 * glyphs), not a dropped-in icon-font sprite sheet. */
export default function SocialGlyph({ icon, className }: { icon: SocialIcon; className?: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, className };
  switch (icon) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
          <path d="M10.2 9.2 L15 12 L10.2 14.8 Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "vimeo":
      return (
        <svg {...common}>
          <path d="M21 7.6c-.1 1.9-1.4 4.5-4 7.8-2.7 3.4-5 5.1-6.8 5.1-1.1 0-2-1-2.8-3.1L6 12.4C5.3 10.3 4.6 9.3 3.8 9.3c-.2 0-.7.3-1.7 1L1.4 9.4C2.5 8.4 3.6 7.4 4.6 6.5c1.4-1.2 2.5-1.9 3.2-1.9 1.7-.2 2.7 1 3 3.5.3 2.8.5 4.5.8 5.2.4 1.1.9 1.6 1.5 1.6.5 0 1.2-.7 2.1-2.2.9-1.4 1.4-2.5 1.5-3.3.2-1.2-.4-1.8-1.6-1.8-.5 0-1.1.1-1.7.4 1.1-3.6 3.2-5.4 6.4-5.3 2.3.1 3.4 1.6 3.2 4.4z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M14 3v10.6a3.1 3.1 0 1 1-2.6-3.06" />
          <path d="M14 3c.4 2.4 2.1 4 4.6 4.2" />
        </svg>
      );
    case "behance":
      return (
        <svg {...common}>
          <path d="M3 6.5h5.2c2.6 0 3.9 1.1 3.9 2.9 0 1.1-.6 1.9-1.6 2.3 1.3.4 2.1 1.4 2.1 2.8 0 2-1.5 3.2-4.2 3.2H3z" />
          <path d="M3.6 11.5h4.3" />
          <path d="M16 12.8c.1-2 1.6-3.4 3.7-3.4 2.3 0 3.7 1.6 3.7 4v.5h-6c.1 1.5 1 2.4 2.4 2.4 1 0 1.7-.4 2.1-1.2l1.4.8c-.7 1.3-2 2-3.6 2-2.4 0-4-1.6-3.7-5.1z" />
          <path d="M16.9 9.9h5.1" transform="translate(0 -3.3)" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <line x1="7.5" y1="10.5" x2="7.5" y2="16.5" />
          <circle cx="7.5" cy="7.2" r="0.9" fill="currentColor" stroke="none" />
          <path d="M11.5 16.5v-4c0-1.4.9-2.3 2.2-2.3 1.3 0 2 .9 2 2.3v4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M9 12h6M12 9v6" />
        </svg>
      );
  }
}
