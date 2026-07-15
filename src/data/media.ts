/**
 * The real photography, and only the real photography — every image in
 * `src/data/Photos` inspected individually (dominant color, orientation,
 * subject, mood) before anything here was written. Chapters are not a
 * preset list; they're the themes that were actually sitting in the
 * folder: a spring of cherry blossoms, a pair of quiet water reflections,
 * a run of golden-hour wandering, a roll of Kathmandu street photography,
 * portraits, interior quiet, and dusk. Nothing here is stock.
 *
 * Each chapter carries its own small earthy palette, sampled from its own
 * photographs (see Photo.colors, extracted with Pillow's median-cut
 * quantizer, not eyeballed) — related, never identical, never forced to
 * one beige. ChapterTheme.tsx reads `chapters[i].palette` to color-grade
 * the page around whichever chapter is active.
 */

const photoModules = import.meta.glob("./Photos/*.{webp,jpg}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function photoUrl(filename: string): string {
  const entry = Object.entries(photoModules).find(([path]) => path.endsWith(`/${filename}`));
  if (!entry) throw new Error(`Missing photo: ${filename}`);
  return entry[1];
}

export type Orientation = "portrait" | "landscape" | "square";

export type Palette = {
  /** the page/backdrop tone this chapter settles into */
  background: string;
  /** the primary earthy tone — the chapter's accent lines, active states */
  earth: string;
  /** a muted secondary accent, for graphic marks and secondary text */
  accent: string;
  /** the brightest tone drawn from the photos, used sparingly for glow/rim light */
  highlight: string;
  /** the darkest tone, for grounding shadow and contrast */
  shadow: string;
  /** the readable body/heading text color against `background` */
  text: string;
};

export type Photo = {
  id: string;
  src: string;
  orientation: Orientation;
  aspect: number;
  chapter: ChapterId;
  title: string;
  story: string;
  /** CSS object-position — respects the actual subject in the frame */
  focalPoint: string;
  /** six swatches extracted directly from the file, darkest to lightest-ish */
  colors: string[];
};

export type ChapterId = "bloom" | "reflections" | "wander" | "streets" | "durbar" | "people" | "quiet" | "dusk";

export type Chapter = {
  id: ChapterId;
  number: string;
  name: string;
  headline: string;
  palette: Palette;
  photos: Photo[];
};

function photo(
  filename: string,
  data: Omit<Photo, "id" | "src" | "colors" | "orientation" | "aspect"> & {
    colors: string[];
    w: number;
    h: number;
  },
): Photo {
  const { w, h, colors, ...rest } = data;
  return {
    id: filename.replace(/\.(webp|jpg)$/, ""),
    src: photoUrl(filename),
    orientation: h > w ? "portrait" : w > h ? "landscape" : "square",
    aspect: w / h,
    colors,
    ...rest,
  };
}

