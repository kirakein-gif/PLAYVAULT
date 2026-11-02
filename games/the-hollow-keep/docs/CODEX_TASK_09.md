# Codex 작업 지시 09 · 3단계 전투 1차 — Noah 3단 콤보, Ethan 3단계 충전 사격

> 작성: Claude Code, 2026-11-02
> 사용자 결정: 전투와 Noah 3단 콤보를 함께, Ethan은 3단계 충전 사격, 체력은 주인공별, 쓰러지면 자동 교대 + 짧은 무적(2차), 무기 먼저 → 적 3종(2차)
> 아래 블록을 그대로 Codex에 붙여 넣으면 됩니다.

```text
PLAYVAULT — THE HOLLOW KEEP 3단계 전투 1차: Noah 3단 콤보(연타)와 Ethan 3단계 충전 사격(누르고 놓기)

저장소: kirakein-gif/PLAYVAULT
기준 브랜치: main (이 지시서·규격·검사가 병합된 뒤) — 병합 전이면 claude/hollow-keep-combat-spec
작업 브랜치: codex/hollow-keep-combat-weapons (기준에서 새로 만든다)

[작업 시작 전]
1. git fetch origin --prune, 원격 브랜치·열린 PR 확인. games/the-hollow-keep/ 대상 다른 미병합 작업이 있으면 시작하지 말고 확인 요청.
2. 읽기: AGENTS.md, docs/STATUS.md, docs/WORK_LOG.md 최근 항목, games/the-hollow-keep/docs/COMBAT_SPEC.md (필수), FOUNDATION_SPEC.md §4, ART_DIRECTION.md
3. 첫 커밋으로 STATUS에 담당·범위를 적고 푸시, Draft PR 개설.

[규칙 — COMBAT_SPEC §2·§3]
- Noah: weapon.combo 3단 + comboWindowTicks. 회복 중 누름은 미리 입력, 창 안에 누르면 다음 단, 3단 뒤 1단, 3단 디딤(벽 통과 금지), 교대 시 초기화. 이벤트 attack.step.
- Ethan: 누른 순간 1단 룬탄(지금과 같음) + 충전 시작, 40틱 2단·80틱 3단(charge 이벤트), 놓으면 2단 이상만 충전탄(attack.level), 충전탄 뒤 공격 대기 다시 시작.
  충전탄도 관통하지 않음. 3단은 맞은 면 가운데에서 반지름 45 빛 터짐(직접 맞은 표적 제외, 부서지는 벽 영향 없음, burst 이벤트). 교대 시 충전 사라짐. getPlayer().charge = {ticks, level}.
- 1단 무기 값과 1단계 이동 수치는 바꾸지 않는다(foundation-contract 51/51 유지).
- 조작 패널(F2)에 콤보·충전 수치 추가. 모바일 공격 버튼은 누르고 있는 동안 계속 눌림.

[그림 — COMBAT_SPEC §4, ART_DIRECTION 규칙(scale 2, 64색, 투명도 0/255, 원래 해상도, 경로 A)]
- noah attack-2(올려 베기), attack-3(크게 가로 베기 + 디딤): 4프레임 이상, 첫 프레임 2틱 이하
- noah fx-slash-2, fx-slash-3: 3프레임 이상, 한 번, 프레임마다 한 획, 1단과 다른 궤적
- ethan charge(충전 자세, 2프레임 이상 반복), fx-charge(손에 모이는 빛 3프레임 이상, 2·3단을 크기·밝기로 구분), fx-rune-2·fx-rune-3(2프레임 이상, 1단보다 크게), fx-burst(3프레임 이상, 한 번)
- 렌더러: 단계별 동작·효과 그리기. PROVENANCE 갱신(특정 게임·작가 이름 금지).

[검증 — 결과를 그대로 보고]
1. node games/the-hollow-keep/next/tests/weapons-contract.cjs → 15/15
2. pixel-assets 전부 통과(새 동작·효과 포함)
3. foundation-contract 51/51, foundation-edge, exploration-contract 16/16, entrance 9/9, ladder-actions 10/10, area-data 22/22, exploration-edge, ladder-edge
4. 로컬 HTTP 서버 후 pixel-render 7/7(구역·?room=test), ladder-render 7/7, tile-mosaic-render 7/7, keyboard-ime 7/7, mobile-layout 20/20, mobile-fullscreen 6/6, exploration-browser, browser-playtest(?room=test), room-traversal, ABYSSFALL 회귀 3종
5. 캡처: Noah 1·2·3단 연속(좌우), Ethan 충전 2단·3단 자세와 탄, 3단 빛 터짐, 모바일 780×330
6. 손맛·외형은 사용자가 판단한다. "완성"이라고 쓰지 않는다.

[금지] 검사 원본 약화(결함이 있으면 고치지 말고 PR에 이유를 적는다), 1단계 이동·1단 무기 수치 변경, 체력·적·보스(2차), 기존 게임·공용 자산 수정, 병합·배포
[완료] next/README.md 갱신, WORK_LOG·STATUS·CHANGELOG 갱신, Draft → Ready, 병합하지 않는다. 검토는 Claude Code.
```

