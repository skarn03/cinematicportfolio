import { Component, type ReactNode } from "react";

/**
 * Unlike AtmosphereBoundary (decoration that's fine to just drop), the
 * 3D camera is the entire opening of the site — if it throws (a shader
 * fails to compile, a driver-specific WebGL quirk on some Android GPU),
 * the visitor needs the fallback passed in as `fallback`, not a blank
 * screen where the camera used to be.
 */
export default class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn("[WebGLErrorBoundary] the 3D scene failed and fell back to the static intro:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
