import { useCallback, useRef, useState } from "react";

/**
 * A soft, evolving ambient drone synthesized in-browser (no external audio
 * file to keep this reliable). Several detuned oscillators through a slow
 * filter sweep, gated well below listening-fatigue volume.
 */
export function useAmbientSound() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  const start = useCallback(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx: AudioContext = ctxRef.current ?? new AudioCtx();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2.5);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    filter.connect(master);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const freqs = [55, 82.4, 110, 164.8];
    const oscillators = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = f;
      const gain = ctx.createGain();
      gain.gain.value = 1 / freqs.length;
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      return osc;
    });

    nodesRef.current = {
      stop: () => {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
        setTimeout(() => {
          oscillators.forEach((o) => o.stop());
          lfo.stop();
        }, 1300);
      },
    };
    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    nodesRef.current?.stop();
    nodesRef.current = null;
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (playing) stop();
    else start();
  }, [playing, start, stop]);

  return { playing, toggle };
}
