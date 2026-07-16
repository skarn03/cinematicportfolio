import { useEffect, useMemo, useRef, useState, type WheelEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Scene from "../three/Scene";
import SceneFallback from "./SceneFallback";
import WebGLErrorBoundary from "./WebGLErrorBoundary";
import { useCameraSoundEffects } from "../hooks/useCameraSoundEffects";
import { sampleDayCycle } from "../lib/dayCycle";
import { isWebGLAvailable, isLikelyLowPowerDevice } from "../lib/webgl";

type Phase = "dark" | "emerge" | "idle";
type DollyStage = "rest" | "close";

const BOKEH = [
  { top: "16%", left: "10%", size: 260, color: "#d9a856", duration: 10, delay: 0 },
  { top: "70%", left: "18%", size: 200, color: "#c97b3f", duration: 12, delay: 1.2 },
  { top: "22%", left: "84%", size: 300, color: "#cfe0e8", duration: 11, delay: 0.6 },
  { top: "74%", left: "80%", size: 220, color: "#f2ead9", duration: 9, delay: 2 },
  { top: "46%", left: "50%", size: 360, color: "#e8d9bd", duration: 14, delay: 0.3 },
  { top: "36%", left: "30%", size: 160, color: "#d9a856", duration: 8, delay: 1.8 },
  { top: "58%", left: "66%", size: 190, color: "#cfe0e8", duration: 13, delay: 2.6 },
];

function FloatingBokeh() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {BOKEH.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{ top: b.top, left: b.left, width: b.size, height: b.size, background: b.color, opacity: 0.22 }}
          animate={{
            y: [0, -30, 0, 24, 0],
            x: [0, 16, 0, -16, 0],
            opacity: [0.14, 0.28, 0.18, 0.3, 0.14],
          }}
          transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

const METADATA = [
  { text: "ISO 200", top: "14%", left: "8%", duration: 13, delay: 0, font: "mono" as const },
  { text: "f/2.8", top: "20%", left: "88%", duration: 15, delay: 1.4, font: "mono" as const },
  { text: "1/125 SEC", top: "82%", left: "10%", duration: 12, delay: 2.6, font: "mono" as const },
  { text: "35mm", top: "70%", left: "90%", duration: 14, delay: 0.8, font: "mono" as const },
  { text: "RAW + JPEG", top: "10%", left: "62%", duration: 16, delay: 3.2, font: "mono" as const },
  { text: "COORDINATES NOT LOGGED", top: "88%", left: "68%", duration: 17, delay: 1.9, font: "mono" as const },
  { text: "FRAME 001", top: "8%", left: "34%", duration: 11, delay: 4.1, font: "mono" as const },
  { text: "CARD ALMOST FULL", top: "90%", left: "38%", duration: 15, delay: 0.4, font: "mono" as const },
  { text: "a quiet moment, kept", top: "60%", left: "6%", duration: 18, delay: 2.2, font: "hand" as const },
  { text: "still learning to see", top: "34%", left: "92%", duration: 16, delay: 3.8, font: "hand" as const },
];

/** Editorial metadata drifting through the space around the camera — never
 * UI, nothing to click, just the kind of fragments (exposure settings, a
 * coordinate, a handwritten aside) that would surround a photographer's
 * actual desk. Each one slowly rises, fades in and out, and repeats on its
 * own unrelated clock, so the field never reads as a single choreographed
 * loop.
 *
 * Hidden below `md`: several of these strings ("COORDINATES NOT LOGGED",
 * "CARD ALMOST FULL") are long enough to reach past a narrow screen's edge
 * before wrapping, and on a short phone viewport there simply isn't room
 * for a dozen drifting fragments without them colliding with the caption
 * and placard. The camera itself is the point on a small screen — this
 * layer is the first thing to give up its space. */
function FloatingMetadata() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
      {METADATA.map((m, i) => (
        <motion.span
          key={i}
          className={`absolute whitespace-nowrap text-charcoal/50 ${
            m.font === "hand" ? "font-hand text-lg" : "text-[10px] uppercase tracking-cinema"
          }`}
          style={{ top: m.top, left: m.left, fontFamily: m.font === "mono" ? "monospace" : undefined }}
          animate={{
            y: [10, -14, 10],
            opacity: [0, 0.4, 0.4, 0],
          }}
          transition={{ duration: m.duration, delay: m.delay, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.7, 1] }}
        >
          {m.text}
        </motion.span>
      ))}
    </div>
  );
}

/** A quiet grid and a set of corner registration marks — the kind of
 * precise, graphic-design detail that reads as an intentional exhibition
 * space rather than an empty backdrop. Kept faint enough to never compete
 * with the world behind it. */
