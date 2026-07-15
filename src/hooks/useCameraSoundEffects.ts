import { useCallback, useRef } from "react";

/**
 * Short mechanical sound effects synthesized in-browser (noise bursts through
 * a filter + tight gain envelope) — no external audio file, so there's
 * nothing to fail to load and no licensing to track.
 */
export function useCameraSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = ctxRef.current ?? new AudioCtx();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }, []);

  const noiseBurst = useCallback(
    (ctx: AudioContext, {
      startAt,
      duration,
      filterType,
      filterFreq,
      q = 1,
      peakGain,
      attack = 0.002,
    }: {
      startAt: number;
      duration: number;
      filterType: BiquadFilterType;
      filterFreq: number;
      q?: number;
      peakGain: number;
      attack?: number;
    }) => {
      const bufferSize = Math.ceil(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = filterFreq;
      filter.Q.value = q;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(peakGain, startAt + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(startAt);
      source.stop(startAt + duration + 0.02);
    },
    [],
  );

  /** A faint mechanical click — the camera stirring awake. */
  const playWakeClick = useCallback(() => {
    const ctx = getCtx();
    noiseBurst(ctx, {
      startAt: ctx.currentTime,
      duration: 0.045,
      filterType: "bandpass",
      filterFreq: 2200,
      q: 2.2,
      peakGain: 0.12,
    });
  }, [getCtx, noiseBurst]);

  /** A crisp two-stage clack — the shutter curtain opening and closing. */
  const playShutter = useCallback(() => {
    const ctx = getCtx();
    const t0 = ctx.currentTime;
    noiseBurst(ctx, {
      startAt: t0,
      duration: 0.03,
      filterType: "highpass",
      filterFreq: 3200,
      q: 0.8,
      peakGain: 0.22,
      attack: 0.001,
    });
    noiseBurst(ctx, {
      startAt: t0 + 0.075,
      duration: 0.05,
      filterType: "bandpass",
      filterFreq: 1200,
      q: 1.4,
      peakGain: 0.18,
      attack: 0.001,
    });
  }, [getCtx, noiseBurst]);

  return { playWakeClick, playShutter };
}
