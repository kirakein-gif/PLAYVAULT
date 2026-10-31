# Pixel asset provenance · THE HOLLOW KEEP

Date: 2026-10-31 (Asia/Seoul). Production: Codex. Review: Claude Code / pending. Visual identity, polish and motion quality require user review.

## References and tools

- Appearance only: `games/the-hollow-keep/assets/title-ethan-hd-v2.webp`, `title-noah-hd-v2.webp`. Both were opened and inspected. Ethan: short brown hair, no hood, ivory/gold long coat and cyan rune forearm. Noah: navy hood, long blue-black hair, purple lining, silver/black armor and cyan sword.
- OpenAI image_gen generated an original transparent pose reference board. Tool/model version and seed were not exposed. Reference output: `/workspace/generated_images/exec-01f1b4a9-1527-49a1-abd8-6eba010c48a7.png` (local concept, not a runtime asset).
- Python 3 + Pillow 12.3.0. Reproducible native redraw: `next/tools/build-pixel-art.py`. No third-party sprite, tile, font, game or artist style reference was used.

## Full image generation prompt

```text
Create a clean ORIGINAL pixel-art character design reference board for a gothic side-view action game. Use the two attached portraits only as character appearance references; do not shrink or paste the portraits. Two horizontal rows, six separated full-body poses per row, all facing RIGHT, readable 68-pixel-tall proportions, generous transparent spacing, no text or borders. Top row ETHAN: adult masculine young man, short dark brown hair, NO hood, broad shoulders, ivory long split coat with gold trim, dark leather waistcoat/belts, black gloves and boots, ornate gold right forearm rune gauntlet with a tiny cyan core. Bottom row NOAH: adult feminine slim figure, dark navy pointed hood over long blue-black hair, ragged navy cloak with purple lining, black leather armor with silver fittings, long dark boots, a thin cyan luminous longsword. Each row shows: upright idle, a grounded running stride, upright standing-jump with tucked knees, clearly forward-leaning running-jump, a low landing crouch, and an attack (Ethan extends rune forearm; Noah follows through a forward sword cut). Restrained limited-palette clusters, 1-pixel selective outlines, no antialiasing, no gradient dithering, upper-left moonlight and tiny warm highlights, crisp cloth/metal/leather separation. This board is concept reference only: final native-resolution sprite sheets will be separately redrawn and palette-cleaned. Transparent background.
```

## Redraw / cleanup record

1. The generated board was inspected for separate silhouettes, cloth direction, upright/tucked jump versus forward-leaning jump and weapon-arm poses. Neither it nor the portraits is resized, cropped or sampled into the delivered sheets. No high-resolution picture is used as a final sprite.
2. The final figures were independently drawn on the native 96×96 grid (128×96 attack frames) with integer polygon/line/pixel clusters. Hair, profile/eye, hood, ivory split coat, navy/purple mantle, belt, boots, forearm core and sword are separate authored clusters. The builder contains all joints, poses, outlines and color assignments. It reads no source image.
3. Four idle, six run, three standing jump, three running jump, two land and four attack frames per hero. A fixed foot pivot (48,95), grounded foot endpoints and 68/64-pixel idle heights are authored at source resolution. Run legs alternate their support foot; jump-running leans at source coordinates rather than rotating a raster image in the renderer. Landing lowers the torso while retaining the foot line.
4. A shared 46-color palette uses 3–5 material shades, selective 1-pixel outlines, upper-left highlights and cyan/gold/silver accents. `finish()` remaps any out-of-palette RGB to the nearest allowed entry and thresholds alpha to 0/255, even though drawing is already palette constrained. Transparent RGB is normalized to zero. No antialiasing or gradient dithering is introduced.
5. Contours, single-pixel fittings, grounded feet and sheet bounds were inspected in the native contact sheet. Tiles are authored at 30×30: the floor bottom is opaque, wall is filled, ledge ends at row 15. The optional 960×540 background uses quiet native-grid masonry, original lancet windows, mullions and candles. Texture marks are deliberate stone/material clusters, not gradient dithering.
6. Optional rune (2 frames) and slash (3 frames) sheets use the same palette and binary alpha. Tiny isolated effect sparks are intentional; no generated background-fringe pixels are present because no reference-image pixels were copied.
7. The temporary contact sheet `/tmp/hollow-keep-pixel-contact.png` is for review only. Runtime PNGs are saved at native size in `next/assets/pixel/`. They are not 2×/3× enlarged exports.

## Rebuild and verification

```sh
python games/the-hollow-keep/next/tools/build-pixel-art.py
CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/pixel-assets.cjs
```

The manifest is the runtime source of dimensions, pivots, durations and tile cells. Tests are kept unchanged. Detailed execution results and remaining visual review are recorded in WORK_LOG and the implementation PR. Passing palette/grid checks does not certify likeness or animation quality.

