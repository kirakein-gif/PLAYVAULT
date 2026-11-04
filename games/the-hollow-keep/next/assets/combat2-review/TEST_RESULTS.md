# TASK_10 검증

최신: [2026-11-04 추가 수정1 · 쓰러짐 교대 자리 보정](down-swap/TEST_RESULTS.md). 검토 브랜치의 정정 검사와 구현 수정을 반영해 enemies17/17, exploration-edge13/13, exploration-browser6/6 및 요구 회귀를 통과했습니다. 아래는 이전 제출 시점의 기록이며, 당시 탐험 검사2개 실패는 최신 결과에서 해소됐습니다.

## 최초 제출 · 2026-11-03 (Asia/Seoul)

대상: main `2605e46`에서 만든 `codex/hollow-keep-combat-enemies`, PR #24. Windows / Node24.18 / Playwright / Chrome. 원본 인수 검사와 기존 이동·무기 수치는 수정하지 않았습니다. 아래는 이번 구현에 실제 실행한 결과입니다.

## 통과

모두 `node games/the-hollow-keep/next/tests/<이름>.cjs`입니다.

| 검사 | 결과 |
|---|---:|
| enemies-contract | 16/16 |
| area-data | 24/24 |
| pixel-assets | 135/135 |
| weapons-contract / foundation-contract | 22/22 / 51/51 |
| foundation-edge / exploration-contract / entrance-contract | 16/16 / 16/16 / 9/9 |
| ladder-actions / ladder-edge / weapons-edge | 10/10 / 4/4 / 6/6 |
| combo-render | 5/5 |
| pixel-render (구역 및 `?room=test` 각각) | 7/7, 7/7 |
| ladder-render / tile-mosaic-render / keyboard-ime | 각 7/7 |
| mobile-layout / mobile-fullscreen | 20/20 / 6/6 |
| browser-playtest (`?room=test`) | 20/20 |
| room-traversal | 4/4 |
| combat2-browser (새 보완 검사) | 4/4 |

`tools/capture-enemies.cjs`: 시뮬레이션 시험 구역 16/16 시나리오 및 캡처. 실제 입력 완주는 4214틱(70.2초), 8방·특정 적2·모든 장치·열쇠·출입문 확인, defeat0. F2 음수 knockback.vy 적용 및 기본값 복원도 확인합니다.

기존 게임 회귀: `node tests/polish-regression.cjs`, `node tests/audio-regression.cjs`, `node tests/audio-wind-regression.cjs` 모두 exit0. 이들은 ABYSSFALL/ECLIPSE의 기존 검사이며 Hollow Keep 적 검사를 대신하지 않습니다.

## 실패 · 원본 유지

1. **exploration-edge**: 처음5개 통과 후 6번째 `nonlethal target HP survives a round trip between rooms`, 26행에서 `w.dummies.find(...oath-west).hp`가 TypeError. TASK_10은 이 시험 표적을 특정 방패형으로 교체하고 구역의 target을 없애도록 요구합니다. 또 적의 비치명 피해는 재입장 시 초기화되므로 이 테스트의 표적 유지 계약을 적에 그대로 적용할 수 없습니다. 나머지 원본 사례는 이 예외 때문에 실행되지 않았습니다. 적의 재생/특정 적 영구 처치 계약은 enemies-contract에서 검증합니다.
2. **exploration-browser**: 첫 지도 검사 통과, 실제4214틱 입력 후 56행에서 새 `gate-shelter`의 flag bucket이 없어 TypeError. 원본이 모든 물건을 기존 switch/door/breakable/key/target/entrance로만 처리합니다. 필수 쉼터·enemy를 제거해서 해결할 수 없습니다. 원본은 그대로 두고, 같은 실제 입력과 새 물건 규격을 확인하는 `combat2-browser.cjs`를 별도로 추가했습니다. 원본의 후속 검사들은 이 예외 때문에 실행되지 않았습니다.

두 실패는 PR에 그대로 인계합니다. 원본 검사를 약화하거나 적을 허수아비 배열에 복제하지 않았습니다. [실행 로그](logs/)에 통과·실패 출력을 보존합니다.

## 미확인

실물 모바일 회전·터치감·성능, 사용자 손맛·외형 판단, Claude Code 교차 검토. 원본 exploration 후속 검사 미실행은 위에 명시했습니다. 회사 PC 미리보기 갱신·main 병합·배포는 수행하지 않았습니다.
