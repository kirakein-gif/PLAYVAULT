# Codex 작업 지시 04 · scale 2(136px) 전체 동작·효과·타일·배경 제작

> 작성: Claude Code, 2026-10-31
> 사용자 결정: 그림 밀도 **x2(136px)** 확정. 시험본에는 점프·공격 등 나머지 동작이 아직 반영되지 않음.
> 아래 블록을 그대로 Codex에 붙여 넣으면 됩니다.

```text
PLAYVAULT — THE HOLLOW KEEP: 그림 밀도 x2(scale 2)로 전체 동작·효과·타일·배경을 제작해 기본 자산으로 적용

작업 브랜치: codex/hollow-keep-pixel-art (PR #8, 같은 PR에 이어서)
먼저 claude/hollow-keep-pixel-art-spec 의 최신 커밋을 반영한다.
(ART_DIRECTION §1 밀도 확정, attack 첫 프레임 2틱 이하, pixel-assets·pixel-render 검사 추가)

[읽기]
ART_DIRECTION.md 전체(§3 외형 확인 목록, §4 scale 2, §4-4 베기 효과, §5 경로 A),
docs/reference/target-pose-board-2026-10-31.jpg(목표 외형), 시험본 x2 결과와 PROVENANCE

[만들 것 — 기본 자산 next/assets/pixel/ 을 scale 2 세트로 교체]
- manifest.json: scale 2, tileSize 60. palette.json은 64색 이하.
- Ethan·Noah 각각 idle(4+) run(6+) jump-standing(3+) jump-running(3+) land(2+) attack(4+)
  · 시험본 x2의 idle·run을 출발점으로 쓰되 손질을 더 한다(축소 잔색·떠 있는 점·흐린 경계 정리). Noah run은 새로 만든다.
  · 동작마다 목표 그림의 해당 자세를 기준으로, 부족한 중간 프레임은 같은 인물로 생성한 동작 그림을 밑그림으로 쓴다(경로 A).
  · jump-standing: 곧게 선 채 무릎 당김. jump-running: 앞으로 기운 도약(상체까지 기울 것). land: 분명한 웅크림.
  · attack: 첫(준비) 프레임 2틱 이하, 이어서 휘두름/발사 → 끝 → 복귀. 게임 판정은 누르는 즉시이므로 그림이 늦으면 안 됨.
- 효과: Ethan fx-rune(2+, 반복 가능), Noah fx-slash(3+, 한 번만 재생) — §4-4: 매끄러운 초승달 호, 단색 채움 금지,
  밝은 칼날 선 + 가늘어지는 꼬리 + 흩어진 점, 칼 궤적을 따라 펼쳐짐, 몸 뒤로 넘어가지 않음.
- tiles.png(60px 칸: floor-top, wall-fill, ledge는 위 32px만), bg-*.png 1920×1080(선택이지만 권장)
- PROVENANCE.md: 경로 A, 동작별 생성 지시문 전문, 손질 내용(특정 게임·작가 이름 금지)

[렌더러]
- 기본 자산이 scale 2로 바뀌므로 artStatus().scale = 2, 캔버스 실제 해상도 1920×k, setTransform(k×2)
- fx-slash는 공격 판정 상자가 아니라 attack 프레임·손 위치 기준으로 그리고, attack 0번(준비) 프레임에는 그리지 않는다.
- 시험본(?art=trial-x1|x2)과 pixel-trial 폴더는 사용자 승인 전까지 그대로 둔다.

[검증 — 결과를 그대로 보고]
1. node games/the-hollow-keep/next/tests/pixel-assets.cjs → 전부 통과(scale 2 기본 자산)
2. 로컬 HTTP 서버 후 pixel-render.cjs → 7/7 (새로 추가된 Noah 베기 효과 좌·우 검사 포함)
3. 기존 검사 전체: foundation-contract 51/51, foundation-edge, room-traversal, mobile-layout 20/20,
   mobile-fullscreen 6/6, browser-playtest, density-trial(HK_URL 지정), ABYSSFALL 회귀 3종
4. 비교 캡처를 PR에 첨부: 목표 그림의 6개 자세와 해당 스프라이트 프레임을 같은 크기로 나란히(Ethan·Noah),
   Noah·Ethan 공격 연속 캡처, PC와 휴대전화 780×330 게임 화면
5. 외형이 닮았는지는 자동 검사로 확인되지 않으므로 완성이라고 쓰지 않는다. 사용자 판단 대기로 보고한다.

[금지] 검사 원본 약화(결함이 있으면 고치지 말고 이유를 PR에 적는다), 기존 게임·공용 자산·런처·다른 게임 수정,
sim.js 수치 변경, Noah 3단 콤보 추가(보류), 병합·배포
[완료] next/README.md 갱신, WORK_LOG·STATUS·CHANGELOG 갱신, 같은 PR에 푸시. 재검토는 Claude Code.
```
