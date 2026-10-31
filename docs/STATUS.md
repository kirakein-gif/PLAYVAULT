# 현재 개발 현황 (STATUS)

> 규칙: [`AGENTS.md`](../AGENTS.md). 작업을 마친 AI는 해당 게임 항목을 갱신합니다.
> 확인되지 않은 사항은 **미확인**으로 표시합니다. 이 문서는 GitHub에 있는 내용만 반영하며, PC 로컬에서만 진행된 작업은 포함하지 않습니다.

## 저장소 공통

| 항목 | 내용 |
|---|---|
| 마지막 확인 일자 | 2026-10-31 (Claude Code) |
| 마지막 확인 `main` 커밋 | `41f7517` docs(worlds-greatest-game): add docs/CODEX_HANDOFF.md (2026-10-19) |
| 확인한 이력 범위 | `main` 전체 233커밋 (`3deefb5` Initialize PLAYVAULT, 2026-10-05 ~ `41f7517`, 2026-10-19). 작성자 표기: kirakein-gif 195, Codex 38 |
| 원격 브랜치 | `main`, `polish/eclipse-art-audio`(헤드 `8ce4d02`, `main`에 포함됨), `codex/wgg-action-prototype`(헤드 `e7b28cf`, **미병합**) |
| 열린 PR | 없음 (2026-10-31 확인. 과거 PR도 조회되지 않음) |
| 공용 영역 | `index.html`(런처), `assets/`(공용 캐릭터·적·유물·아트·오디오), `tests/`, `tools/` |
| 배포 | 배포 설정 파일(예: GitHub Actions, Pages 설정)은 저장소에서 확인되지 않음. 실제 배포 여부·주소 **미확인** |
| 비고(로컬 미반영 작업) | **미확인** — 사용자가 PC에만 있는 작업을 알고 있다면 여기에 적어 주세요. |

## 진행 중인 작업과 담당 AI (작업 잠금)

진행 여부의 1차 기준은 원격 브랜치와 열린 PR입니다(`AGENTS.md` §3).

| 대상 | 담당 AI | 브랜치 / PR | 시작일 | 범위 | 상태 |
|---|---|---|---|---|---|
| 세계 최고의 게임 | Codex | `codex/wgg-action-prototype` / PR 없음 | 2026-10-19 (커밋 기준) | `games/worlds-greatest-game/` 아래 `prototype/` 신규 경로 | **미병합 상태로 정지. 계속 진행 중인지 미확인** — 사용자 확인 필요 |
| 저장소 공통 문서 | Claude Code | `claude/playvault-ai-collaboration-system-3ia07z` | 2026-10-31 | 관리 문서만 (게임 코드 변경 없음) | PR 제출 후 사용자 검토 대기 |

---

## 1. ABYSSFALL: ECLIPSE

| 항목 | 내용 |
|---|---|
| 작업 경로 | `games/abyssfall-eclipse/` (+ 공용 `assets/art`, `assets/audio`, `assets/characters`, `assets/enemies`, `assets/relics`, `tests/`, `tools/`) |
| 현재 확인된 버전 | **v60** — `index.html` 조작 안내 문구 `· v60`와 CSS/JS 캐시 파라미터 `?v=60`이 일치 |
| 마지막 확인 Git 커밋 | `8ce4d02` Scale enemy and boss rush reach with dungeon depth (2026-10-15, Codex) — 이 커밋에서 v59 → v60 |
| 장르/구성 | Ethan / Noah 듀얼 주인공 룸 서바이버, Canvas 2D, 파일: `index.html`, `game.css`, `audio.js`, `atlas.js`, `art.js`, `core.js`, `render.js` |

