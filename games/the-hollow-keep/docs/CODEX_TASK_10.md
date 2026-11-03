# Codex 작업 지시 10 · 3단계 전투 2차 — 체력·피격·쓰러짐·회복과 기본 적 3종

> 작성: Claude Code, 2026-11-03
> 사용자 결정: 체력은 주인공별, 한 명이 쓰러지면 자동 교대 + 짧은 무적, 둘 다 쓰러지면 성문에서 다시 시작(진행 유지),
> 적은 지상·공중·방패 3종, 일반 적은 방에 다시 들어오면 되살아남, 회복은 성문 쉼터 + 회복 조각 둘 다
> 아래 블록을 그대로 Codex에 붙여 넣으면 됩니다.

```text
PLAYVAULT — THE HOLLOW KEEP 3단계 전투 2차: 체력·피격·쓰러짐·회복과 기본 적 3종(지상 돌격형·공중형·방패형)

저장소: kirakein-gif/PLAYVAULT
기준 브랜치: main (이 지시서·규격·검사가 병합된 뒤) — 병합 전이면 claude/hollow-keep-combat2-spec
작업 브랜치: codex/hollow-keep-combat-enemies (기준에서 새로 만든다)

[작업 시작 전]
1. git fetch origin --prune, 원격 브랜치·열린 PR 확인. games/the-hollow-keep/ 대상 다른 미병합 작업이 있으면 시작하지 말고 확인 요청.
2. 읽기: AGENTS.md, docs/STATUS.md, docs/WORK_LOG.md 최근 항목, games/the-hollow-keep/docs/COMBAT2_SPEC.md (필수, 수치·이벤트·API는 여기가 기준),
   COMBAT_SPEC.md(1차 무기), EXPLORATION_REFINE_SPEC.md(구역 밀도), ART_DIRECTION.md
3. 첫 커밋으로 STATUS에 담당·범위를 적고 푸시, Draft PR 개설.

[규칙 — COMBAT2_SPEC §2~§5]
- 체력: CONFIG.heroes.ethan.maxHp 6, noah 5. hurtInvulnTicks 60, downSwapInvulnTicks 90, knockback {vx 3, vy -4}(맞은 뒤 6틱 안에 3단위 이상 확실히 밀림).
- 이벤트: hurt, down, swap(reason 'down'), swapBlocked(reason 'down'), defeat → 같은 틱 respawn(시작 방·시작 위치, 둘 다 가득, getFlags 진행 유지, 일반 적 되살아남), rest, heal, kill, blocked.
- API: HKSim.getHeroes, getEnemies, getPickups, getPlayer().invuln, createWorld({..., hp:{ethan, noah}}), area.start.hero.
- 쉼터(shelter 2×3칸, 조사하면 둘 다 가득·쓰러짐 해제), 회복 조각(구역 전체 처치 수가 healDropEvery 4의 배수일 때, 20×20, healAmount 1, 방을 나가면 사라짐 — 무작위 금지).
- 적: 구역 물건 {type:'enemy', id, kind, x, y, face}. 맞으면 8틱 경직, 체력 0이면 kill. 벽·닫힌 봉쇄물·방 밖으로 나가지 않음.
  특정 적(어느 봉쇄물 open.cleared에 id가 있음)은 getFlags().cleared[id]가 되고 다시 나오지 않음. 일반 적은 방에 다시 들어오면 처음 자리·처음 체력.
- crawler 32×36 hp22: 0.9로 오가며 벽·낭떠러지 앞에서 돌아섬, 같은 바닥 앞쪽 160 안이면 2.6으로 40틱 돌진 → 30틱 쉼, 접촉 1.
- wisp 28×28 hp22: 몸 아래가 바닥에서 60~70, 가로 220 안이면 0.8로 따라가고 150틱마다 40틱 내리꽂기(몸 아래가 바닥 40 아래까지), 접촉 1.
- shield 40×64 hp66: 가로 300 안의 주인공 쪽으로 돌아서서 0.5로 다가옴. 앞에서 온 Ethan 1단·Noah 1·2단은 막힘(blocked, 피해 0).
  Noah 3단·뒤에서 친 공격·빛 터짐은 들어감. Ethan 2·3단 충전탄은 60틱 stagger(그동안 모든 공격이 들어감). 앞 50 안이면 windup 20틱 → bash 피해 2.
- 1단계 이동, 1차 무기 수치는 바꾸지 않는다(foundation-contract 51/51, weapons-contract 유지). 1단계 한 방 모드는 적이 없으면 아무것도 바뀌지 않는다.
- 조작 패널(F2)에 체력·무적·밀림·적 수치를 넣는다.

[구역 배치 — COMBAT2_SPEC §6]
- 적 8마리 이상, 3종 각 2마리 이상, 두 종류 이상이 함께 있는 방 1개 이상. 시작 방(성문)에는 적이 없고 쉼터가 있다.
- 잿빛 맹세의 홀 봉쇄물은 표적 대신 특정 적(방패형 1 + 다른 종류 1)으로 바꾼다. 구역에 시험 표적을 남기지 않는다(시험 방 ?room=test의 표적은 그대로).
- EXPLORATION_REFINE 밀도 규칙(D1~D6)은 계속 지킨다. 적은 벽에 겹치지 않고, 지상형 아래에는 바닥이 있다.
- 완주 기록을 다시 기록한다: 기존 2단계 조건 + 특정 적을 모두 쓰러뜨림 + 도중에 defeat 없음.

[그림 — COMBAT2_SPEC §7, ART_DIRECTION 규칙(scale 2, 64색, 투명도 0/255, 원래 해상도, 경로 A)]
- manifest.enemies.<kind> = { body:{w,h}(CONFIG와 같게), animations:{ 이름: {file, frames, frameW, frameH, pivot(발 가운데), ticks, loop} } }
- crawler: walk 4(반복), charge 2, hurt 1, die 3
- wisp: hover 4(반복), dive 2, hurt 1, die 3
- shield: walk 4(반복), guard 1(막을 때 번쩍임), windup 2(준비가 분명히 보이게), bash 2, stagger 2, die 3 — guard·windup·stagger는 걷기와 다른 그림
- 적 몸 크기는 CONFIG 몸 ±15%(가로·세로 모두), 지상형 walk의 발은 기준선에.
- ethan·noah hurt 2프레임(맞아서 젖혀지는 자세). objects: shelter 120×180, heal(한 칸 이하).
- 렌더러: 적 동작·피격 밝힘·쓰러짐, 무적 중 주인공 깜빡임, 두 주인공 체력 칸(조작 중인 쪽 강조, 쓰러진 쪽 어둡게), 회복 조각·쉼터.
- 고딕 성채 분위기로 새로 디자인. 특정 게임의 적 외형·이름을 따르지 않는다. PROVENANCE 갱신(특정 게임·작가 이름 금지).

[검증 — 결과를 그대로 보고]
1. node games/the-hollow-keep/next/tests/enemies-contract.cjs → 16/16
2. area-data 24/24(적 배치·§6 요구·완주 기록 포함), pixel-assets 전부 통과(적·hurt·쉼터·회복 조각 포함)
3. weapons-contract 22/22, foundation-contract 51/51, foundation-edge, exploration-contract 16/16, entrance-contract 9/9, ladder-actions 10/10, exploration-edge, ladder-edge, weapons-edge
4. 로컬 HTTP 서버 후 combo-render 5/5, pixel-render 7/7(구역·?room=test), ladder-render 7/7, tile-mosaic-render 7/7, keyboard-ime 7/7,
   mobile-layout 20/20, mobile-fullscreen 6/6, exploration-browser, browser-playtest(?room=test), room-traversal, ABYSSFALL 회귀 3종
5. 기존 검사가 적 배치 때문에 실패하면 검사를 고치지 말고, 배치를 옮기거나 PR에 이유를 적어 보고한다.
6. 캡처: 적 3종 각각(걷기·공격 준비·맞음), 방패 막기 순간, 방패 경직, 체력 칸(한 명 쓰러진 상태 포함), 쉼터·회복 조각, 모바일 780×330
7. 손맛·외형은 사용자가 판단한다. "완성"이라고 쓰지 않는다.

[금지] 검사 원본 약화(결함이 있으면 고치지 말고 PR에 이유를 적는다), 1단계 이동·1차 무기 수치 변경, 보스·효과음·저장·보조 무기,
       게임 시간 정지(히트스톱), 무작위 드롭, 기존 게임·공용 자산 수정, 병합·배포
[완료] next/README.md 갱신, WORK_LOG·STATUS·CHANGELOG 갱신, Draft → Ready, 병합하지 않는다. 검토는 Claude Code.
```
