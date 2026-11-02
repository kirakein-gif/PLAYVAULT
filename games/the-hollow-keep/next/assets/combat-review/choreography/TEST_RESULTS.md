# 2026-11-02 · TASK_09 추가 수정3 검증

이번 실행만의 결과. Codex, 기준00479e7 + 규격abbcd8f(병합ffe7736), PR #20. 원본 인수 테스트는 규격 브랜치와 동일합니다. 자체 weapons-edge6항목은 3단10디딤→2단12디딤으로 조정하고 3단 제자리 확인을 더했습니다. 검사 항목 삭제·약화 없음.

| 검사 | 실제 결과 |
| --- | --- |
| weapons-contract / 자체 weapons-edge |18/18 ·6/6|
| pixel-assets / combo-render |94/94 ·5/5|
| foundation-contract / foundation-edge |51/51 ·16/16|
| exploration-contract / entrance-contract |16/16 ·9/9|
| ladder-actions / area-data |10/10 ·22/22(4159틱/69.3초·교대2회 완주)|
| exploration-edge / ladder-edge / room-traversal |13/13 ·4/4 ·4/4|
| pixel-render 구역/시험실 |각7/7|
| ladder-render / tile-mosaic-render / keyboard-ime |각7/7|
| mobile-layout / mobile-fullscreen |20/20 ·6/6|
| exploration-browser / browser-playtest |6/6 ·20/20|
| capture-combat 실제 입력 |6/6: 좌우18몸프레임·9효과프레임, Ethan2/3·모바일·F2|
| capture-combat-feel 실제 화면 |좌우2/2: 기존명중/박자/시간/피해표시 전부 + 실제 궤적·파고들기12·3타제자리|
| check-combo-release |2/2: 정확한 창 만료·이동 해제 유지|
| ECLIPSE polish/audio/audio-wind 회귀 |모두 PASS(다른 게임으로 구분)|
| 재빌드 무결성 |전체 runtime PNG/JSON hash 동일; Noah 전투6장 외 모든 PNG와 Ethan manifest00479e7동일|
| 연결 자세 |1→2·2→3·3→1 RGBA동일, 기준점 실루엣IoU1.0|
| 캡처 포장 |44장→10보드·좌우각82틱1367ms영상·기준/idle/연결 비교, 무손실RGBA·시간일치|

정적 효과 중심 이동(native pixel):1단(+74.57,+5.17),2단(+17.35,-83.79),3단(+19.06,+123.41). 실제 화면에서1단가로37.29/세로2.59단위,2단위로41.90,3단아래로60.71단위(3단흔들림 포함).2·3단 모두 단조로운 상/하 이동이고3단이 더 큽니다. 실제2단12단위 파고들기,3단제자리·게임tick지속·물리표적좌표유지를 추가 관측했습니다.

실행 중 수정: 초기 효과 시트의 투명한 왼쪽 여백이 몸 뒤에 걸려 pixel-render 구역/시험실에서 각각5/7 실패했습니다. 원본 검사를 유지하고192px폭·pivot0으로 앞쪽 영역만 남겨 렌더링 픽셀/위치를 그대로 보존했습니다. 각7/7 재통과,94/94 재통과. 실패 로그(*before-trim.log)도 보존합니다. 좌우 실제82틱+idle 전체RGBA가 자르기 전후 동일한지 재캡처 비교했습니다.

원본 stdout/stderr: [logs](logs/). 구역HK_URL=http://127.0.0.1:8765/games/the-hollow-keep/next/, 시험실은?room=test, CHROMIUM_PATH=/usr/bin/chromium. [재현 절차](README.md). 실기기와 사용자 손맛/외형 판단은 미확인. Claude Code 재검토 대기, main 병합·수동 배포 없음.