**구현 완료 기능(소스·문서·커밋으로 확인)**
- 방 유형: 일반전투·보물·회복·엘리트·보스방 (README)
- 층 진행: README v19는 12층 캠페인. 이후 커밋 `0a0c718`에서 "24 floors"로 확장, 회귀 테스트는 깊은 층 진행 항목(`depth`, `deep arrivals`)을 검사
- 지역 보스·적 확장(v46), 6프레임 적 걷기(v47), Ethan 근접 돌진 / Noah 원거리 회피 구르기 분리(v49~v50), 역할별 유물 효과·성장(v51~v52), 보스 소환 연출(v54), 이중 강화 선택(v55), 미니맵 통로·문 잠금 및 용암 위험 위상 동기화(v56), 피격 시 적 공격 유지(v57), 미니맵 복원(v59), 깊이에 따른 돌진 사거리(v60)
- 오디오: WAV 앰비언스 루프 + 절차적 대체음, 음소거 저장(README v22·v30·v33·v34)
- 모바일 조이스틱/특수기 버튼, 데스크톱 1/2/3 강화 선택

**미해결 오류와 알려진 문제**
- 알려진 버그 목록은 저장소에서 **미확인**(이슈·버그 문서 없음)
- 문서 불일치: 루트 README의 ECLIPSE 설명은 v34까지만 있고 상단 "v30" 섹션은 12층 기준으로 기술됨. v35~v60 변경은 커밋 메시지와 테스트에만 있음
- README v30: 음악은 하드웨어 청취 확인이 필요하다고 기록됨 — 청취 검증 결과 **미확인**

**다음 작업 우선순위**: **미확인**(사용자 지시 없음). 문서 측면에서는 README/CHANGELOG의 v35~v60 설명 보강이 가능하나 사용자 승인 후 진행

**테스트 및 배포 상태**
- 2026-10-31 Claude Code가 `main`(`41f7517`)에서 실행: `node tests/polish-regression.cjs` 전 항목 PASS(movement ~ v60 engagement, v52 loading 포함), `node tests/audio-regression.cjs` PASS, `node tests/audio-wind-regression.cjs` PASS
- 실제 브라우저·모바일 기기 플레이 확인: **미확인**
- 배포 상태: **미확인**

---

## 2. THE HOLLOW KEEP

| 항목 | 내용 |
|---|---|
| 작업 경로 | `games/the-hollow-keep/` (`index.html`, `game.css`, `art.js`, `core.js`, `assets/`) |
| 현재 확인된 버전 | **미확인** — 게임 화면에 버전 표기 없음. 루트 README의 마지막 작업 번호는 v7(finisher rhythm), 커밋 `75a2317`이 "Release HOLLOW KEEP v8". 그 뒤 커밋들(모바일 가로 강제, 첫 플레이 구역, 타이틀 키아트)은 버전 번호를 붙이지 않음 |
| 캐시 파라미터 | `game.css?v=16`, `art.js?v=15`, `core.js?v=13`. v4~v8 시점에는 작업 번호와 같은 값이었으나(`0bae7a0`, `a080f49`, `7e63d67`, `4350083`, `75a2317`) 이후 파일별로 따로 증가해 게임 버전으로 볼 근거 없음 |
| 마지막 확인 Git 커밋 | `d9a9859` feat(hollow-keep): extend gothic key art across stage and foes (2026-10-08, kirakein-gif) |
| 장르/구성 | Ethan / Noah 듀얼 주인공 횡스크롤 미궁 액션 어드벤처, Chapter I 프로토타입 |

**구현 완료 기능(README·커밋으로 확인)**
- 고정 30방 성 구조, 엘리베이터, 지하 납골당, 숨겨진 벽, 휴식 석상, 방문 지도, 첫 보스(Gate Keeper), 종 이벤트, 지름길, Chapter I 종료
- 캐릭터별 이동 특성, 코요테 타임·점프 버퍼(v4), 적 예비동작·경직(v5), Noah 3단 베기 포즈(v6)와 마무리 회복(v7), 스프라이트·배경(v8)
- 모바일 가로 모드 강제(`c751cc6` 등), 타이틀 키 비주얼·HD 주인공(`9fec3ae`~`1911abd`), Bell Warden 복귀 리프트(`60a9f8d`)

