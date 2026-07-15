import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent } from "framer-motion";
import { useSiteRhythm } from "./SiteRhythm";

type Accident = "dust" | "leak" | "flicker" | "scratch" | "settle";
const RANDOM_TYPES: Accident[] = ["dust", "leak", "flicker", "scratch"];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function DustMote() {
  const [pos] = useState(() => ({ top: `${randomBetween(10, 85)}%`, left: `${randomBetween(10, 85)}%`, dx: randomBetween(-30, 30), dy: randomBetween(-20, 20) }));
  return (
    <motion.span
      className="absolute h-1 w-1 rounded-full bg-warm-white"
      style={{ top: pos.top, left: pos.left }}
      initial={{ opacity: 0, scale: 0.6, x: 0, y: 0 }}
      animate={{ opacity: [0, 0.7, 0], scale: [0.6, 1.4, 1], x: [0, pos.dx], y: [0, pos.dy] }}
      transition={{ duration: 1.4, ease: "easeOut" }}
    />
  );
}

function LightLeakFlare() {
  const [fromLeft] = useState(() => Math.random() > 0.5);
  return (
    <motion.div
      className="absolute inset-y-0 w-1/2"
      style={{
        [fromLeft ? "left" : "right"]: 0,
        background: `linear-gradient(${fromLeft ? "100deg" : "260deg"}, rgba(255,190,120,0.22), transparent 60%)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.8, ease: "easeInOut" }}
    />
  );
}

function Flicker() {
  return (
    <motion.div
      className="absolute inset-0 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.12, 0, 0.06, 0] }}
      transition={{ duration: 0.35, ease: "linear" }}
    />
  );
}

function Scratch() {
  const [left] = useState(() => `${randomBetween(5, 95)}%`);
  return (
    <motion.span
      className="absolute top-0 h-full w-px bg-warm-white"
      style={{ left }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.5, 0, 0.3, 0] }}
      transition={{ duration: 0.6, ease: "linear" }}
    />
  );
}

/** A single leaf, drifting down and coming to rest — the visual for "the
 * site notices you've stopped." Wobbles on the way down, then holds still
 * and fades, rather than looping. */
function Settle() {
  const [left] = useState(() => `${randomBetween(15, 80)}%`);
  return (
    <motion.div
      className="absolute top-[-6%]"
      style={{ left }}
      initial={{ y: 0, x: 0, rotate: 0, opacity: 0 }}
      animate={{ y: "70vh", x: [0, 18, -14, 8, 0], rotate: [0, 20, -15, 10, 0], opacity: [0, 0.5, 0.5, 0.5, 0] }}
      transition={{ duration: 6.5, ease: "easeInOut", times: [0, 0.25, 0.5, 0.8, 1] }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1 C 11 3, 13 7, 7 13 C 1 7, 3 3, 7 1 Z" fill="currentColor" className="text-warm-white/60" />
      </svg>
    </motion.div>
  );
}

const ACCIDENT_COMPONENTS: Record<Accident, () => React.ReactElement> = {
  dust: DustMote,
  leak: LightLeakFlare,
  flicker: Flicker,
  scratch: Scratch,
  settle: Settle,
};

/** A roll of real film has flaws — a mote of dust, a stray flare, a
 * missed frame, a scratch from the reel before it. None of these repeat
 * on a loop (that would read as decoration, not accident); each one fires
 * once, then waits before the next. Every instance is a single fresh mount
 * with its own one-shot animation, so none of this touches `repeat` —
 * nothing here can join the WAAPI-crash category the rest of the
 * atmosphere layers guard against.
 *
 * The wait itself isn't fixed: it reads the visitor's own scroll speed
 * (see SiteRhythm) so accidents come more often while they're moving fast
 * through the site and settle into a slower, calmer cadence otherwise —
 * and the moment they actually stop, a leaf drifts down and rests, rather
 * than waiting for the next random slot. */
export default function HappyAccidents() {
  const [current, setCurrent] = useState<{ type: Accident; key: number } | null>(null);
  const rhythm = useSiteRhythm();
  const showRef = useRef<(type: Accident) => void>(() => {});

  useEffect(() => {
    let alive = true;
    let scheduleTimer: ReturnType<typeof setTimeout>;
    let clearTimer: ReturnType<typeof setTimeout>;

    const show = (type: Accident) => {
      setCurrent({ type, key: Date.now() + Math.random() });
      clearTimeout(clearTimer);
      clearTimer = setTimeout(() => alive && setCurrent(null), type === "settle" ? 6800 : 2200);
    };
    showRef.current = show;

    const scheduleNext = () => {
      const fast = Math.abs(rhythm.velocity.get()) > 900;
      const [min, max] = fast ? [7000, 16000] : [18000, 42000];
      scheduleTimer = setTimeout(() => {
        if (!alive) return;
        show(RANDOM_TYPES[Math.floor(Math.random() * RANDOM_TYPES.length)]);
        scheduleNext();
      }, randomBetween(min, max));
    };

    scheduleNext();
    return () => {
      alive = false;
      clearTimeout(scheduleTimer);
      clearTimeout(clearTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(rhythm.idle, "change", (isIdle) => {
    if (isIdle) showRef.current("settle");
  });

  const Accident = current ? ACCIDENT_COMPONENTS[current.type] : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-25 overflow-hidden">
      <AnimatePresence>{Accident && <Accident key={current!.key} />}</AnimatePresence>
    </div>
  );
}
