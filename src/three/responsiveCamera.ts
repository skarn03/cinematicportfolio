/**
 * A perspective camera's `fov` is vertical — the effective HORIZONTAL
 * field of view shrinks as the viewport gets narrower/taller, since
 * horizontal FOV is derived from `fov` and `aspect` together. A distance
 * tuned to frame the (wide, landscape-oriented) camera model nicely on a
 * desktop window crops it badly on a portrait phone, where `aspect` drops
 * well below 1.
 *
 * This scales a reference distance up — never down — once the aspect
 * ratio falls below the desktop reference, so the object's horizontal
 * framing stays roughly consistent across orientations instead of
 * appearing to zoom in as the screen gets narrower. Desktop/landscape
 * viewports (aspect >= reference) are returned unchanged, so there's no
 * regression to the framing that was already tuned for them.
 */
const REFERENCE_ASPECT = 1.5;

export function scaleForAspect(distance: number, aspect: number): number {
  if (!aspect || aspect >= REFERENCE_ASPECT) return distance;
  return distance * (REFERENCE_ASPECT / aspect);
}

/** Best-effort synchronous read of the window's aspect ratio, for the
 * very first frame before a Canvas has reported its own size back. */
export function initialWindowAspect(): number {
  if (typeof window === "undefined") return REFERENCE_ASPECT;
  return window.innerWidth / window.innerHeight;
}
