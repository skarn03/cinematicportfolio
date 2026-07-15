import { motion, useTransform } from "framer-motion";
import { useCursor } from "./CursorContext";
import AtmosphereBoundary from "./AtmosphereBoundary";
import CloudShadowLayer from "./layers/CloudShadowLayer";
import VolumetricLightLayer from "./layers/VolumetricLightLayer";
import DustLayer from "./layers/DustLayer";

/**
 * The default depth stack every chapter gets for free, back to front:
 * cloud shadows (slowest) -> volumetric light -> a cursor-following glow ->
 * drifting dust (fastest, most cursor-reactive). Individual chapters can
 * layer their own environment on top of this rather than instead of it —
 * see the Rain/Departure/Cinematography chapters for that.
 */
export default function AmbientLayer() {
  const { x, y } = useCursor();
  // The shared cursor value is -1..1; the glow needs it as a CSS position.
  const left = useTransform(x, [-1, 1], ["0%", "100%"]);
  const top = useTransform(y, [-1, 1], ["0%", "100%"]);

  return (
    <AtmosphereBoundary>
      <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        <CloudShadowLayer />
        <VolumetricLightLayer />

        <motion.div
          className="absolute h-[55vw] w-[55vw] rounded-full blur-[110px]"
          style={{
            left,
            top,
            x: "-50%",
            y: "-50%",
            background: "radial-gradient(circle, rgba(217,168,86,0.16) 0%, rgba(201,123,63,0.05) 55%, transparent 75%)",
            mixBlendMode: "soft-light",
          }}
        />

        <DustLayer />
      </div>
    </AtmosphereBoundary>
  );
}
