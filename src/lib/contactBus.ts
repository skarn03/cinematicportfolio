/**
 * Lets any surface in the portfolio — a persistent corner link, or the
 * button at the very end of the journey — open the same 3D contact scene
 * without prop-drilling it through every chapter. Mirrors cursorBus.ts's
 * plain subscriber-list pattern.
 */
export type ContactOrigin = "shortcut" | "journey";

export type ContactRequest = {
  origin: ContactOrigin;
  /** Only set for the "journey" origin — the existing rewind-to-the-
   * beginning mechanic, offered as the way to leave the contact scene
   * once you arrived here by finishing the roll rather than by the
   * shortcut. */
  onContinue?: () => void;
};

type Listener = (request: ContactRequest) => void;

const listeners = new Set<Listener>();

export function requestContact(request: ContactRequest) {
  listeners.forEach((l) => l(request));
}

export function subscribeContact(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