**미해결 오류와 알려진 문제**: **미확인**(이슈·버그 문서 없음)

**진행 중인 작업**: 없음(원격 브랜치 기준)

**다음 작업 우선순위**: **미확인**

**테스트 및 배포 상태**
- 자동 테스트: 저장소에서 확인되지 않음
- 브라우저·모바일 수동 확인 결과: **미확인**
- 배포 상태: **미확인**

---

## 3. 세계 최고의 게임 (THE WORLD'S GREATEST GAME)

| 항목 | 내용 |
|---|---|
| 작업 경로 | `games/worlds-greatest-game/` (`index.html`, `README.md`, `docs/`) |
| 현재 확인된 버전 | `main`: **v0.1** 원본 테스트판(`index.html` `<title>` "플레이 테스트 v0.1") |
| 미병합 브랜치 버전 | `codex/wgg-action-prototype`: **액션 프로토타입 v0.13 / APPROVED A** (`prototype/README.md` 기준) |
| 마지막 확인 Git 커밋 | `main`: `41f7517` (2026-10-19) / 브랜치: `e7b28cf` Level the table horizontally and remove strike camera zoom (2026-10-19, Codex) |
| 런처 등록 | 루트 `index.html`의 게임 목록에 **없음** (등록 여부는 사용자 결정) |
| 기존 인계 문서 | `docs/CODEX_HANDOFF.md`, `docs/ROADMAP.md`, `docs/GAME_DESIGN.md`, `docs/VISUAL_STYLE.md`, `docs/COMBAT_AND_INPUT.md` — 보존 |

**구현 완료 기능**
- `main`: v0.1 HTML5 단일 파일(오프닝, 최주임/김과장 테스트). README에 따르면 아이디어 검증용이며 정식 조작 방향이 아님
- 미병합 브랜치(코드 확인, 병합 전): `prototype/` 신규 경로에 마우스 잡기·스윙·냄비 착용, 승패 미노출 RPS, 파울 판정, 에너지 경기, 3-2-1 반복 라운드, 정지 포즈 기반 아트(APPROVED A), Node·Chrome 테스트(`prototype/tests/*.cjs`)
- ROADMAP 1차 항목의 체크 상태는 `main` 기준 모두 미완료로 표시되어 있음

**미해결 오류와 알려진 문제(브랜치 `prototype/README.md`에 기록된 것)**
- 정지 포즈 사이 인물 위치/크기 불일치, 준비↔RPS 머리 위치 튐, 상대 내려치기 숙임 과장 → 후속 아트 앵커/구도 정합 과제
- 효과음은 코드 합성음, 실제 청취·외부 사용자 테스트·Windows/Steam 배포 미검증

**진행 중인 작업과 담당 AI**: Codex — `codex/wgg-action-prototype` (위 작업 잠금 표 참고). 다른 AI는 사용자 확인 전까지 이 게임의 코드를 수정하지 않습니다.

**다음 작업 우선순위(확인된 범위)**
1. 사용자: 브랜치 `codex/wgg-action-prototype`의 v0.13을 검토하고 PR 생성·병합 여부 결정
2. 브랜치 문서상 후속 과제: 정지 포즈 아트 앵커/구도 정합
3. 이후는 `docs/ROADMAP.md` 1차 → 2차 순서

**테스트 및 배포 상태**
- `main` v0.1: 자동 테스트 없음
- 브랜치 v0.13: Codex 기록상 Node 32 + Chrome 23 = 55개 검사 통과(2026-10-19). Claude Code는 이 브랜치 테스트를 **재실행하지 않음**
- 배포 상태: **미확인**

---

## 갱신 방법

- 게임 항목을 갱신할 때 **마지막 확인 일자·커밋**을 함께 바꿉니다.
- 진행 중 작업 표는 작업 시작 시 행을 추가하고, PR 병합·종료 시 상태를 "완료(PR #n)" 등으로 바꿉니다.
- 새 게임이 추가되면 같은 양식의 섹션을 추가합니다.
