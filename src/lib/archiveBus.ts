/**
 * Lets the persistent "Open Archive" shortcut open the Archive room from
 * anywhere without prop-drilling. Mirrors contactBus.ts's plain
 * subscriber-list pattern — the Archive only has one entry point, so
 * there's no origin/payload to carry, unlike contactBus's shortcut vs.
 * journey distinction.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export function requestArchive() {
  listeners.forEach((l) => l());
}

export function subscribeArchive(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
