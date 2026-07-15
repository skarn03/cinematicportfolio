/**
 * Lets non-DOM surfaces (the R3F canvas, where the shutter button lives)
 * drive the same custom-cursor hover state as real DOM elements do via
 * `data-cursor-hover`. Plain subscriber list — no store needed for one bit.
 */
type Listener = (hovering: boolean) => void;

const listeners = new Set<Listener>();

export function setCursorHover(hovering: boolean) {
  listeners.forEach((l) => l(hovering));
}

export function subscribeCursorHover(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
