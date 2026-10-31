# PLAYVAULT · 게임별 변경 내역

게임별 기존 버전 체계를 독립적으로 유지한다. 이 파일을 만들면서 게임 버전을 올리거나 새 릴리스를 선언하지 않는다. 아래는 **소스·기존 문서·Git 이력에서 확인한 일부 기준점**이며 전체 과거 이력의 복원이 아니다. 기록 날짜는 Git 또는 기존 문서의 날짜다. 브랜치 구현·병합·배포를 구분하며 실제 배포 버전은 미확인이다.

향후 제품 변경은 해당 게임 아래 `버전 / 날짜 / 브랜치·커밋 또는 PR / 변경 / 검증·배포 상태`를 추가한다. 번호가 확정되지 않으면 `미확인` 또는 `미출시`로 쓰고 번호를 추정하지 않는다. 문서/운영 작업은 [WORK_LOG](docs/WORK_LOG.md)에 누적한다. UI 버전과 캐시 쿼리·자산 번호·기획 문서 버전은 서로 다를 수 있다.

## ABYSSFALL: ECLIPSE

### v60 · 2026-10-15 · main 구현 기준

- 깊이에 따른 적/보스 돌진 도달 거리 조정 및 회귀 검사 추가.
- 근거: [`8ce4d02`](https://github.com/kirakein-gif/PLAYVAULT/commit/8ce4d0257ab46b9f67f1aa0840868521f22a7e75), `games/abyssfall-eclipse/index.html`의 v60 표기. 실제 배포 여부 미확인.
- 현재 소스는 8구역/24층 캠페인이며, 이는 해당 커밋 하나에서 모두 도입되었다는 뜻이 아니다. 과거 v18–v34 요약은 기존 [README](README.md)에 보존한다. 최신 검증은 [STATUS](docs/STATUS.md)와 [WORK_LOG](docs/WORK_LOG.md) 참조.

## THE HOLLOW KEEP

### 최신 단일 버전 미확인 · 2026-10-08 · main 구현 기준

- [`d9a9859`](https://github.com/kirakein-gif/PLAYVAULT/commit/d9a9859063204cb5a770a5ad47fd2eb4f74a0e83): 고딕 키 아트를 스테이지와 적으로 확장.
- Git 이력 [`75a2317`](https://github.com/kirakein-gif/PLAYVAULT/commit/75a2317)에는 v8 sprite/backdrop pass가 명시되어 있다. 이후 변경 전체의 공식 버전은 확인되지 않았다.
- 현재 캐시 쿼리 CSS 16 / art 15 / core 13을 단일 게임 버전으로 해석하지 않는다. README의 v4–v7 이력을 보존하며 임의로 v16 또는 통합 버전을 부여하지 않는다. 실제 배포 여부 미확인.

## 세계 최고의 게임 · THE WORLD'S GREATEST GAME

### 원본 v0.1 / 화면 0.1.0 · 2026-10-19 · main

- [`ebf5ae4`](https://github.com/kirakein-gif/PLAYVAULT/commit/ebf5ae4): 기존 플레이 가능한 단일 HTML 테스트 원본 도입.
- [`41f7517`](https://github.com/kirakein-gif/PLAYVAULT/commit/41f7517a24822f73c9b0732996bb78661e47a284)까지 README 및 기획·로드맵·기존 CODEX_HANDOFF 문서 추가.
- 버튼/키 기반 반응과 승패 안내는 원본 규칙이다. 정식 요구나 아래 별도 프로토타입의 완료 상태와 혼동하지 않는다.

### 액션 프로토타입 v0.13 · 2026-10-19 · main 미병합

- 브랜치 [`codex/wgg-action-prototype`](https://github.com/kirakein-gif/PLAYVAULT/tree/codex/wgg-action-prototype), tip [`e7b28cf`](https://github.com/kirakein-gif/PLAYVAULT/commit/e7b28cfc1ce4e595cc7e8abfc6f55845543ca795).
- 해당 커밋: 수평 테이블, 타격 카메라 축소 제거.HTML은 `APPROVED A / 0.13`으로 표기.
- 브랜치에는 직접 조작·파울, 에너지 경기 및 연속 카운트 작업이 누적되어 있다. 세부 v0.3–v0.13 변경과 기존 검증 보고는 브랜치의 `docs/ACTION_PROTOTYPE.md`, `prototype/README.md`에 남아 있다. 원본과 별도 버전이며 이번 문서 작업에서 병합·실행 검증·배포하지 않았다.
