import { Component, type ReactNode } from "react";

/**
 * Decorative background layers should never be able to take the whole
 * experience down with them. If one throws (framer-motion / WAAPI edge
 * cases with unusual keyframe shapes have real, hard-to-predict browser
 * quirks), this just quietly drops that one layer instead of crashing the
 * page the visitor is trying to read.
 */
export default class AtmosphereBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn("[AtmosphereBoundary] a background layer failed and was dropped:", error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
