import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import CameraModel from "../three/CameraModel";
import SocialGlyph from "./SocialIcons";
import { contactLinks, mailtoHref } from "../data/contact";
import { subscribeContact, type ContactOrigin } from "../lib/contactBus";
import { setCursorHover } from "../lib/cursorBus";
import { scaleForAspect } from "../three/responsiveCamera";

const CONTACT_CAMERA_Z = 5.4;

/** This canvas's own container — not the full window — is what changes
 * aspect ratio between a wide desktop card and a short, narrow phone
 * frame. Re-targets the resting distance whenever that container's own
 * size changes, using the same horizontal-framing math as the opening
 * camera scene. */
function ResponsiveCameraDistance() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.z = scaleForAspect(CONTACT_CAMERA_Z, size.width / size.height);
  }, [camera, size]);
  return null;
}

const EASE = [0.65, 0, 0.35, 1] as const;

/** A slow diagonal shaft of light — the same soft-sunlight technique
 * Bloom's atmosphere uses, borrowed here for "subtle volumetric rays." */
function LightRay({ left, delay }: { left: string; delay: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-y-[-10%] w-[22vw] -skew-x-12"
      style={{ left, background: "linear-gradient(180deg, rgba(255,238,204,0.22), transparent 70%)" }}
      initial={{ opacity: 0.15 }}
      animate={{ opacity: [0.1, 0.28, 0.1] }}
      transition={{ duration: 9, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/** A single mote of paper drifting down and away — plain CSS-timed
 * Framer animation, positive bounded delay/repeatDelay only, the same
 * safety convention every other atmosphere layer in this project follows
 * to stay clear of the WAAPI crash class documented elsewhere in the
 * codebase. */
function PaperMote({ left, size, duration, delay }: { left: string; size: number; duration: number; delay: number }) {
  return (
    <motion.span
      className="pointer-events-none absolute top-[-8%] rounded-[1px] bg-[#f2ead9]/70"
      style={{ left, width: size, height: size * 1.3, boxShadow: "0 1px 3px rgba(58,50,38,0.15)" }}
      initial={{ y: 0, rotate: 0, opacity: 0 }}
      animate={{ y: "112vh", rotate: [0, 22, -14, 8, 0], opacity: [0, 0.5, 0.5, 0.4, 0] }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay: duration * 0.4, ease: "easeInOut" }}
    />
  );
}

const PAPER_MOTES = [
  { left: "12%", size: 7, duration: 14, delay: 0 },
  { left: "28%", size: 5, duration: 17, delay: 3 },
  { left: "62%", size: 6, duration: 15, delay: 6 },
  { left: "81%", size: 8, duration: 18, delay: 1.5 },
  { left: "46%", size: 5, duration: 16, delay: 8 },
];

/** The minimal 3D environment behind the camera — warm, soft, and
 * deliberately much lighter than the opening sequence's full weather
 * system (no rain, no wind, no fog-driven sky dome): a couple of lights,
 * one procedural environment map for reflections, and a thin layer of
 * dust. "Avoid clutter" is a requirement here, not a suggestion. */
function ContactCanvas() {
  return (
    <Canvas dpr={Math.min(window.devicePixelRatio, 2)} shadows camera={{ position: [0, 0, CONTACT_CAMERA_Z], fov: 30 }} gl={{ antialias: true, alpha: true }} className="absolute! inset-0">
      <ResponsiveCameraDistance />
      <ambientLight intensity={0.75} color="#fff6e6" />
      <directionalLight position={[2.5, 2.2, 3]} intensity={1.1} color="#ffe9c2" castShadow shadow-mapSize={[512, 512]} />
      <directionalLight position={[-2.5, 1, -2]} intensity={0.45} color="#f2d9ad" />
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={2.6} color="#fffaf0" position={[3, 2, 4]} scale={[4, 3, 1]} />
        <Lightformer intensity={0.5} color="#e8dfc8" position={[-4, -1, -3]} scale={[5, 4, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#fff6e6" position={[0, 3, -2]} scale={2.6} />
      </Environment>
      <Sparkles count={55} scale={[7, 8, 7]} position={[0, 1, 0]} size={2} speed={0.07} opacity={0.4} color="#d9a856" />
      <CameraModel
        phase="idle"
        shutterTrigger={0}
        capturedImage={null}
        facing="back"
        onShutterOver={() => setCursorHover(true)}
        onShutterOut={() => setCursorHover(false)}
        onShutterClick={() => window.open(mailtoHref(), "_self")}
        onScreenOver={() => setCursorHover(true)}
        onScreenOut={() => setCursorHover(false)}
        onScreenClick={() => window.open(mailtoHref(), "_self")}
      />
    </Canvas>
  );
}

function EmailRow() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contactLinks.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard access can fail quietly (permissions, insecure context) —
      // the email is still fully visible and selectable by hand either way.
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <a
        href={mailtoHref()}
        data-cursor-hover
        className="break-all text-center font-serif-display text-2xl italic text-charcoal transition-colors hover:text-[#a9793f] sm:text-3xl md:text-4xl"
      >
        {contactLinks.email}
      </a>
      <button
        type="button"
        data-cursor-hover
        onClick={handleCopy}
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-cinema text-charcoal/50 transition-colors hover:text-charcoal"
      >
        <span className="inline-block h-3 w-3 rounded-[1px] border border-current" />
        {copied ? "Email copied" : "Copy email"}
      </button>
    </div>
  );
}

function SocialRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
      {contactLinks.socials.map((s) => {
        const hasUrl = s.url.length > 0;
        return (
          <a
            key={s.platform}
            href={hasUrl ? s.url : undefined}
            target={hasUrl ? "_blank" : undefined}
            rel={hasUrl ? "noreferrer" : undefined}
            data-cursor-hover={hasUrl ? true : undefined}
            title={hasUrl ? s.description : `Add your ${s.platform} link`}
            className={`group flex flex-col items-center gap-1.5 ${hasUrl ? "text-charcoal/60 hover:text-charcoal" : "cursor-default text-charcoal/25"} transition-colors`}
            onClick={(e) => {
              if (!hasUrl) e.preventDefault();
            }}
          >
            <SocialGlyph icon={s.icon} />
            <span className="font-mono text-[9px] uppercase tracking-cinema">{s.platform}</span>
          </a>
        );
      })}
    </div>
  );
}

/**
 * The final scene — reachable from a persistent shortcut anywhere in the
 * portfolio, or naturally at the end of the 2D journey (see Home.tsx's
 * "Ready for the next roll?" beat and contactBus.ts). Both paths call
 * `requestContact`, which this component alone listens for; the story
 * underneath never unmounts, and its scroll position is explicitly saved
 * on open and restored instantly (no smooth-scroll animation, which
 * would itself read as "going somewhere") on close, so the shortcut path
 * always returns the visitor to exactly where they were.
 */
export default function ContactScene() {
  const [request, setRequest] = useState<{ origin: ContactOrigin; onContinue?: () => void } | null>(null);
  const savedScrollRef = useRef(0);

  useEffect(() => subscribeContact((r) => setRequest(r)), []);

  useEffect(() => {
    if (!request) return;
    savedScrollRef.current = window.scrollY;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRequest(null);
    };
    window.addEventListener("keydown", onKey);
    // No `body { overflow: hidden }` here — the overlay itself is a fixed,
    // full-viewport layer that already intercepts every wheel/touch event
    // over the story beneath it, and toggling overflow on/off was the
    // actual source of a scroll-position drift (it hides/reveals the
    // scrollbar, which reflows the page and can trigger the browser's own
    // scroll-anchoring right as this cleanup runs). Simpler is more
    // correct here.
    return () => {
      window.removeEventListener("keydown", onKey);
      // Deliberately move focus off the (about to unmount) close button
      // first — some browsers scroll to keep the next focused element in
      // view once a focused element is removed from the DOM, which was
      // fighting this exact restore.
      (document.activeElement as HTMLElement | null)?.blur?.();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedScrollRef.current, left: 0, behavior: "instant" });
        });
      });
    };
  }, [request]);

  const quick = request?.origin === "shortcut";
  const entranceDuration = quick ? 0.6 : 1.3;

  return (
    <AnimatePresence>
      {request && (
        <motion.div
          data-lenis-prevent
          className="fixed inset-0 z-95 flex items-center justify-center overflow-y-auto overscroll-contain px-6 py-16"
          style={{ background: "radial-gradient(circle at 50% 38%, #fdf6e8 0%, #f3e6c9 55%, #e8d5a8 100%)" }}
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(18px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: entranceDuration, ease: EASE }}
          onClick={() => setRequest(null)}
        >
          {/* The bezel — a frame materializing around the composition, the
              visual cue that this whole scene is being seen through the
              camera's own screen. */}
          <motion.div
            className="pointer-events-none fixed inset-6 rounded-[2px] border border-[#3a3226]/15 md:inset-10"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: entranceDuration, delay: quick ? 0.1 : 0.3, ease: EASE }}
          />

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <LightRay left="18%" delay={0} />
            <LightRay left="68%" delay={3} />
            {PAPER_MOTES.map((m, i) => (
              <PaperMote key={i} {...m} />
            ))}
          </div>

          <button
            type="button"
            data-cursor-hover
            onClick={() => setRequest(null)}
            aria-label={request.origin === "shortcut" ? "Back to the story" : "Close"}
            className="fixed left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-charcoal/20 bg-[#fdf6e8]/70 py-2 pl-3 pr-4 text-charcoal/70 shadow-sm backdrop-blur-sm transition-colors hover:border-charcoal/40 hover:text-charcoal md:left-8 md:top-8"
          >
            <span className="flex h-4 w-4 items-center justify-center text-sm leading-none">&larr;</span>
            <span className="font-mono text-[10px] uppercase tracking-cinema">
              {request.origin === "shortcut" ? "Back to the story" : "Close"}
            </span>
          </button>

          <motion.div
            className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10 py-10 text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: quick ? 0.25 : 0.6, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[38vh] w-full min-h-[220px] md:h-[42vh]">
              <ContactCanvas />
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="max-w-md font-serif-display text-2xl italic leading-snug text-charcoal md:text-3xl">{contactLinks.message.headline}</p>
              <p className="max-w-sm text-base text-charcoal/60 md:text-lg">{contactLinks.message.sub}</p>
            </div>

            <EmailRow />
            <SocialRow />

            {request.origin === "journey" && request.onContinue && (
              <button
                type="button"
                data-cursor-hover
                onClick={() => {
                  const cont = request.onContinue;
                  setRequest(null);
                  cont?.();
                }}
                className="mt-2 font-mono text-[10px] uppercase tracking-cinema text-charcoal/40 transition-colors hover:text-charcoal"
              >
                Rewind to the beginning &rarr;
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
