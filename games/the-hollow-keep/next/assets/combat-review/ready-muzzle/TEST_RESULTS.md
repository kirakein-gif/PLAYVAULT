# 2026-11-03 · TASK_09 추가 수정 4·5 실제 검증

이번 Windows 실행 결과만 기록합니다. Codex 구현, Claude Code 재검토 대기. 규격 기준5740714. 인수 검사 weapons-contract/pixel-assets/combo-render는 원본과 동일합니다. 자체 weapons-edge는 준비 4틱을 기다린 뒤 방 경계 취소를 검사하도록 갱신했고, 준비 중 이동·방 이동이 없음을 더했습니다. 항목 삭제·약화 없음.

| 검사 | 결과 |
| --- | --- |
| weapons-contract / weapons-edge | 22/22 · 6/6 |
| pixel-assets / combo-render | 96/96 · 5/5 |
| foundation-contract / foundation-edge | 51/51 · 16/16 |
| exploration-contract / entrance-contract | 16/16 · 9/9 |
| ladder-actions / ladder-edge | 10/10 · 4/4 |
| area-data / exploration-edge / room-traversal | 22/22 · 13/13 · 4/4 |
| pixel-render 구역 / 시험실 | 각7/7 |
| ladder-render / tile-mosaic-render / keyboard-ime | 각7/7 |
| mobile-layout / mobile-fullscreen | 20/20 · 6/6 |
| exploration-browser / browser-playtest 시험실 | 6/6 · 20/20 |
| capture-combat | 6/6, 좌우 각19몸프레임·9효과프레임, Ethan2/3·모바일·F2 |
| capture-combat-feel / check-combo-release | 좌우2/2 · 2/2 |
| capture-ready-muzzle | 6/6, 좌우 각1타/2타멈춤·Ethan발사/충전십자 |
| ECLIPSE polish / audio / audio-wind | 모두 PASS, 다른 게임 회귀로 구분 |
| 재빌드 | 전체 runtime PNG/manifest SHA256 동일 |

area-data 완주 입력은 기존4159틱(69.3초)·교대2회 그대로 통과했습니다. 실제 브라우저에서도 모든 방·출입문·장치·복귀를 같은 입력으로 통과했습니다. Ethan 발사 높이/앞 위치 변경으로 완주 기록을 바꿀 필요는 없었습니다.

실제 좌우 관측: Noah 2·3타 준비 중 베기 효과·피해·디딤 없음; 2타 전체12단위 디딤, 3타제자리. 18/22박자, 3/3/5틱 자세 붙잡기, 표적2틱밝힘·3px그림밀림(물리좌표그대로), 3타만6틱흔들림, HP와 피해숫자분리, 세계틱지속 유지. 효과1타가로37.29/세로2.59,2타위41.90,3타아래60.71단위. 준비 추가로 타격 시점은2타+4,3타+6틱이며 공격 간격은 그대로입니다.

처음 자산 조립 시94/96: Ethan 손 그림 미교체와3타준비 칼높이 부족. 새 경로A 소스/높은 칼 준비로 보강한 뒤96/96. 처음 브라우저 실행은 격리된 서버8765의 연결 시간 초과로 실패했습니다. Chrome과 같은 권한에서8766 서버를 실행한 뒤 요구 브라우저 검사 전부 통과. `*-connection-failure.log`는 그 실패 로그이며 게임 실패와 구분합니다.

원본 stdout/stderr는 [logs](logs/)에 있습니다. 캡처/제작 재현은 [README](README.md). 사용자 외형/손맛, 실제 휴대전화 성능·회전·터치는 미확인. 자동 검사 통과를 사용자 승인으로 해석하지 않습니다.
