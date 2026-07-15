import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type Phase = "dark" | "emerge" | "idle";

type CameraModelProps = {
  phase: Phase;
  /** increments by one each time the shutter is pressed */
  shutterTrigger: number;
  /** once set, the LCD shows this photo full-bleed instead of the viewfinder HUD */
  capturedImage: string | null;
  /** "back" turns the model to present the LCD to the default viewpoint —
   * animated with a single slow spin when it changes from "front" after the
   * shutter fires, or already settled on mount for the closing scene, where
   * the visitor should see the screen immediately rather than the lens again */
  facing?: "front" | "back";
  onShutterOver: () => void;
  onShutterOut: () => void;
  onShutterClick: () => void;
  onScreenOver: () => void;
  onScreenOut: () => void;
  onScreenClick: () => void;
  /** fires once, the instant an animated turn to "back" settles */
  onFacingComplete?: () => void;
};

const SPIN_DURATION = 2;
// Dead center — the camera is the one fixed point the whole opening turns
// around, not something sharing the frame with anything else.
const BASE_Y = 0;
const BASE_X = 0;
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
// A small overshoot on the way in — parts settle past their resting scale
// and ease back, rather than arriving flat. This is what reads as assembled
// rather than faded in.
function easeOutBack(t: number, overshoot = 1.5) {
  const c3 = overshoot + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}
function constructScale(sinceEmerge: number, delay: number, duration: number) {
  if (sinceEmerge < delay) return 0;
  const p = Math.min(1, (sinceEmerge - delay) / duration);
  return Math.max(0, easeOutBack(p));
}

const BODY_COLOR = "#7a5c42";
const METAL_COLOR = "#cbb088";
const ACCENT_RED = "#c9683f";

const POWER_TARGET: Record<Phase, number> = { dark: 0, emerge: 0.55, idle: 1 };
const AF_CYCLE = 3.4;
const AF_ON = 0.5;
const AF_HOLD = 0.9;
const AF_OFF = 0.6;

// The construction timeline — four tiers, each a little later and a little
// faster than the last, the way a hand would actually assemble something:
// structure first, then mechanism, then trim, then the strap last.
const TIER_BODY = { delay: 0, duration: 0.85 };
const TIER_LENS = { delay: 0.4, duration: 0.85 };
const TIER_TOP = { delay: 0.8, duration: 0.75 };
const TIER_STRAP = { delay: 1.3, duration: 0.9 };
const GHOST_FADE = 0.7;

function AFBracket({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const arm = 0.055;
  const thickness = 0.006;
  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <mesh position={[arm / 2, 0, 0]}>
        <boxGeometry args={[arm, thickness, thickness]} />
        <meshBasicMaterial color="#e8dcc0" />
      </mesh>
      <mesh position={[0, arm / 2, 0]}>
        <boxGeometry args={[thickness, arm, thickness]} />
        <meshBasicMaterial color="#e8dcc0" />
      </mesh>
    </group>
  );
}

/** A pulse of the iris stopping down and reopening — the "camera taking its
 * first breath" beat, fired once as the construction settles into idle. Six
 * thin dark blades slide radially in and out from the lens axis, sharing
 * one closedness value driven by a single timeline. */
function ApertureBlades({ trigger }: { trigger: boolean }) {
  const closednessRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  const BLADE_COUNT = 6;

  useFrame((state) => {
    if (trigger && !firedRef.current) {
      firedRef.current = true;
      startRef.current = state.clock.elapsedTime;
    }
    if (startRef.current !== null) {
      const since = state.clock.elapsedTime - startRef.current;
      // Stop down quickly, hold briefly, reopen slower — the same rhythm a
      // real body uses to test the iris on power-up.
      if (since < 0.22) closednessRef.current = since / 0.22;
      else if (since < 0.4) closednessRef.current = 1;
      else if (since < 0.9) closednessRef.current = 1 - (since - 0.4) / 0.5;
      else closednessRef.current = 0;
    }
  });

  return (
    <group>
      {Array.from({ length: BLADE_COUNT }, (_, i) => (
        <BladeWithClosedness key={i} angle={(i / BLADE_COUNT) * Math.PI * 2} closednessRef={closednessRef} />
      ))}
    </group>
  );
}

