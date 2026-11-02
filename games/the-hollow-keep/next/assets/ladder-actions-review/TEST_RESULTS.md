# TASK_08 실행 검증 (2026-11-02, Asia/Seoul)

기준 main1dea1e2, 구현 Codex, PR #17. 아래는 이번 실행 결과이며 Claude Code 재검토 결과가 아닙니다. 원본 인수 검사 수정 없음. 새 ladder-edge만 추가했습니다.

| 검사 | 결과 |
| --- | --- |
| ladder-actions | 8/8 |
| ladder-edge (추가 경계) | 4/4 |
| pixel-assets (climb 포함) | 63/63 |
| ladder-render | 7/7 |
| exploration-contract | 16/16 |
| entrance-contract | 9/9 |
| foundation-contract | 51/51 |
| area-data | 22/22 |
| tile-mosaic-render | 7/7 |
| pixel-render 구역 / ?room=test | 각각7/7 |
| mobile-layout | 20/20 |
| mobile-fullscreen | 6/6 |
| exploration-browser | 6/6 |
| browser-playtest ?room=test | 20/20 |
| foundation-edge | 16/16 |
| room-traversal | 4/4 |
| exploration-edge | 13/13 |
| ABYSSFALL polish / audio / audio-wind | 3종 통과 |
| 두 주인공 실제 입력 캡처 | climb전4프레임·매달린공격·옆바닥내림 + 모바일, 13장 |
| climb 재빌드 | PNG2개·manifest SHA256 동일 |

재현: 루트 HTTP8765, `CHROMIUM_PATH=/usr/bin/chromium HK_URL=http://127.0.0.1:8765/games/the-hollow-keep/next/ node games/the-hollow-keep/next/tests/<name>.cjs`. 시험 방 browser-playtest/pixel-render는 URL에 `?room=test`. ABYSSFALL은 루트 `node tests/{polish-regression,audio-regression,audio-wind-regression}.cjs`를 각각 실행합니다. 로그는 [logs](logs/) 참조.

실행 중 문제: 최초 exploration-browser 실행은 기본8766과 서버8765 불일치로 연결 실패, HK_URL을 지정한 재실행은6/6. 추가 ladder-edge fixture는 처음에 사다리 옆 벽을 어깨와 겹치게 배치해 준비 실패; 기존 인수와 같은 한 칸 틈으로 fixture를 고친 뒤4/4. 검사 원본은 변경하지 않았습니다. audio404 메시지는 기존 실패 복구 검사에서 예상된 경고입니다. 기존4159틱·교대2회 완주는 규칙 변경 후에도 통과하므로 재기록하지 않았습니다.

남은 확인: Claude Code 교차 검토, 사용자 외형·손맛, 실제 휴대전화 회전·터치·성능. climb 반대 자세의 후면 반전이 의상 비대칭을 뒤집는 미술상 한계가 있습니다. 병합·수동 배포하지 않았습니다.
