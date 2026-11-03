# 2026-11-02 · TASK_09 추가 수정2 실제 검증

Codex / 기준091e41b + 규격c77525a, 병합3e85135 / PR #20. 아래는 이번 실행 결과이며 이전 결과를 재사용하지 않았습니다. 원본 인수 테스트는 규격 브랜치와 같고 약화·생략하지 않았습니다.

| 검사 | 결과 |
| --- | --- |
| weapons-contract / 자체 weapons-edge |17/17 ·6/6|
| pixel-assets / combo-render |93/93 ·5/5|
| foundation-contract / foundation-edge |51/51 ·16/16|
| exploration-contract / entrance-contract |16/16 ·9/9|
| ladder-actions / area-data |10/10 ·22/22|
| exploration-edge / ladder-edge / room-traversal |13/13 ·4/4 ·4/4(4159틱 완주)|
| pixel-render 시험실/구역 |7/7 ·7/7|
| ladder-render / tile-mosaic-render / keyboard-ime(구역) |7/7 ·7/7 ·7/7|
| mobile-layout / mobile-fullscreen(구역) |20/20 ·6/6|
| exploration-browser(구역) / browser-playtest(시험실) |6/6 ·20/20|
| 실제 전투 입력 capture-combat |6/6(좌우18프레임·각9효과프레임·Ethan2/3·모바일·F2)|
| 실제 명중 연출 capture-combat-feel |좌우2/2(18/22간격·3/3/5틱추가유지·2틱밝힘·3픽셀그림밀림·3단6틱흔들림·피해숫자분리·시간지속)|
| 실제 연결 해제 check-combo-release |2/2(18+20=38틱 만료·이동 후 복귀 방지)|
| ECLIPSE polish-regression / audio-regression / audio-wind-regression |모두 PASS(다른 게임 회귀)|
| 제작 무결성 |재빌드 전체 runtime PNG/JSON 동일, 세 핵심 cut/core 원본 픽셀 보존, 모든 다른 PNG/Ethan manifest가091e41b와 동일|
| 연결 자산 |1→2·2→3·3→1 끝/시작 RGBA 동일, 실루엣 IoU1.0|
| 캡처 |44장→10무손실보드, 좌우82틱/1367ms 영상 디코딩 RGBA·시간 동일, 단 사이8장/방향 보드 원본RGBA 동일|

실행: 루트 HTTP8765, CHROMIUM_PATH=/usr/bin/chromium. 구역 검사에는 HK_URL=http://127.0.0.1:8765/games/the-hollow-keep/next/, 시험실은 ?room=test. [원본 stdout/stderr 로그](logs/).

실행 중 바로잡은 사항: 처음 구역용 ladder-render·tile-mosaic-render·keyboard-ime·exploration-browser를 시험실 URL로 잘못 실행했습니다. ladder-render는 area 미존재 예외, tile-mosaic는2/7, keyboard-ime·exploration-browser는 구역 준비 실패였습니다. 해당 로그도 보존하고 올바른 구역 URL에서 위 결과로 재실행했습니다(*-area.log). 제품 코드나 원본 검사는 수정하지 않았습니다. 자체 combo-release 작성 중 만료 경계를1틱 일찍 기대한 검사가 실패했고, world tick-started=37 확인 후38에서 해제되는지 정확히 검사하도록 고쳤습니다(combo-release-debug.log 보존).

재현 명령은 각 tests/*.cjs 머리말과 [캡처 README](README.md) 참조. 실제 휴대전화 주소창·회전·터치감·성능은 미확인. 동작 자연스러움은 사용자 판단, Claude Code 재검토 대기. 효과음·main 병합·수동 배포 없음.
