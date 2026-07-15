import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles, Billboard } from "@react-three/drei";
import * as THREE from "three";
import CameraModel from "./CameraModel";
import WorldEnvironment from "./WorldEnvironment";
import { setCursorHover } from "../lib/cursorBus";
import { scaleForAspect, initialWindowAspect } from "./responsiveCamera";
import type { sampleDayCycle } from "../lib/dayCycle";

type ScenePhase = "dark" | "emerge" | "idle";
type DayColors = ReturnType<typeof sampleDayCycle>;
type DollyStage = "rest" | "close";

// Pulled back further than the object's own footprint would need, so the
// camera reads as a piece sitting in a room with air around it rather than
// filling the frame edge to edge.
const BASE_CAMERA_Z = 4.5;
// How close the slow story-transition dolly pushes in — tight enough that
// the LCD's photo fills essentially the whole frame before the crossfade.
const CLOSE_Z = 1.05;
const ZOOM_DURATION = 2.6;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function Rig({
  phase,
  shutterTrigger,
  capturedImage,
  facing,
  dollyStage,
  onShutterHover,
  onShutterClick,
  onScreenHover,
  onScreenClick,
  onFacingComplete,
  onDollyComplete,
}: {
  phase: ScenePhase;
  shutterTrigger: number;
  capturedImage: string | null;
  facing: "front" | "back";
  dollyStage: DollyStage;
  onShutterHover: (hovering: boolean) => void;
  onShutterClick: () => void;
  onScreenHover: (hovering: boolean) => void;
  onScreenClick: () => void;
  onFacingComplete?: () => void;
  onDollyComplete?: () => void;
}) {
  const initialAspect = initialWindowAspect();
  const zoomFromRef = useRef(dollyStage === "close" ? scaleForAspect(CLOSE_Z, initialAspect) : scaleForAspect(BASE_CAMERA_Z, initialAspect));
  const zoomToRef = useRef(dollyStage === "close" ? scaleForAspect(CLOSE_Z, initialAspect) : scaleForAspect(BASE_CAMERA_Z, initialAspect));
  const zoomStartRef = useRef(-Infinity);
  const prevDollyStageRef = useRef(dollyStage);
  const zoomCompleteFiredRef = useRef(true);
  const prevAspectRef = useRef(initialAspect);

  useFrame((state) => {
    // A portrait phone has a much narrower aspect ratio than the desktop
    // window this framing was tuned on — since `fov` is vertical, the
    // same distance shows far less width on a tall/narrow screen, cropping
    // the (wide) camera model at both edges. Re-target both dolly ends
    // whenever the aspect ratio actually changes (resize, orientation
    // flip) rather than every frame, so this never fights the animation
    // that's already in flight.
    const aspect = state.size.width / state.size.height;
    if (aspect !== prevAspectRef.current) {
      const prevBase = scaleForAspect(BASE_CAMERA_Z, prevAspectRef.current);
      const prevClose = scaleForAspect(CLOSE_Z, prevAspectRef.current);
      const nextBase = scaleForAspect(BASE_CAMERA_Z, aspect);
      const nextClose = scaleForAspect(CLOSE_Z, aspect);
      if (zoomFromRef.current === prevBase) zoomFromRef.current = nextBase;
      else if (zoomFromRef.current === prevClose) zoomFromRef.current = nextClose;
      if (zoomToRef.current === prevBase) zoomToRef.current = nextBase;
      else if (zoomToRef.current === prevClose) zoomToRef.current = nextClose;
      prevAspectRef.current = aspect;
    }

    // The slow, deliberate push toward (or pull back from) the LCD that
    // carries the story transition — a single scripted move, not something
    // the visitor drives. The camera holds its resting position through the
    // shutter click itself (the spin is the only motion there); this is the
    // one dolly move in the whole sequence, so nothing else competes with it
    // or has to be "returned from" first.
    if (dollyStage !== prevDollyStageRef.current) {
      zoomFromRef.current = state.camera.position.z;
      zoomToRef.current = dollyStage === "close" ? scaleForAspect(CLOSE_Z, aspect) : scaleForAspect(BASE_CAMERA_Z, aspect);
      zoomStartRef.current = state.clock.elapsedTime;
      // Only the push-in direction has anyone waiting on completion.
      zoomCompleteFiredRef.current = dollyStage !== "close";
      prevDollyStageRef.current = dollyStage;
    }
    const sinceZoom = state.clock.elapsedTime - zoomStartRef.current;
    if (sinceZoom >= 0 && sinceZoom < ZOOM_DURATION) {
      const eased = easeInOutCubic(sinceZoom / ZOOM_DURATION);
      state.camera.position.z = zoomFromRef.current + (zoomToRef.current - zoomFromRef.current) * eased;
    } else if (sinceZoom >= ZOOM_DURATION) {
      state.camera.position.z = zoomToRef.current;
      if (!zoomCompleteFiredRef.current) {
        zoomCompleteFiredRef.current = true;
        onDollyComplete?.();
      }
    }
  });

  return (
    <CameraModel
      phase={phase}
      shutterTrigger={shutterTrigger}
      capturedImage={capturedImage}
      facing={facing}
      onShutterOver={() => {
        setCursorHover(true);
        onShutterHover(true);
      }}
      onShutterOut={() => {
        setCursorHover(false);
        onShutterHover(false);
      }}
      onShutterClick={onShutterClick}
      onScreenOver={() => {
        setCursorHover(true);
        onScreenHover(true);
      }}
      onScreenOut={() => {
        setCursorHover(false);
        onScreenHover(false);
      }}
      onScreenClick={onScreenClick}
      onFacingComplete={onFacingComplete}
    />
  );
}

