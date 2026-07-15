import { motion } from "framer-motion";
import { useAmbientSound } from "../hooks/useAmbientSound";

export default function SoundToggle() {
  const { playing, toggle } = useAmbientSound();

  return (
    <button
      onClick={toggle}
      data-cursor-hover
      className="group flex items-center gap-2 text-charcoal/70 transition-colors hover:text-charcoal"
      aria-label={playing ? "Mute ambient sound" : "Play ambient sound"}
    >
      <span className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-[2px] bg-current"
            animate={
              playing
                ? { height: ["30%", "100%", "50%", "80%", "30%"] }
                : { height: "20%" }
            }
            transition={
              playing
                ? { duration: 1.2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          />
        ))}
      </span>
      <span className="hidden text-[10px] tracking-cinema uppercase sm:inline">
        {playing ? "Sound On" : "Sound Off"}
      </span>
    </button>
  );
}
