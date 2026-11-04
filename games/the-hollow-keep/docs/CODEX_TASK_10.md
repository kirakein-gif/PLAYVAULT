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

## 추가 수정 지시 1 (2026-11-03, PR #24 교차 검토 후)

```text
PLAYVAULT — THE HOLLOW KEEP: 쓰러짐 자동 교대 시 Ethan이 벽·봉쇄물에 묻히는 문제

저장소: kirakein-gif/PLAYVAULT
작업 브랜치: codex/hollow-keep-combat-enemies (PR #24를 이어서 수정한다)
먼저 할 일: origin/claude/hollow-keep-combat2-review 를 이 브랜치에 병합한다(규격 §2 보완·검사 추가·원본 검사 2개 정정).

[발견 — Claude Code 무작위 입력 검사, 314곳 × 1500틱]
- Noah(39×64)가 벽·닫힌 봉쇄물에 붙은 채 쓰러지면 자동 교대한 Ethan(42×68)이 같은 발 가운데에 놓여 1.5단위 묻힌다.
  reliquary oath-door, belfry bell-door, vault 왼쪽 벽 등 4곳, 최대 154틱 연속 겹침. hurtPlayer의 down 교대 분기.

[규칙 — COMBAT2_SPEC §2 "자동 교대 자리 보정"]
- 교대한 그 틱 안에 새 몸이 막힌 칸(벽·닫힌 봉쇄물·부서지지 않은 벽)과 겹치면 가장 가까운 빈 자리(좌우 → 아래 순, 최대 8단위)로 옮긴다.
- 수동 교대 규칙(공간이 없으면 swapBlocked)과 다른 수치는 바꾸지 않는다.

[검사 정정 — 이 브랜치를 병합하면 들어옴]
- enemies-contract 17번째 "쓰러짐 교대: 더 큰 Ethan이 벽·닫힌 봉쇄물에 묻히지 않음" 추가(현재 16/17).
- exploration-edge: 구역 표적이 특정 적으로 바뀌었으므로 시험용 표적을 직접 넣어 같은 의도(방 왕복 뒤 표적 체력 유지)를 확인.
- exploration-browser: 완주 확인에서 쉼터·일반 적은 진행 기록 대상이 아니고, 특정 적은 cleared로 확인.
- 보고해 준 두 원본 검사 충돌은 규격 쪽 결함이었다. 원본을 고치지 않고 보고한 처리가 맞다.

[검증]
1. enemies-contract 17/17, exploration-edge 13/13, exploration-browser 6/6
2. 나머지 회귀 전체(이전 지시와 같음), combat2-browser·capture-enemies 유지
3. 완주 기록이 바뀌면 다시 기록·보고

[금지] 검사 원본 약화, 1단계 이동·1차 무기 수치 변경, 병합·배포
```

## 추가 수정 지시 2 (2026-11-04, 사용자 손맛 확인 후)

```text
PLAYVAULT — THE HOLLOW KEEP: 적 공격이 그림보다 먼저 맞는 문제(피격 상자·방패 밀치기 충격파·밀치기 빈도)

저장소: kirakein-gif/PLAYVAULT
작업 브랜치: codex/hollow-keep-combat-enemies (PR #24를 이어서 수정한다)
먼저 할 일: origin/claude/hollow-keep-combat2-review 를 이 브랜치에 병합한다(규격 §2-1·§5-1·§7 보완, 검사 추가).

사용자 의견: "적들의 공격 모션이 아군에게 닿지도 않았는데 충돌로 인식한다",
"밀칠 때의 이펙트 같은 게 있으면 좋겠고, 그게 충돌하면 맞는다", "너무 자주 밀친다". 방패 막기 범위는 그대로 둔다.

[원인 — Claude Code 측정]
- 방패 밀치기 판정이 방패 앞 50단위인데 그림은 3단위만 나와, 맞는 순간 그림 사이 간격이 약 54단위.
- 주인공 그림 앞 끝(기준점에서 16)보다 몸 상자(21·19.5)가 앞에 있어 돌격형도 2~3단위 먼저 맞음.
- 밀치기 주기 준비20 + 밀치기10 + 회복30 = 60틱(1초).

[규칙 — COMBAT2_SPEC §2-1·§5-1]
- CONFIG.hurtInset = 4. 적에게 맞는 판정만 몸 상자에서 앞뒤 4단위씩 줄인 상자(HKSim.getHurtbox). 이동·벽·교대·줍기는 지금 상자 그대로.
- CONFIG.enemies.shield.bashReach = 32. 밀치기 판정은 방패 앞면에서 바라보는 쪽 32, 높이 발에서 8~56. HKSim.getEnemyHitboxes(world)로 밀치기 중 판정 공개.
- bashRange(준비 시작 거리 50)는 그대로 — 준비를 보고 물러나면 피할 수 있어야 함. recoveryTicks 30 → 90.
- F2 패널에 hurtInset·bashReach·recoveryTicks.

[그림 — §5-1·§7, ART_DIRECTION 규칙]
- shield fx-bash: 밀치기 충격파 3프레임 이상, 한 번(loop 아님). 기준점 = 방패 앞면·발 높이.
  모든 프레임이 앞으로 bashReach(32) −6~+4단위까지 닿고, 높이는 발에서 4~60 안. 방패 뒤로 2단위 넘게 나가지 않음.
- 렌더러: 밀치기 중 fx-bash를 방패 앞에 바라보는 쪽으로 그린다(보이는 충격파 = 판정).
- 디버그 표시(F2)에 getHurtbox와 getEnemyHitboxes 상자를 그려 확인할 수 있게 한다.

[검증]
1. enemies-contract 19/19(피격 판정·밀치기 판정/빈도 추가), pixel-assets 전부(fx-bash 위치 포함)
2. 나머지 회귀 전체, down-swap-edge·combat2-browser 유지, 완주 기록(바뀌면 다시 기록·보고)
3. 캡처: 방패 준비 → 충격파가 닿는 순간 맞음, 준비 중 물러나 피함, 돌격형이 몸에 닿는 순간(디버그 상자 표시 포함)

[금지] 검사 원본 약화, 방패 막기 범위 변경(사용자 결정: 그대로), 1단계 이동·1차 무기 수치 변경, 병합·배포
```