function GraphicOverlay() {
  const corner = "absolute h-4 w-4 border-charcoal/25";
  return (
    <div className="pointer-events-none absolute inset-0 opacity-70">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, rgba(58,50,38,0.05) 0 1px, transparent 1px 8.3333%), repeating-linear-gradient(to bottom, rgba(58,50,38,0.05) 0 1px, transparent 1px 12.5%)",
        }}
      />
      <div className={`${corner} left-5 top-5 border-l border-t`} />
      <div className={`${corner} right-5 top-5 border-r border-t`} />
      <div className={`${corner} bottom-5 left-5 border-b border-l`} />
      <div className={`${corner} bottom-5 right-5 border-b border-r`} />
    </div>
  );
}

/** A soft radial vignette — darkens the far edges just enough to pull the
 * eye back to the camera instead of the gallery clutter around it. */
function Vignette() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(20,15,8,0.22) 100%)" }}
    />
  );
}

/** The studio ident — the beat right before the photo becomes the page,
 * the same rhythm as a production logo before a film starts. Letters
 * assemble inward rather than simply fading, so it reads as a piece of
 * type animation rather than a UI toast. */
function TitleCard({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
          <motion.p
            className="relative font-serif-display text-3xl italic text-warm-white md:text-5xl"
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0em" }}
            transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
          >
            Saika Cinematics
          </motion.p>
          <motion.span
            className="relative h-px w-16 bg-warm-white/50"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          />
          <motion.p
            className="relative text-[10px] uppercase tracking-cinema text-warm-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            A Field Notes Production
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A small museum-label detail, bottom-left — the visitor is standing in
 * front of a piece, not scrolling a webpage. Sits low enough on desktop
 * to stay clear of the hero caption above it; on a short phone viewport
 * there isn't reliably enough room for both, so it steps aside there
 * instead of overlapping the one line of text that actually matters. */
function ExhibitPlacard({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-4 left-4 hidden flex-col gap-1.5 sm:flex md:bottom-6 md:left-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 1.2 }}
    >
      <div className="h-px w-10 bg-charcoal/30" />
      <p className="font-serif-display text-sm italic text-charcoal/70">Sahil Karn</p>
      <p className="text-[9px] uppercase tracking-cinema text-charcoal/40">Field Notes &middot; Exhibit No. 01</p>
    </motion.div>
  );
}

