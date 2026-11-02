# 추가 지시1·2 실행 결과 (2026-11-02, Asia/Seoul)

기준dc5e336 + 규격817fd63(병합69e8497). 구현Codex / Claude Code 재검토 대기. 이 문서는 이전 실행결과와 구분한 이번 실행입니다. 정정규격의 ladder-actions/pixel-assets/keyboard-ime 및 다른 원본검사는 변경하지 않았습니다.

| 검사 | 이번 결과 |
| --- | --- |
| ladder-actions / ladder-edge | 10/10 · 4/4 |
| keyboard-ime | 7/7 |
| pixel-assets / ladder-render | 65/65 · 7/7 |
| exploration-contract / entrance / foundation | 16/16 · 9/9 · 51/51 |
| exploration-browser / browser-playtest(?room=test) | 6/6 · 20/20 |
| area-data | 22/22 (기존4159틱·교대2회완주) |
| tile-mosaic-render | 7/7 |
| pixel-render 구역 / 시험방 | 각각7/7 |
| mobile-layout / mobile-fullscreen | 20/20 · 6/6 |
| foundation-edge / room-traversal / exploration-edge | 16/16 · 4/4 · 13/13 |
| ABYSSFALL polish / audio / audio-wind | 3종통과 |
| 실제입력캡처 | 14장, 두주인공전4프레임·매달린공격·옆내림·PC연속사다리·780×330 |
| 재빌드 / 검사원본 / 다른타일 | 4파일해시동일 / 정정규격과동일 / ladder외RGBA동일 |

현재그림의 불투명무게중심오차최대0.247단위(허용±2), 맨위6줄올린손중심오차최대6.591단위(허용±12). 가로대시작7/27/47px·6px두께·순환간격20/20/20px. 전체의상반전없음. 원본/정리/전문지시문은PROVENANCE.

재현: 루트HTTP8765, `HK_URL=http://127.0.0.1:8765/games/the-hollow-keep/next/ CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/<name>.cjs`. 시험방browser-playtest/pixel-render는?room=test. ABYSSFALL은루트tests의3스크립트. 로그는logs폴더. 최초브라우저시도는이전서버종료로연결실패해HTTP서버재시작후원본검사를재실행했습니다(검사약화없음). audio404는기존실패복구검사의예상경고.

남은확인: Claude Code 교차검토, 사용자외형/움직임/손맛, 실제기기회전·터치·성능. main병합·수동배포없음.
