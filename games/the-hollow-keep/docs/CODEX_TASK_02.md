# Codex 작업 지시 02 · THE HOLLOW KEEP 픽셀아트 HD 주인공·타일 제작과 적용

> 작성: Claude Code, 2026-10-31 · 사용자 결정: 아트 기준부터, 픽셀아트 HD(1단위 = 1픽셀), 고딕
> 아래 블록을 그대로 Codex에 붙여 넣으면 됩니다.

```text
PLAYVAULT — THE HOLLOW KEEP 픽셀아트 HD: 주인공 스프라이트·시험 방 타일 제작과 렌더러 적용

저장소: kirakein-gif/PLAYVAULT
기준 브랜치: main (claude/hollow-keep-pixel-art-spec 이 아직 병합 전이면 그 브랜치)
작업 브랜치: codex/hollow-keep-pixel-art

[작업 시작 전]
1. git fetch origin --prune, 최신 main·원격 브랜치·열린 PR 확인. games/the-hollow-keep/ 대상 다른 미병합 작업이 있으면 시작하지 말고 확인 요청.
2. 읽기: AGENTS.md(역할 분담 포함), docs/STATUS.md, docs/WORK_LOG.md 최근 항목,
   games/the-hollow-keep/docs/ART_DIRECTION.md (이번 작업 기준, 필수), DESIGN_DIRECTION.md, FOUNDATION_SPEC.md.
3. 기존 타이틀 키아트 games/the-hollow-keep/assets/title-ethan-hd-v2.webp, title-noah-hd-v2.webp를 열어 인물 외형을 확인한다(외형 기준으로만 사용, 축소해서 쓰지 않음).
4. 첫 커밋으로 STATUS에 담당·범위를 적고 푸시, Draft PR 개설.

[만들 것 — ART_DIRECTION.md §4~§6]
- games/the-hollow-keep/next/assets/pixel/ 에:
  palette.json(64색 이하), manifest.json, PROVENANCE.md,
  Ethan·Noah 각각 idle(4+) run(6+) jump-standing(3+) jump-running(3+) land(2+) attack(4+) PNG 시트,
  tiles.png(floor-top, wall-fill, ledge), 선택: bg-*.png, fx-rune, fx-slash
- 규칙: 원래 해상도 PNG, 투명도 0/255만, 팔레트 색만, 오른쪽을 보는 방향, 발 기준점, idle 높이는 판정 높이 ±15%
- jump-running은 앞으로 기운 도약 자세, jump-standing은 곧게 선 자세(그림이 달라야 함)
- 이미지 생성은 참고 그림용. 반드시 원래 해상도로 다시 맞추고, 팔레트 양자화, 투명도 정리, 손질을 거친다.
  지시문에 특정 게임·작가 이름을 쓰지 않는다. 전체 지시문과 손질 과정을 PROVENANCE.md에 기록한다.

[렌더러 적용 — ART_DIRECTION.md §4-7]
- 캔버스 실제 해상도 = 960k×540k(표시 크기×DPR 이상인 가장 작은 정수 k), setTransform(k), imageSmoothingEnabled=false,
  창 크기·전체 화면 변화 시 다시 계산
- 스프라이트·타일은 정수 좌표로 그림(판정은 그대로), 왼쪽은 좌우 뒤집기, 점프는 jumpKind와 vy로 프레임 선택
- HKPlaytest.artStatus() → { loaded, failed }; 자산 실패 시 현재 도형으로 대신 그리고 게임은 계속 동작
- sim.js의 규칙·CONFIG 수치는 바꾸지 않는다.

[금지]
- 기존 games/the-hollow-keep/ 파일, 공용 assets/, 루트 런처, 다른 게임 수정
- 인수 테스트(foundation-contract, mobile-layout, mobile-fullscreen, pixel-assets, pixel-render) 약화·건너뛰기
- 특정 게임 그림체 모방, 강제 푸시, main 병합, 배포

[검증 — 결과를 그대로 보고]
1. node games/the-hollow-keep/next/tests/pixel-assets.cjs   (서버 불필요) → 전부 통과
2. 로컬 HTTP 서버 후 node games/the-hollow-keep/next/tests/pixel-render.cjs → 5/5
   HK_SHOT_DIR 를 지정해 두 점프 자세 캡처를 저장하고 육안 확인
3. 기존 검사 전체 재실행: foundation-contract 51/51, foundation-edge, room-traversal, mobile-layout 20/20,
   mobile-fullscreen 6/6, browser-playtest, ABYSSFALL 회귀 3종
4. PC와 모바일 가로(780×330) 화면 캡처를 확인하고, 픽셀이 뭉개지거나 들쭉날쭉하지 않은지 적는다.
5. "보기 좋다/닮았다"는 자동 검사로 확인되지 않으므로 완성이라고 쓰지 않는다. 사용자 판단 대기로 보고한다.

[완료 시]
- next/README.md에 자산 구조·검사 방법 추가
- WORK_LOG 새 항목(검토 담당 "Claude Code / 검토 대기"), STATUS 갱신, CHANGELOG 필요 시 갱신
- 게임 버전 번호는 올리지 않는다(사용자 결정 사항)
- Draft PR을 Ready로 전환. 병합하지 않는다. 검토는 Claude Code.
```

## Codex 작업 후 Claude Code가 할 일
1. `pixel-assets`·`pixel-render`와 기존 검사 전체 재실행
2. 화면 캡처로 픽셀 선명도(PC·모바일), 두 점프 자세 차이, 인물 외형 일치 확인
3. 원래 해상도 여부, 팔레트, PROVENANCE 기록, 특정 게임 모방 지시문 여부 확인
4. PR 검토 의견, WORK_LOG 기록