export const chapters: Chapter[] = [
  {
    id: "bloom",
    number: "I",
    name: "Bloom",
    headline: "Nine frames, one afternoon, the same pond.",
    palette: {
      background: "#f3ecdf",
      earth: "#b5825f",
      accent: "#7c8a68",
      highlight: "#f6ecd8",
      shadow: "#332a20",
      text: "#332a20",
    },
    photos: [
      photo("bloom-pond-figure.webp", {
        chapter: "bloom",
        title: "The pond, early",
        story: "Nobody else here yet. Almost didn't get the camera out of the bag in time.",
        focalPoint: "58% 78%",
        w: 1080,
        h: 1350,
        colors: ["#392d21", "#9c845f", "#615138", "#b4a285", "#896353", "#c1bdab"],
      }),
      photo("bloom-blossom-in-hand.webp", {
        chapter: "bloom",
        title: "One blossom",
        story: "Picked the smallest one on the branch. Asked why. Got a shrug.",
        focalPoint: "50% 62%",
        w: 1080,
        h: 1350,
        colors: ["#302b20", "#93704d", "#968c69", "#afaf7f", "#71674e", "#e1e6d4"],
      }),
      photo("bloom-canopy-sky.webp", {
        chapter: "bloom",
        title: "Looking up",
        story: "Lay down on the grass for this one. Grass was wet. Worth it.",
        focalPoint: "42% 68%",
        w: 1080,
        h: 1350,
        colors: ["#28311f", "#10140d", "#304029", "#3b442c", "#678667", "#46553b"],
      }),
      photo("bloom-girl-and-dog.webp", {
        chapter: "bloom",
        title: "The dog didn't care",
        story: "Kept pulling toward the water. Blossoms weren't the point for either of them.",
        focalPoint: "55% 76%",
        w: 1080,
        h: 1350,
        colors: ["#27251e", "#7b6b53", "#6599ac", "#66848c", "#97adaf", "#456a75"],
      }),
      photo("bloom-tree-gaze-a.webp", {
        chapter: "bloom",
        title: "The leaning tree",
        story: "Moss on the bark, blossoms at the crown. Grows sideways, toward the light.",
        focalPoint: "62% 60%",
        w: 1080,
        h: 1350,
        colors: ["#191e17", "#47382f", "#3c541f", "#685643", "#cfcbc6", "#667840"],
      }),
      photo("bloom-tree-gaze-b.webp", {
        chapter: "bloom",
        title: "Same tree, closer",
        story: "Walked around it twice before taking this one.",
        focalPoint: "58% 62%",
        w: 1080,
        h: 1350,
        colors: ["#373726", "#1c1f18", "#65583d", "#6e7739", "#ccc8bf", "#623e3b"],
      }),
      photo("bloom-tree-gaze-c.webp", {
        chapter: "bloom",
        title: "Same tree, third try",
        story: "Should have stopped after the second frame. Didn't.",
        focalPoint: "64% 58%",
        w: 1080,
        h: 1350,
        colors: ["#272b1e", "#131813", "#564b34", "#606b34", "#c3c1b6", "#4f3230"],
      }),
      photo("bloom-fountain-backlit.webp", {
        chapter: "bloom",
        title: "The fountain, backlit",
        story: "Sun was directly behind it for maybe ninety seconds. Then it wasn't.",
        focalPoint: "62% 78%",
        w: 1080,
        h: 1440,
        colors: ["#4e6a59", "#d2d9c5", "#fbfcf2", "#879e8a", "#b3b396", "#f1f3e7"],
      }),
      photo("bloom-reach-lake.webp", {
        chapter: "bloom",
        title: "Over the reeds",
        story: "The reeds were taller than she was. Reached over them anyway.",
        focalPoint: "48% 74%",
        w: 1080,
        h: 1440,
        colors: ["#becfc4", "#8c7a48", "#504c2a", "#6c7a24", "#dde7d7", "#a2ae99"],
      }),
    ],
  },
  {
    id: "reflections",
    number: "II",
    name: "Reflections",
    headline: "Two frames, thirty seconds apart.",
    palette: {
      background: "#e2e9e4",
      earth: "#4f6e6b",
      accent: "#7c8d74",
      highlight: "#eef2ef",
      shadow: "#16211e",
      text: "#1f2b28",
    },
    photos: [
      photo("reflections-duck-sky-a.webp", {
        chapter: "reflections",
        title: "One goose",
        story: "Kept this frame for the upside-down sky more than the goose.",
        focalPoint: "50% 66%",
        w: 1080,
        h: 1350,
        colors: ["#14332f", "#53786e", "#405e50", "#8b7944", "#778d78", "#a6ac91"],
      }),
      photo("reflections-duck-sky-b.webp", {
        chapter: "reflections",
        title: "The ripple after",
        story: "Same spot, half a minute later. Sky was already putting itself back together.",
        focalPoint: "52% 70%",
        w: 1080,
        h: 1350,
        colors: ["#2e5040", "#8aa898", "#adc4b5", "#778366", "#dbdabe", "#3e7b7c"],
      }),
    ],
  },
  {
    id: "wander",
    number: "III",
    name: "Wander",
    headline: "A few hours around one lake, most of it on foot.",
    palette: {
      background: "#ecdfc4",
      earth: "#a9793f",
      accent: "#6f7548",
      highlight: "#f6ecd8",
      shadow: "#2a2013",
      text: "#2e2416",
    },
    photos: [
      photo("wander-forest-path.webp", {
        chapter: "wander",
        title: "The path",
        story: "Didn't look back once to check if I was still behind him.",
        focalPoint: "52% 82%",
        w: 1080,
        h: 1350,
        colors: ["#5d5020", "#252413", "#6e5e29", "#343415", "#473e1a", "#867239"],
      }),
      photo("wander-kayak-golden-lake.webp", {
        chapter: "wander",
        title: "Under the bridge",
        story: "Waited about ten minutes for a boat to pass through here. One did.",
        focalPoint: "68% 82%",
        w: 1080,
        h: 1080,
        colors: ["#565450", "#312620", "#433e39", "#544139", "#427279", "#707571"],
      }),
      photo("wander-boardwalk-autumn-a.webp", {
        chapter: "wander",
        title: "The boardwalk",
        story: "Canopy was thicker than I expected. Lost the light for a while under it.",
        focalPoint: "50% 66%",
        w: 1080,
        h: 720,
        colors: ["#191d0c", "#565629", "#2f3719", "#454116", "#746e43", "#998e77"],
      }),
      photo("wander-boardwalk-autumn-b.webp", {
        chapter: "wander",
        title: "Further along",
        story: "Same boardwalk. Different light by the far end.",
        focalPoint: "50% 65%",
        w: 1080,
        h: 720,
        colors: ["#13170a", "#383d21", "#2b2b0e", "#1f2713", "#535437", "#7a7261"],
      }),
      photo("wander-pergola-lake.webp", {
        chapter: "wander",
        title: "Lights on, daytime",
        story: "No idea why they were on. Left them on anyway, apparently.",
        focalPoint: "50% 58%",
        w: 1080,
        h: 720,
        colors: ["#16140f", "#343228", "#474c38", "#68684a", "#58543c", "#a4a67a"],
      }),
      photo("wander-pine-lake.webp", {
        chapter: "wander",
        title: "Through the pines",
        story: "More pinecones on the ground than people on the path.",
        focalPoint: "50% 78%",
        w: 1080,
        h: 1440,
        colors: ["#1e2b17", "#435133", "#63774d", "#97a262", "#888d5a", "#c2c9b5"],
      }),
    ],
  },
  {
    id: "streets",
    number: "IV",
    name: "Streets",
    headline: "Thamel, mostly on foot, camera never really down.",
    palette: {
      background: "#ddc9a8",
      earth: "#a85a35",
      accent: "#8a7f6e",
      highlight: "#efe6d3",
      shadow: "#120e08",
      text: "#231a12",
    },
    photos: [
      photo("streets-thamel-tours-sign.webp", {
        chapter: "streets",
        title: "Tibet Tours",
        story: "Half the shopfronts here lead somewhere upstairs you can't see from the street.",
        focalPoint: "50% 25%",
        w: 1080,
        h: 1440,
        colors: ["#080703", "#615744", "#0a0a05", "#3d3629", "#18100b", "#8b7c64"],
      }),
      photo("streets-elder-walker.webp", {
        chapter: "streets",
        title: "Hotel Utse",
        story: "Walked past the sign without looking at it. Probably passes it daily.",
        focalPoint: "50% 62%",
        w: 1080,
        h: 1439,
        colors: ["#080703", "#251e13", "#120e06", "#0b0a05", "#4b3e2c", "#b29d85"],
      }),
      photo("streets-scooter-shop.webp", {
        chapter: "streets",
        title: "Royal Pan Mahal",
        story: "Helmet on before the engine was even running.",
        focalPoint: "40% 62%",
        w: 1080,
        h: 1440,
        colors: ["#0d0c06", "#654e3a", "#241c12", "#997d63", "#4e2418", "#cfb8a0"],
      }),
      photo("streets-utse-doorway.webp", {
        chapter: "streets",
        title: "The doorway",
        story: "One more step and she'd have disappeared into the same shadow as everyone else on the block.",
        focalPoint: "45% 60%",
        w: 1080,
        h: 1440,
        colors: ["#080703", "#13120c", "#0a0905", "#675d4d", "#060602", "#080602"],
      }),
      photo("streets-market-couple-a.webp", {
        chapter: "streets",
        title: "Past the fruit stand",
        story: "Neither of them slowed down. They'd clearly been this way before.",
        focalPoint: "45% 70%",
        w: 1080,
        h: 1440,
        colors: ["#080703", "#8b7b61", "#363024", "#0d0c06", "#060501", "#080602"],
      }),
      photo("streets-market-couple-b.webp", {
        chapter: "streets",
        title: "Same street, later",
        story: "Helmet stayed under his arm the whole block. Never put it on.",
        focalPoint: "45% 68%",
        w: 1080,
        h: 1440,
        colors: ["#080703", "#6e614c", "#0e0c07", "#373124", "#aa9475", "#060502"],
      }),
      photo("streets-market-silhouettes.webp", {
        chapter: "streets",
        title: "超市",
        story: "Only color on the whole block came from that sign.",
        focalPoint: "50% 60%",
        w: 1080,
        h: 1440,
        colors: ["#11100b", "#0b0a05", "#080703", "#090804", "#b79c84", "#3b2d22"],
      }),
      photo("streets-utse-tassels.webp", {
        chapter: "streets",
        title: "Tongba, since 1971",
        story: "She walked past the carved door without a glance. Knew what was inside already.",
        focalPoint: "32% 65%",
        w: 1080,
        h: 1440,
        colors: ["#080703", "#2e2418", "#140f08", "#845c36", "#cbad88", "#0b0a05"],
      }),
      photo("streets-archway-silhouette.webp", {
        chapter: "streets",
        title: "The archway",
        story: "Couldn't see what was parked back there. Light made it look important anyway.",
        focalPoint: "50% 55%",
        w: 1080,
        h: 1440,
        colors: ["#050402", "#8c7a5a", "#151208", "#070401", "#030300", "#050200"],
      }),
      photo("streets-honacha-walker.webp", {
        chapter: "streets",
        title: "Honacha",
        story: "Rain had stopped. Ground hadn't caught up yet.",
        focalPoint: "58% 65%",
        w: 1080,
        h: 1575,
        colors: ["#090d0b", "#191c1a", "#2b2c25", "#4c4d41", "#807b67", "#fcfcfc"],
      }),
      photo("streets-honacha-cyclist.webp", {
        chapter: "streets",
        title: "Same corner, later",
        story: "Came back twenty minutes on. Nobody had gone in or out.",
        focalPoint: "55% 60%",
        w: 1080,
        h: 1575,
        colors: ["#0b0c0a", "#222621", "#3f453c", "#5b5746", "#948c71", "#fdfdfc"],
      }),
      photo("streets-bells-passerby.webp", {
        chapter: "streets",
        title: "The bells",
        story: "Someone strung these along the roofline. Never found out why.",
        focalPoint: "60% 68%",
        w: 1080,
        h: 1575,
        colors: ["#080f10", "#181d19", "#262c26", "#46473a", "#929182", "#fcfcfc"],
      }),
      photo("streets-momo-king-alley.webp", {
        chapter: "streets",
        title: "Momo King",
        story: "More wire overhead than customers on the ground floor.",
        focalPoint: "48% 55%",
        w: 1080,
        h: 1575,
        colors: ["#0c1e27", "#253237", "#433d39", "#6e6859", "#bcb8aa", "#fefefe"],
      }),
      photo("streets-wasapasa-shopfront.webp", {
        chapter: "streets",
        title: "Wasa Pasa",
        story: "Couldn't read the sign yet. Photographed it anyway.",
        focalPoint: "50% 70%",
        w: 1080,
        h: 1575,
        colors: ["#0b1213", "#282d29", "#3a403b", "#595f56", "#7d8d84", "#fbfbfb"],
      }),
      photo("streets-corner-crossing.webp", {
        chapter: "streets",
        title: "The corner",
        story: "Neither one slowed down for the other.",
        focalPoint: "55% 55%",
        w: 1080,
        h: 740,
        colors: ["#0d1312", "#202623", "#34322d", "#525347", "#959587", "#fdfdfd"],
      }),
      photo("streets-corner-passenger.webp", {
        chapter: "streets",
        title: "Two on one seat",
        story: "She held on with one hand. Didn't look concerned about it.",
        focalPoint: "42% 55%",
        w: 1080,
        h: 740,
        colors: ["#090e0d", "#181e1b", "#2a2823", "#404339", "#717367", "#fbfbfb"],
      }),
      photo("streets-corner-pink-cap.webp", {
        chapter: "streets",
        title: "Same wall, again",
        story: "Stood in that spot a while. Kept the camera up the whole time.",
        focalPoint: "45% 55%",
        w: 1080,
        h: 740,
        colors: ["#0c1211", "#20231f", "#2d342e", "#515245", "#979688", "#fdfdfc"],
      }),
      photo("streets-corner-yellow-cap.webp", {
        chapter: "streets",
        title: "Third frame, same wall",
        story: "Started to feel less like I was photographing people and more like I was photographing the wall.",
        focalPoint: "45% 55%",
        w: 1080,
        h: 740,
        colors: ["#090d0c", "#181915", "#232822", "#3d4036", "#7d7f72", "#fcfcfc"],
      }),
      photo("streets-corner-riders.webp", {
        chapter: "streets",
        title: "Fourth frame, same wall",
        story: "Gave up trying to time it after this one. Just kept the shutter going.",
        focalPoint: "55% 55%",
        w: 1080,
        h: 740,
        colors: ["#0e1210", "#1f2926", "#34372e", "#4f5044", "#8a8b7c", "#fbfbfb"],
      }),
    ],
  },
  {
    id: "durbar",
    number: "V",
    name: "Durbar",
    headline: "An hour in the square, mostly by the same stone lion.",
    palette: {
      background: "#e4d7bd",
      earth: "#8a5c3f",
      accent: "#a8493f",
      highlight: "#f2e8d2",
      shadow: "#171109",
      text: "#2b1e14",
    },
    photos: [
      photo("durbar-red-shawl-woman.webp", {
        chapter: "durbar",
        title: "Waiting",
        story: "She'd found the only shade in the courtyard. Noticed a few minutes after she did.",
        focalPoint: "65% 55%",
        w: 1080,
        h: 1549,
        colors: ["#050302", "#141411", "#2f1b19", "#434035", "#887f68", "#fcfcfb"],
      }),
      photo("durbar-pigeons-pagoda-a.webp", {
        chapter: "durbar",
        title: "The pagoda",
        story: "Pigeons wouldn't hold still. Neither would anyone else.",
        focalPoint: "48% 62%",
        w: 1080,
        h: 1575,
        colors: ["#171d1d", "#3b4542", "#6e6455", "#c6c1b2", "#e3e0d4", "#f9f9f6"],
      }),
      photo("durbar-pigeons-pagoda-b.webp", {
        chapter: "durbar",
        title: "Same square, wider",
        story: "Stepped back for this one. The lion got in the frame either way.",
        focalPoint: "50% 65%",
        w: 1080,
        h: 1374,
        colors: ["#3c3834", "#756c5d", "#b18e7a", "#e2dbce", "#eee9df", "#ffffff"],
      }),
      photo("durbar-pink-umbrella-steps.webp", {
        chapter: "durbar",
        title: "The umbrella",
        story: "Wasn't raining. She kept it open the whole way across the square regardless.",
        focalPoint: "42% 68%",
        w: 1080,
        h: 1575,
        colors: ["#090e0c", "#1b1f1b", "#2f2e27", "#4e4e42", "#87826c", "#fcfbfb"],
      }),
      photo("durbar-family-pigeons.webp", {
        chapter: "durbar",
        title: "Unhurried",
        story: "Nobody here seemed to be going anywhere in particular.",
        focalPoint: "40% 65%",
        w: 1080,
        h: 1575,
        colors: ["#192116", "#424d3b", "#5d604d", "#aaa596", "#f2f3ed", "#fefefe"],
      }),
      photo("durbar-backpack-torana.webp", {
        chapter: "durbar",
        title: "The carved doorway",
        story: "He walked under it without looking up. Looked up for both of us.",
        focalPoint: "58% 55%",
        w: 1080,
        h: 1575,
        colors: ["#151918", "#373f3b", "#676153", "#c9c6b7", "#e2e0d3", "#f7f6f2"],
      }),
      photo("durbar-column-framed.webp", {
        chapter: "durbar",
        title: "Through the gap",
        story: "Two slabs of stone and a strip of the square between them. That was the whole shot.",
        focalPoint: "50% 55%",
        w: 1080,
        h: 1575,
        colors: ["#010300", "#0e1006", "#17160e", "#3c3b32", "#73796b", "#fbfbfa"],
      }),
      photo("durbar-two-men-stride.webp", {
        chapter: "durbar",
        title: "Mid-stride",
        story: "Shutter speed was too slow for this. Kept the frame anyway.",
        focalPoint: "42% 60%",
        w: 1080,
        h: 1575,
        colors: ["#262f23", "#5d6556", "#867b67", "#bbbdb4", "#f4f5f0", "#fefefe"],
      }),
      photo("durbar-blue-shirt-hurry.webp", {
        chapter: "durbar",
        title: "In a hurry",
        story: "Only person moving fast in the whole square.",
        focalPoint: "58% 55%",
        w: 1080,
        h: 1575,
        colors: ["#141513", "#2e2e24", "#454338", "#7e7e72", "#e0ded3", "#fefefd"],
      }),
      photo("durbar-family-cluster-a.webp", {
        chapter: "durbar",
        title: "Close together",
        story: "Crossed the square in a tight group, like they didn't want to lose each other.",
        focalPoint: "50% 60%",
        w: 1080,
        h: 1575,
        colors: ["#151714", "#38352b", "#534e3f", "#8c8672", "#e6e5db", "#fefefe"],
      }),
      photo("durbar-family-brick-wall.webp", {
        chapter: "durbar",
        title: "Past the wall",
        story: "Same family, other side of the square.",
        focalPoint: "42% 58%",
        w: 1080,
        h: 1575,
        colors: ["#121513", "#312d24", "#474539", "#7d7b6c", "#d9d9cd", "#fefefe"],
      }),
      photo("durbar-family-cluster-b.webp", {
        chapter: "durbar",
        title: "A step later",
        story: "Two frames apart. Already more spread out than before.",
        focalPoint: "48% 65%",
        w: 1080,
        h: 1575,
        colors: ["#0f100e", "#272e2a", "#444033", "#7e7f71", "#d3d2c3", "#fdfdfd"],
      }),
    ],
  },
  {
    id: "people",
    number: "VI",
    name: "People",
    headline: "Five strangers, five different afternoons.",
    palette: {
      background: "#e9e0c9",
      earth: "#a9714a",
      accent: "#6b7645",
      highlight: "#f2ead6",
      shadow: "#1c150e",
      text: "#241b12",
    },
    photos: [
      photo("people-bw-portrait.webp", {
        chapter: "people",
        title: "Didn't look up",
        story: "Not once, the whole roll.",
        focalPoint: "50% 45%",
        w: 1080,
        h: 1350,
        colors: ["#1b201a", "#242a21", "#1e231d", "#3e4235", "#7b7962", "#9b9674"],
      }),
      photo("people-sub-shop-portrait.webp", {
        chapter: "people",
        title: "Sottini's",
        story: "Sign said open. She looked like she'd rather be somewhere else.",
        focalPoint: "62% 65%",
        w: 1080,
        h: 1350,
        colors: ["#020305", "#656938", "#4b4023", "#0b0c0a", "#391a0d", "#918f54"],
      }),
      photo("people-riverside-friends.webp", {
        chapter: "people",
        title: "The worst view on the riverbank",
        story: "They picked that patch of grass anyway.",
        focalPoint: "62% 82%",
        w: 1080,
        h: 1350,
        colors: ["#171f0b", "#204a0b", "#253a11", "#575c26", "#444e22", "#828240"],
      }),
      photo("people-motion-blur-portrait.webp", {
        chapter: "people",
        title: "Three tries at one smile",
        story: "The shutter caught all three. Kept the middle one.",
        focalPoint: "48% 60%",
        w: 1080,
        h: 1440,
        colors: ["#3f4b1f", "#181e0f", "#a6a05a", "#67743a", "#938b4f", "#bec398"],
      }),
      photo("people-aquarium-detail.jpg", {
        chapter: "people",
        title: "Someone's fish tank",
        story: "Wasn't planning to photograph this. Did anyway.",
        focalPoint: "60% 48%",
        w: 1080,
        h: 565,
        colors: ["#18210c", "#0f1c09", "#2a2e10", "#493f1d", "#977d5e", "#27230d"],
      }),
    ],
  },
  {
    id: "quiet",
    number: "VII",
    name: "Quiet",
    headline: "Four rooms, none of them loud.",
    palette: {
      background: "#e6e0cf",
      earth: "#7a5c3e",
      accent: "#5f7a6e",
      highlight: "#f2ecd9",
      shadow: "#241c12",
      text: "#28211a",
    },
    photos: [
      photo("quiet-hallway-gaze-a.webp", {
        chapter: "quiet",
        title: "The one patch of sun",
        story: "Whole hallway had exactly one bright square on the floor. She found it before I did.",
        focalPoint: "58% 65%",
        w: 1080,
        h: 1350,
        colors: ["#131810", "#405439", "#343f28", "#515c3f", "#6d8565", "#87a785"],
      }),
      photo("quiet-hallway-gaze-b.webp", {
        chapter: "quiet",
        title: "Same hallway, further back",
        story: "Looked emptier from here than it actually was.",
        focalPoint: "56% 66%",
        w: 1080,
        h: 1350,
        colors: ["#302617", "#d7ac78", "#483822", "#61482b", "#b19062", "#ddbe93"],
      }),
      photo("quiet-bookstore-portrait.webp", {
        chapter: "quiet",
        title: "Not reading",
        story: "She'd been on that stool a while. Book stayed closed the whole time I watched.",
        focalPoint: "58% 58%",
        w: 1080,
        h: 1080,
        colors: ["#2c2919", "#837453", "#48452f", "#665332", "#b99f78", "#e0cebb"],
      }),
      photo("quiet-stairwell-glance.webp", {
        chapter: "quiet",
        title: "Stairs, apparently",
        story: "Sign pointed one way. He was looking the other.",
        focalPoint: "58% 62%",
        w: 1080,
        h: 1350,
        colors: ["#34210b", "#211509", "#403013", "#4f3c1a", "#41250b", "#4f4b28"],
      }),
    ],
  },
  {
    id: "dusk",
    number: "VIII",
    name: "Dusk",
    headline: "The last twenty minutes of light.",
    palette: {
      background: "#e8caa1",
      earth: "#a97a51",
      accent: "#4f6e6b",
      highlight: "#f0c9a0",
      shadow: "#100a08",
      text: "#2c1d13",
    },
    photos: [
      photo("dusk-silhouette-figure.webp", {
        chapter: "dusk",
        title: "Last light",
        story: "By the time I got the exposure right, there wasn't much shape left to see.",
        focalPoint: "48% 68%",
        w: 1080,
        h: 720,
        colors: ["#a79483", "#1c3332", "#908373", "#5a7874", "#e7b18b", "#d2a07f"],
      }),
      photo("dusk-silhouette-bench.webp", {
        chapter: "dusk",
        title: "The bench",
        story: "Whoever sat there left before the good light showed up.",
        focalPoint: "45% 68%",
        w: 1080,
        h: 720,
        colors: ["#0a0504", "#080001", "#b19781", "#e0aa86", "#484c43", "#080102"],
      }),
      photo("dusk-dandelion-field.webp", {
        chapter: "dusk",
        title: "Gone to seed",
        story: "Someone's laundry bag was still out there. Everything else in the frame was moving.",
        focalPoint: "50% 68%",
        w: 1080,
        h: 1350,
        colors: ["#191f14", "#5e7569", "#2f3326", "#88a288", "#4e4530", "#bbc2a2"],
      }),
      photo("dusk-night-lanterns.webp", {
        chapter: "dusk",
        title: "Lanterns on",
        story: "By the time these came on, the street had already changed hands for the night.",
        focalPoint: "58% 45%",
        w: 1080,
        h: 566,
        colors: ["#222316", "#0b0f0a", "#191910", "#10160f", "#433d23", "#958855"],
      }),
    ],
  },
];

