# TASK_09 추가 수정3 · 콤보 동선 검토

2026-11-02(Asia/Seoul), Codex, PR #20. 기준00479e7 + 규격abbcd8f(병합ffe7736). 과거 검토 캡처는 보존했습니다.

- 실제 입력 좌우 연속: [오른쪽](noah-right-rhythm.webp) · [왼쪽](noah-left-rhythm.webp). 각82틱/1367ms,60Hz(17/17/16ms), 무손실 디코딩 RGBA·시간 일치.
- 세 핵심 자세와 방향 기준 그림 나란히: [오른쪽](noah-right-keyposes-reference.webp) · [왼쪽](noah-left-keyposes-reference.webp). 위는 방향/박자만의 기준, 아래는 실제 게임 화면입니다.
- idle과 각 단의 모든6자세 크기 비교: [오른쪽](noah-right-idle-size.webp) · [왼쪽](noah-left-idle-size.webp). 각 행 첫 칸은 idle, 나머지는0~5자세, 같은 게임 확대율/기준선의 실제 캡처입니다. 자세에 따라 몸 높이는 바뀌지만 그림 축척은 같습니다.
- 단 사이 실제 화면(-2/-1/0/+1틱): [오른쪽](noah-right-transitions.webp) · [왼쪽](noah-left-transitions.webp).
- 전 동작 묶음: [오른쪽](noah-right-combo.webp) · [왼쪽](noah-left-combo.webp). 기존 타격 연출: [오른쪽](noah-right-impact-board.webp) · [왼쪽](noah-left-impact-board.webp).
- 실제 관측: [오른쪽](noah-right-observations.json) · [왼쪽](noah-left-observations.json). world tick·물리 표적·그림/효과 중심을 함께 기록했습니다.

1타 제자리 가로치기 → 2타12단위 파고들며 낮게→높게 → 3타발 고정, 머리 위→아래로 크게. 실제 게임 효과 중심은1타가로37.3/세로2.6단위,2타위로41.9단위,3타아래로60.7단위이며 좌우 같은 방향·크기입니다. 각6프레임·18/22/34틱, 끝=다음 첫 RGBA 동일(IoU1.0), 기존명중3/3/5틱·밝힘·그림밀림·흔들림·피해숫자 분리 유지.

재현(루트 HTTP8765, CHROMIUM_PATH=/usr/bin/chromium):

```sh
python3 games/the-hollow-keep/next/tools/build-combat-art.py
HK_SHOT_DIR=/tmp/hk09d-review node games/the-hollow-keep/next/tools/capture-combat.cjs
HK_SHOT_DIR=/tmp/hk09d-feel node games/the-hollow-keep/next/tools/capture-combat-feel.cjs
node games/the-hollow-keep/next/tools/check-combo-release.cjs
python3 games/the-hollow-keep/next/tools/pack-combat-review.py /tmp/hk09d-review games/the-hollow-keep/next/assets/combat-review/choreography
python3 games/the-hollow-keep/next/tools/pack-combat-feel.py /tmp/hk09d-feel games/the-hollow-keep/next/assets/combat-review/choreography
```

[검증 결과](TEST_RESULTS.md), [제작 prompt/축척/정리](../../pixel/PROVENANCE.md). Claude Code 재검토와 사용자 자연스러움 판단 대기, 실기기 성능/회전/터치감 미확인.효과음·시간정지·main 병합·수동 배포 없음.
