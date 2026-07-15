import { motion } from "framer-motion";
import MuseumLabel from "./MuseumLabel";
import type { Photo } from "../../data/media";

const EASE = [0.65, 0, 0.35, 1] as const;

/** Format 2 — Editorial Spread. The photograph takes two-thirds of the
 * page; a short line of real text sits in the remaining column, on
 * whichever side keeps the image's own composition unobstructed. Huge
 * margins around both — a magazine page, not a caption stapled to a
 * picture. */
export default function EditorialSpread({
  photo,
  index,
  chapterNumber,
  textSide = "right",
  onOpen,
  tone = "dark",
}: {
  photo: Photo;
  index: number;
  chapterNumber: string;
  textSide?: "left" | "right";
  onOpen: () => void;
  tone?: "dark" | "light";
}) {
  const imageOrder = textSide === "right" ? "md:order-1" : "md:order-2";
  const textOrder = textSide === "right" ? "md:order-2" : "md:order-1";

  return (
    <div className="group flex w-full flex-col items-center justify-center gap-10 px-6 py-20 md:flex-row md:gap-14 md:px-16 md:py-32 lg:gap-20">
      <motion.div
        className={`relative flex justify-center ${imageOrder}`}
        initial={{ opacity: 0, x: textSide === "right" ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: EASE }}
      >
        {/* A print mount, not an edge-to-edge crop — a white paper margin
            around the photograph, sized to always fit inside the viewport
            rather than stretched to fill its column and risking a portrait
            frame taller than the screen itself. */}
        <div className="bg-warm-white p-2 shadow-2xl shadow-black/30 md:p-3">
          <img
            data-cursor-hover
            src={photo.src}
            alt={photo.title}
            loading="lazy"
            onClick={onOpen}
            className="max-h-[68vh] w-auto max-w-[88vw] cursor-pointer object-cover md:max-h-[82vh] md:max-w-[52vw]"
            style={{ objectPosition: photo.focalPoint, aspectRatio: photo.aspect }}
          />
        </div>
      </motion.div>
      <div className={`relative flex max-w-sm flex-col justify-center ${textOrder} ${textSide === "right" ? "md:items-start md:text-left" : "md:items-end md:text-right"}`}>
        <motion.p
          className={`max-w-[28ch] font-serif-display text-2xl italic leading-snug md:text-3xl ${tone === "dark" ? "text-warm-white/80" : "text-charcoal/80"}`}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
        >
          {photo.story}
        </motion.p>
        <div className="mt-7">
          <MuseumLabel title={photo.title} index={index} chapterNumber={chapterNumber} tone={tone} align={textSide === "right" ? "left" : "right"} />
        </div>
      </div>
    </div>
  );
}
