# TASK_10 추가 수정 지시 1 · 2026-11-04 (Asia/Seoul)

같은 PR [#24](https://github.com/kirakein-gif/PLAYVAULT/pull/24), `codex/hollow-keep-combat-enemies`. 구현 시작 `812d362`, 검토 브랜치 `1d32619` 병합 `b4b4180`, 자리 보정 `ee8f57c`. 최신 main `4e7abd0`도 작업 브랜치로 병합(`ca7ea74`)하여 기존 홈 화면·체스 변경을 보존했습니다. main에 PR을 병합하거나 수동 배포하지 않았습니다.

## 수정과 재현

Noah가 벽·닫힌 봉쇄물에 붙은 채 쓰러져 큰 Ethan으로 바뀔 때, 같은 틱 안에 막힌 칸 밖으로 옮깁니다. 원래 좌표가 비어 있으면 그대로 둡니다. 좌우에서 가장 짧은 이동을 먼저 찾고, 천장이 막는 경우 아래 및 모서리의 두 축 보정을 검사합니다. 전체 이동 거리는 최대8단위입니다. 타일 경계의 정확한 소수 좌표를 사용하므로 기존 1.5단위 겹침은 1.5단위만 보정합니다.

수동 교대의 공간 검사·실패 규칙, 무적·피격·교대 시간, 이동·무기 수치는 그대로입니다. 새 그림은 만들지 않았습니다. `enemies-contract`, `exploration-edge`, `exploration-browser`는 검토 브랜치 파일과 동일하며 Codex가 수정하지 않았습니다.

수정 전 `812d362`의 sim을 임시 파일로 꺼내 `HK_SIM`으로 새 인수 검사에 연결했습니다. **16/17, exit1로 같은 오류를 재현**했습니다([기준 로그](logs/baseline-enemies-contract.log)). 실패한 항목은 새 쓰러짐 교대 검사 하나이며, 오른쪽 벽에 교대0틱부터 겹쳤습니다. 아래 표는 수정 후 이번 실행입니다. 이전 2026-11-03 기록과 구분합니다.

## 실행 결과

Windows / Node24.18 / Playwright / Chrome, 저장소 루트 HTTP8766. `node games/the-hollow-keep/next/tests/<이름>.cjs`, 별도 표기한 도구/기존 게임 검사는 해당 경로에서 실행합니다.

| 검사 | 수정 후 결과 |
|---|---:|
| enemies-contract | 17/17 |
| down-swap-edge (추가 보완) | 5/5 |
| exploration-edge | 13/13 |
| exploration-browser | 6/6 |
| area-data / pixel-assets | 24/24 / 135/135 |
| weapons-contract / foundation-contract | 22/22 / 51/51 |
| foundation-edge / exploration-contract / entrance-contract | 16/16 / 16/16 / 9/9 |
| ladder-actions / ladder-edge / weapons-edge | 10/10 / 4/4 / 6/6 |
| room-traversal / combo-render | 4/4 / 5/5 |
| pixel-render (구역·시험 방 각각) | 7/7, 7/7 |
| ladder-render / tile-mosaic-render / keyboard-ime | 각7/7 |
| mobile-layout / mobile-fullscreen | 20/20 / 6/6 |
| browser-playtest (`?room=test`) | 20/20 |
| combat2-browser | 4/4 |
| `tools/capture-enemies.cjs` | 16/16 |
| `tests/polish-regression.cjs` / `audio-regression.cjs` / `audio-wind-regression.cjs` | 모두 exit0 |

보완5개는 왼쪽 벽의 정확한1.5단위 보정, 부서지지 않은 벽, 천장 아래, 천장+벽 모서리, 수동 교대 거부입니다. 자동 교대는 그 틱과 이후30틱의 막힌 칸 겹침이 없고 무적90틱이 유지되는지 확인합니다.

완주 기록은 **4214틱/70.2초로 변경 없음**입니다. 실제 키 입력으로8방·특정 적2마리 처치·모든 장치·열쇠·출입문·성문 복귀와 defeat0을 재확인합니다. 이전 원본 탐험 검사2개 충돌은 검토 담당의 정정본으로 모두 통과했습니다.

[이번 실행 로그](logs/)를 보존합니다. 기존 실제 구역 및 시뮬레이션 캡처 제작 도구도 재실행했으며, 기존 검토 자료를 덮어쓰지 않았습니다. 실물 모바일 터치감/성능·사용자 손맛 판단은 이번 자동 검사로 확인하지 않았습니다. 다음은 Claude Code 재검토입니다.