export const photos: Photo[] = chapters.flatMap((c) => c.photos);
export const photoById = (id: string): Photo => {
  const found = photos.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown photo id: ${id}`);
  return found;
};
export const chapterById = (id: ChapterId): Chapter => {
  const found = chapters.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown chapter id: ${id}`);
  return found;
};

/** The opening capture — the first photograph the camera "takes," and the
 * hero of the Bloom chapter it falls into. */
export const heroImage = photoById("bloom-pond-figure");
/** The closing frame — what the camera shows again on the way out. */
export const closingImage = photoById("dusk-silhouette-figure");

/** A minor atmospheric texture (not a content photograph) — a few chapters
 * blend this at very low opacity for a sense of moving air/water. Left in
 * deliberately, since it never competes with or stands in for the real
 * photography above. */
export const ambientVideo = "https://vjs.zencdn.net/v/oceans.mp4";

export const nav = {
  name: "Sahil Karn",
};

export type Film = {
  id: string;
  title: string;
  year: string;
  duration: string;
  poster: string;
  video: string;
};

export const films: Film[] = [
  {
    id: "sintel",
    title: "Sintel",
    year: "2010",
    duration: "1:32",
    poster: "https://media.w3.org/2010/05/sintel/poster.png",
    video: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
  },
  {
    id: "elephants-dream",
    title: "Elephant's Dream",
    year: "2006",
    duration: "10:53",
    poster: "https://archive.org/services/get-item-image.php?identifier=ElephantsDream",
    video: "https://archive.org/download/ElephantsDream/ed_1024.mp4",
  },
];
