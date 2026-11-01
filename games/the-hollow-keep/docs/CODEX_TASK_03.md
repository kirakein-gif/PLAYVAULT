# Codex 작업 지시 03 · 목표 외형 시험본 (68px / 136px 비교)

> 작성: Claude Code, 2026-10-31
> 사용자 결정:
> - 목표 외형 = `docs/reference/target-pose-board-2026-10-31.jpg`
> - 그림 밀도는 두 가지를 시험한 뒤 결정
>
> PR #8의 이전 수정 요청(전체 재제작)보다 **이 시험이 먼저**입니다. 전체 재제작은 사용자가 밀도를 고른 뒤 진행합니다.

```text
PLAYVAULT — THE HOLLOW KEEP 목표 외형 시험본: 같은 인물·동작을 68px(scale 1)과 136px(scale 2)로 만들어 비교

작업 브랜치: codex/hollow-keep-pixel-art (PR #8, 같은 PR에 이어서)
먼저 claude/hollow-keep-pixel-art-spec 의 최신 커밋을 반영한다(ART_DIRECTION 수정, 참고 그림, 검사 scale·시험본 모드).

[읽기]
games/the-hollow-keep/docs/ART_DIRECTION.md (§1 목표 외형·밀도, §3 외형 확인 목록, §4 scale, §5 경로 A),
games/the-hollow-keep/docs/reference/README.md, 참고 그림 target-pose-board-2026-10-31.jpg
(가능하면 PROVENANCE에 적힌 원본 PNG를 밑그림으로 쓴다. 사용자가 보낸 JPEG는 압축 흔적이 있다.)

[만들 것 — 경로 A(생성 그림 → 원래 크기 밑그림 → 팔레트 → 손질)]
- next/assets/pixel-trial/x1/ (scale 1, 몸 높이 Ethan 68·Noah 64px 기준)
- next/assets/pixel-trial/x2/ (scale 2, 몸 높이 Ethan 136·Noah 128px 기준, tileSize 60)
- 두 폴더 모두 같은 범위: Ethan idle(4+)·run(6+), Noah idle(4+). 각각 manifest.json, palette.json(64색 이하), PROVENANCE.md
- 손질 필수: 1px 윤곽, 얼굴(코를 부리처럼 튀어나오게 하지 않음), 손, 프레임 간 흔들림, 떠 있는 점
- 참고 그림의 자세·옷·색을 최대한 유지한다. 지시문에 특정 게임·작가 이름 금지.

[렌더러]
- ?art=trial-x1 / ?art=trial-x2 로 시험본 전환. 시험본에 없는 동작은 도형으로 대체
- artStatus()에 scale을 포함하고, 실제 해상도 = (960×scale)×k, setTransform(k×scale), 보간 끔, 정수 그림 픽셀 좌표

[검증 — 결과를 그대로 보고]
1. HK_ART_REQUIRE="ethan:idle,run;noah:idle" HK_ART_DIR=games/the-hollow-keep/next/assets/pixel-trial/x1 node games/the-hollow-keep/next/tests/pixel-assets.cjs
2. 같은 명령을 x2 폴더로
3. 로컬 HTTP 서버 후 HK_URL=".../next/?art=trial-x1" 와 "?art=trial-x2" 로 pixel-render.cjs 각각 5/5
4. 기존 검사 전체(기본 자산 포함) 재실행
5. 비교 캡처를 PR에 첨부: (a) 참고 그림 해당 자세 | x1 | x2 를 같은 크기로 나란히, (b) PC와 모바일 780×330 게임 화면에서 x1·x2
6. 어느 쪽이 낫다는 판단은 하지 않는다. 사용자가 고른다.

[금지] 검사 원본 약화, 기존 게임·공용 자산·런처 수정, sim.js 수치 변경, 병합·배포
[완료] WORK_LOG·STATUS 갱신, 같은 PR에 푸시, 재검토는 Claude Code
```