export default function Scene({
  phase,
  shutterTrigger,
  capturedImage,
  facing = "front",
  dollyStage = "rest",
  dayColors,
  onShutterHover,
  onShutterClick,
  onScreenHover,
  onScreenClick,
  onFacingComplete,
  onDollyComplete,
}: {
  phase: ScenePhase;
  shutterTrigger: number;
  capturedImage: string | null;
  facing?: "front" | "back";
  dollyStage?: DollyStage;
  dayColors: DayColors;
  onShutterHover: (hovering: boolean) => void;
  onShutterClick: () => void;
  onScreenHover: (hovering: boolean) => void;
  onScreenClick: () => void;
  onFacingComplete?: () => void;
  onDollyComplete?: () => void;
}) {
  const [dpr] = useState(() => Math.min(window.devicePixelRatio, 2));
  const [initialZ] = useState(() => scaleForAspect(BASE_CAMERA_Z, initialWindowAspect()));

  return (
    <Canvas
      dpr={dpr}
      shadows
      camera={{ position: [0, 0, initialZ], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      className="absolute! inset-0"
    >
      {/* The environment is a character too — a real sky, a table underfoot,
          fog and weather — sampled from the same day-cycle driving the DOM
          background, so scrolling through the day evolves both together. */}
      <fog attach="fog" args={[dayColors.skyBottom, dayColors.fogNear, dayColors.fogFar]} />
      <Suspense fallback={null}>
        <WorldEnvironment
          skyTop={dayColors.skyTop}
          skyBottom={dayColors.skyBottom}
          rainIntensity={dayColors.rainIntensity}
          cloudOpacity={dayColors.cloudOpacity}
          cloudTint={dayColors.cloudTint}
          windStrength={dayColors.windStrength}
        />
      </Suspense>

      {/* Cinematic product lighting — warm morning key, soft fill, and a
          dedicated rim light from behind that separates the camera's edge
          from the backdrop the way a real product shoot would, rather than
          leaving it flatly lit against its surroundings. */}
      <ambientLight intensity={dayColors.ambientIntensity} color={dayColors.ambient} />
      <directionalLight
        position={[2.5, 2.5, 3]}
        intensity={dayColors.keyIntensity}
        color={dayColors.keyLight}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 0.5, -1.5]} intensity={0.4} color="#f2d9ad" />
      <directionalLight position={[-1.2, 1.7, -4]} intensity={1.15} color="#ffedc4" />
      <pointLight position={[0, -1.2, 2]} intensity={0.4} color="#d9a856" />

      {/* Procedural, in-scene environment map — no remote HDR fetch, no
          expensive PMREM decode of a downloaded image. This is what was
          causing GPU readback stalls and WebGL context loss for some users. */}
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={3.2} color="#fffaf0" position={[3, 2, 4]} scale={[4, 3, 1]} />
        <Lightformer intensity={0.55} color="#e4ecee" position={[-4, -1, -3]} scale={[5, 4, 1]} />
        <Lightformer intensity={1.7} color="#f0b876" position={[0, -3, 2]} scale={[3, 2, 1]} />
        <Lightformer form="ring" intensity={2.2} color="#fff6e6" position={[0, 3, -2]} scale={3} />
      </Environment>

      {/* A soft double-glow standing in for lens flare, held near the key
          light's direction — subtle enough to read as atmosphere, not a
          sci-fi effect. */}
      <Billboard position={[2.1, 1.7, 2.4]}>
        <mesh>
          <circleGeometry args={[0.55, 32]} />
          <meshBasicMaterial color="#fff6df" transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh>
          <circleGeometry args={[0.16, 32]} />
          <meshBasicMaterial color="#fffdf5" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </Billboard>

      {/* Dust filling the air around the camera. */}
      <Sparkles count={110} scale={[9, 12, 9]} position={[0, 2, 0]} size={1.6} speed={0.12} opacity={0.5} color="#d9a856" />
      <Sparkles count={60} scale={[6, 10, 6]} position={[0, 2, 0]} size={3.2} speed={0.07} opacity={0.55} color="#c97b3f" />
      <Sparkles count={40} scale={[12, 14, 12]} position={[0, 2, 0]} size={4.6} speed={0.04} opacity={0.3} color="#8fb8cf" />

      <Rig
        phase={phase}
        shutterTrigger={shutterTrigger}
        capturedImage={capturedImage}
        facing={facing}
        dollyStage={dollyStage}
        onShutterHover={onShutterHover}
        onShutterClick={onShutterClick}
        onScreenHover={onScreenHover}
        onScreenClick={onScreenClick}
        onFacingComplete={onFacingComplete}
        onDollyComplete={onDollyComplete}
      />
    </Canvas>
  );
}
