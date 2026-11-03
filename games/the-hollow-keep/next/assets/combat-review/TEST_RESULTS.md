# TASK_09 실행 결과 (2026-11-02, Asia/Seoul)

기준 main `4ec1cfa`, 착수 `c4d07bf`, PR #20. 담당 Codex / Claude Code 재검토 대기. 아래는 이번 실행 결과입니다. 원본 인수 검사 수정·약화 없이, 자체 경계 검사와 실제 조작 검사만 추가했습니다.

| 검사 | 결과 |
| --- | --- |
| weapons-contract | 15/15 |
| weapons-edge (추가 경계) | 6/6 |
| capture-combat 실제 입력·렌더·터치·패널 | 6/6 |
| pixel-assets (새 동작·효과 포함) | 92/92 |
| foundation-contract / foundation-edge | 51/51 · 16/16 |
| exploration-contract / entrance | 16/16 · 9/9 |
| ladder-actions / ladder-edge | 10/10 · 4/4 |
| area-data / exploration-edge | 22/22 · 13/13 |
| pixel-render 구역 / ?room=test | 각각 7/7 |
| ladder-render / tile-mosaic-render / keyboard-ime | 각각 7/7 |
| mobile-layout / mobile-fullscreen | 20/20 · 6/6 |
| exploration-browser / browser-playtest(?room=test) | 6/6 · 20/20 |
| room-traversal | 4/4 |
| ABYSSFALL polish / audio / audio-wind | 3종 통과 |
| 빌드 재현 | 새 PNG 9개 + manifest, 10/10 SHA256 동일 |
| 기존 값·그림 보존 | 이동·1단 무기 CONFIG, 기존 PNG·동작 manifest 동일 |
| git diff --check | 통과 |

기존 4159틱·교대 2회 완주는 새 무기 규칙에서도 통과해 재기록하지 않았습니다. 추가 경계 검사는 공격 대기 중 충전 무시, 왼쪽 3단 디딤·벽 충돌, 직접 표적 중복 피해 제외, 벽 너머 주변 피해·퍼즐 벽 비파괴, 공중·사다리 콤보와 사다리 10단위 디딤·중앙 복귀, 방을 넘은 디딤의 이전 공격 취소를 확인합니다.

실제 입력 검사는 Noah 좌우 각각 1·2·3단의 몸 자세 12개·효과 9개 프레임, Ethan 2·3단 충전 자세·단계별 빛·탄, 빛 터짐 3프레임, 780×330 CDP 터치의 누르고 놓기, 패널 수치·1단 동기화·JSON 복사·기본값 복원을 확인합니다. 월드·좌표·그림 주입은 없습니다. 32개 캡처를 10개 무손실 WebP(710890바이트)로 정리했습니다.

재현: 저장소 루트 HTTP8765 후 `HK_URL=http://127.0.0.1:8765/games/the-hollow-keep/next/ CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/<name>.cjs`. pixel-render/browser-playtest 시험 방은 `?room=test`입니다. 새 실제 조작 검사는 `tools/capture-combat.cjs`, ABYSSFALL은 루트 tests의 세 회귀 스크립트입니다. [원본 실행 로그](logs/)를 함께 제공합니다.

자체 검토에서 보완한 점: 첫 생성 보드의 finisher 두 자세가 붙어 별도 원본을 재생성했습니다. 2단 효과 마지막 프레임의 표시 시간을 2/2/3틱으로 맞췄고, 디딤으로 방을 넘어갈 때 이전 공격의 새 방 피해를 막았습니다. 자체 경계 검사 초안의 구문 오류는 수정 후 실행했습니다. 원본 검사 실패나 판정 변경은 없습니다. 보존 확인 중 Node 자식 프로세스가 샌드박스 EPERM으로 막힌 것은 Git 원본을 임시 파일로 읽어 비교하는 방식으로 확인했습니다. audio404 메시지는 기존 실패 복구 검사의 예상 경고입니다.

남은 확인: Claude Code 교차 검토, 사용자 손맛·외형·동작 판단, 실제 휴대전화 회전·터치감·성능. 이번에는 움직이지 않는 표적만 있고 체력·적·보스는 구현하지 않았습니다. main 병합·수동 배포 없음.
