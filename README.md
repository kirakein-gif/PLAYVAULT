# PLAYVAULT

개인 웹게임 플랫폼 저장소입니다. 게임은 `games/<slug>/` 단위로 추가합니다.

## Games

- **ABYSSFALL: ECLIPSE** — Dawn Seeker / Night Veil 듀얼 주인공 룸 서바이버

## Shared protagonists

PLAYVAULT의 공통 주인공 자산은 `assets/characters/` 아래에서 관리합니다.

- **Dawn Seeker** — Light / Dawn / Relic Guardian
- **Night Veil** — Shadow / Night / Spellblade

공통 애니메이션 규격:

- Idle 4 frames
- Run 6 frames
- Attack 4 frames
- Hurt 2 frames
- Death 4 frames

아틀라스 규격과 캐릭터 메타데이터는 `assets/characters/manifest.json`에 기록합니다. 이후 게임은 같은 캐릭터 자산을 재사용하고, 게임별로 능력·장비·색감만 변형하는 것을 기본 원칙으로 합니다.

## Structure

```
PLAYVAULT/
├─ index.html
├─ assets/
│  └─ characters/
│     ├─ manifest.json
│     ├─ dawn-seeker/
│     └─ night-veil/
└─ games/
   └─ abyssfall-eclipse/
      ├─ index.html
      ├─ game.css
      ├─ atlas.js
      ├─ core.js
      └─ render.js
```