## 추가 수정 지시 (2026-11-02, PR #20 손맛 확인 후)

```text
PLAYVAULT — THE HOLLOW KEEP: Noah 3단 베기를 "촥, 촥, 촥" 리듬으로 (자세 멈춤 + 리듬 조금 느리게 + 타격 연출)

저장소: kirakein-gif/PLAYVAULT
작업 브랜치: codex/hollow-keep-combat-weapons (PR #20을 이어서 수정한다)
먼저 할 일: origin/claude/hollow-keep-combat-review 를 이 브랜치에 병합한다(규격 §2-1·검사 추가).

사용자 의견: "에단 충전 공격은 괜찮다. 노아 3단 베기는 너무 빨라서 움직임이 잘 안 보이고 궤적만 여기저기 다른 느낌",
"무언가 촥~ 촥~ 촥 하는 느낌이 나야 할 것 같다. 격투 게임의 3단 콤보처럼". 선택: 자세 멈춤 + 리듬 조금 느리게.

[규칙 — COMBAT_SPEC §2-1]
- combo[1].recoveryTicks 18→22, combo[2].recoveryTicks 30→34. 1단·창·피해·사거리·판정 시간은 그대로.
- 자체 weapons-edge.cjs는 옛 타이밍(18·30)을 가정한 곳을 새 값에 맞게 고친다(확인 항목을 줄이지 않는다).
- 완주 기록·다른 검사 영향이 있으면 다시 기록·보고.

[그림·렌더러 — COMBAT_SPEC §2-1, ART_DIRECTION 규칙]
- attack/attack-2/attack-3 동작 길이(ticks 합) ≥ 각 단 recoveryTicks - 2 (16·20·32틱), 가장 긴 핵심 자세 프레임 ≥ 4틱, 첫 프레임 ≤ 2틱.
  준비 → 짧게 휘두름(1~2프레임) → 멈춘 핵심 자세(길게) → 거두기. 세 단의 몸 동작이 확실히 다르게(내려 베기 / 올려 베기 / 크게 가로 베기 + 디딤).
- 맞힐 때(그림 표시만, 게임 시간은 멈추지 않음): Noah 프레임 붙잡기 1·2단 3틱·3단 5틱, 맞은 표적·적 1~2틱 하얗게 + 반대 방향 2~4픽셀 밀었다 복귀,
  3단 명중 시 화면 6틱 2~3픽셀 흔들기. 3단 베기 효과는 1·2단보다 굵고 길게.
- 피해 숫자가 같은 자리에 겹쳐 표적 HP 글자를 가리는 문제도 정리(조금씩 위로 떠오르며 겹치지 않게).

[검증]
1. weapons-contract 16/16, pixel-assets 전부 통과(동작 길이·자세 멈춤 포함)
2. 나머지 회귀 전체(이전 지시와 같음), weapons-edge 갱신 후 통과
3. 캡처: Noah 1·2·3단 연속 — 각 단의 핵심 자세, 맞는 순간(밝힘·밀림), 3단 화면 흔들림. 가능하면 짧은 연속 캡처(프레임 묶음)

[금지] 검사 원본 약화, 1단 수치·1단계 이동 수치 변경, 게임 시간 정지(히트스톱을 시뮬레이션에 넣지 않음), 효과음 추가(사용자 결정: 소리 없이 그림만으로), 병합·배포
```
