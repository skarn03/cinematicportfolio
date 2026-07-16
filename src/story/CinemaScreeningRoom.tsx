import { motion } from "framer-motion";

/** The dark, minimal screening room — a YouTube embed and nothing else
 * competing for attention. Shared between the Exhibition's Cinematography
 * chapter and the Archive's video tile, so both open the exact same room
 * rather than two slightly different implementations. */
export default function CinemaScreeningRoom({
  title,
  youtubeId,
  onClose,
}: {
  title: string;
  youtubeId: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-80 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="aspect-video w-full max-w-6xl px-4">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <button
        type="button"
        data-cursor-hover
        onClick={onClose}
        className="absolute right-6 top-6 text-[10px] uppercase tracking-cinema text-warm-white/70 hover:text-warm-white"
      >
        Close
      </button>
    </motion.div>
  );
}
