import Kicker from "../Kicker";
import { useLightbox } from "../Lightbox";
import { useRegisterChapterSection, useChapterTheme } from "../ChapterTheme";
import DurbarAtmosphere from "../layers/DurbarAtmosphere";
import MuseumWall from "../gallery/MuseumWall";
import EditorialSpread from "../gallery/EditorialSpread";
import OversizedCrop from "../gallery/OversizedCrop";
import FloatingPrint from "../gallery/FloatingPrint";
import CinematicFullscreen from "../gallery/CinematicFullscreen";
import Triptych from "../gallery/Triptych";
import Diptych from "../gallery/Diptych";
import FieldNotebookMargin from "../FieldNotebookMargin";
import { notebookNotes } from "../../data/notebook";
import { chapters } from "../../data/media";

const durbar = chapters[4];
const [
  hero,
  pigeonsA,
  pigeonsB,
  umbrella,
  familyPigeons,
  backpack,
  columnFramed,
  twoMen,
  blueShirt,
  clusterA,
  brickWall,
  clusterB,
] = durbar.photos;

/** Chapter Five — Durbar. Every guardian lion in this square has stood
 * there long enough to watch the same handful of gestures repeat: someone
 * hurrying, a family staying close, a stranger who can't help looking up
 * at the woodwork. Told mostly one photograph at a time — the two moments
 * that are genuinely a sequence (the same vantage point, different
 * passersby) are the only ones shown together. */
export default function Durbar() {
  const open = useLightbox();
  const theme = useChapterTheme();
  const sectionRef = useRegisterChapterSection("durbar");

  return (
    <section ref={sectionRef} data-cursor-kind="rangefinder" className="relative w-full overflow-hidden" style={{ background: durbar.palette.background }}>
      <DurbarAtmosphere />
      <FieldNotebookMargin note={notebookNotes.durbar} dock="top" align="right" rotate={-1} tone="light" />

      <div className="relative z-10 px-6 pt-24 md:px-14 md:pt-32">
        <Kicker number={durbar.number} accent={theme.earth}>
          {durbar.name}
        </Kicker>
        <p className="mt-6 max-w-lg font-serif-display text-2xl italic text-charcoal md:text-4xl">{durbar.headline}</p>
      </div>

      <MuseumWall photo={hero} index={1} chapterNumber={durbar.number} glow={durbar.palette.accent} onOpen={() => open(hero.src, hero.title)} tone="light" />
      <EditorialSpread photo={pigeonsA} index={2} chapterNumber={durbar.number} textSide="right" onOpen={() => open(pigeonsA.src, pigeonsA.title)} tone="light" />
      <OversizedCrop photo={columnFramed} onOpen={() => open(columnFramed.src, columnFramed.title)} />
      <FloatingPrint photo={umbrella} index={4} chapterNumber={durbar.number} onOpen={() => open(umbrella.src, umbrella.title)} tone="light" />
      <EditorialSpread photo={backpack} index={5} chapterNumber={durbar.number} textSide="left" onOpen={() => open(backpack.src, backpack.title)} tone="light" />
      <MuseumWall photo={pigeonsB} index={6} chapterNumber={durbar.number} glow={durbar.palette.earth} onOpen={() => open(pigeonsB.src, pigeonsB.title)} tone="light" />

      <Triptych
        photos={[twoMen, blueShirt, clusterA]}
        caption="The same spot by the lion statue, three different passersby — everyone in this square moves at their own speed."
        onOpen={(p) => open(p.src, p.title)}
        tone="light"
      />

      <CinematicFullscreen photo={familyPigeons} onOpen={() => open(familyPigeons.src, familyPigeons.title)} />

      <Diptych
        a={brickWall}
        b={clusterB}
        relation={["I", "II"]}
        caption="The same family, two frames apart — already a different shape entirely."
        onOpenA={() => open(brickWall.src, brickWall.title)}
        onOpenB={() => open(clusterB.src, clusterB.title)}
        tone="light"
      />

      <div className="h-16 md:h-24" />
    </section>
  );
}
