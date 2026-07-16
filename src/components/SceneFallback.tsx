import { motion } from "framer-motion";

const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * What shows in place of the 3D camera when WebGL isn't available or the
 * GPU context is lost and doesn't come back — some Android devices fail
 * either way, and a visitor should never be left looking at a blank
 * screen because of it. Same photograph, same sentence, same way into
 * the story — just a still frame instead of a scene, and a real button
 * instead of "click the camera."
 */
export default function SceneFallback({
  capturedImage,
  sentence,
  onEnter,
}: {
  capturedImage: string;
  sentence: string;
  onEnter: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 overflow-hidden bg-[#f3ecdf] px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <motion.img
        src={capturedImage}
        alt=""
        className="max-h-[52vh] w-auto max-w-[88vw] object-contain shadow-2xl shadow-black/30"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
      />
      <motion.p
        className="max-w-md text-center font-serif-display text-lg italic text-charcoal/80 md:text-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
      >
        {sentence}
      </motion.p>
      <motion.button
        type="button"
        onClick={onEnter}
        className="rounded-full border border-charcoal/30 px-6 py-2.5 font-mono text-[11px] uppercase tracking-cinema text-charcoal/80 transition-colors hover:border-charcoal hover:bg-charcoal hover:text-warm-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.7 }}
      >
        Enter the Gallery
      </motion.button>
    </motion.div>
  );
}
