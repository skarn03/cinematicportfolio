import { useCallback, useRef, useState } from "react";

export type AmbientLayer = "none" | "wind" | "projector";

/**
 * A soft, evolving ambient drone synthesized in-browser (no external audio
 * file to keep this reliable), plus two optional textures layered on top of
 * it — a filtered-noise wind for the outdoor chapters and a low projector
 * hum with a subtle flutter for the cinema chapter. All three exist as soon
 * as sound is switched on; `setLayer` only ever crossfades between them, so
 * changing chapters never clicks or restarts anything.
 */
export function useAmbientSound() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void; setLayer: (l: AmbientLayer) => void } | null>(null);

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

    // Wind — brownian noise through a slowly wandering bandpass, the
    // texture behind an open field or a dusk skyline, not a hiss.
    const windGain = ctx.createGain();
    windGain.gain.value = 0;
    windGain.connect(master);

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < noiseData.length; i++) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.02 * white) / 1.02;
      noiseData[i] = brown * 3.2;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 500;
    windFilter.Q.value = 0.6;
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.07;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 300;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);
    noiseSource.connect(windFilter);
    windFilter.connect(windGain);
    noiseSource.start();
    windLfo.start();

    // Projector hum — a low steady tone with a faint flutter, the room
    // tone under the cinema chapter.
    const projGain = ctx.createGain();
    projGain.gain.value = 0;
    projGain.connect(master);
    const projOsc = ctx.createOscillator();
    projOsc.type = "sawtooth";
    projOsc.frequency.value = 90;
    const projFilter = ctx.createBiquadFilter();
    projFilter.type = "lowpass";
    projFilter.frequency.value = 220;
    const flutter = ctx.createOscillator();
    flutter.frequency.value = 6.5;
    const flutterGain = ctx.createGain();
    flutterGain.gain.value = 3;
    flutter.connect(flutterGain);
    flutterGain.connect(projOsc.frequency);
    projOsc.connect(projFilter);
    projFilter.connect(projGain);
    projOsc.start();
    flutter.start();

    const setLayer = (layer: AmbientLayer) => {
      const now = ctx.currentTime;
      windGain.gain.linearRampToValueAtTime(layer === "wind" ? 0.055 : 0, now + 1.6);
      projGain.gain.linearRampToValueAtTime(layer === "projector" ? 0.045 : 0, now + 1.6);
    };

    nodesRef.current = {
      setLayer,
      stop: () => {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
        setTimeout(() => {
          oscillators.forEach((o) => o.stop());
          lfo.stop();
          noiseSource.stop();
          windLfo.stop();
          projOsc.stop();
          flutter.stop();
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

  const setLayer = useCallback((layer: AmbientLayer) => {
    nodesRef.current?.setLayer(layer);
  }, []);

  return { playing, toggle, setLayer };
}
