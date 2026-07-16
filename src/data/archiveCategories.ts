import type { ChapterId, Photo } from "./media";

/**
 * Categories for the Archive's filter — only tags that are actually true
 * of the work. No "Commercial" or "Film Recipe": nothing here is a paid
 * commission or a documented film-simulation recipe, so those filters
 * would just be empty shelves.
 */
export type Category = "photography" | "video" | "travel" | "street" | "portrait" | "bw";

export const CATEGORY_LABELS: Record<Category, string> = {
  photography: "Photography",
  video: "Video",
  travel: "Travel",
  street: "Street",
  portrait: "Portrait",
  bw: "Black & White",
};

const CHAPTER_DEFAULTS: Record<ChapterId, Category[]> = {
  bloom: ["photography"],
  reflections: ["photography"],
  wander: ["photography"],
  streets: ["photography", "street", "travel"],
  durbar: ["photography", "street", "travel"],
  people: ["photography", "portrait", "street"],
  quiet: ["photography"],
  dusk: ["photography"],
};

/** Individual exceptions where a photo is more specific than its
 * chapter's default — a clear portrait sitting in an otherwise
 * landscape-leaning chapter, or the one real black-and-white frame. */
const CATEGORY_OVERRIDES: Partial<Record<string, Category[]>> = {
  "bloom-pond-figure": ["photography", "portrait"],
  "bloom-girl-and-dog": ["photography", "portrait"],
  "bloom-tree-gaze-a": ["photography", "portrait"],
  "bloom-tree-gaze-b": ["photography", "portrait"],
  "bloom-tree-gaze-c": ["photography", "portrait"],
  "wander-forest-path": ["photography", "portrait"],
  "quiet-hallway-gaze-a": ["photography", "portrait"],
  "quiet-hallway-gaze-b": ["photography", "portrait"],
  "quiet-bookstore-portrait": ["photography", "portrait"],
  "quiet-stairwell-glance": ["photography", "portrait"],
  "dusk-silhouette-figure": ["photography", "portrait"],
  "people-bw-portrait": ["photography", "portrait", "bw"],
};

export function categoriesFor(photo: Photo): Category[] {
  return CATEGORY_OVERRIDES[photo.id] ?? CHAPTER_DEFAULTS[photo.chapter];
}

/**
 * Only two locations are actually confirmed this session — Durbar Square
 * and Thamel are both real, named places in Nepal; the Cinematography
 * video's own title ("A Cinematic New York"), fetched from YouTube's
 * oEmbed API rather than guessed, confirms the USA. Every other chapter
 * stays untagged rather than assigned a guessed country.
 */
export const LOCATIONS = {
  durbar: "Nepal",
  streets: "Nepal",
  cinematography: "USA",
} as const;

export function locationFor(chapterId: ChapterId | "cinematography"): string | null {
  return (LOCATIONS as Record<string, string>)[chapterId] ?? null;
}
