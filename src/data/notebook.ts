import type { ChapterId } from "./media";
import type { NotebookNote } from "../story/FieldNotebookMargin";

/**
 * Margin notes for each chapter's hero image — the notebook carried on the
 * walk, not a caption for the photo. Places are only ever named where
 * real and verifiable (Thamel, Durbar Square) — never guessed.
 *
 * `metadata` (date · time · lens · aperture · ISO) is the one deliberate
 * exception to that honesty rule: none of these files carry surviving
 * EXIF, so every value below is invented purely as exhibition typography,
 * by explicit direction — it is not a factual claim about the photograph.
 */
export const notebookNotes: Record<ChapterId, NotebookNote> = {
  bloom: {
    heading: "Bloom",
    metadata: "APRIL 12 · 6:41 AM · 35mm · f/2 · ISO 200",
    lines: ["Nine frames, one pond, one afternoon.", "Kept coming back to the same spot in the light."],
    frame: "01 / 09",
  },
  reflections: {
    heading: "Reflections",
    metadata: "MAY 03 · 7:15 AM · 50mm · f/2.8 · ISO 100",
    lines: ["Waited for the water to go still.", "It didn't, not fully. Shot it anyway."],
    frame: "01 / 02",
  },
  wander: {
    heading: "Wander",
    metadata: "JUNE 20 · 6:52 PM · 35mm · f/1.8 · ISO 160",
    lines: ["One lake, most of it on foot.", "Lost count of how many times I stopped."],
    frame: "01 / 06",
  },
  streets: {
    heading: "Streets",
    place: "Thamel, Kathmandu",
    metadata: "MARCH 08 · 2:30 PM · 35mm · f/4 · ISO 200",
    lines: ["Camera stayed out the whole walk.", "Easier to miss a shot than dig it out again."],
    frame: "01 / 19",
  },
  durbar: {
    heading: "Durbar",
    place: "Kathmandu Durbar Square",
    metadata: "MARCH 09 · 11:20 AM · 35mm · f/5.6 · ISO 200",
    lines: ["Same stone lion in half these frames.", "It never moved. Everything else did."],
    frame: "01 / 12",
  },
  people: {
    heading: "People",
    metadata: "FEBRUARY 14 · 4:10 PM · 50mm · f/2 · ISO 320",
    lines: ["Never planned any of these.", "Five different afternoons, five strangers."],
    frame: "01 / 05",
  },
  quiet: {
    heading: "Quiet",
    metadata: "JANUARY 28 · 3:45 PM · 35mm · f/2.8 · ISO 400",
    lines: ["Four rooms, none of them loud.", "Spent longer in each than the photo lets on."],
    frame: "01 / 04",
  },
  dusk: {
    heading: "Dusk",
    metadata: "JULY 02 · 7:38 PM · 35mm · f/2 · ISO 100",
    lines: ["Twenty minutes, most days.", "Some evenings the light never fully shows up."],
    frame: "01 / 04",
  },
};
