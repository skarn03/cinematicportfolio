import type { ChapterId } from "./media";
import type { NotebookNote } from "../story/FieldNotebookMargin";

/**
 * Margin notes for each chapter's hero image — the notebook carried on the
 * walk, not a caption for the photo. Only real, visually-verifiable places
 * are named (Thamel, Durbar Square). No dates, times, or camera settings
 * are invented — nothing in this batch of files carries surviving EXIF, so
 * anything that specific would be fiction dressed as metadata.
 */
export const notebookNotes: Record<ChapterId, NotebookNote> = {
  bloom: {
    heading: "Bloom",
    lines: ["Nine frames, one pond, one afternoon.", "Kept coming back to the same spot in the light."],
    frame: "01 / 09",
  },
  reflections: {
    heading: "Reflections",
    lines: ["Waited for the water to go still.", "It didn't, not fully. Shot it anyway."],
    frame: "01 / 02",
  },
  wander: {
    heading: "Wander",
    lines: ["One lake, most of it on foot.", "Lost count of how many times I stopped."],
    frame: "01 / 06",
  },
  streets: {
    heading: "Streets",
    place: "Thamel, Kathmandu",
    lines: ["Camera stayed out the whole walk.", "Easier to miss a shot than dig it out again."],
    frame: "01 / 19",
  },
  durbar: {
    heading: "Durbar",
    place: "Kathmandu Durbar Square",
    lines: ["Same stone lion in half these frames.", "It never moved. Everything else did."],
    frame: "01 / 12",
  },
  people: {
    heading: "People",
    lines: ["Never planned any of these.", "Five different afternoons, five strangers."],
    frame: "01 / 05",
  },
  quiet: {
    heading: "Quiet",
    lines: ["Four rooms, none of them loud.", "Spent longer in each than the photo lets on."],
    frame: "01 / 04",
  },
  dusk: {
    heading: "Dusk",
    lines: ["Twenty minutes, most days.", "Some evenings the light never fully shows up."],
    frame: "01 / 04",
  },
};
