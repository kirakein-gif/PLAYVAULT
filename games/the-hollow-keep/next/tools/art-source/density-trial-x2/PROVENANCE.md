# Target look trial x2 · route A

Date: 2026-10-31 (Asia/Seoul). Codex production; Claude Code review pending. Density selection belongs to the user. Scale 2: Ethan 136px / Noah 128px body reference, game-world sizes unchanged.

## Source and tools

The user selected `docs/reference/target-pose-board-2026-10-31.jpg` as the target. We used the lossless original of that same generated board, now preserved at `next/tools/art-source/target-pose-board.png`, rather than the JPEG copy. Its original output was `/workspace/generated_images/exec-01f1b4a9-1527-49a1-abd8-6eba010c48a7.png`.

A new six-phase Ethan run source was generated with image_gen using the target board as the appearance reference: `next/tools/art-source/ethan-run-source.png`, original output `/workspace/generated_images/exec-599d848e-89f5-4207-a2f9-a4c80c6bac47.png`. The first running frame retains the exact target board's running pose; other phases use the new source. No specific game or artist style was requested. Model version/seed were not exposed.

Tools: image_gen; Python 3, Pillow, numpy and scipy. Reproducible route-A processing: `next/tools/build-density-trial.py`.

## Full original target-board generation prompt

```text
Create a clean ORIGINAL pixel-art character design reference board for a gothic side-view action game. Use the two attached portraits only as character appearance references; do not shrink or paste the portraits. Two horizontal rows, six separated full-body poses per row, all facing RIGHT, readable 68-pixel-tall proportions, generous transparent spacing, no text or borders. Top row ETHAN: adult masculine young man, short dark brown hair, NO hood, broad shoulders, ivory long split coat with gold trim, dark leather waistcoat/belts, black gloves and boots, ornate gold right forearm rune gauntlet with a tiny cyan core. Bottom row NOAH: adult feminine slim figure, dark navy pointed hood over long blue-black hair, ragged navy cloak with purple lining, black leather armor with silver fittings, long dark boots, a thin cyan luminous longsword. Each row shows: upright idle, a grounded running stride, upright standing-jump with tucked knees, clearly forward-leaning running-jump, a low landing crouch, and an attack (Ethan extends rune forearm; Noah follows through a forward sword cut). Restrained limited-palette clusters, 1-pixel selective outlines, no antialiasing, no gradient dithering, upper-left moonlight and tiny warm highlights, crisp cloth/metal/leather separation. This board is concept reference only: final native-resolution sprite sheets will be separately redrawn and palette-cleaned. Transparent background.
```

## Full new running-source generation prompt

```text
Create an ORIGINAL six-frame RUN CYCLE sprite reference strip of ONLY the ivory-coated male character ETHAN from the attached target appearance board. Match that exact identity and richness: short dark brown hair, adult proportions 1:6.5 head/body, clean natural three-quarter face with subtle nose, broad gold-armored shoulders, layered ivory long split coat with gold filigree, dark fitted leather vest, belts and boots, gold forearm rune device with cyan core. NOT the hooded character. Six full-body poses all facing RIGHT, consistently scaled and aligned along the SAME flat foot ground line, one planted support foot in every frame; six distinct phases of a believable running stride: right contact, right down, right passing, left contact, left down, left passing. Coat tails flutter behind while legs visibly cycle. Preserve the target's complex cloth, metallic highlights, anatomy and face, do NOT simplify to vector polygons or large flat blocks. Slight forward lean while running, head not hunched. Clean separated silhouettes with ample transparent gaps, no cropping of boots or coat, no ground shadow, no text, no grid, no borders. Arrange exactly SIX frames in a SINGLE HORIZONTAL ROW. Transparent background. This is a high-resolution source for two palette-cleaned native density trials, not a final pixel sheet.
```

## Underdrawing, palette and mandatory cleanup

1. Isolate source figures with connected opaque components (source alpha >160), then retain a two-source-pixel fringe as an underdrawing. No title key-art pixels are used directly.
2. Independently area-sample the SAME source poses to each native grid. x2 is NOT a nearest-neighbour doubled x1. Idle references are 68/64 game units; running has a slightly lower silhouette. Subtle idle breathing and cloth sway use the same game-space phase/amplitude at both densities.
3. Derive one shared <=64-color palette from both candidate grids to avoid palette differences confounding the density comparison. Quantize without dithering, threshold alpha to 0/255 and normalize transparent RGB.
4. Remove detached single-pixel antialias fragments, clean each native contour with a single-pixel selective dark/lit border, and close isolated one-pixel glove/cloth holes while retaining limb/coat gaps. Keep the reference's natural cheek contour rather than drawing a new protruding nose. Re-stamp a native-pixel eye/brow and an INTERNAL skin highlight, constrained inside the existing silhouette. No face polygon is substituted for the reference.
5. Align heads and body anchors to reduce frame wobble; ground each frame on its pivot. Sheet frame size is 256x192, pivot(128,190). Body.w/h remain 42/68 and39/64 GAME units in the manifest. tileSize is 60, but no new tiles/background/full-action set is made in this limited trial.
6. Required trial scope only: Ethan idle4/run6, Noah idle4. Missing actions render geometric fallback. The default assets and the deferred full remake/slash effect are not changed.
7. Compare the target pose, x1 and x2 at equal displayed body heights in `assets/pixel-trial/comparison/`. Inspect source clothing/colors, face/nose, hands, silhouette, frame alignment and isolated pixels. Captures and tests are recorded in WORK_LOG. These checks do not choose a density or certify final visual quality.

## Rebuild / test

```sh
python games/the-hollow-keep/next/tools/build-density-trial.py
HK_ART_REQUIRE="ethan:idle,run;noah:idle" HK_ART_DIR=games/the-hollow-keep/next/assets/pixel-trial/x2 CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/pixel-assets.cjs
```