export default function CameraIntro({
  mode,
  capturedImage,
  sentence,
  startZoomOut,
  onRequestEnter,
}: {
  mode: "opening" | "closing";
  capturedImage: string;
  sentence: string;
  /** closing mode only — mounts already zoomed in on the LCD; flip this to
   * true once the crossfade from the story has settled, to pull back and
   * reveal the whole camera */
  startZoomOut?: boolean;
  onRequestEnter: () => void;
}) {
  const [phase, setPhase] = useState<Phase>(mode === "closing" ? "idle" : "dark");
  const [shutterTrigger, setShutterTrigger] = useState(0);
  const [showText, setShowText] = useState(mode === "closing");
  const [, setHovering] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [captured, setCaptured] = useState(mode === "closing");
  const [dollyStage, setDollyStage] = useState<DollyStage>(mode === "closing" ? "close" : "rest");
  const [showTitleCard, setShowTitleCard] = useState(false);
  const [screenHovering, setScreenHovering] = useState(false);
  const [dayProgress, setDayProgress] = useState(0.32);
  // Checked once, synchronously, before the first paint — cheaper than an
  // effect, and it means a device that can't do WebGL never even attempts
  // to mount the Canvas in the first place.
  const [webglBroken, setWebglBroken] = useState(() => !isWebGLAvailable());
  const [lowPower] = useState(isLikelyLowPowerDevice);
  const firedRef = useRef(false);
  const enterFiredRef = useRef(false);

  const { playWakeClick, playShutter } = useCameraSoundEffects();
  const dayColors = useMemo(() => sampleDayCycle(dayProgress), [dayProgress]);

  const requestEnter = () => {
    if (enterFiredRef.current) return;
    enterFiredRef.current = true;
    onRequestEnter();
  };

  const handleWheel = (e: WheelEvent) => {
    if (captured) return;
    setDayProgress((p) => Math.max(0, Math.min(1, p + e.deltaY * 0.00025)));
  };

  useEffect(() => {
    if (mode === "closing") return;
    // The construction sequence (see CameraModel's four staggered tiers)
    // keeps playing on its own timeline underneath — it no longer gates
    // clickability. The shutter is reachable almost immediately so a
    // visitor never sits waiting on an intro they can't yet interact with.
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => {
        setPhase("emerge");
        playWakeClick();
      }, 300),
    );
    timers.push(setTimeout(() => setPhase("idle"), 700));
    timers.push(setTimeout(() => setShowText(true), 1100));
    return () => timers.forEach(clearTimeout);
  }, [mode, playWakeClick]);

  useEffect(() => {
    if (startZoomOut) setDollyStage("rest");
  }, [startZoomOut]);

  const handleShutterClick = () => {
    if (phase !== "idle" || firedRef.current) return;
    firedRef.current = true;

    playShutter();
    setShutterTrigger((n) => n + 1);

    // The flash reads as the actual exposure — it fires alone, first, the
    // way a real shutter flash would. The turn only starts once that
    // moment has actually registered, not in the same instant as the
    // click; a flash and a turn beginning simultaneously reads as the
    // camera reacting to being clicked, not as a photograph being taken.
    setFlashing(true);

    setTimeout(() => {
      setCaptured(true);
      if (mode === "closing") setDollyStage("close");
    }, 260);

    setTimeout(() => setFlashing(false), 560);
  };

  // If a first-time visitor doesn't realize the camera itself is the
  // button, don't leave them stalled on the opening screen — press the
  // shutter for them once it's been reachable for a few seconds with no
  // click.
  useEffect(() => {
    if (mode !== "opening" || phase !== "idle" || captured) return;
    const timer = setTimeout(() => {
      if (!firedRef.current) handleShutterClick();
    }, 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, phase, captured]);

  // The camera finished turning to present the LCD — fall through into the
  // slow push toward the screen.
  const handleFacingComplete = () => {
    if (mode === "opening") setDollyStage("close");
  };

  // The push-in settled with the photo filling the frame — a beat of studio
  // branding, the same rhythm as a production ident before a film starts,
  // then the "eventually just fade into the 2D webpage" moment.
  const handleDollyComplete = () => {
    setShowTitleCard(true);
    setTimeout(() => setShowTitleCard(false), 1400);
    setTimeout(() => requestEnter(), 1800);
  };

  const handleScreenClick = () => {
    if (!captured) return;
    requestEnter();
  };

  const showHero = phase === "idle" && !firedRef.current && !flashing;

  // Some Android devices report a WebGL-capable browser but can't
  // actually sustain a context (GPU process crashed, driver blocklisted,
  // out of memory) — when that's true, or once a live context is lost and
  // doesn't come back, skip the 3D camera entirely rather than leave a
  // visitor looking at a blank screen where the opening used to be.
  if (webglBroken) {
    return <SceneFallback capturedImage={capturedImage} sentence={sentence} onEnter={requestEnter} />;
  }

  return (
    <div
      className="fixed inset-0 z-40 overflow-hidden"
      style={{
        cursor: (showHero && !captured) || screenHovering ? "pointer" : "default",
        background: `radial-gradient(circle at 50% 35%, #fff8ec 0%, ${dayColors.skyBottom} 50%, ${dayColors.skyTop} 100%)`,
        transition: "background 0.6s linear",
      }}
      onClick={!captured ? handleShutterClick : undefined}
      onWheel={handleWheel}
      role={!captured ? "button" : undefined}
      aria-label={!captured ? "Press the shutter to begin" : undefined}
    >
      <FloatingBokeh />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ width: 680, height: 680, background: "radial-gradient(circle, #ffffffaa, transparent 70%)" }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: phase === "dark" ? 0.2 : 0.6, scale: 1 }}
        transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1] }}
      />

      <motion.div
        className="absolute inset-0"
        animate={{ opacity: phase === "dark" ? 0.15 : 1 }}
        transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
      >
        <WebGLErrorBoundary fallback={<SceneFallback capturedImage={capturedImage} sentence={sentence} onEnter={requestEnter} />}>
          <Scene
            phase={phase}
            shutterTrigger={shutterTrigger}
            capturedImage={captured ? capturedImage : null}
            facing={mode === "closing" || captured ? "back" : "front"}
            dollyStage={dollyStage}
            dayColors={dayColors}
            lowPower={lowPower}
            onShutterHover={setHovering}
            onShutterClick={handleShutterClick}
            onScreenHover={setScreenHovering}
            onScreenClick={handleScreenClick}
            onFacingComplete={handleFacingComplete}
            onDollyComplete={handleDollyComplete}
            onContextLost={() => setWebglBroken(true)}
          />
        </WebGLErrorBoundary>
      </motion.div>

      {/* Editorial fragments drifting around the camera while it's still
          being watched — once a photo's been taken there's nothing left to
          be thinking about. */}
      <AnimatePresence>
        {!captured && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <FloatingMetadata />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Painted over the world, not under it — a graphic design layer that
          reads as an intentional exhibition space rather than a webpage. */}
      <Vignette />
      <GraphicOverlay />
      <ExhibitPlacard visible={phase !== "dark"} />
      <TitleCard visible={showTitleCard} />

      {/* No box, no pill, no button — the camera's own shutter buttons
          already breathe with an inviting glow (see CameraModel), and the
          whole frame is clickable. This is the one line of type the scene
          allows itself, quiet enough to read as caption rather than UI. */}
      <AnimatePresence>
        {showHero && showText && (
          <motion.p
            className="pointer-events-none absolute inset-x-0 bottom-14 px-6 text-center font-serif-display text-xl italic text-charcoal/80 sm:bottom-24 sm:text-2xl md:bottom-20 md:text-4xl"
            style={{ textShadow: "0 1px 24px rgba(250,245,236,0.8)" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
          >
            {sentence}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        className="pointer-events-none absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: flashing ? 1 : 0 }}
        transition={{ duration: flashing ? 0.09 : 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
