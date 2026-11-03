# TASK_09 추가 수정 지시2 · 실제 입력 콤보 연결 검토

2026-11-02 / Codex / PR #20 / 기준091e41b + 규격c77525a(병합3e85135). 이전 캡처와 followup 폴더는 보존합니다.

- 좌우 실제 입력 연속 영상: [오른쪽](noah-right-rhythm.webp), [왼쪽](noah-left-rhythm.webp). 각각82틱,1367ms,60Hz 표시 시간(17/17/16ms), 무손실 디코딩 RGBA·시간 일치 확인.
- 단 사이 실제 화면(-2,-1,0,+1틱): [오른쪽](noah-right-transitions.webp), [왼쪽](noah-left-transitions.webp). 1→2,2→3 연결에서 끝5→시작0. 월드·그림 주입 없음.
- 각 단6프레임 전체: [오른쪽](noah-right-combo.webp), [왼쪽](noah-left-combo.webp). 각 행1/2/3단, 각 열0~5번 몸 자세. 캡처 총44장(Noah36+Ethan8)을10개 무손실 보드로 포장.
- 기존 타격 연출 보존: [오른쪽](noah-right-impact-board.webp), [왼쪽](noah-left-impact-board.webp). [관측 오른쪽](noah-right-observations.json), [관측 왼쪽](noah-left-observations.json).

각 단18/22/34틱, 끝과 다음 시작은 같은 RGBA(기준점 실루엣 IoU1.0). 세 핵심 베기와 효과는 유지하며 거두기·준비를 새로 제작했습니다. 연결 창20틱 동안 마지막 자세 유지, 이동 시작·창 만료 시 해제. 명중 추가3/3/5틱은 긴 핵심 자세의 시간에서 배분해 거두기를 자르지 않습니다. 피해/판정/1단/이동 수치, Ethan, 게임 시간은 유지합니다.

재현(루트 HTTP8765, Chromium):

```sh
python3 games/the-hollow-keep/next/tools/build-combat-art.py
HK_SHOT_DIR=/tmp/hk09c-review node games/the-hollow-keep/next/tools/capture-combat.cjs
HK_SHOT_DIR=/tmp/hk09c-feel node games/the-hollow-keep/next/tools/capture-combat-feel.cjs
node games/the-hollow-keep/next/tools/check-combo-release.cjs
python3 games/the-hollow-keep/next/tools/pack-combat-review.py /tmp/hk09c-review games/the-hollow-keep/next/assets/combat-review/linked
python3 games/the-hollow-keep/next/tools/pack-combat-feel.py /tmp/hk09c-feel games/the-hollow-keep/next/assets/combat-review/linked
```

[검증 결과](TEST_RESULTS.md), [제작 기록](../../pixel/PROVENANCE.md). Claude Code 재검토·사용자 동작 자연스러움 판단 대기. 실기기 미확인, main 병합·수동 배포 없음.