## 추가 수정 지시 3 (2026-11-04, 사용자 손맛 확인 — 사다리 위 방패병)

추가 수정 지시 2와 **함께** 진행한다(같은 검토 브랜치 병합 한 번으로 두 지시의 규격·검사가 모두 들어옴).

```text
PLAYVAULT — THE HOLLOW KEEP: 사다리 위에서 기다리는 적(캠핑) 없애기 — 층 판단·순찰·사다리 층계참

저장소: kirakein-gif/PLAYVAULT
작업 브랜치: codex/hollow-keep-combat-enemies (PR #24를 이어서 수정한다)
먼저 할 일: origin/claude/hollow-keep-combat2-review 를 이 브랜치에 병합한다(규격 §4-1·§6-1, 검사 추가, 참고 그림 docs/reference/vault-ladder-landing.png).

사용자 의견(금 간 보관실): "방패병이 작정하고 캠핑을 하고 있다. 올라오는 데 반응하자마자 때리면 계단을 올라갈 수가 없다",
"사다리 양옆으로 길이 있어야 방패병이 왔다 갔다 할 것 같다. 사다리가 그 길까지 되어 있으면 올라갈 수 있고 타고 내려갈 수도 있다는 개념".

[원인 — Claude Code 측정]
- 방패형이 층과 상관없이 가로 300 안의 주인공을 따라와, 아래층에서 오르는 주인공 바로 위 구멍 가장자리에서 기다림(가로 300 밖이면 멈춤).
- 구역 15개 사다리 모두 바닥을 지나는 줄에 사다리 양옆 빈칸(3칸 구멍)이 있어 바닥이 끊기고, 지상 적은 그 앞에서 돌아섬.

[규칙 — COMBAT2_SPEC §4-1]
- 같은 층 = 주인공이 매달려 있지 않고 발 높이 차 < CONFIG.sameFloorTolerance(24).
- 지상 적(crawler·shield)은 같은 층 주인공에게만 돌아서기·따라가기·돌진·준비. 아니면 제 속도로 순찰(벽·낭떠러지에서 돌아섬). 공중형은 그대로.
- 주인공이 사다리에서 내린 뒤 CONFIG.ladderGraceTicks(30) 동안 지상 적은 돌진·준비를 시작하지 않음(접촉 피해는 그대로).
- 낭떠러지 판단에서 바닥 줄의 사다리 칸(양옆이 바닥·발판)은 바닥으로 본다.
- F2 패널에 sameFloorTolerance·ladderGraceTicks.

[구역 — COMBAT2_SPEC §6-1]
- 사다리가 지나는 바닥 줄에서 사다리 바로 양옆 빈칸을 발판(-)으로 채운다(지금 구역 57칸). 사다리 통로를 1칸으로 좁히지 않는다.
- Claude Code가 이 규칙을 적용한 사본에서 확인한 것: 두 주인공 모두 바닥→꼭대기 오르기·꼭대기에서 ↓로 내려가기·층 건너 걷기 정상,
  기존 완주 기록 그대로 통과(defeat 0), exploration·ladder·entrance·foundation·weapons·area-data와 화면 검사 전부 통과, 무작위 입력 52.8만 틱 겹침 0.
- back 장식·타일 모자이크 규칙 유지. 완주 기록이 바뀌면 다시 기록·보고.

[검증]
1. enemies-contract 21/21(§2-1·§5-1·§4-1 포함), area-data 25/25(§6-1 층계참), pixel-assets 전부(fx-bash 포함)
2. 나머지 회귀 전체, down-swap-edge·combat2-browser 유지
3. 캡처: 금 간 보관실 — 사다리를 오르는 동안 위층 방패형이 순찰하는 장면, 위층에 올라선 직후(0.5초 안에 준비하지 않음), 방패형이 사다리 칸을 건너가는 장면

[금지] 검사 원본 약화, 방패 막기 범위 변경, 1단계 이동·1차 무기 수치 변경, 병합·배포
```
