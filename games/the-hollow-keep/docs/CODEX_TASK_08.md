# Codex 작업 지시 08 · 사다리 위 행동과 오르기 동작

> 작성: Claude Code, 2026-11-01
> 사용자 의견: 사다리에서 점프·공격 등이 안 되고, 옆 층으로 넘어갈 수 있어야 하며, 오르기 동작이 있어야 함
> 아래 블록을 그대로 Codex에 붙여 넣으면 됩니다.

```text
PLAYVAULT — THE HOLLOW KEEP: 사다리 위 행동(점프로 떠나기·옆으로 내리기·공격 방향)과 climb 동작

저장소: kirakein-gif/PLAYVAULT
기준 브랜치: main (PR #14·#15 병합 완료. 이 지시서와 검사가 main에 들어 있음)
작업 브랜치: codex/hollow-keep-ladder-actions (main에서 새로 만든다)

[작업 시작 전]
1. git fetch origin --prune, 원격 브랜치·열린 PR 확인. games/the-hollow-keep/ 대상 다른 미병합 작업이 있으면 시작하지 말고 확인 요청.
2. 읽기: AGENTS.md, docs/STATUS.md, docs/WORK_LOG.md 최근 항목, games/the-hollow-keep/docs/LADDER_ACTIONS_SPEC.md (필수)
3. 첫 커밋으로 STATUS에 담당·범위를 적고 푸시, Draft PR 개설.

[규칙 — §2]
- L1: 사다리에서 점프로 떠난 뒤 16틱 동안 다시 매달리지 않는다(↑/↓를 누르고 있어도). 원인: 지금은 ↑를 누른 채 점프하면 다음 틱에 바로 다시 잡는다.
- L2: 매달린 채 ←/→ → 그 방향을 본다. 옆에 발 높이 ±8단위의 서는 면(벽 윗면·한쪽 발판)이 있고 몸이 들어가면 그 위에 내려선다. 없으면 계속 매달린다.
- L3: 매달린 채 공격 가능(떨어지지 않음), 방향은 마지막 좌우 입력.
- 기존 사다리 규칙(오르내리기, 꼭대기 서기, 위 방 이동, 교대 유지, 1칸 통로 예외, 방 이동 겹침 금지)은 그대로.

[그림·렌더러 — §3, ART_DIRECTION 규칙(scale 2, 64색, 투명도 0/255, 원래 해상도, 경로 A)]
- 두 주인공 animations.climb: 4프레임 이상, loop true, 양손으로 사다리를 잡고 손발이 번갈아 오르는 모습(등 또는 비스듬히 권장).
- 매달린 동안 climb으로 그린다. 프레임은 오른 거리로 정한다(멈추면 멈춤). 공격 중에는 attack.
- PROVENANCE 갱신(특정 게임·작가 이름 금지).

[검증 — 결과를 그대로 보고]
1. node games/the-hollow-keep/next/tests/ladder-actions.cjs → 8/8
2. pixel-assets 전부 통과(climb 포함), 로컬 HTTP 서버 후 ladder-render 7/7
3. exploration-contract 16/16, entrance 9/9, foundation-contract 51/51, area-data 22/22(완주 기록이 바뀐 규칙으로 어긋나면 다시 기록), tile-mosaic-render 7/7,
   pixel-render 7/7(구역·?room=test), mobile-layout 20/20, mobile-fullscreen 6/6, exploration-browser, browser-playtest(?room=test), foundation-edge, room-traversal, exploration-edge, ABYSSFALL 회귀 3종
4. 캡처: 오르기 동작 프레임 전부, 사다리에서 옆 바닥으로 내리는 장면, 사다리에서 공격, 모바일 780×330
5. 느낌은 사용자가 판단한다. "완성"이라고 쓰지 않는다.

[금지] 검사 원본 약화(결함이 있으면 고치지 말고 PR에 이유를 적는다), 1단계 조작 수치·캐릭터 크기 변경, 기존 게임·공용 자산 수정, 적·체력, 병합·배포
[완료] next/README.md 갱신, WORK_LOG·STATUS·CHANGELOG 갱신, Draft → Ready, 병합하지 않는다. 검토는 Claude Code.
```
