import { motion, useScroll, useSpring } from "framer-motion";
import { useChapterTheme } from "./ChapterTheme";

/** A hairline of progress along the very top edge — the one quiet piece of
 * orientation in a story that otherwise refuses to have navigation. Its
 * color is the same live chapter palette everything else reads from, so
 * it quietly agrees with whatever's on screen. */
export default function ProgressBar() {
  const theme = useChapterTheme();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-[2px] origin-left opacity-70"
      style={{ scaleX, backgroundColor: theme.earth }}
    />
  );
}
