# Codex 작업 지시 05 · 2단계 탐험 구조 (시범 구역 8~12방)

> 작성: Claude Code, 2026-11-01
> 사용자 결정: 상하좌우 4방향, 길 여는 방법 전부(캐릭터 능력·스위치·열쇠·부서지는 벽·특정 적 처치 — 적은 이번에 시험 표적으로 대신), 시범 구역 8~12방, 적 없음
> 아래 블록을 그대로 Codex에 붙여 넣으면 됩니다.

```text
PLAYVAULT — THE HOLLOW KEEP 2단계: 탐험 구조(방 연결·사다리·길 여는 장치·지도)와 시범 구역 8~12방

저장소: kirakein-gif/PLAYVAULT
기준 브랜치: claude/hollow-keep-exploration-spec (이미 main에 병합되었다면 main)
작업 브랜치: codex/hollow-keep-exploration

[작업 시작 전]
1. git fetch origin --prune, 원격 브랜치·열린 PR 확인. games/the-hollow-keep/ 대상 다른 미병합 작업이 있으면 시작하지 말고 확인 요청.
2. 읽기: AGENTS.md, docs/STATUS.md, docs/WORK_LOG.md 최근 항목,
   games/the-hollow-keep/docs/EXPLORATION_SPEC.md (이번 작업 기준, 필수), FOUNDATION_SPEC.md, ART_DIRECTION.md, DESIGN_DIRECTION.md
3. 첫 커밋으로 STATUS에 담당·범위를 적고 푸시, Draft PR 개설.

[규칙 구현 — EXPLORATION_SPEC §2~§6]
- sim.js에 구역 모드 추가: createWorld({ area, hero }), world.roomId, 4방향 방 이동(좌표 이어짐·속도 유지),
  32×18칸 격자(. # - H), 한쪽 발판(↓+점프로 내려감), 사다리(climbing, CONFIG.climbSpeed, 점프로 떨어짐, 꼭대기에 서기),
  물건 door/switch/key/breakable/target과 문 조건 switch/key/cleared, 캐릭터 전용 스위치(hero), 상태 유지,
  getMap()/getFlags()(cleared 포함), 새 이벤트(room/switch/denied/pickup/door/break).
- 1단계 한 방 모드(createWorld({room, spawn}))와 기존 수치는 그대로 둔다. foundation-contract 51/51 유지.
- 입력: up/down/interact. 키보드 ↑/W ↓/S E, 지도 M. 모바일 두 축 조이스틱 + 조사 버튼(data-action="interact") + 지도 버튼.

[시범 구역 — §7]
- next/areas/area1.json: 8~12방. 가로·세로 연결, 사다리, 한쪽 발판, 스위치 문·열쇠 문·표적 처치 문,
  Ethan 빛 장치(hero:"ethan", kind:"light")·Noah 높은 레버(hero:"noah", kind:"lever", Noah 점프로만 닿는 높이),
  부서지는 벽 뒤 숨은 곳, 되돌아가야 풀리는 구조, 지름길.
- 방 이름은 고딕 성채 분위기로 새로 짓는다(특정 게임의 지명·구성 금지).
- next/areas/area1.walkthrough.json: 입력만으로 모든 방·스위치·문·벽·열쇠·표적을 해내고 시작 방으로 돌아오는 완주 기록(두 주인공 사용).
  사람이 직접 플레이해 기록하거나 스크립트로 만든다. 재생은 결정적이므로 검사가 그대로 확인한다.
- 게임 시작 화면은 시범 구역으로 바꾼다. 1단계 시험 방은 지우지 말고 주소 ?room=test 로 열 수 있게 둔다.

[그림 — §8, ART_DIRECTION 규칙(scale 2, 64색, 투명도 0/255, 원래 해상도, 경로 A)]
- tiles에 ladder 칸 추가(위아래 이음새 없이), 한쪽 발판은 기존 ledge 사용
- objects.png + manifest.objects: door-closed, door-open, lever-off, lever-on, light-off, light-on, key, breakable, locked-door
- 렌더러: 격자 타일 그리기, 물건 상태별 그림, 사다리 매달림 자세(새 동작 climb 2프레임 이상 권장, 없으면 idle로 대신),
  방 이동 시 짧은 전환 효과(선택), 지도 화면(가본 방만, 현재 방 강조)
- PROVENANCE 갱신(지시문 전문, 특정 게임·작가 이름 금지)

[검증 — 결과를 그대로 보고]
1. node games/the-hollow-keep/next/tests/exploration-contract.cjs → 14/14
2. node games/the-hollow-keep/next/tests/area-data.cjs → 전부 통과(완주 재생 포함)
3. node games/the-hollow-keep/next/tests/pixel-assets.cjs → 전부 통과(ladder·objects 포함)
4. 로컬 HTTP 서버 후 pixel-render 7/7, mobile-layout 20/20(조사 버튼 포함), mobile-fullscreen 6/6, browser-playtest
   (browser-playtest는 시범 구역 기준으로 갱신해도 되지만, 기존 확인 항목을 약하게 만들지 않는다)
5. foundation-contract 51/51, foundation-edge, room-traversal(?room=test 또는 한 방 모드), ABYSSFALL 회귀 3종
6. 캡처를 PR에 첨부: 방마다 1장(PC), 지도 화면, 사다리 오르내리기, 각 장치가 열리는 장면, 모바일 780×330
7. 구역 설계의 재미·난이도는 사용자가 판단한다. "완성"이라고 쓰지 않는다.

[금지] 검사 원본 약화(결함이 있으면 고치지 말고 PR에 이유를 적는다), 기존 게임·공용 자산·런처·다른 게임 수정,
1단계 조작 수치 변경, 적 AI·체력·사망 추가(3단계), Noah 3단 콤보(보류), 병합·배포
[완료] next/README.md 갱신, WORK_LOG·STATUS·CHANGELOG 갱신, Draft → Ready, 병합하지 않는다. 검토는 Claude Code.
```

## Codex 작업 후 Claude Code가 할 일
1. 검사 전체 재실행, 완주 기록 재생 확인
2. 방마다 실제로 들어가 보며 막힘·끼임·도달 불가 위치 확인(완주 기록이 피해 간 곳도 확인)
3. 되돌아가기·지름길 구조, 전용 장치가 의도대로 그 주인공만 가능한지 확인
4. PR 검토 의견, WORK_LOG 기록, 사용자용 바로 열리는 링크 전달
