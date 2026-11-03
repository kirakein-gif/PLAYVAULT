# TASK_09 추가 수정 실행 결과 (2026-11-02, Asia/Seoul)

기준 bf87c75 + 정정 규격097119f(병합e1a4409), PR #20. Codex 구현 / Claude Code 재검토 대기. 이전 실행과 구분한 이번 결과입니다. 정정 규격의 weapons-contract/pixel-assets 및 다른 원본 검사는 그대로입니다. 자체 weapons-edge의 옛 고정18틱 가정만 CONFIG 기준으로 바꾸고6개 확인 항목을 유지했습니다.

| 검사 | 이번 결과 |
| --- | --- |
| weapons-contract / weapons-edge | 16/16 · 6/6 |
| pixel-assets (동작 길이·핵심 자세 포함) | 92/92 |
| capture-combat 실제 입력·터치·패널·전체 프레임 | 6/6 |
| capture-combat-feel 명중·박자·시계·숫자 | 좌우2/2 |
| foundation-contract / foundation-edge | 51/51 · 16/16 |
| exploration-contract / entrance | 16/16 · 9/9 |
| ladder-actions / ladder-edge | 10/10 · 4/4 |
| area-data / exploration-edge | 22/22 · 13/13 |
| pixel-render 구역 / ?room=test | 각각7/7 |
| ladder-render / tile-mosaic-render / keyboard-ime | 각각7/7 |
| mobile-layout / mobile-fullscreen | 20/20 · 6/6 |
| exploration-browser / browser-playtest(?room=test) | 6/6 · 20/20 |
| room-traversal | 4/4 |
| ABYSSFALL polish / audio / audio-wind | 3종 통과 |
| 재빌드 | 모든 런타임PNG/manifest 해시 동일 |
| 보존 확인 | CONFIG 변경은 요청된 회복22/34뿐, PNG 변경은3단 베기뿐, Ethan PNG/manifest 그대로 |
| git diff --check | 통과 |

실제 화면에서 18·22틱 공격 간격, 추가3·3·5틱 유지의 시작과 끝, 흰색2틱, 그림 밀림3/2/1/0픽셀, 3단만6틱 화면 흔들림을 확인했습니다. 그동안 매 틱 세계 tick은1씩 증가하고 표적의 실제 x/y는 바뀌지 않습니다. 피해 글자의 실제 글꼴 크기와 폭으로 서로/HP와 겹치지 않음을 확인했습니다. 최초 준비와 베기 효과도 유지하며 각 방향12몸자세·9효과 프레임이 실제 렌더에 나타납니다.

기존4159틱·교대2회 완주는 새 회복 시간에서도 통과해 재기록하지 않았습니다. 입력·피해·판정 시간·사거리·연결 창·1단/이동 수치·Ethan 충전은 그대로이며, 시뮬레이션 정지나 효과음은 추가하지 않았습니다. hit 이벤트의 공격자/단계/방향 메타데이터로 교대 후 남은 Ethan 탄을 Noah 명중으로 잘못 처리하지 않습니다.

재현: 루트 HTTP8765, `HK_URL=http://127.0.0.1:8765/games/the-hollow-keep/next/ CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/<name>.cjs`. 시험방pixel-render/browser-playtest는?room=test. 실제 연출 검사는 tools/capture-combat-feel.cjs입니다. 실행 로그는 [logs](logs/), 캡처와 영상 재현은 [README](README.md) 참조.

원본 검사 실패·약화는 없었습니다. 연속 영상 정리 도구의 초안 구문 오류는 바로 고쳐 포장했고, 떠오르는 숫자까지 보이도록 캡처 범위를 넓혔습니다. 영상은 실제82틱/1.367초를 리사이즈·시간 변경 없이 저장하고 프레임/시간 동등성을 검증했습니다. audio404는 기존 실패 복구 검사의 예상 경고입니다.

남은 확인은 Claude Code 교차 검토, 사용자 손맛·외형 판단, 실제 휴대전화 회전·터치감·성능입니다. 회사 PC 미리보기는 사용자가 새 빌드로 갱신할 예정이며 이번 작업에서 게시하지 않았습니다. main 병합·수동 배포 없음.
