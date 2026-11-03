# TASK_09 추가 수정 4·5 · 기본 복귀 자세 / Ethan 발사 위치

2026-11-03 Asia/Seoul, Codex, PR #20. 기준 eb1fdd2 + 검토 규격 5740714, 병합 e8d96c5. 이전 캡처와 검토 기록은 보존했습니다.

Noah는 각 타를 같은 서 있는 자세로 끝냅니다. 2타 숙이기는 누른 뒤 준비 4틱 안에서, 3타 칼 들기는 준비 6틱 안에서 시작합니다. 그동안 판정·피해·디딤·베기 효과가 없고, 준비가 끝나면 기존 판정 시간만큼 벱니다. 각 6/7/6프레임, 18/22/34틱, 기존 3/3/5틱 명중 연출과 연결 창 20틱을 유지합니다.

- [1타만 / 2타까지 치고 멈춘 실제 화면, 좌우](noah-stop-ready.webp)
- 연속 콤보: [오른쪽 영상](noah-right-rhythm.webp), [왼쪽 영상](noah-left-rhythm.webp). 각각 82틱/1367ms, 원본 화면 RGBA와 시간 일치 확인.
- 준비·명중·복귀: [오른쪽](noah-right-startup-hit-ready.webp), [왼쪽](noah-left-startup-hit-ready.webp)
- idle과 모든 실제 자세 크기 비교: [오른쪽](noah-right-idle-poses.webp), [왼쪽](noah-left-idle-poses.webp)
- [Ethan 1단 발사 / 2·3단 충전, 좌우 발사 위치 십자](ethan-muzzle-cross.webp). 분홍 십자는 그림의 hands가 아니라 CONFIG.muzzle에서 별도로 계산했습니다. 몸 앞면 +6, 발에서40, 좌우 반전. 손·팔 그림을 낮췄고 hands는 실제 장갑/손끝에서 샘플링했습니다. 손은 목표의 ±4단위 안이며, 자연스러움은 화면으로 판단해 주세요.
- [모바일 780×330 실제 누르기 유지](mobile-charge-780x330.webp), [2단 탄](ethan-projectile-2.webp), [3단 탄](ethan-projectile-3.webp)

캡처는 실제 앱·키보드·터치 입력으로 얻었고 월드/자세를 주입하지 않았습니다. 캡처 포장 시 크기를 바꾸지 않았으며 무손실 WebP 디코딩 RGBA를 비교했습니다. 영상·보드 관측 데이터: `noah-*-observations.json`, `ready-muzzle-observations.json`. [검사 결과](TEST_RESULTS.md), [제작 prompt·소스 좌표·샘플링 기록](../../pixel/PROVENANCE.md).

재현: 저장소 루트에서 HTTP 서버를 켜고, Playwright와 Chromium을 지정합니다. Windows 검증은 Python3.12/Pillow/numpy/scipy, Node24/Playwright와 설치된 Chrome을 사용했습니다. `CHROMIUM_PATH`, `NODE_PATH`는 실행 환경에 맞춥니다.

```sh
python games/the-hollow-keep/next/tools/build-combat-art.py
python -m http.server 8766 --bind 127.0.0.1
# 다른 터미널, HK_URL=http://127.0.0.1:8766/games/the-hollow-keep/next/?room=test
# HK_SHOT_DIR=<원본 캡처 경로>
node games/the-hollow-keep/next/tools/capture-combat.cjs
node games/the-hollow-keep/next/tools/capture-combat-feel.cjs
node games/the-hollow-keep/next/tools/capture-ready-muzzle.cjs
node games/the-hollow-keep/next/tools/check-combo-release.cjs
python games/the-hollow-keep/next/tools/pack-ready-muzzle.py <원본 캡처 경로> games/the-hollow-keep/next/assets/combat-review/ready-muzzle
```

Claude Code 재검토와 사용자 외형·손맛 판단 대기. 실기기 회전·성능·터치감 미확인. 게임 버전 번호 변경, main 병합, 수동 배포, 효과음 추가 없음.
