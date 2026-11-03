# TASK_10 · 전투 2차 검토 자료

PR [#24](https://github.com/kirakein-gif/PLAYVAULT/pull/24), 기준 main `2605e46`, 브랜치 `codex/hollow-keep-combat-enemies`. Claude Code 교차 검토 및 사용자 외형·손맛 판단 대기입니다. 병합·배포하지 않았습니다.

## 실제 구역 · 실제 키 입력

`tests/combat2-browser.cjs`가 생산 앱을 열고 `areas/area1.walkthrough.json`의 4214틱을 그대로 재생합니다. 스케줄만 제어하며 게임 상태·좌표·체력·CONFIG를 주입하지 않습니다. 읽기 전용 관찰로 이벤트와 화면을 저장합니다.

- [시작 방 · 쉼터와 체력](actual/gate-shelter-hud.png)
- [방패에 막힘](actual/blocked-oath-west.png)
- [특정 방패형 처치](actual/kill-oath-west.png), [특정 돌격형 처치](actual/kill-oath-east.png)
- [8방 완주 지도](actual/complete-map.png), [780×330 모바일](actual/mobile-780x330.png)
- [실제 최종 상태·이벤트](actual/events.json)

## 시뮬레이션 시험 구역 캡처

아래는 실제 구역 완주 장면과 구분한 작은 시험 구역입니다. `tools/capture-enemies.cjs`가 정식 `createWorld({area,hp})` 옵션으로 만들고 실제 `step(input)`으로 진행합니다. 생성 후 적·체력·CONFIG를 변경하지 않습니다. 손쉬운 재현을 위한 별도 구역이며, 실제 구역에서 해당 상황을 모두 자연스럽게 플레이했다는 뜻은 아닙니다. [각 캡처의 상태·이벤트](fixtures/states.json)를 함께 남깁니다.

| 대상 | 이동 | 공격/준비 | 피격/상태 |
|---|---|---|---|
| 돌격형 | [걷기](fixtures/crawler-walk.png) | [돌진](fixtures/crawler-charge.png) | [명중](fixtures/crawler-hit.png) |
| 공중형 | [부유](fixtures/wisp-hover.png) | [내리꽂기](fixtures/wisp-dive.png) | [점프 공격 명중](fixtures/wisp-hit.png) |
| 방패형 | [걷기](fixtures/shield-walk.png) | [준비](fixtures/shield-windup.png), [밀치기](fixtures/shield-bash.png) | [막기](fixtures/shield-blocked.png), [충전탄 경직](fixtures/shield-stagger-hit.png) |

- [주인공 피격](fixtures/hero-hurt.png), [Ethan 쓰러짐·Noah 자동 교대·체력 표시](fixtures/hero-down-auto-swap.png)
- [쉼터 조사 전](fixtures/shelter-before-rest.png), [조사 후 두 사람 회복](fixtures/shelter-after-rest.png)
- [4번째 처치의 회복 조각](fixtures/heal-fragment.png)

돌격형·공중형 체력22와 무기 최소 피해22 때문에 기본 수치에서는 한 번 맞으면 죽습니다. 치명타도 첫2틱은 피격 그림·밝힘을 보이고, 이어서 사망3프레임을 한 번 재생합니다. 방패형은 살아 있는 경직·밝힘을 볼 수 있습니다. 깜빡임 한 장은 투명해 보일 수 있으므로 이벤트/무적 틱과 함께 확인합니다.

## 재현

저장소 루트에서 HTTP8766 서버를 켭니다. Node/Playwright, Chrome/Chromium이 필요합니다. `CHROMIUM_PATH`, `HK_URL`, `HK_SHOT_DIR`로 실행 환경과 캡처 위치를 지정할 수 있습니다.

```sh
node games/the-hollow-keep/next/tests/combat2-browser.cjs
node games/the-hollow-keep/next/tools/capture-enemies.cjs
```

[검증 결과·실패 사유](TEST_RESULTS.md), [그림 제작 기록](../pixel/PROVENANCE.md).
