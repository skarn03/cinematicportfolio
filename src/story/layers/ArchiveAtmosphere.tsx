import { motion, useTransform } from "framer-motion";
import { useCursor } from "../CursorContext";
import AtmosphereBoundary from "../AtmosphereBoundary";
import DustLayer from "./DustLayer";

/** The Archive's own quiet backdrop — almost black is kept almost black,
 * just given a pulse: drifting dust (the same generic layer every other
 * room's atmosphere already uses) and one very soft, slow wash of light
 * leaning toward the cursor, the way a room's only lamp would. No curtain
 * reveal here — that beat belongs to the cinema chapter, not this one. */
function ArchiveAtmosphereInner() {
  const { x, y } = useCursor();
  const washLeft = useTransform(x, [-1, 1], ["35%", "65%"]);
  const washTop = useTransform(y, [-1, 1], ["25%", "45%"]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <DustLayer count={16} color="bg-warm-white/40" cursorSpeed={14} />
      <motion.div
        className="absolute h-[50vh] w-[50vw] rounded-full blur-[120px] mix-blend-screen"
        style={{ left: washLeft, top: washTop, x: "-50%", y: "-50%", background: "radial-gradient(circle, rgba(217,168,86,0.06), transparent 70%)" }}
      />
    </div>
  );
}

export default function ArchiveAtmosphere() {
  return (
    <AtmosphereBoundary>
      <ArchiveAtmosphereInner />
    </AtmosphereBoundary>
  );
}
