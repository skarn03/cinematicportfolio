import { useRef, useState, type PointerEvent } from "react";
import { motion } from "framer-motion";
import AtmosphereBoundary from "../AtmosphereBoundary";

let rippleSeq = 0;

/** A single ring expanding from wherever the visitor's cursor touched the
 * water — plain CSS keyframes, not Framer/WAAPI, since a filter-heavy
 * chapter is exactly where an extra animation engine earns its keep. */
function CursorRipple({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  return (
    <span
      className="pointer-events-none absolute rounded-full border border-white/40"
      style={{ left: x, top: y, width: 8, height: 8, marginLeft: -4, marginTop: -4, animation: "reflections-ripple 1.8s ease-out forwards" }}
      onAnimationEnd={onDone}
    />
  );
}

function ReflectionsAtmosphereInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastSpawnRef = useRef(0);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const now = performance.now();
    if (now - lastSpawnRef.current < 220) return; // the water doesn't need a ring for every pixel
    lastSpawnRef.current = now;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const id = rippleSeq++;
    setRipples((prev) => [...prev.slice(-6), { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };

  return (
    <div ref={containerRef} className="pointer-events-auto absolute inset-0 overflow-hidden" onPointerMove={handlePointerMove}>
      {/* A slow shimmer across the whole chapter — the cheapest possible
          "light on moving water" effect: a soft diagonal band drifting on
          a loop, no filter cost. */}
      <motion.div
        className="pointer-events-none absolute -inset-x-1/4 -inset-y-1/4 opacity-[0.05]"
        style={{
          background: "repeating-linear-gradient(115deg, transparent 0px, transparent 40px, rgba(255,255,255,0.5) 41px, transparent 90px)",
        }}
        animate={{ backgroundPositionX: ["0px", "600px"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />

      {ripples.map((r) => (
        <CursorRipple key={r.id} x={r.x} y={r.y} onDone={() => setRipples((prev) => prev.filter((p) => p.id !== r.id))} />
      ))}
    </div>
  );
}

/** Reflections' own physics — the chapter about water gets to actually
 * behave like it. A slow shimmer moves across the whole frame, and every
 * so often the cursor leaves a real ring on the surface, the way a hand
 * trailing in a pond would. The developing prints and headline get their
 * own water-specific touches (ripple filter, mirrored type) directly in
 * the chapter component, since those need to sit precisely over specific
 * elements rather than float freely above everything. */
export default function ReflectionsAtmosphere() {
  return (
    <AtmosphereBoundary>
      <ReflectionsAtmosphereInner />
    </AtmosphereBoundary>
  );
}
