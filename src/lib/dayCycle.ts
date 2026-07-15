/** A single source of truth for time-of-day color grading, sampled by both
 * the DOM background gradient and the 3D scene lighting so they stay in sync
 * as the visitor scrolls through the day. */

type Stop = {
  skyTop: string;
  skyBottom: string;
  keyLight: string;
  keyIntensity: number;
  ambient: string;
  ambientIntensity: number;
  // Weather — the same scroll that moves the sun also moves the sky's mood,
  // so the world visibly lives through more than just a palette shift.
  rainIntensity: number;
  fogNear: number;
  fogFar: number;
  cloudOpacity: number;
  cloudTint: string;
  windStrength: number;
};

const STOPS: Stop[] = [
  // dawn — cool, soft, quiet, a light mist still sitting low
  { skyTop: "#dce8f0", skyBottom: "#f5ddc0", keyLight: "#eef2ff", keyIntensity: 1.5, ambient: "#eef2ff", ambientIntensity: 0.6, rainIntensity: 0, fogNear: 3, fogFar: 13, cloudOpacity: 0.55, cloudTint: "#eef2ff", windStrength: 0.3 },
  // late morning — bright, warm-neutral, clear (the default resting state)
  { skyTop: "#cfe0e8", skyBottom: "#fff6e6", keyLight: "#fff8ec", keyIntensity: 1.9, ambient: "#fff6e8", ambientIntensity: 0.75, rainIntensity: 0, fogNear: 6, fogFar: 20, cloudOpacity: 0.3, cloudTint: "#fffaf0", windStrength: 0.15 },
  // golden hour — warm, low, dramatic, dry haze thickening the light
  { skyTop: "#e0b98c", skyBottom: "#f2914f", keyLight: "#ffd9a6", keyIntensity: 1.6, ambient: "#f7c98f", ambientIntensity: 0.55, rainIntensity: 0.05, fogNear: 5, fogFar: 15, cloudOpacity: 0.45, cloudTint: "#f2c98f", windStrength: 0.35 },
  // dusk — dusty, low-key, cooling off, weather finally breaking into rain
  { skyTop: "#8d7fa0", skyBottom: "#d97f5a", keyLight: "#e3a97e", keyIntensity: 1, ambient: "#a6879c", ambientIntensity: 0.4, rainIntensity: 0.85, fogNear: 3, fogFar: 11, cloudOpacity: 0.7, cloudTint: "#8d7fa0", windStrength: 0.8 },
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex([r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t]);
}

export function sampleDayCycle(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const segments = STOPS.length - 1;
  const scaled = p * segments;
  const i = Math.min(segments - 1, Math.floor(scaled));
  const t = scaled - i;
  const a = STOPS[i];
  const b = STOPS[i + 1];

  return {
    skyTop: lerpColor(a.skyTop, b.skyTop, t),
    skyBottom: lerpColor(a.skyBottom, b.skyBottom, t),
    keyLight: lerpColor(a.keyLight, b.keyLight, t),
    keyIntensity: a.keyIntensity + (b.keyIntensity - a.keyIntensity) * t,
    ambient: lerpColor(a.ambient, b.ambient, t),
    ambientIntensity: a.ambientIntensity + (b.ambientIntensity - a.ambientIntensity) * t,
    rainIntensity: a.rainIntensity + (b.rainIntensity - a.rainIntensity) * t,
    fogNear: a.fogNear + (b.fogNear - a.fogNear) * t,
    fogFar: a.fogFar + (b.fogFar - a.fogFar) * t,
    cloudOpacity: a.cloudOpacity + (b.cloudOpacity - a.cloudOpacity) * t,
    cloudTint: lerpColor(a.cloudTint, b.cloudTint, t),
    windStrength: a.windStrength + (b.windStrength - a.windStrength) * t,
  };
}
