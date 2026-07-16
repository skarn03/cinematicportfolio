/**
 * A real, cheap probe rather than a UA sniff — some Android WebViews and
 * low-memory devices report a WebGL-capable UA but fail to actually hand
 * back a context (GPU process crashed, driver blocklisted, out of GPU
 * memory from another tab). Creating a throwaway canvas and asking for
 * the context directly is the only reliable way to know before mounting
 * the real one.
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

/** A coarse-pointer/touch device, used to dial back GPU load rather than
 * to change any layout — phones and budget tablets are exactly the
 * population most likely to have a GPU driver that kills the context
 * under memory pressure, so they get a lighter scene, not a different
 * one. */
export function isLikelyLowPowerDevice(): boolean {
  if (typeof window === "undefined") return false;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  return coarsePointer && fewCores;
}
