# CODEX_TASK_05 · exploration review

Captured from the real default app and recorded inputs in a PC browser (1280×900). Room/device/ladder PNGs preserve the native1920×1080 canvas; maps are full-page screenshots. No pose/world state is injected. Mobile is780×330 atDPR2 (1560×660PNG).

| Room | PC canvas | Role |
| --- | --- | --- |
| 잔광의 성문 | [gate](room-gate.png) | Start, lower route and locked return shaft |
| 침묵의 서고 | [crypt](room-crypt.png) | Ladder return and one-way shelves |
| 금 간 보관실 | [vault](room-vault.png) | Breakable screen and bronze key |
| 봉인 회랑 | [nave](room-nave.png) | Bronze lock |
| 잿빛 맹세의 홀 | [reliquary](room-reliquary.png) | Two test targets and cleared gate |
| 기울어진 종탑 | [belfry](room-belfry.png) | Noah-only high lever |
| 달빛 프리즘실 | [prism](room-prism.png) | Ethan-only light device |
| 귀환의 다락 | [loft](room-loft.png) | Unlock the early room's shortcut |

- Map: [start, visited only](map-start.png), [all eight rooms / returned home](map-complete.png)
- Ladder: [up](ladder-up.png), [down](ladder-down.png). The allowed idle-pose fallback is used while climbing.
- Changes: [cracked wall breaks](break-cracked-screen.png), [key pickup](pickup-bronze-key.png), [bronze door](door-bronze-door.png), [target gate](door-oath-door.png), [high lever](switch-high-lever.png), [bell gate](door-bell-door.png), [light device](switch-sun-prism.png), [light door](door-light-door.png), [return lever](switch-return-lever.png), [return seal](door-return-seal.png).
- Mobile780×330: [area](mobile-area-780x330.png), [map](mobile-map-780x330.png).

Reproduce with a repository HTTP server and:

```sh
HK_URL=http://127.0.0.1:8766/games/the-hollow-keep/next/ CHROMIUM_PATH=/usr/bin/chromium HK_SHOT_DIR=/tmp/hk05-review node games/the-hollow-keep/next/tests/exploration-browser.cjs
```

The test controls the browser clock and replays each recorded simulation tick using keyboard events. It observes simulation events and captures after the real renderer; it never edits world/pose state. First room captures wait until the body is fully inside the screen. Device captures show actual switch/door/break/pickup events. Technical completion does not establish fun, difficulty, visual likeness or hardware rotation behavior. Claude Code review and user judgment remain pending.
