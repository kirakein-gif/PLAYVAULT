# CODEX_TASK_04 · x2 review captures

Default scale2 runtime. Likeness and motion quality await user review; automated checks only establish the stated technical conditions.

- [Ethan target six poses | x2](ethan-reference-poses.png)
- [Noah target six poses | x2](noah-reference-poses.png)
- [Ethan actual attack sequence](ethan-attack-sequence.png)
- [Noah actual attack sequence](noah-attack-sequence.png)
- PC1280×900: [Ethan](pc-ethan.png), [Noah](pc-noah.png)
- Mobile780×330 (DPR2 PNG1560×660): [Ethan](mobile-780x330-ethan.png), [Noah](mobile-780x330-noah.png)

Target/production pose pairs have the same displayed opaque height; this is a silhouette comparison, not a shared game-space scale. Each individual attack-tick PNG records the actual simulation age after attack input, sampled immediately after the real renderer. Slow browser frames can skip a tick; filenames and strip labels retain actual ages. Prep is ticks0–1, swing starts at2. The immediate damage number in prep is expected: simulation damage remains immediate. No pose is injected into simulation state.

Reproduce sources/pose boards with `python games/the-hollow-keep/next/tools/build-full-x2.py` and browser captures with `HK_URL=<local next URL> CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tools/capture-full-x2.cjs`. The browser uses the default art, and never writes pixel-trial. Original trial comparisons remain preserved in the sibling pixel-trial directory.
