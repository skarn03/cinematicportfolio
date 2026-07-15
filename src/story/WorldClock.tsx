/** The site's own clock, independent of scroll — leave the page open and
 * do nothing, and the light still moves. A very slow warm glow drifting
 * across the whole page, and a softer cloud-shadow crossing on its own
 * unrelated cycle, both plain CSS `animation` so they run continuously
 * with zero JS cost and no scroll dependency whatsoever. Deliberately
 * subtle — `soft-light` blend, low opacity — this is meant to be felt,
 * not seen. */
export default function WorldClock() {
  return (
    <div className="pointer-events-none fixed inset-0 z-15 overflow-hidden mix-blend-soft-light">
      <div
        className="absolute -left-1/4 -top-1/4 h-[70vmax] w-[70vmax] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,214,160,0.35), transparent 65%)",
          animation: "world-light-drift 110s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 h-[38vmax] w-[58vmax] rounded-full bg-black/10 blur-3xl"
        style={{ animation: "world-cloud-drift 165s linear infinite" }}
      />
    </div>
  );
}