function BladeWithClosedness({ angle, closednessRef }: { angle: number; closednessRef: RefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const c = closednessRef.current;
    ref.current.position.set(Math.cos(angle) * (0.17 - c * 0.15), Math.sin(angle) * (0.17 - c * 0.15), 0);
  });
  return (
    <mesh ref={ref} rotation={[0, 0, angle + Math.PI / 2]}>
      <planeGeometry args={[0.14, 0.05]} />
      <meshStandardMaterial color="#0c0b09" roughness={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** A subtle mottled, slightly directional grain — cheap, but it's the
 * difference between "flat CSS color" and "a material with a surface." */
function useGrainTexture(baseColor: string, kind: "leather" | "metal") {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);

    if (kind === "leather") {
      for (let i = 0; i < 1600; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const shade = Math.random() > 0.5 ? 255 : 0;
        ctx.fillStyle = `rgba(${shade},${shade},${shade},${0.02 + Math.random() * 0.035})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.5 + Math.random() * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(20,15,8,0.05)";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 26; i++) {
        const y = Math.random() * 256;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(85, y + (Math.random() - 0.5) * 14, 170, y + (Math.random() - 0.5) * 14, 256, y + (Math.random() - 0.5) * 10);
        ctx.stroke();
      }
    } else {
      // Fine horizontal streaks — the anisotropic look of brushed metal.
      for (let i = 0; i < 220; i++) {
        const y = Math.random() * 256;
        const shade = Math.random() > 0.5 ? 255 : 0;
        ctx.strokeStyle = `rgba(${shade},${shade},${shade},${0.02 + Math.random() * 0.05})`;
        ctx.lineWidth = 0.4 + Math.random() * 0.6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y + (Math.random() - 0.5) * 3);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(kind === "leather" ? 3 : 2, kind === "leather" ? 2 : 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [baseColor, kind]);
}

/** A tiny engraved lens marking — baked once, wrapped around the barrel. */
function useLensMarkingTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 512, 64);
    ctx.fillStyle = "rgba(232,220,192,0.85)";
    ctx.font = "italic 15px Georgia";
    ctx.textAlign = "left";
    ctx.fillText("SAIKA  1:2.8  35mm", 14, 26);
    ctx.font = "10px monospace";
    ctx.fillStyle = "rgba(232,220,192,0.5)";
    ctx.fillText("MULTI COATED", 14, 44);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
}

/** Tick marks around the mode dial — decorative, never meant to be read at
 * a glance, just enough detail to survive a close-up. */
function useDialTicksTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 256, 256);
    ctx.strokeStyle = "rgba(58,50,38,0.55)";
    ctx.lineWidth = 2;
    const cx = 128;
    const cy = 128;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const r1 = 110;
      const r2 = i % 3 === 0 ? 92 : 100;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
}

export default function CameraModel({
  phase,
  shutterTrigger,
  capturedImage,
  facing = "front",
  onShutterOver,
  onShutterOut,
  onShutterClick,
  onScreenOver,
  onScreenOut,
  onScreenClick,
  onFacingComplete,
}: CameraModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tiltGroupRef = useRef<THREE.Group>(null);
  const initialY = facing === "back" ? Math.PI : 0;
  const spinFromRef = useRef(initialY);
  const spinToRef = useRef(initialY);
  const spinStartRef = useRef(-Infinity);
  const prevFacingRef = useRef(facing);
  const facingCompleteFiredRef = useRef(true);

  const screenMat = useRef<THREE.MeshStandardMaterial>(null);
  const ledMat = useRef<THREE.MeshStandardMaterial>(null);
  const shutterBtnRef = useRef<THREE.Mesh>(null);
  const topShutterBtnRef = useRef<THREE.Mesh>(null);
  const afGroupRef = useRef<THREE.Group>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const shutterGlowMat = useRef<THREE.MeshStandardMaterial>(null);
  const topShutterGlowMat = useRef<THREE.MeshStandardMaterial>(null);
  const strapSwingRef = useRef<THREE.Group>(null);
  const focusRingRef = useRef<THREE.Mesh>(null);
  const frontGlassRef = useRef<THREE.Mesh>(null);

  const bodyTierRef = useRef<THREE.Group>(null);
  const lensTierRef = useRef<THREE.Group>(null);
  const topTierRef = useRef<THREE.Group>(null);
  const strapTierRef = useRef<THREE.Group>(null);
  const ghostBodyRef = useRef<THREE.Mesh>(null);
  const ghostLensRef = useRef<THREE.Mesh>(null);

  const powerLevelRef = useRef(0);
  const prevPhaseRef = useRef<Phase>(phase);
  const flickerUntilRef = useRef(-Infinity);
  const idleStartRef = useRef<number | null>(null);
  const emergeStartRef = useRef<number | null>(phase === "idle" ? -Infinity : null);
  const apertureFiredRef = useRef(phase === "idle");
  const prevShutterTriggerRef = useRef(shutterTrigger);
  const pressStartRef = useRef(-Infinity);
  const lensHoverRef = useRef(false);
  const lensPowerRef = useRef(0);
  const strapSwingValRef = useRef(0);
  const strapVelRef = useRef(0);
  const prevStrapTriggerRef = useRef(shutterTrigger);

  const leatherTexture = useGrainTexture(BODY_COLOR, "leather");
  const metalTexture = useGrainTexture(METAL_COLOR, "metal");
  const lensMarkingTexture = useLensMarkingTexture();
  const dialTicksTexture = useDialTicksTexture();

  const bodyMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ map: leatherTexture, metalness: 0.04, roughness: 0.68 }),
    [leatherTexture],
  );
  const metalMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ map: metalTexture, metalness: 0.8, roughness: 0.28 }),
    [metalTexture],
  );
  const topPlateMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ map: metalTexture, metalness: 0.7, roughness: 0.4 }),
    [metalTexture],
  );
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#2a3a44",
        metalness: 0.1,
        roughness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.8,
      }),
    [],
  );
  const lensBarrelMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ map: metalTexture, metalness: 0.75, roughness: 0.32 }),
    [metalTexture],
  );
  const lensBadgeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1a1712", map: lensMarkingTexture, roughness: 0.5 }),
    [lensMarkingTexture],
  );
  const screwMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1c1a16", metalness: 0.6, roughness: 0.4 }), []);
  const dialMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ map: dialTicksTexture, color: "#e4d9bd", metalness: 0.3, roughness: 0.5 }),
    [dialTicksTexture],
  );

  // A leather strap hanging between the two lugs — baked once as a curve,
  // never regenerated; the swing comes from rotating the whole strap group
  // around its top, not from reshaping the geometry every frame.
  const strapGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.74, 0, -0.1),
      new THREE.Vector3(-0.7, -0.6, -0.35),
      new THREE.Vector3(0, -0.98, -0.42),
      new THREE.Vector3(0.7, -0.6, -0.35),
      new THREE.Vector3(0.74, 0, -0.1),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.017, 8, false);
  }, []);
  const strapMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#3a2c20", roughness: 0.8, metalness: 0.05 }),
    [],
  );

  // The rear LCD renders real content — a viewfinder HUD while waiting, or
  // the captured photograph once the shutter has fired — drawn to a canvas
  // rather than left as a flat tinted rectangle.
  const screenCanvas = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 288;
    return canvas;
  }, []);
  const screenTexture = useMemo(() => new THREE.CanvasTexture(screenCanvas), [screenCanvas]);
  const capturedImageRef = useRef<HTMLImageElement | null>(null);

  const drawScreen = () => {
    const ctx = screenCanvas.getContext("2d");
    if (!ctx) return;
    const w = screenCanvas.width;
    const h = screenCanvas.height;
    ctx.fillStyle = "#100f0c";
    ctx.fillRect(0, 0, w, h);

    const img = capturedImageRef.current;
    if (capturedImage && img) {
      const imgRatio = img.width / img.height;
      const boxRatio = w / h;
      let dw = w;
      let dh = h;
      if (imgRatio > boxRatio) {
        dh = h;
        dw = h * imgRatio;
      } else {
        dw = w;
        dh = w / imgRatio;
      }
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);

      const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.75);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      const topScrim = ctx.createLinearGradient(0, 0, 0, h * 0.22);
      topScrim.addColorStop(0, "rgba(0,0,0,0.4)");
      topScrim.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topScrim;
      ctx.fillRect(0, 0, w, h * 0.22);

      ctx.fillStyle = "rgba(244,239,230,0.92)";
      ctx.font = "italic 19px Georgia";
      ctx.textAlign = "center";
      const ctxWithSpacing = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
      ctxWithSpacing.letterSpacing = "2px";
      ctx.fillText("Saika Cinematics", w / 2, 32);
      ctxWithSpacing.letterSpacing = "0px";

      ctx.fillStyle = "rgba(244,239,230,0.85)";
      ctx.font = "13px monospace";
      ctx.textAlign = "left";
      ctx.fillText("f/2.8   1/125   ISO 200", 16, h - 16);
      ctx.textAlign = "right";
      ctx.fillText("1 / 1", w - 16, h - 16);
    } else {
      ctx.strokeStyle = "rgba(233,217,189,0.7)";
      ctx.lineWidth = 1.5;
      const m = 18;
      const len = 22;
      ctx.beginPath();
      ctx.moveTo(m, m + len); ctx.lineTo(m, m); ctx.lineTo(m + len, m);
      ctx.moveTo(w - m - len, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + len);
      ctx.moveTo(m, h - m - len); ctx.lineTo(m, h - m); ctx.lineTo(m + len, h - m);
      ctx.moveTo(w - m - len, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - len);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w / 2 - 10, h / 2);
      ctx.lineTo(w / 2 + 10, h / 2);
      ctx.moveTo(w / 2, h / 2 - 10);
      ctx.lineTo(w / 2, h / 2 + 10);
      ctx.stroke();

      ctx.fillStyle = "#cfae7a";
      ctx.font = "15px monospace";
      ctx.textAlign = "left";
      ctx.fillText("f/2.8   1/125   ISO 200", 20, h - 22);
      ctx.textAlign = "right";
      ctx.fillText("▮▮▮▯ 78%", w - 20, 30);
    }

    screenTexture.needsUpdate = true;
  };

  useEffect(() => {
    if (!capturedImage) {
      capturedImageRef.current = null;
      drawScreen();
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      capturedImageRef.current = img;
      drawScreen();
    };
    img.src = capturedImage;
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage]);

  useEffect(() => {
    if (groupRef.current) groupRef.current.rotation.y = initialY;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;

    g.position.y = BASE_Y + Math.sin(t * 0.45) * 0.09;
    g.position.x = BASE_X + Math.sin(t * 0.3) * 0.04;
    g.position.z = Math.cos(t * 0.35) * 0.05;

    // Mouse parallax — a subtle tilt on a child group, independent of the
    // scripted Y-axis turn on the outer group, so the two never fight.
    if (tiltGroupRef.current) {
      const targetTiltX = -state.pointer.y * 0.1;
      const targetTiltZ = state.pointer.x * 0.07;
      const smoothing = 1 - Math.exp(-delta * 2.5);
      tiltGroupRef.current.rotation.x += (targetTiltX - tiltGroupRef.current.rotation.x) * smoothing;
      tiltGroupRef.current.rotation.z += (targetTiltZ - tiltGroupRef.current.rotation.z) * smoothing;
    }

    if (facing !== prevFacingRef.current) {
      spinFromRef.current = g.rotation.y;
      spinToRef.current = facing === "back" ? Math.PI : 0;
      spinStartRef.current = t;
      facingCompleteFiredRef.current = facing !== "back";
      prevFacingRef.current = facing;
    }
    const sinceSpin = t - spinStartRef.current;
    if (sinceSpin >= 0 && sinceSpin < SPIN_DURATION) {
      const eased = easeInOutCubic(sinceSpin / SPIN_DURATION);
      g.rotation.y = spinFromRef.current + (spinToRef.current - spinFromRef.current) * eased;
    } else if (sinceSpin >= SPIN_DURATION) {
      g.rotation.y = spinToRef.current;
      if (!facingCompleteFiredRef.current) {
        facingCompleteFiredRef.current = true;
        onFacingComplete?.();
      }
    }

    if (prevPhaseRef.current !== phase) {
      if (phase === "idle") {
        flickerUntilRef.current = t + 0.9;
        idleStartRef.current = t;
      }
      // Triggered by *leaving* "dark", not by observing "emerge" directly —
      // a slow first frame (shader compilation, a stalled tab) can let
      // several setTimeout-driven phase changes fire before React commits
      // and useFrame gets to run again, meaning "emerge" itself is never
      // actually seen as the current phase on any given frame. Catching the
      // exit from "dark" instead means the construction sequence still
      // starts correctly even if it has to immediately catch up.
      if (prevPhaseRef.current === "dark" && emergeStartRef.current === null) {
        emergeStartRef.current = t;
      }
      prevPhaseRef.current = phase;
    }

    // The construction sequence — four tiers scaling in with a small
    // overshoot, staggered from the moment construction began.
    const sinceEmerge = emergeStartRef.current === null ? -Infinity : t - emergeStartRef.current;
    if (bodyTierRef.current) bodyTierRef.current.scale.setScalar(constructScale(sinceEmerge, TIER_BODY.delay, TIER_BODY.duration));
    if (lensTierRef.current) lensTierRef.current.scale.setScalar(constructScale(sinceEmerge, TIER_LENS.delay, TIER_LENS.duration));
    if (topTierRef.current) topTierRef.current.scale.setScalar(constructScale(sinceEmerge, TIER_TOP.delay, TIER_TOP.duration));
    if (strapTierRef.current) strapTierRef.current.scale.setScalar(constructScale(sinceEmerge, TIER_STRAP.delay, TIER_STRAP.duration));

    const ghostOpacity = sinceEmerge < 0 ? 0 : Math.max(0, 1 - sinceEmerge / GHOST_FADE) * 0.5;
    if (ghostBodyRef.current) {
      const mat = ghostBodyRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = ghostOpacity;
      ghostBodyRef.current.visible = ghostOpacity > 0.01;
    }
    if (ghostLensRef.current) {
      const mat = ghostLensRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = ghostOpacity;
      ghostLensRef.current.visible = ghostOpacity > 0.01;
    }

    // The aperture takes its first breath once construction has settled —
    // fired exactly once.
    const constructionSettled = sinceEmerge >= TIER_STRAP.delay + TIER_STRAP.duration;
    if (constructionSettled && !apertureFiredRef.current) {
      apertureFiredRef.current = true;
    }

    const target = POWER_TARGET[phase];
    const smoothing = 1 - Math.exp(-delta * 3);
    powerLevelRef.current += (target - powerLevelRef.current) * smoothing;

    let displayPower = powerLevelRef.current;
    if (t < flickerUntilRef.current) {
      displayPower += Math.sin(t * 45) * 0.18 * (flickerUntilRef.current - t);
      displayPower = THREE.MathUtils.clamp(displayPower, 0, 1);
    }

    if (screenMat.current) screenMat.current.emissiveIntensity = displayPower * 1.4;
    if (ledMat.current) ledMat.current.emissiveIntensity = displayPower * 2.2;

    let afOpacity = 0;
    if (phase === "idle" && idleStartRef.current !== null && !capturedImage) {
      const cycleT = (t - idleStartRef.current - 1.2) % AF_CYCLE;
      if (cycleT >= 0 && cycleT < AF_ON) {
        afOpacity = cycleT / AF_ON;
      } else if (cycleT >= AF_ON && cycleT < AF_ON + AF_HOLD) {
        afOpacity = 1;
      } else if (cycleT >= AF_ON + AF_HOLD && cycleT < AF_ON + AF_HOLD + AF_OFF) {
        afOpacity = 1 - (cycleT - AF_ON - AF_HOLD) / AF_OFF;
      }
    }
    if (afGroupRef.current) {
      afGroupRef.current.visible = afOpacity > 0.02;
      afGroupRef.current.scale.setScalar(0.9 + afOpacity * 0.1);
    }

    if (shutterTrigger !== prevShutterTriggerRef.current) {
      pressStartRef.current = t;
      prevShutterTriggerRef.current = shutterTrigger;
    }
    const sincePress = t - pressStartRef.current;
    let pressDepth = 0;
    if (sincePress >= 0 && sincePress < 0.12) {
      pressDepth = sincePress / 0.12;
    } else if (sincePress >= 0.12 && sincePress < 0.27) {
      pressDepth = 1 - (sincePress - 0.12) / 0.15;
    }
    if (shutterBtnRef.current) shutterBtnRef.current.position.z = THREE.MathUtils.lerp(0.18, 0.15, pressDepth);
    if (topShutterBtnRef.current) topShutterBtnRef.current.position.y = THREE.MathUtils.lerp(0.47, 0.44, pressDepth);

    if (rippleRef.current) {
      const rippleT = Math.min(1, sincePress / 1.1);
      if (sincePress >= 0 && rippleT < 1) {
        rippleRef.current.visible = true;
        const eased = 1 - Math.pow(1 - rippleT, 2);
        rippleRef.current.scale.setScalar(1 + eased * 9);
        const mat = rippleRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.5 * (1 - eased);
      } else {
        rippleRef.current.visible = false;
      }
    }

    if (shutterTrigger !== prevStrapTriggerRef.current) {
      strapVelRef.current -= 0.9;
      prevStrapTriggerRef.current = shutterTrigger;
    }
    const strapTarget = Math.sin(t * 0.55) * 0.02;
    strapVelRef.current += (strapTarget - strapSwingValRef.current) * 5 * delta;
    strapVelRef.current *= Math.max(0, 1 - delta * 1.6);
    strapSwingValRef.current += strapVelRef.current * delta;
    if (strapSwingRef.current) strapSwingRef.current.rotation.z = strapSwingValRef.current;

    const lensTarget = lensHoverRef.current ? 1 : 0;
    lensPowerRef.current += (lensTarget - lensPowerRef.current) * (1 - Math.exp(-delta * 5));
    if (focusRingRef.current) focusRingRef.current.scale.setScalar(1 + lensPowerRef.current * 0.04);
    if (frontGlassRef.current) frontGlassRef.current.position.z = 0.68 + lensPowerRef.current * 0.015;

    const invitation = phase === "idle" && !capturedImage ? 0.35 + Math.sin(t * 1.8) * 0.22 : 0.3;
    if (shutterGlowMat.current) shutterGlowMat.current.emissiveIntensity = invitation;
    if (topShutterGlowMat.current) topShutterGlowMat.current.emissiveIntensity = invitation;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.3}>
      <group ref={tiltGroupRef}>
        {/* Ghost outline — a faint wireframe sketch that arrives an instant
            before the solid body, like the shape is being drawn before it's
            built. */}
        <mesh ref={ghostBodyRef} visible={false}>
          <boxGeometry args={[1.54, 0.96, 0.36]} />
          <meshBasicMaterial color="#f4d9a0" wireframe transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh ref={ghostLensRef} position={[0, -0.02, 0.5]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <cylinderGeometry args={[0.27, 0.27, 0.6, 20]} />
          <meshBasicMaterial color="#f4d9a0" wireframe transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Tier one — structure: body, grip, top plate cap, screws. */}
        <group ref={bodyTierRef}>
          <RoundedBox args={[1.5, 0.92, 0.32]} radius={0.045} smoothness={4} material={bodyMaterial} castShadow receiveShadow />
          <RoundedBox args={[0.22, 0.6, 0.15]} radius={0.03} smoothness={3} position={[0.62, -0.08, 0.19]} material={bodyMaterial} castShadow />
          <RoundedBox args={[1.5, 0.09, 0.34]} radius={0.02} smoothness={3} position={[0, 0.44, 0]} material={topPlateMaterial} castShadow />

          {[
            [-0.68, 0.4, 0.17],
            [0.68, 0.4, 0.17],
            [-0.68, -0.4, 0.17],
            [0.68, -0.4, 0.17],
          ].map((p, i) => (
            <mesh key={i} position={p as [number, number, number]} material={screwMaterial}>
              <cylinderGeometry args={[0.012, 0.012, 0.01, 10]} />
            </mesh>
          ))}
        </group>

        {/* Tier two — the lens assembly and its mechanism. */}
        <group ref={lensTierRef}>
          <mesh position={[0, -0.02, 0.17]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
            <cylinderGeometry args={[0.26, 0.26, 0.05, 48]} />
          </mesh>
          <mesh position={[0, -0.02, 0.42]} rotation={[Math.PI / 2, 0, 0]} material={lensBarrelMaterial} castShadow>
            <cylinderGeometry args={[0.23, 0.24, 0.5, 48]} />
          </mesh>
          {/* Engraved lens marking, wrapped around the barrel. */}
          <mesh position={[0, -0.02, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.241, 0.241, 0.1, 48, 1, true]} />
            <primitive object={lensBadgeMaterial} attach="material" />
          </mesh>
          {/* Aperture ring, forward of the barrel. */}
          <mesh position={[0, -0.02, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.235, 0.018, 8, 48]} />
            <meshStandardMaterial map={metalTexture} metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh ref={focusRingRef} position={[0, -0.02, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.235, 0.012, 8, 48]} />
            <meshStandardMaterial color="#4a3a2c" metalness={0.6} roughness={0.55} />
          </mesh>
          <mesh ref={frontGlassRef} position={[0, -0.02, 0.68]} rotation={[Math.PI / 2, 0, 0]} material={glassMaterial}>
            <cylinderGeometry args={[0.19, 0.19, 0.02, 48]} />
          </mesh>
          <group position={[0, -0.02, 0.665]}>
            <ApertureBlades trigger={phase === "idle"} />
          </group>

          <mesh
            position={[0, -0.02, 0.5]}
            rotation={[Math.PI / 2, 0, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              lensHoverRef.current = true;
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              lensHoverRef.current = false;
            }}
          >
            <cylinderGeometry args={[0.27, 0.27, 0.55, 24]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          <mesh ref={rippleRef} position={[0, -0.02, 0.69]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
            <ringGeometry args={[0.19, 0.21, 48]} />
            <meshBasicMaterial color="#fff3d6" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>

          <group ref={afGroupRef} position={[0, -0.02, 0.82]} visible={false}>
            <AFBracket position={[-0.16, 0.16, 0]} rotation={0} />
            <AFBracket position={[0.16, 0.16, 0]} rotation={Math.PI / 2} />
            <AFBracket position={[0.16, -0.16, 0]} rotation={Math.PI} />
            <AFBracket position={[-0.16, -0.16, 0]} rotation={-Math.PI / 2} />
          </group>
        </group>

        {/* Tier three — top-plate trim and controls. */}
        <group ref={topTierRef}>
          <mesh ref={shutterBtnRef} position={[0.62, 0.34, 0.18]} rotation={[0.15, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.065, 0.06, 24]} />
            <meshStandardMaterial color="#c9c2ab" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0.62, 0.375, 0.18]} rotation={[0.15, 0, 0]}>
            <torusGeometry args={[0.045, 0.004, 8, 24]} />
            <meshStandardMaterial ref={shutterGlowMat} color={ACCENT_RED} emissive={ACCENT_RED} emissiveIntensity={0.3} />
          </mesh>
          <mesh
            position={[0.62, 0.36, 0.19]}
            rotation={[0.15, 0, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              onShutterOver();
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              onShutterOut();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onShutterClick();
            }}
          >
            <cylinderGeometry args={[0.15, 0.16, 0.16, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          <mesh ref={topShutterBtnRef} position={[0.45, 0.47, 0.09]}>
            <cylinderGeometry args={[0.055, 0.06, 0.05, 24]} />
            <meshStandardMaterial color="#c9c2ab" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0.45, 0.496, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.04, 0.004, 8, 24]} />
            <meshStandardMaterial ref={topShutterGlowMat} color={ACCENT_RED} emissive={ACCENT_RED} emissiveIntensity={0.3} />
          </mesh>
          <mesh
            position={[0.45, 0.49, 0.09]}
            onPointerOver={(e) => {
              e.stopPropagation();
              onShutterOver();
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              onShutterOut();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onShutterClick();
            }}
          >
            <cylinderGeometry args={[0.14, 0.15, 0.15, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* Mode dial — decorative, top-left of the plate. */}
          <mesh position={[-0.42, 0.5, 0.05]} material={dialMaterial} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.03, 32]} />
          </mesh>
          <mesh position={[-0.42, 0.52, 0.05]} material={metalMaterial}>
            <cylinderGeometry args={[0.012, 0.012, 0.01, 8]} />
          </mesh>

          <mesh position={[0, 0.49, -0.02]} material={metalMaterial}>
            <boxGeometry args={[0.16, 0.05, 0.14]} />
          </mesh>

          <mesh position={[0.3, 0.3, 0.18]}>
            <sphereGeometry args={[0.02, 12, 12]} />
            <meshStandardMaterial ref={ledMat} color="#7fffa0" emissive="#7fffa0" emissiveIntensity={0} toneMapped={false} />
          </mesh>

          <mesh position={[-0.74, 0.32, 0]} rotation={[0, 0, Math.PI / 2]} material={metalMaterial}>
            <torusGeometry args={[0.05, 0.014, 8, 16]} />
          </mesh>
          <mesh position={[0.74, 0.32, 0]} rotation={[0, 0, Math.PI / 2]} material={metalMaterial}>
            <torusGeometry args={[0.05, 0.014, 8, 16]} />
          </mesh>
        </group>

        {/* Rear screen — not part of the construction stagger, since it
            stays dark until the awakening regardless of assembly state. */}
        <mesh
          position={[0, 0, -0.17]}
          rotation={[0, Math.PI, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            onScreenOver();
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onScreenOut();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onScreenClick();
          }}
        >
          <planeGeometry args={[1.2, 0.72]} />
          <meshStandardMaterial ref={screenMat} color="#0d0d0d" emissive="#ffffff" emissiveMap={screenTexture} emissiveIntensity={0} toneMapped={false} />
        </mesh>

        {/* Tier four — the strap, last to settle. */}
        <group ref={strapTierRef}>
          <group ref={strapSwingRef} position={[0, 0.32, 0]}>
            <mesh geometry={strapGeometry} material={strapMaterial} castShadow />
          </group>
        </group>
      </group>
    </group>
  );
}
