# Codex 작업 지시 07 · 봉인 통과 수정 + 타일 모자이크와 방 다양성

> 작성: Claude Code, 2026-11-01
> 사용자 결정: 봉인 통과 문제는 Codex가 수정. 다양성은 픽셀 스타일에 맞춰 반복 조각을 겹쳐 연출하는 **모자이크 방식**(큰 그림 통째로 그리기보다)
> 아래 블록을 그대로 Codex에 붙여 넣으면 됩니다.

```text
PLAYVAULT — THE HOLLOW KEEP: 방 이동 겹침 수정 + 타일 모자이크(뒷벽·장식·벽 조각) + 방 다양성

저장소: kirakein-gif/PLAYVAULT
작업 브랜치: codex/hollow-keep-exploration-refine (PR #14를 이어서 수정한다)
먼저 할 일: origin/claude/hollow-keep-tile-mosaic 를 이 브랜치에 병합한다(규격·검사가 들어 있음).

[작업 시작 전]
1. git fetch origin --prune, 원격 브랜치·열린 PR 확인. games/the-hollow-keep/ 대상 다른 미병합 작업이 있으면 시작하지 말고 확인 요청.
2. 읽기: AGENTS.md, docs/STATUS.md, docs/WORK_LOG.md 최근 항목,
   games/the-hollow-keep/docs/TILE_MOSAIC_SPEC.md (이번 작업 기준, 필수), EXPLORATION_REFINE_SPEC.md, ART_DIRECTION.md
3. 첫 커밋으로 STATUS에 담당·범위를 적고 푸시. PR #14를 Draft로 돌린다.

[수정 — 모자이크 §6]
- 방 이동 직후 몸이 새 방의 벽·닫힌 봉쇄물·부서지지 않은 벽과 겹치면 방을 옮기지 않는다(이전 방 가장자리에 머묾, 그 축 속도 0).
  사다리로 1칸 통로를 지나는 기존 동작(경계 벽돌 예외)은 유지한다. 닫힌 봉쇄물은 사다리 중에도 막는다.
- PR #14 검토에서 재현된 경우: loft 6열 사다리로 ↓ → gate 1행 return-seal을 레버 없이 통과. 경계 검사(exploration-edge)에도 이 경우를 추가한다.

[모자이크 — §2~§4]
- 구역 모드에서 큰 배경(bg-chapel.png)을 그리지 않는다. 화면은 60×60 조각만으로 만든다. ?room=test는 그대로 둬도 된다.
- 뒷벽: 벽 아닌 칸 전부에 back-1~3 중 하나(칸 위치로 정하는 고정 식, README에 기록).
- 벽: # 칸마다 이웃으로 floor-top / wall-bottom / wall-left / wall-right / wall-fill·wall-fill-2 선택(§3 우선순위). 모서리 조각은 선택.
- 장식: 방마다 back 격자(. w p b c). w·p·b는 세로 묶음의 위·가운데·아래 조각, c는 candle.
  렌더러는 area 데이터의 back을 읽는다(sim의 room 객체에 back이 없으면 world.area.rooms[id].back 사용).

[구역 — §5]
- 8방 모두에 back 격자를 넣고 V1~V4를 지킨다. 특히 V3(어떤 두 방도 # 위치 58칸 이상 다름)를 위해 방 모양을 서로 다르게 다시 짠다.
  반복 조각은 써도 되지만 방 전체가 같은 틀처럼 보이면 안 된다. 밀도 D1~D6·출입문·봉쇄물 규칙은 그대로 지킨다.
- 완주 기록을 다시 만든다(방 모양이 바뀌므로).

[그림 — §7, ART_DIRECTION 규칙(scale 2, 64색, 투명도 0/255, 원래 해상도, 경로 A)]
- tiles에 추가: back-1, back-2, back-3, wall-fill-2, wall-bottom, wall-left, wall-right,
  window-top/mid/bottom, pillar-top/mid/base, banner-top/mid/bottom, candle (각 60×60).
- 뒷벽·벽 조각은 꽉 찬 칸(투명 없음). 뒷벽은 벽보다 어둡고 대비 낮게 — 서는 면과 길이 한눈에 보여야 한다.
- 이어 붙여도 이음새가 보이지 않게. PROVENANCE 갱신(특정 게임·작가 이름 금지). 참고 게임의 타일 모양을 옮기지 않는다.

[검증 — 결과를 그대로 보고]
1. exploration-contract 16/16 (방 이동 겹침 금지 2개 추가됨), entrance-contract 9/9, foundation-contract 51/51
2. area-data 전부 통과(back 격자·V1~V4 포함), pixel-assets 전부 통과(모자이크 조각 포함)
3. 로컬 HTTP 서버 후 tile-mosaic-render 7/7, pixel-render 7/7(구역·?room=test), mobile-layout 20/20, mobile-fullscreen 6/6,
   exploration-browser, browser-playtest(?room=test), room-traversal, foundation-edge, exploration-edge, ABYSSFALL 회귀 3종
4. 캡처: 방마다 1장(PC), 모바일 780×330, 봉인 위에서 사다리로 내려가다 막히는 장면
5. 재미·외형은 사용자가 판단한다. "완성"이라고 쓰지 않는다.

[금지] 검사 원본 약화(결함이 있으면 고치지 말고 PR에 이유를 적는다), 기존 게임·공용 자산·런처 수정,
1단계 조작 수치·캐릭터 크기 변경, 적·체력·보스, Noah 3단 콤보, 병합·배포
[완료] next/README.md 갱신, WORK_LOG·STATUS·CHANGELOG 갱신, Draft → Ready, 병합하지 않는다. 검토는 Claude Code.
```

## Codex 작업 후 Claude Code가 할 일
1. 검사 전체 재실행, 무작위 입력 검사(봉쇄물·벽 겹침), 완주 재생
2. 방 8개 화면 확인: 반복 조각이 단조롭지 않은지, 길·서는 면이 잘 보이는지
3. PR 검토 의견, WORK_LOG 기록, 사용자용 바로 열리는 링크 전달
