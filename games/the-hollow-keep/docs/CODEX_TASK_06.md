# Codex 작업 지시 06 · 2단계 보완 — 출입문·봉쇄물 구분과 방 밀도

> 작성: Claude Code, 2026-11-01
> 사용자 결정: "문"을 출입문(들어가면 다른 곳)과 봉쇄물(잠기면 못 지나감)로 명확히 구분, 여는 방식은 유지, 조사 버튼 유지,
> 방 밀도 추가(참고 화면의 캐릭터·통로 비율), 막히지 않은 길도 있어야 함
> 아래 블록을 그대로 Codex에 붙여 넣으면 됩니다.

```text
PLAYVAULT — THE HOLLOW KEEP 2단계 보완: 출입문(entrance)·봉쇄물 구분, 방 밀도, 시범 구역 다시 짜기

저장소: kirakein-gif/PLAYVAULT
기준 브랜치: claude/hollow-keep-exploration-refine (PR #10·#11이 main에 병합되었다면 main 위의 같은 브랜치)
추가 지시: 이제 기준 브랜치는 main이다. 위의 기준 브랜치 문구보다 이 지시를 우선한다.
작업 브랜치: codex/hollow-keep-exploration-refine

[작업 시작 전]
1. git fetch origin --prune, 원격 브랜치·열린 PR 확인. games/the-hollow-keep/ 대상 다른 미병합 작업이 있으면 시작하지 말고 확인 요청.
2. 읽기: AGENTS.md, docs/STATUS.md, docs/WORK_LOG.md 최근 항목,
   games/the-hollow-keep/docs/EXPLORATION_REFINE_SPEC.md (이번 작업 기준, 필수), EXPLORATION_SPEC.md, ART_DIRECTION.md
3. 첫 커밋으로 STATUS에 담당·범위를 적고 푸시, Draft PR 개설.

[규칙 — 보완 §3]
- sim.js에 entrance 물건: 기본 2×3칸, to(짝, 양방향), lock {key}. 땅에 서 있고 몸 중심이 출입문 안·발이 아래 끝일 때
  ↑ 또는 조사를 누른 순간 짝으로 이동. 이벤트 enter / room(dir:'entrance') / unlock / denied. getFlags().entered·unlocked.
- 출입문 앞에서 ↑는 점프가 아니다. 기존 규칙(door·switch·key·breakable·target, 사다리, 방 이동)과 1단계 수치는 그대로.

[봉쇄물 — 보완 §4]
- 데이터 type은 door 그대로. 모양 규칙(위아래 또는 좌우가 벽에 딱 맞음)을 지킨다.
- 렌더러: 문짝 그림 대신 barrier-v / barrier-h를 칸마다 이어 그리고, 가운데에 여는 방법 기호(mark-key·mark-lever·mark-light·mark-target).
  스위치는 kind(lever/light)를 반드시 적는다.
- 부서지는 벽은 주변 벽과 거의 같게, 미세한 금만.

[시범 구역 — 보완 §5·§6]
- next/areas/area1.json을 밀도 기준 D1~D6에 맞게 고치거나 새로 짠다(8~12방, 2단계 §7 요구사항 유지).
  기본 통로 4칸 + 좁은 3칸 구간 + 세로 통로·높은 공간(5칸, Noah용 7칸). 막히지 않고 지나가는 길도 둔다.
- 출입문 2쌍 이상(이웃하지 않은 방을 잇는 짝 1쌍 이상, 잠긴 출입문 1개 이상).
- Noah 높은 레버는 높이만으로 Ethan이 못 닿게(D6). hero 제한도 유지.
- 부서지는 벽 뒤에는 그것을 부숴야만 닿는 물건을 둔다(D5).
- area1.walkthrough.json 다시 기록: 2단계 조건 + 출입문 짝마다 한 번 이상, 잠긴 출입문 열기.
- 캐릭터 크기·화면 크기·1단계 조작 수치는 바꾸지 않는다.

[그림 — 보완 §7, ART_DIRECTION 규칙(scale 2, 64색, 투명도 0/255, 원래 해상도, 경로 A)]
- objects 필수: barrier-v, barrier-h(각 60×60), mark-key, mark-lever, mark-light, mark-target(60×60 이하),
  entrance, entrance-locked(120×180), lever-off/on, light-off/on, key, breakable.
- 봉쇄물은 "막혀 있다", 출입문은 "안이 어두운 아치 — 들어가는 곳"으로 한눈에 읽혀야 한다. 문짝 모양으로 봉쇄물을 그리지 않는다.
- 참고 화면의 생김새·배치를 옮기지 않는다. PROVENANCE 갱신(특정 게임·작가 이름 금지).

[검증 — 결과를 그대로 보고]
1. node games/the-hollow-keep/next/tests/entrance-contract.cjs → 9/9
2. node games/the-hollow-keep/next/tests/area-data.cjs → 전부 통과(밀도 D1~D6, 봉쇄물 모양, 출입문 배치, 완주 재생 포함)
3. node games/the-hollow-keep/next/tests/pixel-assets.cjs → 전부 통과
4. exploration-contract 14/14, foundation-contract 51/51, foundation-edge, room-traversal(?room=test), exploration-edge·exploration-browser(필요하면 새 구역 기준으로 갱신하되 확인 항목을 약하게 만들지 않는다)
5. 로컬 HTTP 서버 후 pixel-render 7/7, mobile-layout 20/20, mobile-fullscreen 6/6, browser-playtest(HK_URL에 ?room=test), ABYSSFALL 회귀 3종
6. 캡처를 PR에 첨부: 방마다 1장(PC), 봉쇄물 종류별 닫힘·열림, 출입문 들어가기 전후, 지도, 모바일 780×330
7. 재미·난이도·외형은 사용자가 판단한다. "완성"이라고 쓰지 않는다.

[금지] 검사 원본 약화(결함이 있으면 고치지 말고 PR에 이유를 적는다), 기존 게임·공용 자산·런처·다른 게임 수정,
1단계 조작 수치·캐릭터 크기 변경, 적 AI·체력·사망 추가, Noah 3단 콤보, area2 추가, 병합·배포
[완료] next/README.md 갱신, WORK_LOG·STATUS·CHANGELOG 갱신, Draft → Ready, 병합하지 않는다. 검토는 Claude Code.
```

## Codex 작업 후 Claude Code가 할 일
1. 검사 전체 재실행, 완주 기록 재생 확인, 무작위 입력 검사(끼임·벽 겹침)
2. 출입문 짝·잠금, 봉쇄물 기호가 실제 여는 방법과 맞는지, 막히지 않은 길이 실제로 지나가지는지 확인
3. 밀도 근사 검사(D4·D5)가 점프 높이 때문에 실제와 다른 곳이 없는지 확인
4. PR 검토 의견, WORK_LOG 기록, 사용자용 바로 열리는 링크 전달
