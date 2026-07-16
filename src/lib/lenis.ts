import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooths the actual page scroll (native `scrollY` keeps advancing, just
 * eased toward its target over a few frames) rather than replacing it with
 * a transformed content wrapper — every existing `useScroll()`/
 * `IntersectionObserver`/`scrollIntoView` call in the story keeps reading
 * real scroll position unchanged. This is the difference between "the page
 * glides" and "the page is a diorama on rails."
 */
export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    let frame: number;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
}
