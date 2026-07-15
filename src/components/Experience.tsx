import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraIntro from "./CameraIntro";
import RewindOverlay from "./RewindOverlay";
import Story from "../story/Story";
import { heroImage, closingImage } from "../data/media";

const HERO_IMAGE = heroImage.src;
const FINAL_IMAGE = closingImage.src;

// How long the camera and the story cross-dissolve into one another — kept
// in one place so both sides of the fade agree on timing.
const CROSSFADE_SECONDS = 1.3;
const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * The whole journey lives in one state machine here:
 *
 *   intro -> entering -> story -> leaving -> exiting -> outro -> entering -> ...
 *
 * `intro`/`outro` show only the camera. `story` shows only the editorial
 * scroll. The phases between are where both are briefly mounted together,
 * cross-fading into one another — the camera does its own slow push toward
 * (or pull back from) the LCD on either side of that fade, entirely inside
 * CameraIntro/Scene; this component only owns the fade itself.
 */
type Phase = "intro" | "entering" | "story" | "leaving" | "exiting" | "outro";

export default function Experience() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [storyKey, setStoryKey] = useState(0);
  const [startZoomOut, setStartZoomOut] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const cameraMode = phase === "outro" || phase === "leaving" || phase === "exiting" ? "closing" : "opening";
  // Invisible the moment it (re)mounts for the closing scene, and while
  // fading out on the way into the story — visible everywhere else.
  const cameraOpacity = phase === "entering" || phase === "leaving" ? 0 : 1;

  const handleRequestEnter = () => {
    if (phase !== "intro" && phase !== "outro") return;
    setStartZoomOut(false);
    setPhase("entering");
    timers.current.push(setTimeout(() => setPhase("story"), CROSSFADE_SECONDS * 1000));
  };

  const handleReachEnd = () => {
    if (phase !== "story") return;
    setPhase("leaving");
    // The closing camera mounts already zoomed in on the final photo, so
    // there's nothing to wait on — the cross-fade can start right away.
    timers.current.push(setTimeout(() => setPhase("exiting"), 50));
  };

  useEffect(() => {
    if (phase !== "exiting") return;
    const timer = setTimeout(() => {
      setStoryKey((k) => k + 1);
      setStartZoomOut(true);
      setPhase("outro");
    }, CROSSFADE_SECONDS * 1000);
    timers.current.push(timer);
    return () => clearTimeout(timer);
  }, [phase]);

  const showCamera = phase !== "story";
  const showStory = phase === "entering" || phase === "story" || phase === "leaving" || phase === "exiting";
  const showRewind = phase === "leaving" || phase === "exiting";

  return (
    <>
      <AnimatePresence>{showRewind && <RewindOverlay key="rewind" />}</AnimatePresence>

      {showCamera && (
        <motion.div
          initial={false}
          animate={{ opacity: cameraOpacity }}
          transition={{ duration: CROSSFADE_SECONDS, ease: EASE }}
        >
          <CameraIntro
            mode={cameraMode}
            capturedImage={cameraMode === "closing" ? FINAL_IMAGE : HERO_IMAGE}
            sentence={
              cameraMode === "closing"
                ? "That's the last frame on this roll."
                : "Haven't put this camera down all day."
            }
            startZoomOut={cameraMode === "closing" ? startZoomOut : undefined}
            onRequestEnter={handleRequestEnter}
          />
        </motion.div>
      )}

      {showStory && (
        <motion.div
          className="relative z-45"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "exiting" ? 0 : 1 }}
          transition={{ duration: CROSSFADE_SECONDS, ease: EASE }}
          style={{ pointerEvents: phase === "story" ? "auto" : "none" }}
        >
          <Story key={storyKey} onReachEnd={handleReachEnd} />
        </motion.div>
      )}
    </>
  );
}
