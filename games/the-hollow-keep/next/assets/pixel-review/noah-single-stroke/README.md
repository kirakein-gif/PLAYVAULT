# Noah single-stroke slash · PR #8 correction

Replaces the previous double-line slash captures for review of spec db1679b.

- [Right attack, actual ticks 0–11](right-attack-sequence.png)
- [Left attack, actual ticks 0–11](left-attack-sequence.png)

These capture every consecutive simulation age after real keyboard attack input. Playwright's controlled browser clock advances the existing game loop; no pose, attack or world state is injected. Ticks0–1 show prep without a slash, ticks2–7 show the three one-time effect frames, and ticks8+ show recovery without the effect. Immediate damage text is expected under the existing simulation rules.

Reproduce from the repository root with the HTTP server running:

```sh
HK_URL=http://127.0.0.1:8766/games/the-hollow-keep/next/ CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tools/capture-noah-single-stroke.cjs
```

The script requires actual ages0–11 to all be present before saving the strip. Individual tick PNGs are also included. Each final effect frame is a single opaque connected ribbon (302/581/288px, 8-connectivity), with its inner dark trail touching the bright edge. Other runtime images and all simulation/render timing remain unchanged. Technical checks do not establish visual quality; Claude Code review and user judgment remain pending.
