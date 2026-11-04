# Cinematic gallery

The photography exhibition displays 128 photographs: all 61 original portfolio photographs and all 67 photographs from `E:/pohoto/new editor`, including alternate edits. At the user's request, the two LITH studio screenshots are excluded from the public catalog. They remain in the source inventory. `scripts/audit-photos.py` checks source coverage; original files are unchanged.

`scripts/prepare_photos.py --all --export --original-thumbnails` creates optimized image copies and thumbnails. `scripts/analyze-colors.py` samples all 130 images, excludes their outer border from analysis, and records dominant colors and CIELAB descriptors in `src/data/colorProfiles.json`. It does not recolor the photographs.

`src/cinema/colorCurator.ts` arranges images by perceptual color distance, with a nearest-neighbor pass and path refinement. Every collection retains all its images. The full-screen viewer follows the same collection ordering.

Each room has a different composition, with varied image scale, vertical placement, and spacing. Original aspect ratios remain intact. The opening hero and visible section navigation remain available, along with Film, About, Work with me, and Contact.

The gallery stages small groups rather than mounting the full collection at once. Streets uses a horizontal filmstrip, initially six prints, with drag momentum, Shift-wheel support, keyboard navigation, a scrubber, and more prints revealed near the end. People reveals paired portraits, Nature one large landscape at a time, Quiet scattered prints, and After dark a full-width screening format. Additional exhibits appear on scroll, with a manual reveal control as an alternative. Every public photograph remains available through the full-screen index.

Selected previews have arches, oval silhouettes, or cut corners; the full-screen viewer shows the complete original composition with the image filling the available viewport. Image clicks also request native browser full screen when supported. Large solo exhibits display their title or original editorial line over the upper image. Headings and entrance animations vary between rooms. The hero now opens with the lantern-lit street photograph.

`scripts/upgrade-photo-quality.py` exports the 67 newer photographs from the original JPEGs at WebP quality 93/94/96, with 1200/2400/3840-pixel maximum edges. It preserves embedded source ICC profiles and orientation, and does not upscale smaller originals. Responsive variants serve the gallery; the largest files serve the viewer. The 61 older source photographs retain their original existing files. These are high-quality compressed web copies, not a claim of lossless encoding. `scripts/audit-photo-quality.py` verifies resolution, aspect ratios, color profiles, and asset availability.

Atmosphere changes follow the active image in the hero, horizontal gallery, and full-screen viewer. Colors come from each photograph's measured palette. Particle positions persist while color, motion, and shape weights ease toward their next target, including when users move rapidly between images. Reduced-motion preferences and the atmosphere pause control are supported.

The short lines in `src/cinema/imagePoetry.ts` are original editorial captions, not quotations attributed to other authors or factual claims about the moments photographed.

Preview: `npm run dev -- --host 127.0.0.1 --port 3001`.
Validation: `npm run build`, `npm test`, `npm run lint`, and `python scripts/audit-photos.py`.
