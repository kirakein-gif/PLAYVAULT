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

## Enemy family

ABYSSFALL: ECLIPSE의 첫 적군 자산도 공용 자산으로 분리합니다.

- **Abyssal Grunt · 심연의 하수인** — 근접 추적형
- **Fallen Priest · 타락한 성직자** — 원거리 마도형
- **Shadow Beast · 그림자 짐승** — 중장 돌진형
- **The Abyssal Watcher · 심연의 감시자** — 보스

적 스프라이트는 `assets/enemies/`에서 관리하며 기본 상태는 `idle / run / attack / hurt / death`입니다.

## Room system

ABYSSFALL: ECLIPSE의 각 층은 다음 방 유형을 사용합니다.

- 일반전투방 — 기본 몬스터 전투
- 보물방 — 중앙 상자에서 강화 유물 선택
- 회복방 — 중앙 회복의 샘 사용
- 엘리트방 — 강화 몬스터와 추가 공명 보상
- 보스방 — The Abyssal Watcher 전투

보물방과 회복방은 층마다 기본 1개씩 배치하고, 엘리트방은 진행층에 따라 늘어납니다.

## ABYSSFALL v18 completion pass

- Rebuilt 1F–4F rooms with a shared angled/top-down perspective, upper wall planes, integrated entrances, and room-type mood props.
- Differentiated enemy behavior: Abyssal Grunt dash, Fallen Priest aimed cast, Shadow Beast telegraphed heavy charge.
- Added floor gimmicks: cathedral holy zone, graveyard chilling fog, tower crosswind, altar abyss-rift warnings/explosions.
- 4F boss defeat now ends the first loop with a CLEAR results screen, relic summary, local best records, restart/lobby actions, and optional endless continuation from 5F.

## ABYSSFALL v19 12-floor campaign

- Main campaign expanded to 12 floors across four 3-floor zones: cathedral, graveyard, broken tower, abyss altar.
- Room targets grow by depth: 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20 rooms through 12F.
- Dungeon generation now creates a guaranteed backbone plus branching side paths, making deeper floors longer and less direct.
- Boss floors are 3F, 6F, 9F, and 12F. Other floors end at a farthest-room descent portal after its encounter is cleared.
- Elite-room count rises by zone; later floors can contain additional treasure/recovery rooms.
- Between-floor healing is partial rather than full, so damage and recovery decisions carry through a run.
- 12F now triggers the campaign CLEAR screen; 13F+ remains optional endless descent.

## ABYSSFALL v20 balance pass

- Reworked enemy growth to quadratic HP/damage scaling so deeper floors keep pace with player builds.
- Increased elite durability/damage scaling and raised boss base HP substantially.
- Boss single-hit burst damage is capped to prevent strong relic builds from skipping the whole encounter in seconds.
- Bosses now open a central descent portal after defeat instead of automatically changing floors.
- On 12F, entering the post-boss portal triggers the CLEAR results screen; on earlier boss floors it descends normally.
