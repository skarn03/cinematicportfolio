import MuseumLabel from "./MuseumLabel";
import ApertureSweep from "./ApertureSweep";
import type { Photo } from "../../data/media";

/** Format 1 — Museum Wall. One enormous photograph, a soft spotlight
 * behind it, a small label beside it that only appears on hover, and
 * nothing else competing for the room. Like walking up to a single frame
 * at MoMA — the print itself arrives via a shutter sweep rather than a
 * fade, since this is the format used most often across the site and the
 * one most worth giving its own arrival, not the generic opacity-and-rise
 * every other primitive would otherwise share. */
export default function MuseumWall({
  photo,
  index,
  chapterNumber,
  glow,
  onOpen,
  tone = "dark",
}: {
  photo: Photo;
  index: number;
  chapterNumber: string;
  glow: string;
  onOpen: () => void;
  tone?: "dark" | "light";
}) {
  return (
    <div className="group relative flex w-full flex-col items-center justify-center gap-6 px-6 py-20 md:flex-row md:gap-12 md:px-16 md:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[100px]"
        style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)` }}
      />
      <ApertureSweep className="relative z-10 max-h-[78vh] w-auto max-w-[88vw] md:max-w-[64vw]">
        <img
          data-cursor-hover
          src={photo.src}
          alt={photo.title}
          loading="lazy"
          onClick={onOpen}
          className="max-h-[78vh] w-auto max-w-[88vw] cursor-pointer object-contain shadow-2xl shadow-black/40 md:max-w-[64vw]"
          style={{ objectPosition: photo.focalPoint }}
        />
      </ApertureSweep>
      <div className="relative z-10 md:w-40">
        <MuseumLabel title={photo.title} index={index} chapterNumber={chapterNumber} tone={tone} />
      </div>
    </div>
  );
}
