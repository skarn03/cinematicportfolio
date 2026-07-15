import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";
import AmbientLayer from "./AmbientLayer";
import HappyAccidents from "./HappyAccidents";
import HiddenDiscoveries from "./HiddenDiscoveries";
import WorldClock from "./WorldClock";
import FilmstripNav from "./FilmstripNav";
import ContactShortcut from "./ContactShortcut";
import AgingWrapper from "./AgingWrapper";
import ContactScene from "../components/ContactScene";
import { SiteRhythmProvider } from "./SiteRhythm";
import { LightboxProvider } from "./Lightbox";
import { useChapterTheme } from "./ChapterTheme";
import Bloom from "./chapters/Bloom";
import Reflections from "./chapters/Reflections";
import Wander from "./chapters/Wander";
import Streets from "./chapters/Streets";
import Durbar from "./chapters/Durbar";
import People from "./chapters/People";
import Quiet from "./chapters/Quiet";
import Cinematography from "./chapters/Cinematography";
import Dusk from "./chapters/Dusk";
import Home from "./chapters/Home";

/**
 * The editorial scroll itself — plain document flow, no scroll-jacking.
 * Chapters are the themes actually present in the photography (see
 * src/data/media.ts): a spring of blossoms, a pair of quiet reflections, a
 * run of golden-hour wandering, a roll of Kathmandu streets, a square full
 * of guardian statues and pigeons, the people along the way, interior
 * quiet, and dusk. `onReachEnd` fires once, from Home, when the visitor
 * arrives at the very last beat.
 *
 * Chapters up through Quiet are wrapped in `AgingWrapper` — once a visitor
 * has scrolled well past one, it starts to visibly age. Cinematography,
 * Dusk, and Home are left alone: Dusk and Home already fade on their own
 * terms right at the end of the roll, and Cinematography is video, not a
 * print, so "aging" doesn't apply to it the same way.
 */
export default function Story({ onReachEnd }: { onReachEnd: () => void }) {
  const theme = useChapterTheme();
  return (
    <LightboxProvider>
      <SiteRhythmProvider>
        <motion.div className="relative" style={{ backgroundColor: theme.background }}>
          <ProgressBar />
          <AmbientLayer />
          <WorldClock />
          <HappyAccidents />
          <HiddenDiscoveries />
          <FilmstripNav />
          <ContactShortcut />
          <ContactScene />
          <AgingWrapper>
            <Bloom />
          </AgingWrapper>
          <AgingWrapper>
            <Reflections />
          </AgingWrapper>
          <AgingWrapper>
            <Wander />
          </AgingWrapper>
          <AgingWrapper>
            <Streets />
          </AgingWrapper>
          <AgingWrapper>
            <Durbar />
          </AgingWrapper>
          <AgingWrapper>
            <People />
          </AgingWrapper>
          <AgingWrapper>
            <Quiet />
          </AgingWrapper>
          <Cinematography />
          <Dusk />
          <Home onArrive={onReachEnd} />
        </motion.div>
      </SiteRhythmProvider>
    </LightboxProvider>
  );
}
