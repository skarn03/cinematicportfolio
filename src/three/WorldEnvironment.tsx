import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, GradientTexture } from "@react-three/drei";
import * as THREE from "three";

/** A soft, seamless backdrop wrapped around the whole world — the "curved
 * wall" the brief asks for, not a room with corners. Pure gradient, no
 * graphic linework, no framed art: the eye has nothing to read here except
 * color and light. */
function Backdrop({ top, bottom }: { top: string; bottom: string }) {
  return (
    <mesh scale={30}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial side={THREE.BackSide} depthWrite={false} fog={false}>
        <GradientTexture stops={[0, 1]} colors={[top, bottom]} size={256} />
      </meshBasicMaterial>
    </mesh>
  );
}

/** Soft, blurred cloud blobs painted onto a canvas — the one texture layer
 * kept from the old room, because moving cloud shadows are explicitly part
 * of the brief's cinematic-lighting ask. Barely-there and slow. */
function useCloudTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 1024, 512);
    ctx.filter = "blur(24px)";
    ctx.fillStyle = "rgba(255,252,244,0.9)";
    for (let i = 0; i < 22; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 320 + 30;
      const r = 60 + Math.random() * 140;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }, []);
}

function CloudLayer({ opacity, tint, wind }: { opacity: number; tint: string; wind: number }) {
  const map = useCloudTexture();
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * (0.003 + wind * 0.02);
    if (matRef.current) {
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, opacity, 1 - Math.exp(-delta * 1.5));
      matRef.current.color.lerp(new THREE.Color(tint), 1 - Math.exp(-delta * 1.5));
    }
  });
  return (
    <mesh ref={ref} scale={26}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        ref={matRef}
        map={map}
        color={tint}
        transparent
        opacity={opacity * 0.5}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

/** Rain — thin falling streaks that fade in as the day's weather turns.
 * Invisible (and free) whenever intensity is at or near zero. */
function Rain({ intensity }: { intensity: number }) {
  const COUNT = 200;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const drops = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: (Math.random() - 0.5) * 14,
        z: (Math.random() - 0.5) * 14,
        y: Math.random() * 12 - 3,
        speed: 5 + Math.random() * 5,
      })),
    [],
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.visible = intensity > 0.02;
    if (!mesh.visible) return;
    for (let i = 0; i < COUNT; i++) {
      const d = drops[i];
      d.y -= d.speed * delta;
      if (d.y < -3) {
        d.y = 8 + Math.random() * 2;
        d.x = (Math.random() - 0.5) * 14;
        d.z = (Math.random() - 0.5) * 14;
      }
      dummy.position.set(d.x, d.y, d.z);
      dummy.scale.set(1, 0.4 + intensity * 0.3, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = intensity * 0.4;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <cylinderGeometry args={[0.004, 0.004, 1, 4]} />
      <meshBasicMaterial color="#cfe0e8" transparent opacity={0} depthWrite={false} fog={false} />
    </instancedMesh>
  );
}

/** A soft rectangle of light hanging in the air, not attached to anything —
 * exactly the "floating light plane" the brief calls for, doing the work a
 * softbox does on a real product shoot: a bounce source the eye reads as
 * light, not as an object. */
function LightPlane({
  position,
  rotation = [0, 0, 0],
  size,
  color,
  opacity,
  drift = 0.15,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  color: string;
  opacity: number;
  drift?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const seed = useMemo(() => Math.random() * 40, []);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime * 0.12 + seed;
    m.position.set(position[0] + Math.sin(t) * drift, position[1] + Math.cos(t * 0.8) * drift * 0.6, position[2]);
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} fog={false} />
    </mesh>
  );
}

/** A single volumetric shaft of light, drifting through the haze — cinematic
 * lighting doing the storytelling the brief asks for, rather than props. */
function LightShaft({
  position,
  rotation,
  scale,
  speed,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.05 + Math.sin(state.clock.elapsedTime * speed) * 0.025 + 0.025;
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#fff3d6" transparent opacity={0.06} depthWrite={false} side={THREE.DoubleSide} fog={false} />
    </mesh>
  );
}

/** Chapter Zero — an abstract stage, not a room. Nothing here is a prop the
 * eye is meant to inspect; everything is light, haze, and a soft place for
 * a shadow to fall. The camera is the only object in the world. */
export default function WorldEnvironment({
  skyTop,
  skyBottom,
  rainIntensity,
  cloudOpacity,
  cloudTint,
  windStrength,
}: {
  skyTop: string;
  skyBottom: string;
  rainIntensity: number;
  cloudOpacity: number;
  cloudTint: string;
  windStrength: number;
}) {
  return (
    <>
      <Backdrop top={skyTop} bottom={skyBottom} />
      <CloudLayer opacity={cloudOpacity} tint={cloudTint} wind={windStrength} />
      <Rain intensity={rainIntensity} />

      {/* A soft, blurred pool of contact shadow beneath the camera — the
          "large shadow" grounding the object without a literal desk or
          floor to compete with it. */}
      <ContactShadows position={[0, -1.55, 0]} opacity={0.42} scale={9} blur={2.6} far={3} resolution={512} color="#231a10" frames={1} />

      <LightPlane position={[-3.2, 1.4, -3.5]} size={[3.4, 2.2]} color="#fff3d6" opacity={0.05} drift={0.3} />
      <LightPlane position={[3.6, -0.6, -4]} size={[2.6, 3]} color="#cfe0e8" opacity={0.045} drift={0.24} />
      <LightPlane position={[0, 3.2, -5]} size={[5, 2]} color="#f4efe6" opacity={0.06} drift={0.18} />

      <LightShaft position={[-2.2, 2.6, -2]} rotation={[0.3, 0.5, 1.1]} scale={[2.6, 11, 1]} speed={0.15} />
      <LightShaft position={[2.6, 1.8, -2.6]} rotation={[0.2, -0.4, 0.9]} scale={[2, 9, 1]} speed={0.11} />
    </>
  );
}
