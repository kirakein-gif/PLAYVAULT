# PLAYVAULT · 누적 개발 이력

새 작업이 끝날 때마다 **아래에 항목을 추가**한다. 기존 항목을 삭제·덮어쓰지 않는다. 잘못된 기록을 발견하면 정정 항목을 덧붙이고 원 기록을 참조한다. 최신 상태 요약은 [STATUS.md](STATUS.md), 게임별 제품 변경 요약은 [CHANGELOG.md](../CHANGELOG.md)로 관리한다.

소스·Git 기록으로 확인하지 않은 과거 개발은 복원해 쓰지 않는다. 기존 README 및 게임별 인계 문서는 원래 위치에 보존한다. 테스트는 실행 날짜·명령·대상 브랜치/SHA와 함께 통과/실패/미실행을 구분한다. 날짜는 시간대를 명시하고 Git 이력 날짜와 이번 작업 날짜를 혼동하지 않는다.

## 누적 기록 양식

```markdown
### YYYY-MM-DD (시간대) · 작업 제목

- 담당 AI / 인계받은 담당:
- 작업 대상 게임·경로(공통 작업은 공통으로 표시):
- 기준 브랜치·Git SHA / 작업 브랜치:
- 수정 전 → 후 버전(게임·캐시·문서 표기를 구분; 변경 없으면 그대로):
- 수정 목적 및 요청 배경:
- 변경한 파일과 주요 내용:
- 테스트 방법 및 결과(명령/환경/대상; 통과·실패·미실행):
- Git 커밋 또는 PR 참조(확인된 것만; 미제출이면 그 상태와 이유):
- 미해결 문제·미확인 사항:
- 다음 AI에게 전달할 사항·다음 우선순위:
- 검토 담당 / 검토에서 발견된 문제 수(검토 전이면 "검토 대기"):
- 사용자 재요청 횟수(같은 요청을 다시 받은 횟수):
- 종료 상태 / 다음 담당(검토 대기·차단·인계 완료 등을 구분):
```

## 기록

### 2026-10-31 (Asia/Seoul) · AI 공동 개발 및 버전 관리 문서 구축

- 담당 AI: Codex. 다음 담당 AI **미확인**.
- 대상: 공통 관리 문서만. 게임 코드·이미지·음원·기능·배포 설정은 변경하지 않는다.
- 기준: `origin/main` **`41f7517a24822f73c9b0732996bb78661e47a284`** / 작업 브랜치 `docs/ai-collaboration-handoff`.
- 수정 전 → 후: ECLIPSE v60 → v60; HOLLOW KEEP 단일 최신 버전 미확인 → 미확인(캐시 16/15/13 보존); 세계 최고의 게임 원본 v0.1/0.1.0 → 동일. 미병합 prototype v0.13 → 동일. 게임 버전 상승 없음.
- 목적: 도구와 PC가 바뀌어도 최신 GitHub 소스·검증 기록·담당 선언으로 순차 개발을 이어가도록 공통 규칙과 인계 양식 구축.
- 파일: `AGENTS.md`(공통 규칙·담당 공유·표준 순서), `CLAUDE.md`(공통 규칙 참조), `docs/STATUS.md`(게임/브랜치별 근거·현황), `docs/WORK_LOG.md`(누적 양식·이번 기록), `CHANGELOG.md`(독립 버전 요약). README에는 안내 링크만 추가. 기존 `CODEX_HANDOFF.md` 및 게임별 문서는 보존.
- 조사: main 커밋 이력 233개(비 shallow), 게임별 이력 및 원격 3개 브랜치 조회. main 밖 `codex/wgg-action-prototype`의 추가 20커밋과 v0.13 문서·HTML·엔진·진행 소스를 읽기 전용 비교. `polish/eclipse-art-audio`는 main의 조상. Git 태그 조회 결과 없음. 과거 전체 기능 검증 또는 PC 로컬 작업 확인을 수행한 것은 아님.
- 검증: 문서 6개 내부 링크, README 원문 보존, 게임별 최종 커밋 SHA, HOLLOW KEEP 방 정의 30개, 문서 전용 변경 범위 및 `git diff --check` 통과. `node tests/polish-regression.cjs`, `node tests/audio-regression.cjs`, `node tests/audio-wind-regression.cjs`를 기준 main과 게임 소스가 동일한 작업 브랜치에서 재실행하여 3종 모두 통과. 오디오 404 경고는 테스트가 의도적으로 시뮬레이션한 실패 경로다. 최종 제출 결과는 아래 후속 기록에 추가한다. 이번에 브라우저·실기기 플레이나 미병합 prototype 테스트는 재실행하지 않는다.
- Git/PR: 이 항목을 추가하는 커밋은 `docs/ai-collaboration-handoff`의 초기 문서 커밋에서 확인할 수 있다. PR은 아직 미제출이며 API가 네트워크 정책에서 차단됨. 확정된 원격 제출 결과는 후속 기록에 추가한다.
- 미해결·미확인: 다른 AI 담당/PC 미푸시 작업, 열린 PR, 배포 상태, HOLLOW KEEP 단일 최신 게임 버전. GitHub API 허용 도메인 `api.github.com` 추가가 필요하나 환경 초안 편집이 게시 후 제한되어 자동 저장 실패.
- 인계: 게임 수정 전 STATUS의 브랜치 구분과 기존 게임 인계 문서를 읽고 담당 확인. 특히 세계 최고의 게임은 main만 보고 직접 조작 기능이 전혀 개발되지 않았다고 단정하지 않는다. prototype 브랜치와 PC 로컬 변경을 대조하고 사용자 요청으로 다음 작업을 결정한다.
- 종료 상태: 문서 검증 완료. 커밋/원격 제출 진행, PR은 API 접근 차단. 병합·배포는 하지 않는다.

### 2026-10-31 (Asia/Seoul) · 문서 원격 제출 결과 및 PR 차단 인계

- 담당 AI / 대상: Codex / 공통 관리 문서.
- 기준·브랜치: main `41f7517a24822f73c9b0732996bb78661e47a284` / `docs/ai-collaboration-handoff`.
- 버전: 모든 게임 표기 변경 없음.
- 목적·변경: 앞 항목의 제출 진행 상태를 확정된 원격 결과로 보충. STATUS의 공통 문서 작업 상태 갱신.
- Git 참조: 초기 문서 커밋 [`5f09367b415113727a06204a42a4fef5f6f58b02`](https://github.com/kirakein-gif/PLAYVAULT/commit/5f09367b415113727a06204a42a4fef5f6f58b02)를 원격 문서 브랜치에 푸시하고 `git ls-remote`로 확인했다. 이 후속 기록도 같은 브랜치에 제출한다.
- 검증: 앞 항목의 문서 및 Node 검사 통과. 원격 main은 기준 SHA 그대로임을 확인했다. 후속 변경은 STATUS/WORK_LOG 문서만이며 링크·diff 검사를 다시 수행한다.
- PR: `gh pr create --repo kirakein-gif/PLAYVAULT --base main --head docs/ai-collaboration-handoff` 실행이 `https://api.github.com/graphql`의 Forbidden으로 실패. **PR은 생성되지 않았으며 번호/주소가 없다.** 환경 설정의 API 허용 도메인 초안 저장도 게시 후 편집 제한으로 실패하여 현재 네트워크는 바뀌지 않았다.
- 다음 AI: `api.github.com` 허용이 적용되면 기존 인증으로 PR 제출을 재시도한다. 토큰을 추가 요구하기 전에 실제 API 응답을 확인한다. 또는 사용자가 [GitHub PR 작성 화면](https://github.com/kirakein-gif/PLAYVAULT/compare/main...docs/ai-collaboration-handoff?expand=1)에서 제출할 수 있다. 이 링크는 생성된 PR이 아니다. 먼저 원격 PR 목록을 확인하여 중복 제출하지 않는다.
- 미해결: PR 제출, 사용자 검토·승인. 게임 담당/PC 로컬 작업/배포 상태는 계속 미확인. 공통 문서 편집은 마쳤으나 제출 인계는 남아 있다.
- 종료 상태: 원격 문서 브랜치 제출, PR 차단 인계. 기본 브랜치 병합·게임 배포 없음. 다음 담당 미확인.

## 2026-10-31 (Asia/Seoul) · 과거 개발 이력 복원 보강

- 담당/대상: Codex / 공통 관리 문서 5개. 사용자 요청에 따라 최초부터의 개발 이력 복원을 우선했다. 게임 기능 작업 담당 인수나 기존 프로토타입 병합이 아니다.
- 기준: main `41f7517a24822f73c9b0732996bb78661e47a284`, prototype `e7b28cfc1ce4e595cc7e8abfc6f55845543ca795`; 문서 브랜치는 `docs/ai-collaboration-handoff`의 `f43b8d4`에서 이어간다.
- 조사 범위: 원격 모든 head를 fetch, tags 및 PR head 광고 조회, non-shallow main 233개와 추가 prototype 20개, 기존 문서 브랜치 2개 = 조사 시점 고유 255커밋. **255는 이번 보강 이전의 고정 조사 수치**이며 향후 커밋이 추가되어도 자동으로 바뀌는 숫자가 아니다. 태그·PR head 조회에는 광고된 항목이 없었으나, 이 사실만으로 열린 PR이 없다고 단정하지 않는다.
- 방법: 전체 커밋 제목·부모·날짜·변경 경로를 수집하고 주요 이정표의 텍스트 diff, 버전 표기가 바뀐 HTML 전체, 기존 README/설계/인계 문서와 현 소스를 대조했다. 색인만 있는 세부 커밋까지 모두 개별 실행/시각 검증했다는 뜻은 아니다.
- 파일: WORK_LOG에 아래 복원 연대기·전체 색인 추가(앞선 2개 작업 기록은 보존), CHANGELOG를 게임별 전체 주요 흐름·직접 캐시 근거로 확장, STATUS에 범위·남은 문제·정합성 한계 보강, AGENTS/CLAUDE에 5개 문서의 지속 관리 규칙 명시. README·게임 문서는 이번 보강에서 추가 수정하지 않는다.
- 수정 전→후: ECLIPSE v60, HOLLOW KEEP 최신 단일 버전 확인 불가, WGG 원본 v0.1/0.1.0·prototype v0.13 모두 그대로. 아래의 과거 버전 전환은 당시 기록의 복원이며 이번 게임 변경이 아니다.
- 정확도: Git author/committer의 표기만으로 실제 담당 도구나 사용자의 요청 전문을 알 수 없으므로 과거 **담당 AI·상세 요청 배경은 확인 불가**. Git 등록 전·삭제/접근 불가 브랜치·PC 로컬 작업·실제 배포/승인도 확인 불가. 각 시점에 추가된 코드가 이후 유지·교체·취소되었는지는 현 소스와 함께 판단한다.
- 과거 테스트: 테스트 파일이나 PASS 로그 문구는 검증 수단의 존재를 보여준다. 과거 모든 실행의 성공을 증명하지 않는다. README/인계 문서의 실행 보고는 ‘당시 문서 기록’으로만 인용한다. 현재 Node 3종 통과는 위 이전 작업 항목의 실행 결과이며 이번 보강에서 반복 실행하지 않는다.
- 이번 검증: 5개 문서의 로컬 링크와 연결된 모든 커밋 객체, 제품 이력 253개의 누락/중복 없음 및 KST 날짜, 역사 HTML의 캐시 변경 57회 연결, 기존 WORK_LOG 전체 원문 보존, 변경 경로 5개 한정·미추적 파일 없음, main 대비 games/assets/tests/tools/런처 동일 및 `git diff --check`를 확인하여 모두 통과했다. 확정된 제출 결과는 후속 항목으로 기록한다. 새 게임 플레이 테스트나 배포는 수행하지 않는다.
- PR/차단: API 접근을 사용자 도메인 언급 후 재확인했으나 Forbidden이 지속됐다. 브랜치 제출과 PR 생성은 구분한다. 확정된 PR이 생기기 전에는 번호/주소를 만들지 않는다.

### 복원 기록 읽는 방법

아래 표는 **2026-10-31에 사후 복원한 연대기**이며 당시 작성된 WORK_LOG가 아니다. 날짜는 author timestamp를 KST로 환산한다. 요청 배경은 제목/diff/기존 문서에서 확인되는 범위만 요약한다. 당시 담당 AI, 개별 실행 결과, 승인 및 배포는 별도 기록이 없는 한 **확인 불가**다. 단계가 바뀌면서 현재는 사라진 규칙(4층 종료, 자동 보스 이동, 3점 경기, 연속 IK 표현 등)도 당시 상태로 보존한다.

공통 구조는 HTML5/Canvas/Web Audio이며, ECLIPSE는 `core/render/atlas/art/audio`, HOLLOW KEEP는 `core/art`, WGG main은 단일 HTML, prototype는 `config/engine/app/render-a/round-flow/audio`로 달라졌다. Godot 이전은 브랜치의 비교 검토 대상이었으며 실행 가능한 Godot 프로젝트가 도입되었다는 근거는 없다.

### 복원 연대기 · 플랫폼·병합

| 날짜(KST) | 당시 버전·변화 범위 | 목적·변경과 후속 인계 근거 | 커밋 |
| --- | --- | --- | --- |
| 2026-10-05 | 초기 등록 | 저장소 초기화, 정적 홈과 공통 스타일 생성 | [3deefb5](https://github.com/kirakein-gif/PLAYVAULT/commit/3deefb5c6faa8feb2778e3aaf06acc2ccbfe91a6) · [e83c4a7](https://github.com/kirakein-gif/PLAYVAULT/commit/e83c4a7c80480ccf54f4be41e5b2ed4e2508726a) · [a749330](https://github.com/kirakein-gif/PLAYVAULT/commit/a7493307bf8da5e57dfa9c9160161b9ae177a756) |
| 2026-10-08–2026-10-14 | 병합(게임 버전 아님) | polish/eclipse-art-audio에 당시 main의 HOLLOW KEEP 변경을 두 차례 통합. 독립 기능 구현 커밋으로 중복 계산하지 않음 | [985d589](https://github.com/kirakein-gif/PLAYVAULT/commit/985d5898ec450b9b7135f161e0e93f7b74c842fe) · [f1b355b](https://github.com/kirakein-gif/PLAYVAULT/commit/f1b355b748fee885ab113c42fa1134aceab34e27) |

### 복원 연대기 · ABYSSFALL: ECLIPSE

| 날짜(KST) | 당시 버전·변화 범위 | 목적·변경과 후속 인계 근거 | 커밋 |
| --- | --- | --- | --- |
| 2026-10-05 | 초기(게임 버전 확인 불가) | 게임 HTML·반응형 CSS·core·renderer 생성 후 HTML이 외부 스크립트를 로드하도록 연결. 두 주인공·자동 공격·던전·키보드/터치 입력의 기준선 | [2db4da8](https://github.com/kirakein-gif/PLAYVAULT/commit/2db4da8972298ce4c907ff6b6c79909e10febfa5) · [b856b74](https://github.com/kirakein-gif/PLAYVAULT/commit/b856b74b673f6780aa3d08f81cd0bc061b75d3f9) · [37919e8](https://github.com/kirakein-gif/PLAYVAULT/commit/37919e85b9c0c45fd00afc458a507bed89cf4f76) · [ef8827f](https://github.com/kirakein-gif/PLAYVAULT/commit/ef8827f56694ce22bcf789cccc21ed6461f06358) · [35c55de](https://github.com/kirakein-gif/PLAYVAULT/commit/35c55decc3f35032e546288b29efe123b8c17206) |
| 2026-10-05–2026-10-06 | 초기→캐시 4 | 영웅 이미지와 base64 atlas 조각 도입·보완, loader 추가, 피격/사망 상태와 공격 타이밍·전투 표현 연동 | [b1574e6](https://github.com/kirakein-gif/PLAYVAULT/commit/b1574e682653b3b8cacf00800daffae963b51b52) · [9a8b467](https://github.com/kirakein-gif/PLAYVAULT/commit/9a8b4670497645a7b4ed227d7392eff1e03179cd) · [2d6f538](https://github.com/kirakein-gif/PLAYVAULT/commit/2d6f53852b2ad788a74b56d532fbdd0a66f9962e) · [c63bc4a](https://github.com/kirakein-gif/PLAYVAULT/commit/c63bc4ab0425538b7a19f41aec360ec714f80744) · [c944748](https://github.com/kirakein-gif/PLAYVAULT/commit/c9447489f9e4e45821a3277865862c83866e7eab) · [c10ae62](https://github.com/kirakein-gif/PLAYVAULT/commit/c10ae62229323ed7eaf172df151bafeee0cd29de) · [9c4ee9f](https://github.com/kirakein-gif/PLAYVAULT/commit/9c4ee9fc852515420b137e7a5a0e409229ea4beb) · [d4bce24](https://github.com/kirakein-gif/PLAYVAULT/commit/d4bce246b80dc8ee01b0cd02f58ce4ce0eee9451) |
| 2026-10-06 | 캐시 5–8 | 주인공 atlas를 assets/characters 공용 경로로 승격. 공용 적 가족·상태 애니메이션, 4종 층 테마 및 전투/보물/회복/엘리트/보스 방 도입 | [57f1842](https://github.com/kirakein-gif/PLAYVAULT/commit/57f1842da11c1a468e4d286c113321051e57ee85) · [98bfed2](https://github.com/kirakein-gif/PLAYVAULT/commit/98bfed2cd002d56a415b76edf39e3fe0318a3e77) · [00f5248](https://github.com/kirakein-gif/PLAYVAULT/commit/00f5248378dc9711e59dd5166f9ce228dec8bd20) · [7511aed](https://github.com/kirakein-gif/PLAYVAULT/commit/7511aed38e209dad9396a8a23988cac181d16861) · [5e8106e](https://github.com/kirakein-gif/PLAYVAULT/commit/5e8106e63f224f01ae55a6f3e3df89e094a72727) · [23b454d](https://github.com/kirakein-gif/PLAYVAULT/commit/23b454dc49b9504dcd410c50c56a66375c938a21) · [1d8219e](https://github.com/kirakein-gif/PLAYVAULT/commit/1d8219e92fcccc8c95056820bc42da03a52aa9e5) · [5534367](https://github.com/kirakein-gif/PLAYVAULT/commit/55343673e468b000c7318bdfdf8b752f056beaec) · [649f96f](https://github.com/kirakein-gif/PLAYVAULT/commit/649f96f340f30c6b60cf05d331e9f27189afd8bd) |
| 2026-10-06 | 캐시 9–13 | 획득 유물 추적·인벤토리·배너·픽셀 아트 카드 추가. 플레이 영역 가림, XP바 및 모바일 미니맵 겹침, 일반 강화 카드와 유물 카드 혼용을 순차 조정 | [d13164d](https://github.com/kirakein-gif/PLAYVAULT/commit/d13164de58897ce2a00cf68e740418e13ab6532f) · [f83d3b6](https://github.com/kirakein-gif/PLAYVAULT/commit/f83d3b63c6c319e9d9494f502fe3929c07928b99) · [f4c0d12](https://github.com/kirakein-gif/PLAYVAULT/commit/f4c0d12276eb22a245b70e50ad45aed8f8156611) · [95b0874](https://github.com/kirakein-gif/PLAYVAULT/commit/95b0874b6344c7c9c3a0ebeadaf1abf98b4e4bcf) · [c8f0b7b](https://github.com/kirakein-gif/PLAYVAULT/commit/c8f0b7bf245af11408b70d79e39e0e726b2330d2) · [90eede1](https://github.com/kirakein-gif/PLAYVAULT/commit/90eede126d9d3b5a1f2152af692849201c9b9b7e) · [cd0c904](https://github.com/kirakein-gif/PLAYVAULT/commit/cd0c904c8113aa0282bcba86abcf1091f6273597) · [8c6dd1e](https://github.com/kirakein-gif/PLAYVAULT/commit/8c6dd1efeece6e8b0d69cbb94a5c1dce70ce51ab) · [a5e0f4a](https://github.com/kirakein-gif/PLAYVAULT/commit/a5e0f4a3dc5d226d234e58501ca986a754f9d17f) |
| 2026-10-06 | 캐시 14–16 | 유물을 단순 수치 보너스에서 관통·공명 등 전투 효과로 확장, 알림 과다 감소. Watcher 3페이즈 예고 패턴 및 고급 유물 7종 추가 | [2a49ae3](https://github.com/kirakein-gif/PLAYVAULT/commit/2a49ae3bdb3d0729d2c5cb6ba93670cf125ee430) · [4012c8b](https://github.com/kirakein-gif/PLAYVAULT/commit/4012c8b918d1f90b2b0ba43e1f61b329ca6398b4) · [e4722df](https://github.com/kirakein-gif/PLAYVAULT/commit/e4722df4e7f0d54edcef513c4d15e6aa8992fbd2) · [d20f5df](https://github.com/kirakein-gif/PLAYVAULT/commit/d20f5df81aa6f38f2f7d9f9e131df7d5c92a242c) · [9afb3f6](https://github.com/kirakein-gif/PLAYVAULT/commit/9afb3f6d40e039e213d8af404a3589e0e81088dd) · [7445187](https://github.com/kirakein-gif/PLAYVAULT/commit/7445187bb2baf97cc36bcd2972fc2ea0a578beed) · [1755b69](https://github.com/kirakein-gif/PLAYVAULT/commit/1755b69da4a73c52fbf67c96f3b81cee4f832517) |
| 2026-10-06 | 캐시 17→v18(README) | 보스 입장 유예·연기·승리 정지, 4층 CLEAR/기록/무한 진행, 적군별 공격과 층별 위험·배경 원근 구성 | [52ed50f](https://github.com/kirakein-gif/PLAYVAULT/commit/52ed50f910baf76db989964bc25e5bddf2584419) · [c15997f](https://github.com/kirakein-gif/PLAYVAULT/commit/c15997fdf7b23dedf4a3e3bd04d7c3af8026bdd7) · [a8f1f87](https://github.com/kirakein-gif/PLAYVAULT/commit/a8f1f875773a39f0c23ca67dfc9a30fa58066a5e) · [91bfaa2](https://github.com/kirakein-gif/PLAYVAULT/commit/91bfaa29b94d06609bcf9d621d6238f04fc071ae) · [528ae4a](https://github.com/kirakein-gif/PLAYVAULT/commit/528ae4a43b122de92bbfac2e19626ec5ec8d798e) · [6479002](https://github.com/kirakein-gif/PLAYVAULT/commit/6479002fd14d83b74933cf7018129a86a59da8f1) · [33f0e07](https://github.com/kirakein-gif/PLAYVAULT/commit/33f0e070b23e30753cd83548bc5e3e1c66b2461d) · [3254d29](https://github.com/kirakein-gif/PLAYVAULT/commit/3254d290694b66bb2ed729aaf05cf3173c156014) · [a89c6e9](https://github.com/kirakein-gif/PLAYVAULT/commit/a89c6e92f94b2511706c77fc48b60aeed0ea357a) |
| 2026-10-06 | v18→v19 | 4층 종료에서 12층 캠페인으로 확장. 3층 간격 보스, 깊이에 따라 늘어나는 분기 던전·비보스 출구·부분 회복. 4층/12층 기록 키 분리 | [3aae5ce](https://github.com/kirakein-gif/PLAYVAULT/commit/3aae5ced1bf54bed192866423c251723e57a0d86) · [9610b80](https://github.com/kirakein-gif/PLAYVAULT/commit/9610b80db14ac1fb0bcf393bbee7c55af1a815d5) · [5fe8b44](https://github.com/kirakein-gif/PLAYVAULT/commit/5fe8b44bd7594b35586a054da9377abba310ee74) · [9761f44](https://github.com/kirakein-gif/PLAYVAULT/commit/9761f44fb3220e34494ef1f33e0d46762d5a608c) · [f27486d](https://github.com/kirakein-gif/PLAYVAULT/commit/f27486dc3671dbc3f0e2167afe1029a679986c02) |
| 2026-10-06 | v19→v20 | HP/피해의 이차 성장, 엘리트/보스 내구도·단타 제한, 보스 사후 자동 이동 대신 출구 사용 | [4670fbf](https://github.com/kirakein-gif/PLAYVAULT/commit/4670fbf5995c0f2476e8654687275ed7e53adcb5) · [38cf712](https://github.com/kirakein-gif/PLAYVAULT/commit/38cf712305409a022f20c875874ebf5c58a548b1) · [0af2384](https://github.com/kirakein-gif/PLAYVAULT/commit/0af23848b6982451f8a8e3bd6abb9f9738b62f20) · [9a16041](https://github.com/kirakein-gif/PLAYVAULT/commit/9a16041606831b37439f7353ebb378285e184a15) |
| 2026-10-06 | 캐시 21–23 / README v22 | 출구 전환 멈춤 수정: paused/transitioning 상태 정리. Web Audio 매니저·이벤트 효과음·음소거 추가, 보스 사후 상태 강화·오디오 조정·프레임 오류 후 루프 복구 | [583c768](https://github.com/kirakein-gif/PLAYVAULT/commit/583c7682c0296b3063fc842c937b680b6411a133) · [22c434c](https://github.com/kirakein-gif/PLAYVAULT/commit/22c434cc36f7ad33c7e48a3a800d86b55aeb430f) · [65045c1](https://github.com/kirakein-gif/PLAYVAULT/commit/65045c1a5d09fc83bcc5f64a1b3fab9fefd05d52) · [3e0f53d](https://github.com/kirakein-gif/PLAYVAULT/commit/3e0f53d6a71ab413f4e61aedfbfb02a6c1b7ebb4) · [12533ca](https://github.com/kirakein-gif/PLAYVAULT/commit/12533ca7896abfa833cca09669a526f2eae365b3) · [ff24246](https://github.com/kirakein-gif/PLAYVAULT/commit/ff24246c38fd90cac02ee09aaf3c7935d0d145fb) · [8aa8e3c](https://github.com/kirakein-gif/PLAYVAULT/commit/8aa8e3c4c5a24d46aa7447235696a55091a3f690) · [6c64466](https://github.com/kirakein-gif/PLAYVAULT/commit/6c64466335474b0f8b8f34f1f6e9126413697a73) · [937a9de](https://github.com/kirakein-gif/PLAYVAULT/commit/937a9ded7fb2c732ca2691bd3f7826739d03d3cb) |
| 2026-10-06 | v24–v26(README) | 보스 문 봉인·숨은 제단과 물리적 계단, 발견한 잠긴 문 지도 기억. 드문 벽 흔적·일식 표식. 방별 가변 안개·바람·균열과 구역 진입 분위기 문구 | [14688b4](https://github.com/kirakein-gif/PLAYVAULT/commit/14688b4c5719f5f3b481fcc5b99e6f4f1977e9c3) · [20443bb](https://github.com/kirakein-gif/PLAYVAULT/commit/20443bbd2c22a5296eef3fb2e3becc6a37b48f9a) · [0df5440](https://github.com/kirakein-gif/PLAYVAULT/commit/0df5440ffd41807be590545fd7cf629ecb3265fd) · [d6f231c](https://github.com/kirakein-gif/PLAYVAULT/commit/d6f231ca17d829273a26a8354bfa03654bd9b37b) · [41b8a94](https://github.com/kirakein-gif/PLAYVAULT/commit/41b8a94a2dae41567d35ca6e9f63cf35531eb5cd) · [b4292ec](https://github.com/kirakein-gif/PLAYVAULT/commit/b4292ecfd36d7a5dc4f9b386a56e2ba6b3ca572c) · [43a4be1](https://github.com/kirakein-gif/PLAYVAULT/commit/43a4be1e3451bd23ead633f87360008024309c41) · [0f187b9](https://github.com/kirakein-gif/PLAYVAULT/commit/0f187b9a03a02d151d98ec253b36b2fa96a150ad) |
| 2026-10-06–2026-10-07 | v27–캐시 29 | 특수기 남은 시간·방사형 충전·READY 표현을 도입한 뒤 숫자 제거와 얇은 주인공별 색상 링으로 정리, 데스크톱 상태와 색상 공유 | [48ae3a6](https://github.com/kirakein-gif/PLAYVAULT/commit/48ae3a6b2e781230bc38d6818117d5a26797aed1) · [a87d00c](https://github.com/kirakein-gif/PLAYVAULT/commit/a87d00c43a75d569fd63e43520e8a18adac54390) · [349ad6e](https://github.com/kirakein-gif/PLAYVAULT/commit/349ad6ed5416e33dc3801cd5cba32d8741bb4086) · [7b06a67](https://github.com/kirakein-gif/PLAYVAULT/commit/7b06a67e8319dd24389fcc5e2fa9eece28602240) · [38532ba](https://github.com/kirakein-gif/PLAYVAULT/commit/38532ba5f144e63660e63a8950b67c6af4127e93) · [81b6c6a](https://github.com/kirakein-gif/PLAYVAULT/commit/81b6c6ac9aca7d44cb34a17b624413e2ac180a54) · [1580372](https://github.com/kirakein-gif/PLAYVAULT/commit/15803723a3106bf995173c78675c5bc74bfcb2ed) · [dca67ed](https://github.com/kirakein-gif/PLAYVAULT/commit/dca67edae9bf5505773b1e0490776d52212e5357) |
| 2026-10-07 | v30–v32(README) | 발 피벗·스프라이트 크기·DPR 안정화, 별도 art.js와 고해상도 방/행동 아트·WAV 앰비언스 및 회귀 검사. 성인 비례·작은 표시 크기와 주인공별 실루엣으로 재설계 | [8c18221](https://github.com/kirakein-gif/PLAYVAULT/commit/8c1822101786aacda8ebd1aa4cfec56d2ef326af) · [4f1913c](https://github.com/kirakein-gif/PLAYVAULT/commit/4f1913c0e92004cd8a5e63517525034583ca5308) · [1adeeeb](https://github.com/kirakein-gif/PLAYVAULT/commit/1adeeeb5c3458343cbde420cb8ede7eac714f37a) · [f53d5a1](https://github.com/kirakein-gif/PLAYVAULT/commit/f53d5a1cda20d0fa8e47fad12775dfd4292dbaba) · [829245b](https://github.com/kirakein-gif/PLAYVAULT/commit/829245bf22f860617df9faea823d966571d453ba) · [e845f91](https://github.com/kirakein-gif/PLAYVAULT/commit/e845f91123159fdad6dd13598cc8738ea7eac075) |
| 2026-10-07 | v33–v34(README) | 이동 애니메이션 안정화, 강화 숫자키, 문/상자/샘/계단 props·차분한 WAV 제작 도구. 측면 문을 벽 안으로 배치하고 지속 드론 제거·음원 실패 시 무음·영혼 XP 흡수·샘 사용 전후 형상 고정 | [e99f0e5](https://github.com/kirakein-gif/PLAYVAULT/commit/e99f0e572a5e56607530c6833a8f75da17a3876f) · [df04a58](https://github.com/kirakein-gif/PLAYVAULT/commit/df04a58f307df27233952a57f4eeca923108ab0b) |
| 2026-10-07 | 캐시 35–38 / 커밋 v38 | 방 안 통로와 유물 아트 통합, 측면 문 벽체와 손 높이 발사체 수정, 지면 링 제거. 고정 바닥·남쪽 통로·봉인석·Ethan/Noah 표기 및 문 렌더 회귀 정비 | [5f162c9](https://github.com/kirakein-gif/PLAYVAULT/commit/5f162c9c1392694009a0c4037ca43bbbb8bade37) · [a7ed4b5](https://github.com/kirakein-gif/PLAYVAULT/commit/a7ed4b59e2342c36f7a0acca8f86605f9644b51d) · [6271eea](https://github.com/kirakein-gif/PLAYVAULT/commit/6271eeaa43ad503cde5efe3e2dfc8a30147fd334) · [d6308c7](https://github.com/kirakein-gif/PLAYVAULT/commit/d6308c77e779d798c9dd79ec9de8400435e3005f) |
| 2026-10-08 | v39(캐시/후속 커밋 참조) | 12→24층, 4→8구역. 얼음·용광로·저수로·균열 자산/위험과 심층 적 압력·봉인·무한 진행 기준 확장 | [0a0c718](https://github.com/kirakein-gif/PLAYVAULT/commit/0a0c7184d465a743facf75ec44d5dae90060d427) |
| 2026-10-08 | v40–v43(커밋/캐시) | 보상·계단 전환 경합과 보상 큐 수정, 지속 얼음/안개 및 로컬 테스트 층 이동. 용암/독/빛을 바닥에 통합, 입장 표식/엘리트 십자 제거, 최종 초상 직접 로딩으로 구 아트 깜빡임 방지 | [1d45c30](https://github.com/kirakein-gif/PLAYVAULT/commit/1d45c30d0934ade266d0bc803ec4a85e9f1683de) · [a4aff2e](https://github.com/kirakein-gif/PLAYVAULT/commit/a4aff2e5ab9d9d409baaa058300e452da0d020d5) · [947ead0](https://github.com/kirakein-gif/PLAYVAULT/commit/947ead0b2fd9c87df25f95603ee3749cef8556bd) · [79f22c3](https://github.com/kirakein-gif/PLAYVAULT/commit/79f22c32cab2bbc7e1eaaeeaf6184ece3a1adc6f) |
| 2026-10-08 | v44–v46(커밋/캐시) | 구역 변경 때만 분위기 문구, 성광·바람과 연속 돌풍음, 균열을 석재 금으로 표현·쓴 샘 배수. 구역별 보스 8종과 깊은 층 적 구성/장갑/패턴 확장 | [7abb36a](https://github.com/kirakein-gif/PLAYVAULT/commit/7abb36afa0bb22f66c587c4060e1f4768ff591a5) · [ccd129f](https://github.com/kirakein-gif/PLAYVAULT/commit/ccd129f7f574c9fdb1f17d515ba51314280d8058) · [381cec9](https://github.com/kirakein-gif/PLAYVAULT/commit/381cec901199c83caa5adc1a6b5f0ce78dd3128f) |
| 2026-10-08 | v47–v48(커밋/캐시) | 적의 거리 기반 6프레임 보행, 보행 프레임 이웃 조각 분리, 보스 타격 표현 및 후속 스프라이트 분리/강철 궤적 조정 | [0a40541](https://github.com/kirakein-gif/PLAYVAULT/commit/0a40541b7e8b579e807d5c54130381b28dad1af6) · [2c295b4](https://github.com/kirakein-gif/PLAYVAULT/commit/2c295b499700f2a4225654d4560d0fee7dd6072c) · [86fd346](https://github.com/kirakein-gif/PLAYVAULT/commit/86fd34649fd31a58953b364cc97e361dcd691fcd) |
| 2026-10-14 | v49–v50(커밋/캐시) | Ethan 근접·돌진과 Noah 원거리·회피 역할 분리. Ethan 검 동작 전용 atlas 및 짧은 무적 몸통 돌진 도입 | [42e1420](https://github.com/kirakein-gif/PLAYVAULT/commit/42e14202c121472e33b538bb2ceaac80c2be58eb) · [c5a1d2c](https://github.com/kirakein-gif/PLAYVAULT/commit/c5a1d2c46d15a09c705714bc1cc9a987054cd79f) |
| 2026-10-14 | v51–v52(커밋/캐시) | 전투 자세의 신체 크기·황금 보호 효과·역할별 유물, 무기/충돌 피드백과 성장 차별화. 아트 준비 완료 후 시작 허용 및 로딩 실패 재시도 흐름 | [bfe5eb4](https://github.com/kirakein-gif/PLAYVAULT/commit/bfe5eb4b5f64713f19a806073417d470af633308) · [c4ecaa2](https://github.com/kirakein-gif/PLAYVAULT/commit/c4ecaa2bfa1a09cd83395fccfe23ae08ded266a9) |
| 2026-10-15 | v53–v54(커밋/캐시) | 적/보스 정지·준비·공격까지 atlas 조각 분리 확장. 보스 소환수의 등장 대기·안전 배치·보스 사망 취소와 보행 전환 완화 | [b3c053e](https://github.com/kirakein-gif/PLAYVAULT/commit/b3c053e40f16002e57d60372e9ef2b2a221ee361) · [e6f2631](https://github.com/kirakein-gif/PLAYVAULT/commit/e6f26317e161b8e3a0c0176dda83d4dbffa22a44) |
| 2026-10-15 | v55–v56(화면/캐시) | 깊이별 적/엘리트 XP와 역할 표기 이중 강화. 미니맵 실제 통로·문 잠금 상태, 용암 시각/피해 단계 동기화 | [07d2822](https://github.com/kirakein-gif/PLAYVAULT/commit/07d28226071d6bdea3618ecc6a5ba546a6aaea3d) · [5c47cf2](https://github.com/kirakein-gif/PLAYVAULT/commit/5c47cf2e8a97f9a53d1598b8551967c8786287a8) |
| 2026-10-15 | v57–v60(화면/캐시) | 유물 패널 위치 수정, 피격이 적 공격 준비/돌진을 취소하지 않도록 보정하되 대기 경직 유지. 미니맵 축소 복원. 깊이별 돌진 도달 거리 및 이동 구간 충돌 검사로 빠른 돌진 누락 방지 | [ee02f20](https://github.com/kirakein-gif/PLAYVAULT/commit/ee02f20d7df3cb74b110b229aae5f0b9878667f1) · [c24205c](https://github.com/kirakein-gif/PLAYVAULT/commit/c24205c63e0bd87dd412c3c67a26ef27daa65a3e) · [9d4aaad](https://github.com/kirakein-gif/PLAYVAULT/commit/9d4aaad85d503ad24e5ded115e23239b5902bf2f) · [8ce4d02](https://github.com/kirakein-gif/PLAYVAULT/commit/8ce4d0257ab46b9f67f1aa0840868521f22a7e75) |

### 복원 연대기 · THE HOLLOW KEEP

| 날짜(KST) | 당시 버전·변화 범위 | 목적·변경과 후속 인계 근거 | 커밋 |
| --- | --- | --- | --- |
| 2026-10-07 | 캐시 1–2 | 별도 게임 HTML/CSS·고정 30개 방과 챕터 엔진 구축. 주인공별 HP/공격/교대, 장치·지도·비밀벽·체크포인트·보스/종/귀환과 홈 카드 추가 | [53e3b89](https://github.com/kirakein-gif/PLAYVAULT/commit/53e3b89f9ecb759742b2aab841b395361449e5d2) · [9f56d17](https://github.com/kirakein-gif/PLAYVAULT/commit/9f56d17539a908439e21d1207d845d99ee8d871a) · [5350af8](https://github.com/kirakein-gif/PLAYVAULT/commit/5350af8f6be4542d7b3212cde8575f3aa971d991) · [83adaa7](https://github.com/kirakein-gif/PLAYVAULT/commit/83adaa77a2cf9e82ea9ef6af036deefd541b9055) · [4b09f6a](https://github.com/kirakein-gif/PLAYVAULT/commit/4b09f6ae3745ae8625eff861953d472266b6ea49) · [cb7c869](https://github.com/kirakein-gif/PLAYVAULT/commit/cb7c8698e1379c290bac5ed2437b8f9d9cc9a0f2) · [cb04d04](https://github.com/kirakein-gif/PLAYVAULT/commit/cb04d04f11bfa6be6b733e294e6d3302fe741a2a) · [bb92e1c](https://github.com/kirakein-gif/PLAYVAULT/commit/bb92e1c58436e14cff88c18cc4e3771c05a6de6c) |
| 2026-10-07 | 캐시 3 | 보이지 않는 영웅 수정: 몸체 w/h 초기화 및 유효 좌표 보정 | [ba0ffc3](https://github.com/kirakein-gif/PLAYVAULT/commit/ba0ffc39a79f7cf8694ab8397069a9334c9e7886) · [7076f12](https://github.com/kirakein-gif/PLAYVAULT/commit/7076f126ab41fba3cdde55b9ae2fabb99efed67b) |
| 2026-10-07 | v4(README/캐시) | Ethan의 무게와 Noah의 민첩성 분리, 가속/마찰·가변 점프·코요테 타임·입력 버퍼·교대 관성·착지/발사 피드백 | [56d40a9](https://github.com/kirakein-gif/PLAYVAULT/commit/56d40a9f401b6c29938fdccc1d01bd608b1b2a0d) · [cf964e1](https://github.com/kirakein-gif/PLAYVAULT/commit/cf964e1e415073eb85fed7fc58bfc6f4f44be54e) · [9b5e99d](https://github.com/kirakein-gif/PLAYVAULT/commit/9b5e99de07e84e621ed00d49c7e45a4229415030) · [0bae7a0](https://github.com/kirakein-gif/PLAYVAULT/commit/0bae7a0c0dd735f77418eb55ba7fe344999efded) · [ac488d6](https://github.com/kirakein-gif/PLAYVAULT/commit/ac488d676497856f29bcd83e14f08dbaa755c31c) |
| 2026-10-07 | v5(README/캐시) | Noah 3연타, Ethan 명중 경직·넉백. 적 접촉 위주 공격을 예고→공격→회복으로 개선, 타격·사망 피드백 보강 | [69b1390](https://github.com/kirakein-gif/PLAYVAULT/commit/69b1390bcfb5cd5ddc3dd80f2ee19de507139bc7) · [bbc53cb](https://github.com/kirakein-gif/PLAYVAULT/commit/bbc53cb084b25203415274a4bdef8a92aab169c2) · [99ab351](https://github.com/kirakein-gif/PLAYVAULT/commit/99ab351ffdd79d2190d281b7752cb46dbf85fb4d) · [a080f49](https://github.com/kirakein-gif/PLAYVAULT/commit/a080f4969c075edae30428b45c1449c1e75e4cbf) · [3e8fa01](https://github.com/kirakein-gif/PLAYVAULT/commit/3e8fa019a63ad636f2b8dc9164541d4e359790b9) |
| 2026-10-07 | v6–v7(README/캐시) | Ethan 시전·Noah 각 연타의 별도 자세, 실제 공격 시간 기반 모션. 3타 후 회복 잠금·이동 제한으로 연타 종료 박자 추가 | [4424a7d](https://github.com/kirakein-gif/PLAYVAULT/commit/4424a7df4ccae1f00e7f7c9401ee8ac54d380a83) · [7e63d67](https://github.com/kirakein-gif/PLAYVAULT/commit/7e63d670cbce8fbaeda13c9c91858f97fe69b523) · [4a3d36e](https://github.com/kirakein-gif/PLAYVAULT/commit/4a3d36eb8ababc834d008914c19f3144f0b5dba0) · [4350083](https://github.com/kirakein-gif/PLAYVAULT/commit/4350083519b87d09aae379f59643263938878f83) |
| 2026-10-08 | v8(커밋/캐시) | 히트스톱·차별화 타격과 적 경직/전조 보정. Noah 걸쇠·문으로 초반 성 순환 구성, art.js와 배경/공용 스프라이트 로딩 추가 | [ee448ac](https://github.com/kirakein-gif/PLAYVAULT/commit/ee448acf63933c96b9480043653a053c9aaff2f0) · [4a58bc7](https://github.com/kirakein-gif/PLAYVAULT/commit/4a58bc7148da87a4c36fc736a0ecba87c10c0ae2) · [dfa01b0](https://github.com/kirakein-gif/PLAYVAULT/commit/dfa01b026ceab561082941ab9d1345f64b0031a1) · [d540689](https://github.com/kirakein-gif/PLAYVAULT/commit/d540689bb8fb26761ecb2bf2d57a67471f48dccf) · [75a2317](https://github.com/kirakein-gif/PLAYVAULT/commit/75a23170f8b45a950f21bb52a14a913ca3236d18) |
| 2026-10-08 | 캐시 9–11 | 모바일 선명도 보정, 가로 우선 레이아웃·회전 안내, 전체화면/화면 방향 요청 후 세로 플레이를 단계적으로 차단 | [592570a](https://github.com/kirakein-gif/PLAYVAULT/commit/592570a6080f08db9b62168a4a4698d710e9f4a9) · [706d627](https://github.com/kirakein-gif/PLAYVAULT/commit/706d627d51b0aa7ed317c7f66ab56b6e511de605) · [aee3a14](https://github.com/kirakein-gif/PLAYVAULT/commit/aee3a14518593df864ce93fb2f4d11ccb5751356) · [59bf206](https://github.com/kirakein-gif/PLAYVAULT/commit/59bf206f9b71e5fe885a2a6af262045707780468) · [d5096e6](https://github.com/kirakein-gif/PLAYVAULT/commit/d5096e652d80bd8b412875f11b4f9971dda9285c) · [b6f22f3](https://github.com/kirakein-gif/PLAYVAULT/commit/b6f22f3fe5afbb28928045cbb170ecc175cebf10) · [c751cc6](https://github.com/kirakein-gif/PLAYVAULT/commit/c751cc63ccb0518a414f984aee4a1071d1f0e523) |
| 2026-10-08 | 캐시 12 및 후속 수정 | 조이스틱/터치와 첫 플레이 경로로 Chapter I 정리, 나머지 방은 후속용 정의로 보존. 종지기 보스 사후 출구/승강기 및 중앙홀 복귀 연결 수정 | [e56a45b](https://github.com/kirakein-gif/PLAYVAULT/commit/e56a45b067c9cba5f3fa966cf9d319ba7ae3a2de) · [cabbe8c](https://github.com/kirakein-gif/PLAYVAULT/commit/cabbe8cdc8b4e5d8afb4a8319a1946c22602efde) · [a9d357f](https://github.com/kirakein-gif/PLAYVAULT/commit/a9d357f10088dad1ac67a08b8c026be1a9b52a22) · [60a9f8d](https://github.com/kirakein-gif/PLAYVAULT/commit/60a9f8d0119926abfe443890dce3e93b841aac68) |
| 2026-10-08 | 캐시 분리: CSS 13→16, art 13→15, core 13 | 타이틀 키 비주얼·플레이 영웅·HD 그림 순차 반영, 고딕 아트를 스테이지·적까지 확장. 공식 단일 게임 버전 확인 불가 | [9fec3ae](https://github.com/kirakein-gif/PLAYVAULT/commit/9fec3aeed6e9dbaa2ecbee6f86cee32d6d9c64a5) · [5c99507](https://github.com/kirakein-gif/PLAYVAULT/commit/5c995077ad6cbbcdc508b3617c3643b524930ac8) · [e4e2661](https://github.com/kirakein-gif/PLAYVAULT/commit/e4e26619fa548ae980592609f071e26935c6681f) · [1911abd](https://github.com/kirakein-gif/PLAYVAULT/commit/1911abdf3575d2196929bcd3af7f76e183d14095) · [d9a9859](https://github.com/kirakein-gif/PLAYVAULT/commit/d9a9859063204cb5a770a5ad47fd2eb4f74a0e83) |

### 복원 연대기 · 세계 최고의 게임 · main

| 날짜(KST) | 당시 버전·변화 범위 | 목적·변경과 후속 인계 근거 | 커밋 |
| --- | --- | --- | --- |
| 2026-10-19 | 원본 v0.1 / 화면 0.1.0 | 외부에서 만든 단일 HTML 원본을 최초 등록. 오프닝·최주임/김과장·RPS·버튼/키 타이밍 반응·승패 안내·커서 흔들기·로컬 진행 기록. Git 등록 이전 제작 과정 확인 불가 | [ebf5ae4](https://github.com/kirakein-gif/PLAYVAULT/commit/ebf5ae461ed7cc459a34155c1f5fa1bccbe82c40) |
| 2026-10-19 | 원본 유지 / 기획 문서 v1.0 | README와 게임 디자인·비주얼·입력·로드맵·CODEX_HANDOFF 등록. 드래그/스윙·직접 냄비 착용·결과 스스로 판단 등 정식 방향은 원본 구현과 구분 | [65e56dd](https://github.com/kirakein-gif/PLAYVAULT/commit/65e56dd280369524d028c8d5776f0e34305f5539) · [8f7723a](https://github.com/kirakein-gif/PLAYVAULT/commit/8f7723a82195dd42a67f877cf3d2b48a5cebbf86) · [e6e60ae](https://github.com/kirakein-gif/PLAYVAULT/commit/e6e60ae48efd8f9941ed81b6770704b0b7171b6a) · [dbeb112](https://github.com/kirakein-gif/PLAYVAULT/commit/dbeb112a7715b71722b24bcc81b650fc22ee304c) · [4496834](https://github.com/kirakein-gif/PLAYVAULT/commit/4496834d1f5aff355f429b5a7082ec9d6a577f1e) · [41f7517](https://github.com/kirakein-gif/PLAYVAULT/commit/41f7517a24822f73c9b0732996bb78661e47a284) |

### 복원 연대기 · 세계 최고의 게임 · 미병합 브랜치

| 날짜(KST) | 당시 버전·변화 범위 | 목적·변경과 후속 인계 근거 | 커밋 |
| --- | --- | --- | --- |
| 2026-10-19 | 초기 액션→v0.2(브랜치 문서) | HTML5 유지/Godot 비교·별도 prototype 경로. DOM 분리 engine/config, 어깨너머 RPS 결과 비공개, 직접 grab/스윙/냄비/IK, 파울·AI·3점 경기·타격 정지·음소거/흔들림. Node/브라우저 검증 기록 추가 | [453ff43](https://github.com/kirakein-gif/PLAYVAULT/commit/453ff43bf3b8bfa15f8e49fca99e5ae562a8e938) · [046491f](https://github.com/kirakein-gif/PLAYVAULT/commit/046491f4f2c3630f75bc0ae53080554624754e70) · [d955860](https://github.com/kirakein-gif/PLAYVAULT/commit/d955860511d7dddcae19d887f185ce85299b92ad) · [b47ef45](https://github.com/kirakein-gif/PLAYVAULT/commit/b47ef454e29042caabd9528d703cfc786450b931) · [09bec29](https://github.com/kirakein-gif/PLAYVAULT/commit/09bec29ba76e324fc503e7e7b51333207bbf1320) · [761315f](https://github.com/kirakein-gif/PLAYVAULT/commit/761315f1d12b1170be6e4d3419eee8f8a624cafc) |
| 2026-10-19 | v0.3–v0.6(브랜치 문서) | 구도/팔 길이/즉시 입력과 템포 수정. 인물당 하나의 동작 팔·두 사람 사이 테이블, 대각선 뒤통수 시점 및 테이블 방향 조정 | [5f4412d](https://github.com/kirakein-gif/PLAYVAULT/commit/5f4412d030f0fc25ef1374691e73755730fb280e) · [fdf1331](https://github.com/kirakein-gif/PLAYVAULT/commit/fdf1331ade2cc3fa20cb2dd97276832c328c8d7d) · [ebcdfb7](https://github.com/kirakein-gif/PLAYVAULT/commit/ebcdfb7de1e2881f688b6a27fda5de304cf0fd18) · [60f6cac](https://github.com/kirakein-gif/PLAYVAULT/commit/60f6cacfabfcdee0663b51b7a759047c3af4445c) |
| 2026-10-19 | v0.7–v0.7.3(문서/화면) | A안 일러스트 레이어·투영 포즈로 전환, 목 연결·팔/손 비례·테이블 높이·RPS 앞으로 뻗기 수정 | [103203a](https://github.com/kirakein-gif/PLAYVAULT/commit/103203a94d6d9bad50276e08759eb1be499b4f83) · [0404015](https://github.com/kirakein-gif/PLAYVAULT/commit/0404015704cbb24e31e2a1da95641985280a8b41) · [aa85a53](https://github.com/kirakein-gif/PLAYVAULT/commit/aa85a53fe5149e71c4a8a51cd20f5f952ac5febe) · [4ed6f46](https://github.com/kirakein-gif/PLAYVAULT/commit/4ed6f462310b62e218e63b2fb72412346a821940) |
| 2026-10-19 | v0.8–v0.9(문서/화면) | 승인된 오른손 RPS 자세와 도구 잡기/스윙/냄비 구간의 오른팔-손잡이 연결 조정 | [3712387](https://github.com/kirakein-gif/PLAYVAULT/commit/3712387e8ba67c1f8abb2cfc35e2ac72650530bb) · [b09a052](https://github.com/kirakein-gif/PLAYVAULT/commit/b09a05213275b65231b9f9c05376abfaa76cb2d2) |
| 2026-10-19 | v0.10(문서/화면) | 연속 파츠 리깅 중심 표현에서 완성형 정지 포즈 교체 방식으로 전환, 도구 크기·배치 변경 및 10개 포즈 미리보기. 직접 입력 판정은 유지 | [0071bd3](https://github.com/kirakein-gif/PLAYVAULT/commit/0071bd33c83b69f62d07415370eb8e8c4614b606) |
| 2026-10-19 | v0.11(문서/화면) | 정수리 명중 영역·내려치기 아트, 3점 경기에서 100 에너지/-25 체계로 변경 | [dfc75d0](https://github.com/kirakein-gif/PLAYVAULT/commit/dfc75d03bf96ecc24683cc128ca5ff63df8f0680) |
| 2026-10-19 | v0.12(문서/화면) | 3→2→1 예약 패와 다음 판 자동 진행, 미선택 대기·로딩 후 시작·미리보기 일시정지·에너지 0 종료 | [b5c3c5b](https://github.com/kirakein-gif/PLAYVAULT/commit/b5c3c5b8b8510b0d029b70b62482d480405f0804) |
| 2026-10-19 | v0.13(문서/화면) | 수평 테이블과 타격 카메라 이동/축소 제거, 짧은 망치 머리·HUD 배치 조정. 정지 포즈 간 비례/앵커 정합은 남은 과제 | [e7b28cf](https://github.com/kirakein-gif/PLAYVAULT/commit/e7b28cfc1ce4e595cc7e8abfc6f55845543ca795) |

### 과거 검증 기록과 확인 불가 항목

- ECLIPSE v30 전후: `f53d5a1`에서 audio 회귀와 preview fixture, README 검증 보고를 추가했고 `1adeeeb` 등에서 polish 회귀가 도입되어 이후 24층·피격·돌진 등으로 확대됐다. 현재 테스트의 범위를 과거 최초 버전에 그대로 소급하지 않는다.
- ECLIPSE v33/v34: README는 12층 PC/mobile 회귀 통과 및 오디오 상태 검증을 보고한다. 당시 실제 하드웨어 청취·최종 마스터링 완료는 확인 불가. 현재 파일은 WAV/합성 음원과 후속 sparse track을 함께 보존한다.
- WGG prototype: `761315f` 및 이후 브랜치 문서에 직접 입력·브라우저/Node 검증 보고가 있다. tip의 ACTION_PROTOTYPE 문서는 v0.13에 전투 27 + 진행 5 + Chrome 22 + 고정 구도 1 = 55개를 보고한다. 이번 복원에서 재실행하지 않았으므로 독립 검증으로 부르지 않는다. 이전 절의 3점 경기와 최신 에너지 경기, 초기 연속 IK와 최신 정지 포즈는 교체 관계다.
- HOLLOW KEEP: 전용 회귀 스위트는 현재 main의 tests에서 찾지 못했다. 과거 모든 전투·보스·귀환·터치 동작의 통과 여부는 확인 불가. `60a9f8d`의 귀환 연결 수정 diff를 확인했어도 전체 챕터 완료 실험과 동일하지 않다.
- 아트·음원: provenance 문서와 바이너리 추가/교체 경로는 확인되지만, 모든 원본 생성 과정·권리·인간의 승인·시각/청각 완성도는 Git만으로 확인 불가. 브랜치 제목의 'approved'를 이번 사용자의 새 승인으로 해석하지 않는다.
- 버전: ECLIPSE 초기 독립 v1–v3 릴리스, HOLLOW KEEP v8 이후 공식 단일 게임 번호, WGG main 도입 이전의 외부 제작/대화 이력과 태그 기반 릴리스는 확인 불가. 누락 번호를 채우거나 서로 다른 번호를 통합하지 않는다.
- 날짜/병합: `985d589`와 `f1b355b`의 두 부모를 확인했다. 독립 브랜치의 author 날짜와 현재 main의 편입 순서는 다를 수 있으며, 릴리스 날짜로 쓰지 않는다. 병합에 포함된 기능은 원 기능 커밋과 중복 개발로 세지 않는다.

### 전체 커밋 색인

조사 기준의 제품 이력 **253개(main 233 + 미병합 prototype 20)**를 각각 한 번씩 수록한다. 원문 제목은 검색/추적을 위해 보존한다. 이 표의 사실 범위는 **커밋 존재·부모 연결·날짜·변경 경로**이며 제목의 주장 자체가 실제 기능 검증 결과는 아니다. 주요 기능 분석은 위 복원 연대기 및 CHANGELOG에 있다. 기존 문서 커밋 `5f09367`·`f43b8d4`는 위 이번 작업 기록으로 따로 관리한다.

#### main 전체 233커밋

| 순서 | 날짜(KST) | 커밋 | 변경 경로 분류 | 원문 제목 |
| --- | --- | --- | --- | --- |
| 1 | 2026-10-05 | [3deefb5](https://github.com/kirakein-gif/PLAYVAULT/commit/3deefb5c6faa8feb2778e3aaf06acc2ccbfe91a6) | 플랫폼/문서 | Initialize PLAYVAULT |
| 2 | 2026-10-05 | [e83c4a7](https://github.com/kirakein-gif/PLAYVAULT/commit/e83c4a7c80480ccf54f4be41e5b2ed4e2508726a) | 플랫폼/문서 | Add PLAYVAULT home |
| 3 | 2026-10-05 | [a749330](https://github.com/kirakein-gif/PLAYVAULT/commit/a7493307bf8da5e57dfa9c9160161b9ae177a756) | 공용 자산 · 플랫폼/문서 | Add PLAYVAULT styles |
| 4 | 2026-10-05 | [2db4da8](https://github.com/kirakein-gif/PLAYVAULT/commit/2db4da8972298ce4c907ff6b6c79909e10febfa5) | ECLIPSE | Add ABYSSFALL ECLIPSE page |
| 5 | 2026-10-05 | [b856b74](https://github.com/kirakein-gif/PLAYVAULT/commit/b856b74b673f6780aa3d08f81cd0bc061b75d3f9) | ECLIPSE | Add ABYSSFALL responsive styles |
| 6 | 2026-10-05 | [37919e8](https://github.com/kirakein-gif/PLAYVAULT/commit/37919e85b9c0c45fd00afc458a507bed89cf4f76) | ECLIPSE | Add ABYSSFALL game core |
| 7 | 2026-10-05 | [ef8827f](https://github.com/kirakein-gif/PLAYVAULT/commit/ef8827f56694ce22bcf789cccc21ed6461f06358) | ECLIPSE | Add ABYSSFALL renderer |
| 8 | 2026-10-05 | [35c55de](https://github.com/kirakein-gif/PLAYVAULT/commit/35c55decc3f35032e546288b29efe123b8c17206) | ECLIPSE | Split ABYSSFALL scripts |
| 9 | 2026-10-05 | [b1574e6](https://github.com/kirakein-gif/PLAYVAULT/commit/b1574e682653b3b8cacf00800daffae963b51b52) | ECLIPSE | Add Dawn Seeker and Night Veil game sprites |
| 10 | 2026-10-05 | [8197416](https://github.com/kirakein-gif/PLAYVAULT/commit/819741617524ea97ee96a15ba3b99f21f203ebeb) | ECLIPSE | Add Dawn atlas chunk 1 |
| 11 | 2026-10-05 | [b03b4b4](https://github.com/kirakein-gif/PLAYVAULT/commit/b03b4b431af5f235e628dd618d085873a963e410) | ECLIPSE | Add Dawn atlas chunk 2 |
| 12 | 2026-10-05 | [74cda8a](https://github.com/kirakein-gif/PLAYVAULT/commit/74cda8acc69948b51d911f669beb4d589db8e3b1) | ECLIPSE | Add Dawn atlas chunk 3 |
| 13 | 2026-10-05 | [3d347bd](https://github.com/kirakein-gif/PLAYVAULT/commit/3d347bdee323a80600fce84da15b101f0dc63d6b) | ECLIPSE | Add Dawn atlas chunk 4 |
| 14 | 2026-10-05 | [09e7d46](https://github.com/kirakein-gif/PLAYVAULT/commit/09e7d46617d32007a1101371ed6a0ee985fcbc38) | ECLIPSE | Add Night atlas chunk 1 |
| 15 | 2026-10-06 | [834009c](https://github.com/kirakein-gif/PLAYVAULT/commit/834009cec08e53d1b51a12512637340a9393b145) | ECLIPSE | Add night.2.b64 atlas chunk |
| 16 | 2026-10-06 | [41f1b1b](https://github.com/kirakein-gif/PLAYVAULT/commit/41f1b1bcd25555fea720bf905c9594e490fcc253) | ECLIPSE | Add night.1.b64 atlas chunk |
| 17 | 2026-10-06 | [2be1346](https://github.com/kirakein-gif/PLAYVAULT/commit/2be13464fab58ab7ddf7d5c7afd6727ec28990f8) | 문서 | Complete night.0.b64 atlas chunk |
| 18 | 2026-10-06 | [ab5996b](https://github.com/kirakein-gif/PLAYVAULT/commit/ab5996b136490928d59709c9b8bb115cfc46476b) | 문서 | Complete dawn.3.b64 atlas chunk |
| 19 | 2026-10-06 | [2a19733](https://github.com/kirakein-gif/PLAYVAULT/commit/2a19733a9223676612f1c9bb6ad97a96d285bf37) | ECLIPSE | Complete dawn.2.b64 atlas chunk |
| 20 | 2026-10-06 | [ea8fd59](https://github.com/kirakein-gif/PLAYVAULT/commit/ea8fd59a7ce439a180954d102d437d8fd0f711d0) | 문서 | Complete dawn.1.b64 atlas chunk |
| 21 | 2026-10-06 | [9a8b467](https://github.com/kirakein-gif/PLAYVAULT/commit/9a8b4670497645a7b4ed227d7392eff1e03179cd) | ECLIPSE | Fix Dawn Seeker atlas first chunk |
| 22 | 2026-10-06 | [2d6f538](https://github.com/kirakein-gif/PLAYVAULT/commit/2d6f53852b2ad788a74b56d532fbdd0a66f9962e) | ECLIPSE | Add animated hero atlas loader |
| 23 | 2026-10-06 | [c63bc4a](https://github.com/kirakein-gif/PLAYVAULT/commit/c63bc4ab0425538b7a19f41aec360ec714f80744) | ECLIPSE | Add hurt and death animation state |
| 24 | 2026-10-06 | [c944748](https://github.com/kirakein-gif/PLAYVAULT/commit/c9447489f9e4e45821a3277865862c83866e7eab) | ECLIPSE | Animate heroes from sprite atlases |
| 25 | 2026-10-06 | [c10ae62](https://github.com/kirakein-gif/PLAYVAULT/commit/c10ae62229323ed7eaf172df151bafeee0cd29de) | ECLIPSE | Load animated hero atlases |
| 26 | 2026-10-06 | [9c4ee9f](https://github.com/kirakein-gif/PLAYVAULT/commit/9c4ee9fc852515420b137e7a5a0e409229ea4beb) | ECLIPSE | Synchronize attack animation timing |
| 27 | 2026-10-06 | [d4bce24](https://github.com/kirakein-gif/PLAYVAULT/commit/d4bce246b80dc8ee01b0cd02f58ce4ce0eee9451) | ECLIPSE | Polish animated combat effects |
| 28 | 2026-10-06 | [57f1842](https://github.com/kirakein-gif/PLAYVAULT/commit/57f1842da11c1a468e4d286c113321051e57ee85) | 공용 자산 | Promote dual protagonists to shared PLAYVAULT assets |
| 29 | 2026-10-06 | [98bfed2](https://github.com/kirakein-gif/PLAYVAULT/commit/98bfed2cd002d56a415b76edf39e3fe0318a3e77) | ECLIPSE | Use shared PLAYVAULT protagonist atlases |
| 30 | 2026-10-06 | [ffa2349](https://github.com/kirakein-gif/PLAYVAULT/commit/ffa23491e37a837e0ba70477e26562704a35e382) | 공용 자산 | Document shared protagonist assets |
| 31 | 2026-10-06 | [c3401af](https://github.com/kirakein-gif/PLAYVAULT/commit/c3401af3075eac6c5e46e93574b4afe921981d0b) | ECLIPSE | Bump ABYSSFALL asset cache version |
| 32 | 2026-10-06 | [2288c90](https://github.com/kirakein-gif/PLAYVAULT/commit/2288c90495c8847683b9be9a4d7845ff04a18c35) | 플랫폼/문서 | Document shared protagonist animation system |
| 33 | 2026-10-06 | [00f5248](https://github.com/kirakein-gif/PLAYVAULT/commit/00f5248378dc9711e59dd5166f9ce228dec8bd20) | 공용 자산 | Add PLAYVAULT enemy sprite family |
| 34 | 2026-10-06 | [7511aed](https://github.com/kirakein-gif/PLAYVAULT/commit/7511aed38e209dad9396a8a23988cac181d16861) | ECLIPSE | Animate PLAYVAULT enemy combat states |
| 35 | 2026-10-06 | [5e8106e](https://github.com/kirakein-gif/PLAYVAULT/commit/5e8106e63f224f01ae55a6f3e3df89e094a72727) | ECLIPSE | Render pixel-art enemies and Abyssal Watcher |
| 36 | 2026-10-06 | [c353c14](https://github.com/kirakein-gif/PLAYVAULT/commit/c353c145b423acc91f825dcb16413dec6ae65f05) | ECLIPSE | Bump enemy-art cache version |
| 37 | 2026-10-06 | [ae79c54](https://github.com/kirakein-gif/PLAYVAULT/commit/ae79c54b7f17dd61345910fefec507cc80ff3119) | 플랫폼/문서 | Document ABYSSFALL enemy family |
| 38 | 2026-10-06 | [23b454d](https://github.com/kirakein-gif/PLAYVAULT/commit/23b454dc49b9504dcd410c50c56a66375c938a21) | ECLIPSE | Add named floor themes |
| 39 | 2026-10-06 | [1d8219e](https://github.com/kirakein-gif/PLAYVAULT/commit/1d8219e92fcccc8c95056820bc42da03a52aa9e5) | ECLIPSE | Add four rotating floor environments |
| 40 | 2026-10-06 | [707e0e5](https://github.com/kirakein-gif/PLAYVAULT/commit/707e0e5a6d6e2efd020741a80f87922752a8a3b6) | ECLIPSE | Bump floor-theme cache version |
| 41 | 2026-10-06 | [5534367](https://github.com/kirakein-gif/PLAYVAULT/commit/55343673e468b000c7318bdfdf8b752f056beaec) | ECLIPSE | Add combat treasure recovery elite and boss rooms |
| 42 | 2026-10-06 | [649f96f](https://github.com/kirakein-gif/PLAYVAULT/commit/649f96f340f30c6b60cf05d331e9f27189afd8bd) | ECLIPSE | Render room types and special room objects |
| 43 | 2026-10-06 | [c52c0b5](https://github.com/kirakein-gif/PLAYVAULT/commit/c52c0b5c45e8d050a3b43c60fe7edaa8a6e54185) | ECLIPSE | Bump room-system cache version |
| 44 | 2026-10-06 | [c9a5d9a](https://github.com/kirakein-gif/PLAYVAULT/commit/c9a5d9ac01027eb300c567ebb16806472de49587) | 플랫폼/문서 | Document ABYSSFALL room system |
| 45 | 2026-10-06 | [d13164d](https://github.com/kirakein-gif/PLAYVAULT/commit/d13164de58897ce2a00cf68e740418e13ab6532f) | ECLIPSE | Track and display acquired relics |
| 46 | 2026-10-06 | [f83d3b6](https://github.com/kirakein-gif/PLAYVAULT/commit/f83d3b63c6c319e9d9494f502fe3929c07928b99) | ECLIPSE | Add relic inventory and acquisition banner |
| 47 | 2026-10-06 | [bead089](https://github.com/kirakein-gif/PLAYVAULT/commit/bead089c5f141c88454b4f06720a84e7f39b41f7) | ECLIPSE | Style relic acquisition feedback |
| 48 | 2026-10-06 | [f4c0d12](https://github.com/kirakein-gif/PLAYVAULT/commit/f4c0d12276eb22a245b70e50ad45aed8f8156611) | ECLIPSE | Compact relic inventory UI |
| 49 | 2026-10-06 | [1ec4d35](https://github.com/kirakein-gif/PLAYVAULT/commit/1ec4d35eb4f7de3b5ea8a4caec8f384f5a55f0ea) | ECLIPSE | Open relic inventory from compact HUD button |
| 50 | 2026-10-06 | [95b0874](https://github.com/kirakein-gif/PLAYVAULT/commit/95b0874b6344c7c9c3a0ebeadaf1abf98b4e4bcf) | ECLIPSE | Prevent relic UI from covering playfield |
| 51 | 2026-10-06 | [c8f0b7b](https://github.com/kirakein-gif/PLAYVAULT/commit/c8f0b7bf245af11408b70d79e39e0e726b2330d2) | ECLIPSE | Move mobile minimap clear of HUD |
| 52 | 2026-10-06 | [90eede1](https://github.com/kirakein-gif/PLAYVAULT/commit/90eede126d9d3b5a1f2152af692849201c9b9b7e) | ECLIPSE | Keep compact relic button clear of XP bar |
| 53 | 2026-10-06 | [9954822](https://github.com/kirakein-gif/PLAYVAULT/commit/9954822b529f8b253021e443673a752468e8d867) | ECLIPSE | Bump compact relic UI cache version |
| 54 | 2026-10-06 | [cd0c904](https://github.com/kirakein-gif/PLAYVAULT/commit/cd0c904c8113aa0282bcba86abcf1091f6273597) | 공용 자산 | Add PLAYVAULT relic pixel art set |
| 55 | 2026-10-06 | [0438a37](https://github.com/kirakein-gif/PLAYVAULT/commit/0438a374a43fa58efd21af03fc747a86c27937bb) | ECLIPSE | Use pixel art images for relic rewards |
| 56 | 2026-10-06 | [d325ac7](https://github.com/kirakein-gif/PLAYVAULT/commit/d325ac718f978f88c654bba466819b635d5a9292) | ECLIPSE | Show relic art in acquisition banner |
| 57 | 2026-10-06 | [cc387d4](https://github.com/kirakein-gif/PLAYVAULT/commit/cc387d4fd4f311d267f0e34f591bc99c593d93fd) | ECLIPSE | Style pixel art relic cards and inventory |
| 58 | 2026-10-06 | [8c6dd1e](https://github.com/kirakein-gif/PLAYVAULT/commit/8c6dd1efeece6e8b0d69cbb94a5c1dce70ce51ab) | ECLIPSE | Keep level-up cards separate from relic cards |
| 59 | 2026-10-06 | [a5e0f4a](https://github.com/kirakein-gif/PLAYVAULT/commit/a5e0f4a3dc5d226d234e58501ca986a754f9d17f) | 문서 | Scope mobile relic card layout |
| 60 | 2026-10-06 | [c299471](https://github.com/kirakein-gif/PLAYVAULT/commit/c299471bfa7cc2a23bfaf09f9629687bc478378a) | ECLIPSE | Bump relic art cache version |
| 61 | 2026-10-06 | [2a49ae3](https://github.com/kirakein-gif/PLAYVAULT/commit/2a49ae3bdb3d0729d2c5cb6ba93670cf125ee430) | ECLIPSE | Give relics unique combat-changing effects |
| 62 | 2026-10-06 | [4012c8b](https://github.com/kirakein-gif/PLAYVAULT/commit/4012c8b918d1f90b2b0ba43e1f61b329ca6398b4) | ECLIPSE | Reduce passive relic notification spam |
| 63 | 2026-10-06 | [7a11d5b](https://github.com/kirakein-gif/PLAYVAULT/commit/7a11d5bfee19176e958bd28efb04daa4525e6575) | ECLIPSE | Render relic blade and crystal projectiles |
| 64 | 2026-10-06 | [fb830b3](https://github.com/kirakein-gif/PLAYVAULT/commit/fb830b3f7deb6948c0e6a883a70b265d8aff4780) | ECLIPSE | Show relic effects in inventory panel |
| 65 | 2026-10-06 | [d4e2284](https://github.com/kirakein-gif/PLAYVAULT/commit/d4e22840ec11677120439c52be272eee32455c3d) | ECLIPSE | Bump relic effects cache version |
| 66 | 2026-10-06 | [44e5669](https://github.com/kirakein-gif/PLAYVAULT/commit/44e5669940d8fe5cd19e76e0f36382f9bf60e341) | 공용 자산 | Document combat-changing relic effects |
| 67 | 2026-10-06 | [e4722df](https://github.com/kirakein-gif/PLAYVAULT/commit/e4722df4e7f0d54edcef513c4d15e6aa8992fbd2) | ECLIPSE | Add three-phase Abyssal Watcher boss patterns |
| 68 | 2026-10-06 | [d20f5df](https://github.com/kirakein-gif/PLAYVAULT/commit/d20f5df81aa6f38f2f7d9f9e131df7d5c92a242c) | ECLIPSE | Telegraph Abyssal Watcher boss attacks |
| 69 | 2026-10-06 | [bdaa758](https://github.com/kirakein-gif/PLAYVAULT/commit/bdaa758207c6a759df03105384c9f9e34e2cffb7) | ECLIPSE | Bump boss-pattern cache version |
| 70 | 2026-10-06 | [9afb3f6](https://github.com/kirakein-gif/PLAYVAULT/commit/9afb3f6d40e039e213d8af404a3589e0e81088dd) | 공용 자산 | Add seven advanced relics and pixel art |
| 71 | 2026-10-06 | [7445187](https://github.com/kirakein-gif/PLAYVAULT/commit/7445187bb2baf97cc36bcd2972fc2ea0a578beed) | ECLIPSE | Implement seven advanced relic mechanics |
| 72 | 2026-10-06 | [1755b69](https://github.com/kirakein-gif/PLAYVAULT/commit/1755b69da4a73c52fbf67c96f3b81cee4f832517) | ECLIPSE | Render advanced relic projectile effects |
| 73 | 2026-10-06 | [66a1987](https://github.com/kirakein-gif/PLAYVAULT/commit/66a19875f1341b57cb5786c161bd48486b8bd367) | ECLIPSE | Style epic and legendary relics |
| 74 | 2026-10-06 | [a82b1a2](https://github.com/kirakein-gif/PLAYVAULT/commit/a82b1a2172af6920ad5f034474800cf92803f5b6) | ECLIPSE | Bump advanced relic cache version |
| 75 | 2026-10-06 | [52ed50f](https://github.com/kirakein-gif/PLAYVAULT/commit/52ed50f910baf76db989964bc25e5bddf2584419) | ECLIPSE | Add boss entrance grace and slower stage transition |
| 76 | 2026-10-06 | [c15997f](https://github.com/kirakein-gif/PLAYVAULT/commit/c15997fdf7b23dedf4a3e3bd04d7c3af8026bdd7) | ECLIPSE | Freeze boss room after victory |
| 77 | 2026-10-06 | [a8f1f87](https://github.com/kirakein-gif/PLAYVAULT/commit/a8f1f875773a39f0c23ca67dfc9a30fa58066a5e) | ECLIPSE | Add smoky boss entrance and victory pause |
| 78 | 2026-10-06 | [653d09e](https://github.com/kirakein-gif/PLAYVAULT/commit/653d09e9ca3b00c51506162f51d634822b10e856) | ECLIPSE | Bump boss intro cache version |
| 79 | 2026-10-06 | [327eed2](https://github.com/kirakein-gif/PLAYVAULT/commit/327eed28f9765c19bc98d5b24a329272bdc15f92) | ECLIPSE | Add 4F clear result screen |
| 80 | 2026-10-06 | [75f1cd9](https://github.com/kirakein-gif/PLAYVAULT/commit/75f1cd9725b3926d9e7d72fb34fd9f9d860e54a5) | ECLIPSE | Style clear results and endless mode actions |
| 81 | 2026-10-06 | [91bfaa2](https://github.com/kirakein-gif/PLAYVAULT/commit/91bfaa29b94d06609bcf9d621d6238f04fc071ae) | ECLIPSE | Add 4F clear results and endless continuation |
| 82 | 2026-10-06 | [528ae4a](https://github.com/kirakein-gif/PLAYVAULT/commit/528ae4a43b122de92bbfac2e19626ec5ec8d798e) | ECLIPSE | Add four floor-specific gameplay gimmicks |
| 83 | 2026-10-06 | [6479002](https://github.com/kirakein-gif/PLAYVAULT/commit/6479002fd14d83b74933cf7018129a86a59da8f1) | ECLIPSE | Differentiate grunt priest and beast attack patterns |
| 84 | 2026-10-06 | [33f0e07](https://github.com/kirakein-gif/PLAYVAULT/commit/33f0e070b23e30753cd83548bc5e3e1c66b2461d) | ECLIPSE | Rebuild floor backgrounds with angled perspective and room mood |
| 85 | 2026-10-06 | [df53234](https://github.com/kirakein-gif/PLAYVAULT/commit/df53234e1ee6ee54960423ed1c572e56841dcccc) | ECLIPSE | Telegraph differentiated enemy attacks |
| 86 | 2026-10-06 | [02f6471](https://github.com/kirakein-gif/PLAYVAULT/commit/02f64710c123c41415028f5f3f6f7c7a90ba3d80) | ECLIPSE | Show clear messaging after 4F boss |
| 87 | 2026-10-06 | [3254d29](https://github.com/kirakein-gif/PLAYVAULT/commit/3254d290694b66bb2ed729aaf05cf3173c156014) | ECLIPSE | Refine enemy charge impacts and post-boss hazards |
| 88 | 2026-10-06 | [8378d3b](https://github.com/kirakein-gif/PLAYVAULT/commit/8378d3b3aec6623f090f115b6998b1848ec37984) | ECLIPSE | Bump full-completion update cache version |
| 89 | 2026-10-06 | [a89c6e9](https://github.com/kirakein-gif/PLAYVAULT/commit/a89c6e92f94b2511706c77fc48b60aeed0ea357a) | 플랫폼/문서 | Document ABYSSFALL v18 completion pass |
| 90 | 2026-10-06 | [3aae5ce](https://github.com/kirakein-gif/PLAYVAULT/commit/3aae5ced1bf54bed192866423c251723e57a0d86) | ECLIPSE | Expand ABYSSFALL to 12 floors with growing branching dungeons |
| 91 | 2026-10-06 | [7d857cd](https://github.com/kirakein-gif/PLAYVAULT/commit/7d857cdab32107bfb0979006f1e54d847fe3a86e) | ECLIPSE | Apply floor hazards to exit battles |
| 92 | 2026-10-06 | [9610b80](https://github.com/kirakein-gif/PLAYVAULT/commit/9610b80db14ac1fb0bcf393bbee7c55af1a815d5) | ECLIPSE | Render 12-floor zones, exit portals, and scalable minimap |
| 93 | 2026-10-06 | [5fe8b44](https://github.com/kirakein-gif/PLAYVAULT/commit/5fe8b44bd7594b35586a054da9377abba310ee74) | ECLIPSE | Update clear screen for 12-floor campaign |
| 94 | 2026-10-06 | [9761f44](https://github.com/kirakein-gif/PLAYVAULT/commit/9761f44fb3220e34494ef1f33e0d46762d5a608c) | ECLIPSE | Separate 12-floor clear records from legacy 4F records |
| 95 | 2026-10-06 | [f27486d](https://github.com/kirakein-gif/PLAYVAULT/commit/f27486dc3671dbc3f0e2167afe1029a679986c02) | 플랫폼/문서 | Document 12-floor campaign structure |
| 96 | 2026-10-06 | [4670fbf](https://github.com/kirakein-gif/PLAYVAULT/commit/4670fbf5995c0f2476e8654687275ed7e53adcb5) | ECLIPSE | Rebalance enemy growth and require boss exit portals |
| 97 | 2026-10-06 | [38cf712](https://github.com/kirakein-gif/PLAYVAULT/commit/38cf712305409a022f20c875874ebf5c58a548b1) | ECLIPSE | Show boss defeat portals before descending |
| 98 | 2026-10-06 | [0af2384](https://github.com/kirakein-gif/PLAYVAULT/commit/0af23848b6982451f8a8e3bd6abb9f9738b62f20) | ECLIPSE | Bump balance and boss portal cache version |
| 99 | 2026-10-06 | [9a16041](https://github.com/kirakein-gif/PLAYVAULT/commit/9a16041606831b37439f7353ebb378285e184a15) | 플랫폼/문서 | Document v20 balance and boss portals |
| 100 | 2026-10-06 | [583c768](https://github.com/kirakein-gif/PLAYVAULT/commit/583c7682c0296b3063fc842c937b680b6411a133) | ECLIPSE | Fix boss portal transition freeze |
| 101 | 2026-10-06 | [22c434c](https://github.com/kirakein-gif/PLAYVAULT/commit/22c434cc36f7ad33c7e48a3a800d86b55aeb430f) | ECLIPSE | Bump boss portal freeze fix cache version |
| 102 | 2026-10-06 | [65045c1](https://github.com/kirakein-gif/PLAYVAULT/commit/65045c1a5d09fc83bcc5f64a1b3fab9fefd05d52) | ECLIPSE | Add lightweight Web Audio music and sound manager |
| 103 | 2026-10-06 | [3e0f53d](https://github.com/kirakein-gif/PLAYVAULT/commit/3e0f53d6a71ab413f4e61aedfbfb02a6c1b7ebb4) | ECLIPSE | Add sound toggle and load audio manager |
| 104 | 2026-10-06 | [e2b4ac6](https://github.com/kirakein-gif/PLAYVAULT/commit/e2b4ac6a7fadb4d5e2e6d77162268355a54cdebe) | ECLIPSE | Style compact sound toggle |
| 105 | 2026-10-06 | [12533ca](https://github.com/kirakein-gif/PLAYVAULT/commit/12533ca7896abfa833cca09669a526f2eae365b3) | ECLIPSE | Connect gameplay events to lightweight audio |
| 106 | 2026-10-06 | [703f50e](https://github.com/kirakein-gif/PLAYVAULT/commit/703f50eb3668d6ab93e69cae82a23001edaa8248) | ECLIPSE | Tidy initial audio cue |
| 107 | 2026-10-06 | [bb5a14a](https://github.com/kirakein-gif/PLAYVAULT/commit/bb5a14a42d2acc4a5e81a28ab0f9d6eec1e15493) | 플랫폼/문서 | Document v22 sound pass |
| 108 | 2026-10-06 | [ff24246](https://github.com/kirakein-gif/PLAYVAULT/commit/ff24246c38fd90cac02ee09aaf3c7935d0d145fb) | ECLIPSE | Harden post-boss state and shorten portal unlock |
| 109 | 2026-10-06 | [8aa8e3c](https://github.com/kirakein-gif/PLAYVAULT/commit/8aa8e3c4c5a24d46aa7447235696a55091a3f690) | ECLIPSE | Raise mobile audio levels and make exploration music audible |
| 110 | 2026-10-06 | [6c64466](https://github.com/kirakein-gif/PLAYVAULT/commit/6c64466335474b0f8b8f34f1f6e9126413697a73) | ECLIPSE | Make game loop recover from post-boss frame errors |
| 111 | 2026-10-06 | [937a9de](https://github.com/kirakein-gif/PLAYVAULT/commit/937a9ded7fb2c732ca2691bd3f7826739d03d3cb) | ECLIPSE | Bump post-boss recovery and audio mix cache version |
| 112 | 2026-10-06 | [14688b4](https://github.com/kirakein-gif/PLAYVAULT/commit/14688b4c5719f5f3b481fcc5b99e6f4f1977e9c3) | ECLIPSE | Add mysterious boss gate altars and replace portals with stairs |
| 113 | 2026-10-06 | [20443bb](https://github.com/kirakein-gif/PLAYVAULT/commit/20443bbd2c22a5296eef3fb2e3becc6a37b48f9a) | ECLIPSE | Render hidden altars and stone stair descents |
| 114 | 2026-10-06 | [0df5440](https://github.com/kirakein-gif/PLAYVAULT/commit/0df5440ffd41807be590545fd7cf629ecb3265fd) | ECLIPSE | Add heavy gate, altar, and stone stair sound cues |
| 115 | 2026-10-06 | [d6f231c](https://github.com/kirakein-gif/PLAYVAULT/commit/d6f231ca17d829273a26a8354bfa03654bd9b37b) | ECLIPSE | Remember discovered locked boss gates on the map |
| 116 | 2026-10-06 | [30a4e1a](https://github.com/kirakein-gif/PLAYVAULT/commit/30a4e1a4c46707a2464bfd9ec4ee62014fe2bfdc) | ECLIPSE | Use stone stair color on minimap |
| 117 | 2026-10-06 | [5305ed8](https://github.com/kirakein-gif/PLAYVAULT/commit/5305ed8d332a62aa981ff6a341d32b0ce3a6fb3a) | ECLIPSE | Bump mysterious gate and stair descent cache version |
| 118 | 2026-10-06 | [66df820](https://github.com/kirakein-gif/PLAYVAULT/commit/66df8208f6cfe2595039797418769e42c06ba029) | 플랫폼/문서 | Document v24 mysterious gate progression and stairs |
| 119 | 2026-10-06 | [41b8a94](https://github.com/kirakein-gif/PLAYVAULT/commit/41b8a94a2dae41567d35ca6e9f63cf35531eb5cd) | ECLIPSE | Add sparse environmental story traces |
| 120 | 2026-10-06 | [b4292ec](https://github.com/kirakein-gif/PLAYVAULT/commit/b4292ecfd36d7a5dc4f9b386a56e2ba6b3ca572c) | ECLIPSE | Render faint recurring eclipse wall marks |
| 121 | 2026-10-06 | [9836928](https://github.com/kirakein-gif/PLAYVAULT/commit/98369281b7f2dcc4608d08dd7ce5db41087da5d1) | ECLIPSE | Bump environmental story trace cache version |
| 122 | 2026-10-06 | [b8c05e1](https://github.com/kirakein-gif/PLAYVAULT/commit/b8c05e140fb951baaef8e5f90cb46d77bc0eb3c4) | 플랫폼/문서 | Document v25 environmental storytelling direction |
| 123 | 2026-10-06 | [43a4be1](https://github.com/kirakein-gif/PLAYVAULT/commit/43a4be1e3451bd23ead633f87360008024309c41) | ECLIPSE | Make floor hazards variable and remove mechanical explanations |
| 124 | 2026-10-06 | [0f187b9](https://github.com/kirakein-gif/PLAYVAULT/commit/0f187b9a03a02d151d98ec253b36b2fa96a150ad) | ECLIPSE | Vary fog, wind, and rift visuals by room |
| 125 | 2026-10-06 | [f2b0e48](https://github.com/kirakein-gif/PLAYVAULT/commit/f2b0e480e0a476e776af319d61d10e9a3db96920) | ECLIPSE | Bump variable environment cache version |
| 126 | 2026-10-06 | [184acd4](https://github.com/kirakein-gif/PLAYVAULT/commit/184acd449c20d8a0c1dca8d599f9308429172fc8) | 플랫폼/문서 | Document v26 variable environmental hazards |
| 127 | 2026-10-06 | [48ae3a6](https://github.com/kirakein-gif/PLAYVAULT/commit/48ae3a6b2e781230bc38d6818117d5a26797aed1) | ECLIPSE | Add visible special cooldown timer |
| 128 | 2026-10-06 | [a87d00c](https://github.com/kirakein-gif/PLAYVAULT/commit/a87d00c43a75d569fd63e43520e8a18adac54390) | ECLIPSE | Render live special cooldown progress and ready state |
| 129 | 2026-10-06 | [349ad6e](https://github.com/kirakein-gif/PLAYVAULT/commit/349ad6ed5416e33dc3801cd5cba32d8741bb4086) | ECLIPSE | Add radial special cooldown ring and ready glow |
| 130 | 2026-10-06 | [1343c25](https://github.com/kirakein-gif/PLAYVAULT/commit/1343c253b54d0086da99a5cbb73f435008f22e55) | 플랫폼/문서 | Document v27 special cooldown feedback |
| 131 | 2026-10-06 | [7b06a67](https://github.com/kirakein-gif/PLAYVAULT/commit/7b06a67e8319dd24389fcc5e2fa9eece28602240) | ECLIPSE | Make special cooldown display unmistakable |
| 132 | 2026-10-06 | [049c33b](https://github.com/kirakein-gif/PLAYVAULT/commit/049c33b8544a673de594ce2cb530410d3eb94e9a) | ECLIPSE | Drive special cooldown ring with visible angular progress |
| 133 | 2026-10-06 | [a84b29a](https://github.com/kirakein-gif/PLAYVAULT/commit/a84b29a241dffe051f7d5fd3c7356c286caaf9f2) | ECLIPSE | Enlarge and strengthen radial special cooldown indicator |
| 134 | 2026-10-07 | [38532ba](https://github.com/kirakein-gif/PLAYVAULT/commit/38532ba5f144e63660e63a8950b67c6af4127e93) | ECLIPSE | Simplify special cooldown ring and remove seconds |
| 135 | 2026-10-07 | [81b6c6a](https://github.com/kirakein-gif/PLAYVAULT/commit/81b6c6ac9aca7d44cb34a17b624413e2ac180a54) | ECLIPSE | Use hero-specific special cooldown colors |
| 136 | 2026-10-07 | [1580372](https://github.com/kirakein-gif/PLAYVAULT/commit/15803723a3106bf995173c78675c5bc74bfcb2ed) | ECLIPSE | Use thin hero-colored special cooldown ring |
| 137 | 2026-10-07 | [dca67ed](https://github.com/kirakein-gif/PLAYVAULT/commit/dca67edae9bf5505773b1e0490776d52212e5357) | ECLIPSE | Share hero cooldown color with desktop ability state |
| 138 | 2026-10-07 | [8c18221](https://github.com/kirakein-gif/PLAYVAULT/commit/8c1822101786aacda8ebd1aa4cfec56d2ef326af) | ECLIPSE | Stabilize sprite scale, foot pivots and DPR presentation |
| 139 | 2026-10-07 | [4f1913c](https://github.com/kirakein-gif/PLAYVAULT/commit/4f1913c0e92004cd8a5e63517525034583ca5308) | ECLIPSE · 공용 자산 | Add reference-driven character and enemy art with restrained combat cues |
| 140 | 2026-10-07 | [1adeeeb](https://github.com/kirakein-gif/PLAYVAULT/commit/1adeeeb5c3458343cbde420cb8ede7eac714f37a) | ECLIPSE · 공용 자산 · 회귀 · 제작 도구 | Polish regional rooms, action frames and original ambient audio loops |
| 141 | 2026-10-07 | [f53d5a1](https://github.com/kirakein-gif/PLAYVAULT/commit/f53d5a1cda20d0fa8e47fad12775dfd4292dbaba) | ECLIPSE · 공용 자산 · 회귀 · 플랫폼/문서 | Verify mobile controls, HUD layout, boss progression and audio lifecycle |
| 142 | 2026-10-07 | [e667a84](https://github.com/kirakein-gif/PLAYVAULT/commit/e667a843b0b8b4e7e55e91d3b71fe9283c35e18b) | 회귀 | Keep regression fixture formatting clean |
| 143 | 2026-10-07 | [bb39a17](https://github.com/kirakein-gif/PLAYVAULT/commit/bb39a175b073b684b0f2a29225707b1d335c178d) | ECLIPSE | Finish readable hero labels and stone gate framing |
| 144 | 2026-10-07 | [829245b](https://github.com/kirakein-gif/PLAYVAULT/commit/829245bf22f860617df9faea823d966571d453ba) | ECLIPSE · 공용 자산 · 회귀 · 플랫폼/문서 | Redesign protagonists with grounded gothic proportions and smaller scale |
| 145 | 2026-10-07 | [e845f91](https://github.com/kirakein-gif/PLAYVAULT/commit/e845f91123159fdad6dd13598cc8738ea7eac075) | ECLIPSE · 공용 자산 · 플랫폼/문서 | Distinguish male and female protagonist silhouettes and faces |
| 146 | 2026-10-07 | [e99f0e5](https://github.com/kirakein-gif/PLAYVAULT/commit/e99f0e572a5e56607530c6833a8f75da17a3876f) | ECLIPSE · 공용 자산 · 회귀 · 제작 도구 · 플랫폼/문서 | Calm hero motion and audio; add physical dungeon props and reward keys |
| 147 | 2026-10-07 | [df04a58](https://github.com/kirakein-gif/PLAYVAULT/commit/df04a58f307df27233952a57f4eeca923108ab0b) | ECLIPSE · 공용 자산 · 회귀 · 제작 도구 · 플랫폼/문서 | Inset side doors, remove background drone, and absorb soul XP |
| 148 | 2026-10-07 | [5f162c9](https://github.com/kirakein-gif/PLAYVAULT/commit/5f162c9c1392694009a0c4037ca43bbbb8bade37) | ECLIPSE · 공용 자산 · 회귀 | Integrate gothic passages into room scenery and redraw detailed relics |
| 149 | 2026-10-07 | [a7ed4b5](https://github.com/kirakein-gif/PLAYVAULT/commit/a7ed4b59e2342c36f7a0acca8f86605f9644b51d) | ECLIPSE · 회귀 | Fix side-door masonry and project weapons from hand height |
| 150 | 2026-10-07 | [6271eea](https://github.com/kirakein-gif/PLAYVAULT/commit/6271eeaa43ad503cde5efe3e2dfc8a30147fd334) | ECLIPSE | Remove protagonist ground ring and refresh release assets |
| 151 | 2026-10-07 | [d6308c7](https://github.com/kirakein-gif/PLAYVAULT/commit/d6308c77e779d798c9dd79ec9de8400435e3005f) | ECLIPSE · 회귀 | Release Eclipse v38: stable rooms, clear south passages, grounded effects, seal stones and Ethan / Noah |
| 152 | 2026-10-08 | [0a0c718](https://github.com/kirakein-gif/PLAYVAULT/commit/0a0c7184d465a743facf75ec44d5dae90060d427) | ECLIPSE · 공용 자산 · 회귀 | Extend Eclipse campaign to 24 floors with deep terrain hazards and escalating enemies |
| 153 | 2026-10-08 | [1d45c30](https://github.com/kirakein-gif/PLAYVAULT/commit/1d45c30d0934ade266d0bc803ec4a85e9f1683de) | ECLIPSE · 회귀 | Fix reward transition freeze and refine persistent ice and fog for v40 |
| 154 | 2026-10-08 | [a4aff2e](https://github.com/kirakein-gif/PLAYVAULT/commit/a4aff2e5ab9d9d409baaa058300e452da0d020d5) | ECLIPSE · 회귀 | Blend lava poison and cathedral light into stone floors for v41 |
| 155 | 2026-10-08 | [947ead0](https://github.com/kirakein-gif/PLAYVAULT/commit/947ead0b2fd9c87df25f95603ee3749cef8556bd) | ECLIPSE · 회귀 | Remove room entry labels and elite cross; style stage prose for v42 |
| 156 | 2026-10-08 | [79f22c3](https://github.com/kirakein-gif/PLAYVAULT/commit/79f22c32cab2bbc7e1eaaeeaf6184ece3a1adc6f) | ECLIPSE · 공용 자산 | Load final character portraits directly to prevent old art flash in v43 |
| 157 | 2026-10-08 | [7abb36a](https://github.com/kirakein-gif/PLAYVAULT/commit/7abb36afa0bb22f66c587c4060e1f4768ff591a5) | ECLIPSE · 회귀 | Limit stage prose to biome changes and strengthen holy light and wind with gust audio in v44 |
| 158 | 2026-10-08 | [ccd129f](https://github.com/kirakein-gif/PLAYVAULT/commit/ccd129f7f574c9fdb1f17d515ba51314280d8058) | ECLIPSE · 회귀 | Replace rift target markers with masonry cracks and visibly drain used wells in v45 |
| 159 | 2026-10-08 | [381cec9](https://github.com/kirakein-gif/PLAYVAULT/commit/381cec901199c83caa5adc1a6b5f0ce78dd3128f) | ECLIPSE · 공용 자산 · 회귀 | Add regional bosses and deeper enemy roster for Eclipse v46 |
| 160 | 2026-10-08 | [0a40541](https://github.com/kirakein-gif/PLAYVAULT/commit/0a40541b7e8b579e807d5c54130381b28dad1af6) | ECLIPSE · 공용 자산 · 회귀 | Add six-frame distance-driven enemy walking for Eclipse v47 |
| 161 | 2026-10-08 | [2c295b4](https://github.com/kirakein-gif/PLAYVAULT/commit/2c295b499700f2a4225654d4560d0fee7dd6072c) | ECLIPSE · 회귀 | Isolate walking sprites and enrich boss impacts for Eclipse v48 |
| 162 | 2026-10-07 | [53e3b89](https://github.com/kirakein-gif/PLAYVAULT/commit/53e3b89f9ecb759742b2aab841b395361449e5d2) | HOLLOW KEEP | Add THE HOLLOW KEEP prototype shell |
| 163 | 2026-10-07 | [9f56d17](https://github.com/kirakein-gif/PLAYVAULT/commit/9f56d17539a908439e21d1207d845d99ee8d871a) | HOLLOW KEEP | Add THE HOLLOW KEEP prototype styles |
| 164 | 2026-10-07 | [5350af8](https://github.com/kirakein-gif/PLAYVAULT/commit/5350af8f6be4542d7b3212cde8575f3aa971d991) | HOLLOW KEEP | Build playable THE HOLLOW KEEP chapter-one prototype |
| 165 | 2026-10-07 | [83adaa7](https://github.com/kirakein-gif/PLAYVAULT/commit/83adaa77a2cf9e82ea9ef6af036deefd541b9055) | HOLLOW KEEP | Add map control to HOLLOW KEEP prototype |
| 166 | 2026-10-07 | [4b09f6a](https://github.com/kirakein-gif/PLAYVAULT/commit/4b09f6ae3745ae8625eff861953d472266b6ea49) | HOLLOW KEEP | Polish companion placement and trace interactions |
| 167 | 2026-10-07 | [cb7c869](https://github.com/kirakein-gif/PLAYVAULT/commit/cb7c8698e1379c290bac5ed2437b8f9d9cc9a0f2) | 플랫폼/문서 | Add THE HOLLOW KEEP to PLAYVAULT home |
| 168 | 2026-10-07 | [cb04d04](https://github.com/kirakein-gif/PLAYVAULT/commit/cb04d04f11bfa6be6b733e294e6d3302fe741a2a) | 공용 자산 · 플랫폼/문서 | Style THE HOLLOW KEEP game card |
| 169 | 2026-10-07 | [bb92e1c](https://github.com/kirakein-gif/PLAYVAULT/commit/bb92e1c58436e14cff88c18cc4e3771c05a6de6c) | 플랫폼/문서 | Document THE HOLLOW KEEP chapter-one prototype |
| 170 | 2026-10-07 | [ba0ffc3](https://github.com/kirakein-gif/PLAYVAULT/commit/ba0ffc39a79f7cf8694ab8397069a9334c9e7886) | HOLLOW KEEP | Fix invisible heroes and stabilize mobile character bodies |
| 171 | 2026-10-07 | [7076f12](https://github.com/kirakein-gif/PLAYVAULT/commit/7076f126ab41fba3cdde55b9ae2fabb99efed67b) | HOLLOW KEEP | Bump HOLLOW KEEP invisible-hero fix cache version |
| 172 | 2026-10-07 | [56d40a9](https://github.com/kirakein-gif/PLAYVAULT/commit/56d40a9f401b6c29938fdccc1d01bd608b1b2a0d) | HOLLOW KEEP | Differentiate Ethan and Noah movement profiles |
| 173 | 2026-10-07 | [cf964e1](https://github.com/kirakein-gif/PLAYVAULT/commit/cf964e1e415073eb85fed7fc58bfc6f4f44be54e) | HOLLOW KEEP | Add buffered jumps, coyote time, swap feedback and attack weight |
| 174 | 2026-10-07 | [9b5e99d](https://github.com/kirakein-gif/PLAYVAULT/commit/9b5e99de07e84e621ed00d49c7e45a4229415030) | HOLLOW KEEP | Add landing, swap and attack visual feedback |
| 175 | 2026-10-07 | [0bae7a0](https://github.com/kirakein-gif/PLAYVAULT/commit/0bae7a0c0dd735f77418eb55ba7fe344999efded) | HOLLOW KEEP | Bump HOLLOW KEEP movement polish cache version |
| 176 | 2026-10-07 | [ac488d6](https://github.com/kirakein-gif/PLAYVAULT/commit/ac488d676497856f29bcd83e14f08dbaa755c31c) | 플랫폼/문서 | Document HOLLOW KEEP movement polish |
| 177 | 2026-10-07 | [69b1390](https://github.com/kirakein-gif/PLAYVAULT/commit/69b1390bcfb5cd5ddc3dd80f2ee19de507139bc7) | HOLLOW KEEP | Add hit reactions and Noah three-step combo |
| 178 | 2026-10-07 | [bbc53cb](https://github.com/kirakein-gif/PLAYVAULT/commit/bbc53cb084b25203415274a4bdef8a92aab169c2) | HOLLOW KEEP | Give early enemies telegraphed attacks and recovery windows |
| 179 | 2026-10-07 | [99ab351](https://github.com/kirakein-gif/PLAYVAULT/commit/99ab351ffdd79d2190d281b7752cb46dbf85fb4d) | HOLLOW KEEP | Render enemy telegraphs and stronger hit feedback |
| 180 | 2026-10-07 | [a080f49](https://github.com/kirakein-gif/PLAYVAULT/commit/a080f4969c075edae30428b45c1449c1e75e4cbf) | HOLLOW KEEP | Bump HOLLOW KEEP combat polish cache version |
| 181 | 2026-10-07 | [03dec4f](https://github.com/kirakein-gif/PLAYVAULT/commit/03dec4fa8e252436c33889367deae4e736ee01ca) | 플랫폼/문서 | Document HOLLOW KEEP combat polish |
| 182 | 2026-10-07 | [3e8fa01](https://github.com/kirakein-gif/PLAYVAULT/commit/3e8fa019a63ad636f2b8dc9164541d4e359790b9) | HOLLOW KEEP | Add readable enemy windups and combat hit effects |
| 183 | 2026-10-07 | [12d355e](https://github.com/kirakein-gif/PLAYVAULT/commit/12d355eb46e111e6825fb294e4338144c7a1917e) | 문서 | Bump HOLLOW KEEP combat polish cache version |
| 184 | 2026-10-07 | [e30623e](https://github.com/kirakein-gif/PLAYVAULT/commit/e30623ea802a5c9ae1b18ffa717187ae751e9a6a) | 문서 | Document HOLLOW KEEP combat polish |
| 185 | 2026-10-07 | [4424a7d](https://github.com/kirakein-gif/PLAYVAULT/commit/4424a7df4ccae1f00e7f7c9401ee8ac54d380a83) | HOLLOW KEEP | Animate distinct Ethan and Noah attack poses |
| 186 | 2026-10-07 | [7e63d67](https://github.com/kirakein-gif/PLAYVAULT/commit/7e63d670cbce8fbaeda13c9c91858f97fe69b523) | HOLLOW KEEP | Bump HOLLOW KEEP attack animation cache version |
| 187 | 2026-10-07 | [cc86685](https://github.com/kirakein-gif/PLAYVAULT/commit/cc866852c1c3b381b6650a7707708aa39bbde822) | 플랫폼/문서 | Document HOLLOW KEEP attack animation pass |
| 188 | 2026-10-07 | [4a3d36e](https://github.com/kirakein-gif/PLAYVAULT/commit/4a3d36eb8ababc834d008914c19f3144f0b5dba0) | HOLLOW KEEP | Add clear recovery beat after Noah third strike |
| 189 | 2026-10-07 | [4350083](https://github.com/kirakein-gif/PLAYVAULT/commit/4350083519b87d09aae379f59643263938878f83) | HOLLOW KEEP | Bump HOLLOW KEEP finisher recovery cache version |
| 190 | 2026-10-07 | [55ecf3e](https://github.com/kirakein-gif/PLAYVAULT/commit/55ecf3e8de2e1077ee124813844a30bf47c57625) | 플랫폼/문서 | Document Noah finisher recovery rhythm |
| 191 | 2026-10-08 | [ee448ac](https://github.com/kirakein-gif/PLAYVAULT/commit/ee448acf63933c96b9480043653a053c9aaff2f0) | HOLLOW KEEP | Finish combat impact with hitstop and differentiated strikes |
| 192 | 2026-10-08 | [4a58bc7](https://github.com/kirakein-gif/PLAYVAULT/commit/4a58bc7148da87a4c36fc736a0ecba87c10c0ae2) | HOLLOW KEEP | Give Ethan a heavier rune-shot cadence and impact |
| 193 | 2026-10-08 | [dfa01b0](https://github.com/kirakein-gif/PLAYVAULT/commit/dfa01b026ceab561082941ab9d1345f64b0031a1) | HOLLOW KEEP | Clarify enemy stagger, tells and recovery windows |
| 194 | 2026-10-08 | [d540689](https://github.com/kirakein-gif/PLAYVAULT/commit/d540689bb8fb26761ecb2bf2d57a67471f48dccf) | HOLLOW KEEP | Shape the opening castle loop with gates and Noah latch |
| 195 | 2026-10-08 | [75a2317](https://github.com/kirakein-gif/PLAYVAULT/commit/75a23170f8b45a950f21bb52a14a913ca3236d18) | HOLLOW KEEP | Release HOLLOW KEEP v8 sprite and backdrop pass |
| 196 | 2026-10-08 | [985d589](https://github.com/kirakein-gif/PLAYVAULT/commit/985d5898ec450b9b7135f161e0e93f7b74c842fe) | 병합(두 부모 확인) | Merge remote-tracking branch 'origin/main' into polish/eclipse-art-audio |
| 197 | 2026-10-08 | [86fd346](https://github.com/kirakein-gif/PLAYVAULT/commit/86fd34649fd31a58953b364cc97e361dcd691fcd) | ECLIPSE · 회귀 | Verify sprite isolation and soften steel strike trails |
| 198 | 2026-10-14 | [42e1420](https://github.com/kirakein-gif/PLAYVAULT/commit/42e14202c121472e33b538bb2ceaac80c2be58eb) | ECLIPSE · 회귀 | Separate Ethan melee charge and Noah ranged evasive roll for Eclipse v49 |
| 199 | 2026-10-08 | [592570a](https://github.com/kirakein-gif/PLAYVAULT/commit/592570a6080f08db9b62168a4a4698d710e9f4a9) | HOLLOW KEEP | Sharpen Hollow Keep mobile rendering |
| 200 | 2026-10-08 | [706d627](https://github.com/kirakein-gif/PLAYVAULT/commit/706d627d51b0aa7ed317c7f66ab56b6e511de605) | HOLLOW KEEP | Make HOLLOW KEEP mobile landscape-first |
| 201 | 2026-10-08 | [aee3a14](https://github.com/kirakein-gif/PLAYVAULT/commit/aee3a14518593df864ce93fb2f4d11ccb5751356) | HOLLOW KEEP | Add landscape mobile layout and rotate gate |
| 202 | 2026-10-08 | [59bf206](https://github.com/kirakein-gif/PLAYVAULT/commit/59bf206f9b71e5fe885a2a6af262045707780468) | HOLLOW KEEP | Request fullscreen landscape mode on mobile |
| 203 | 2026-10-08 | [d5096e6](https://github.com/kirakein-gif/PLAYVAULT/commit/d5096e652d80bd8b412875f11b4f9971dda9285c) | HOLLOW KEEP | Make mobile landscape mandatory |
| 204 | 2026-10-08 | [b6f22f3](https://github.com/kirakein-gif/PLAYVAULT/commit/b6f22f3fe5afbb28928045cbb170ecc175cebf10) | HOLLOW KEEP | Hard block portrait gameplay on mobile |
| 205 | 2026-10-08 | [c751cc6](https://github.com/kirakein-gif/PLAYVAULT/commit/c751cc63ccb0518a414f984aee4a1071d1f0e523) | HOLLOW KEEP | Enforce landscape-only mobile gameplay |
| 206 | 2026-10-08 | [e56a45b](https://github.com/kirakein-gif/PLAYVAULT/commit/e56a45b067c9cba5f3fa966cf9d319ba7ae3a2de) | HOLLOW KEEP | feat(hollow-keep): build first playable area |
| 207 | 2026-10-08 | [cabbe8c](https://github.com/kirakein-gif/PLAYVAULT/commit/cabbe8cdc8b4e5d8afb4a8319a1946c22602efde) | HOLLOW KEEP | feat(hollow-keep): build first playable area |
| 208 | 2026-10-08 | [a9d357f](https://github.com/kirakein-gif/PLAYVAULT/commit/a9d357f10088dad1ac67a08b8c026be1a9b52a22) | HOLLOW KEEP | feat(hollow-keep): build first playable area |
| 209 | 2026-10-08 | [60a9f8d](https://github.com/kirakein-gif/PLAYVAULT/commit/60a9f8d0119926abfe443890dce3e93b841aac68) | HOLLOW KEEP | fix(hollow-keep): add bell warden return lift |
| 210 | 2026-10-08 | [9fec3ae](https://github.com/kirakein-gif/PLAYVAULT/commit/9fec3aeed6e9dbaa2ecbee6f86cee32d6d9c64a5) | HOLLOW KEEP | feat(hollow-keep): add title screen key visual |
| 211 | 2026-10-08 | [5c99507](https://github.com/kirakein-gif/PLAYVAULT/commit/5c995077ad6cbbcdc508b3617c3643b524930ac8) | HOLLOW KEEP | feat(hollow-keep): show playable heroes on title |
| 212 | 2026-10-08 | [e4e2661](https://github.com/kirakein-gif/PLAYVAULT/commit/e4e26619fa548ae980592609f071e26935c6681f) | HOLLOW KEEP | feat(hollow-keep): add hd title heroes |
| 213 | 2026-10-08 | [1911abd](https://github.com/kirakein-gif/PLAYVAULT/commit/1911abdf3575d2196929bcd3af7f76e183d14095) | HOLLOW KEEP | feat(hollow-keep): upgrade title heroes to high-res key art |
| 214 | 2026-10-08 | [d9a9859](https://github.com/kirakein-gif/PLAYVAULT/commit/d9a9859063204cb5a770a5ad47fd2eb4f74a0e83) | HOLLOW KEEP | feat(hollow-keep): extend gothic key art across stage and foes |
| 215 | 2026-10-14 | [f1b355b](https://github.com/kirakein-gif/PLAYVAULT/commit/f1b355b748fee885ab113c42fa1134aceab34e27) | 병합(두 부모 확인) | Merge remote-tracking branch 'origin/main' into polish/eclipse-art-audio |
| 216 | 2026-10-14 | [c5a1d2c](https://github.com/kirakein-gif/PLAYVAULT/commit/c5a1d2c46d15a09c705714bc1cc9a987054cd79f) | ECLIPSE · 공용 자산 · 회귀 | Animate coherent Ethan sword swings and short invulnerable body charge for Eclipse v50 |
| 217 | 2026-10-14 | [bfe5eb4](https://github.com/kirakein-gif/PLAYVAULT/commit/bfe5eb4b5f64713f19a806073417d470af633308) | ECLIPSE · 회귀 | Calibrate Ethan combat scale, add golden charge ward and role-specific relic effects for v51 |
| 218 | 2026-10-14 | [c4ecaa2](https://github.com/kirakein-gif/PLAYVAULT/commit/c4ecaa2bfa1a09cd83395fccfe23ae08ded266a9) | ECLIPSE · 회귀 | Improve combat materials, role growth and asset readiness for Eclipse v52 |
| 219 | 2026-10-15 | [b3c053e](https://github.com/kirakein-gif/PLAYVAULT/commit/b3c053e40f16002e57d60372e9ef2b2a221ee361) | ECLIPSE · 회귀 | Isolate every enemy and boss pose from neighboring sprite fragments for v53 |
| 220 | 2026-10-15 | [e6f2631](https://github.com/kirakein-gif/PLAYVAULT/commit/e6f26317e161b8e3a0c0176dda83d4dbffa22a44) | ECLIPSE · 회귀 | Stage boss summons before combat and soften walk transitions for v54 |
| 221 | 2026-10-15 | [07d2822](https://github.com/kirakein-gif/PLAYVAULT/commit/07d28226071d6bdea3618ecc6a5ba546a6aaea3d) | ECLIPSE · 회귀 | Improve depth XP rewards and add role-labelled double upgrades for v55 |
| 222 | 2026-10-15 | [5c47cf2](https://github.com/kirakein-gif/PLAYVAULT/commit/5c47cf2e8a97f9a53d1598b8551967c8786287a8) | ECLIPSE · 회귀 | Show minimap passages and door locks, synchronize magma danger phases for v56 |
| 223 | 2026-10-15 | [ee02f20](https://github.com/kirakein-gif/PLAYVAULT/commit/ee02f20d7df3cb74b110b229aae5f0b9878667f1) | ECLIPSE · 회귀 | Fix relic panel placement and preserve enemy attacks on hit |
| 224 | 2026-10-15 | [c24205c](https://github.com/kirakein-gif/PLAYVAULT/commit/c24205c63e0bd87dd412c3c67a26ef27daa65a3e) | ECLIPSE · 회귀 | Preserve idle stagger while preventing enemy attack cancellation |
| 225 | 2026-10-15 | [9d4aaad](https://github.com/kirakein-gif/PLAYVAULT/commit/9d4aaad85d503ad24e5ded115e23239b5902bf2f) | ECLIPSE | Restore compact minimap with short passage links |
| 226 | 2026-10-15 | [8ce4d02](https://github.com/kirakein-gif/PLAYVAULT/commit/8ce4d0257ab46b9f67f1aa0840868521f22a7e75) | ECLIPSE · 회귀 | Scale enemy and boss rush reach with dungeon depth |
| 227 | 2026-10-19 | [ebf5ae4](https://github.com/kirakein-gif/PLAYVAULT/commit/ebf5ae461ed7cc459a34155c1f5fa1bccbe82c40) | WGG | feat(worlds-greatest-game): import original v0.1 playable prototype |
| 228 | 2026-10-19 | [65e56dd](https://github.com/kirakein-gif/PLAYVAULT/commit/65e56dd280369524d028c8d5776f0e34305f5539) | WGG | docs(worlds-greatest-game): add README.md |
| 229 | 2026-10-19 | [8f7723a](https://github.com/kirakein-gif/PLAYVAULT/commit/8f7723a82195dd42a67f877cf3d2b48a5cebbf86) | WGG | docs(worlds-greatest-game): add docs/GAME_DESIGN.md |
| 230 | 2026-10-19 | [e6e60ae](https://github.com/kirakein-gif/PLAYVAULT/commit/e6e60ae48efd8f9941ed81b6770704b0b7171b6a) | WGG | docs(worlds-greatest-game): add docs/VISUAL_STYLE.md |
| 231 | 2026-10-19 | [dbeb112](https://github.com/kirakein-gif/PLAYVAULT/commit/dbeb112a7715b71722b24bcc81b650fc22ee304c) | WGG | docs(worlds-greatest-game): add docs/COMBAT_AND_INPUT.md |
| 232 | 2026-10-19 | [4496834](https://github.com/kirakein-gif/PLAYVAULT/commit/4496834d1f5aff355f429b5a7082ec9d6a577f1e) | WGG | docs(worlds-greatest-game): add docs/ROADMAP.md |
| 233 | 2026-10-19 | [41f7517](https://github.com/kirakein-gif/PLAYVAULT/commit/41f7517a24822f73c9b0732996bb78661e47a284) | WGG | docs(worlds-greatest-game): add docs/CODEX_HANDOFF.md |

#### codex/wgg-action-prototype 추가 20커밋(main 미병합)

| 순서 | 날짜(KST) | 커밋 | 변경 경로 분류 | 원문 제목 |
| --- | --- | --- | --- | --- |
| 1 | 2026-10-19 | [453ff43](https://github.com/kirakein-gif/PLAYVAULT/commit/453ff43bf3b8bfa15f8e49fca99e5ae562a8e938) | WGG | docs(wgg): analyze baseline and plan action prototype |
| 2 | 2026-10-19 | [046491f](https://github.com/kirakein-gif/PLAYVAULT/commit/046491f4f2c3630f75bc0ae53080554624754e70) | WGG | feat(wgg): add over-shoulder arena and concealed RPS reveal |
| 3 | 2026-10-19 | [d955860](https://github.com/kirakein-gif/PLAYVAULT/commit/d955860511d7dddcae19d887f185ce85299b92ad) | WGG | feat(wgg): implement pointer grab swing equip and arm IK |
| 4 | 2026-10-19 | [b47ef45](https://github.com/kirakein-gif/PLAYVAULT/commit/b47ef454e29042caabd9528d703cfc786450b931) | WGG | feat(wgg): enforce tool fouls AI timing and three-point rounds |
| 5 | 2026-10-19 | [09bec29](https://github.com/kirakein-gif/PLAYVAULT/commit/09bec29ba76e324fc503e7e7b51333207bbf1320) | WGG | feat(wgg): add impact freeze recoil distinct audio and motion options |
| 6 | 2026-10-19 | [761315f](https://github.com/kirakein-gif/PLAYVAULT/commit/761315f1d12b1170be6e4d3419eee8f8a624cafc) | WGG | test(wgg): verify direct input and document prototype playtest |
| 7 | 2026-10-19 | [5f4412d](https://github.com/kirakein-gif/PLAYVAULT/commit/5f4412d030f0fc25ef1374691e73755730fb280e) | WGG | fix(wgg): tighten duel framing constrain both arms and enable immediate actions |
| 8 | 2026-10-19 | [fdf1331](https://github.com/kirakein-gif/PLAYVAULT/commit/fdf1331ade2cc3fa20cb2dd97276832c328c8d7d) | WGG | fix(wgg): unify active arm and stage props on shared duel table |
| 9 | 2026-10-19 | [ebcdfb7](https://github.com/kirakein-gif/PLAYVAULT/commit/ebcdfb7de1e2881f688b6a27fda5de304cf0fd18) | WGG | fix(wgg): compose diagonal table duel from behind player |
| 10 | 2026-10-19 | [60f6cac](https://github.com/kirakein-gif/PLAYVAULT/commit/60f6cacfabfcdee0663b51b7a759047c3af4445c) | WGG | fix(wgg): turn shared table broadside without moving actors |
| 11 | 2026-10-19 | [103203a](https://github.com/kirakein-gif/PLAYVAULT/commit/103203a94d6d9bad50276e08759eb1be499b4f83) | WGG | feat(wgg): apply approved A illustration layers and projected action poses |
| 12 | 2026-10-19 | [0404015](https://github.com/kirakein-gif/PLAYVAULT/commit/0404015704cbb24e31e2a1da95641985280a8b41) | WGG | fix(wgg): keep opponent neck connected through impact |
| 13 | 2026-10-19 | [aa85a53](https://github.com/kirakein-gif/PLAYVAULT/commit/aa85a53fe5149e71c4a8a51cd20f5f952ac5febe) | WGG | fix(wgg): scale arms and hands to character proportions |
| 14 | 2026-10-19 | [4ed6f46](https://github.com/kirakein-gif/PLAYVAULT/commit/4ed6f462310b62e218e63b2fb72412346a821940) | WGG | fix(wgg): lower table and extend RPS toward opponent |
| 15 | 2026-10-19 | [3712387](https://github.com/kirakein-gif/PLAYVAULT/commit/3712387e8ba67c1f8abb2cfc35e2ac72650530bb) | WGG | feat(wgg): apply approved right-hand RPS actor poses |
| 16 | 2026-10-19 | [b09a052](https://github.com/kirakein-gif/PLAYVAULT/commit/b09a05213275b65231b9f9c05376abfaa76cb2d2) | WGG | feat(wgg): connect right-arm tool pickup, swing and pot wear |
| 17 | 2026-10-19 | [0071bd3](https://github.com/kirakein-gif/PLAYVAULT/commit/0071bd33c83b69f62d07415370eb8e8c4614b606) | WGG | Use complete still poses for hammer and pot actions; resize tabletop props |
| 18 | 2026-10-19 | [dfc75d0](https://github.com/kirakein-gif/PLAYVAULT/commit/dfc75d03bf96ecc24683cc128ca5ff63df8f0680) | WGG | Aim mallet strikes at crowns and replace points with energy bars |
| 19 | 2026-10-19 | [b5c3c5b](https://github.com/kirakein-gif/PLAYVAULT/commit/b5c3c5b8b8510b0d029b70b62482d480405f0804) | WGG | Add repeating 3-2-1 rounds with queued hands and visual QA fixes |
| 20 | 2026-10-19 | [e7b28cf](https://github.com/kirakein-gif/PLAYVAULT/commit/e7b28cfc1ce4e595cc7e8abfc6f55845543ca795) | WGG | Level the table horizontally and remove strike camera zoom |

### 2026-10-31 (Asia/Seoul) · 이력 복원 원격 제출 및 최종 인계

- 담당/대상: Codex / 공통 관리 문서 5개 검토·갱신 완료. 게임 버전/소스/자산 변경 없음.
- 커밋: [`56ae994`](https://github.com/kirakein-gif/PLAYVAULT/commit/56ae994) — 전체 이력 복원 보강, 기존 `docs/ai-collaboration-handoff` 브랜치에 푸시 성공. 이 최종 기록도 같은 브랜치에 제출한다.
- 검증 결과: 위 복원 항목의 문서·커밋·색인·보존·변경 범위 검사 모두 통과. 이번 최종 변경은 STATUS/WORK_LOG의 제출 상태뿐이며 `git diff --check`와 링크 검사를 확인한다.
- PR 제출: 완성된 PR 본문으로 `gh pr create`를 실행했으나 `Post https://api.github.com/graphql: Forbidden`으로 실패. PR 생성은 확인되지 않았고 유효한 PR 번호/주소가 없다. 기본 브랜치 병합·배포 없음.
- 다음 AI/사용자: `api.github.com` 허용 적용 후 기존 PR을 조회하고 제출한다. API 인증의 실제 가용성은 접근 차단 해소 전 확인 불가이며 토큰을 임의 요구/교체하지 않는다. [비교·PR 작성 화면](https://github.com/kirakein-gif/PLAYVAULT/compare/main...docs/ai-collaboration-handoff?expand=1)은 생성된 PR 주소가 아니다.
- 확인 불가: 과거 정확한 담당 AI·요청 전문·모든 버전의 실제 테스트/출시·PC 로컬 작업. 다음 기능 작업 전 담당과 대상 브랜치를 확인하고 5개 문서 지속 갱신 규칙을 따른다.
- 종료 상태: 문서와 원격 브랜치 준비 완료, PR 제출은 API 네트워크 차단. 다음 담당 확인 불가.

### 2026-10-31 (Asia/Seoul) · Claude Code 관리 문서 대안(PR #1) 작성과 종료 — 사후 이관 기록

- 담당 AI: Claude Code. 이 항목은 PR #1에만 있던 기록을 PR #2 형식으로 옮긴 것이다.
- 대상: 공통 관리 문서. 게임 코드·자산 변경 없음.
- 기준 / 브랜치: main `41f7517` / `claude/playvault-ai-collaboration-system-3ia07z`.
- 버전: 모든 게임 변경 없음.
- 목적·배경: 사용자가 AI 공동 개발 규칙 구축을 요청. 같은 요청을 다른 도구가 동시에 처리해 PR #2가 생겼고, 두 PR이 같은 파일(`AGENTS.md`, `CLAUDE.md`, `CHANGELOG.md`, `docs/STATUS.md`, `docs/WORK_LOG.md`, `README.md`)을 각각 만들어 충돌했다.
- 변경: PR #1에서 관리 문서 6종 작성, 이어서 사용자 승인으로 역할 분담 규칙과 WORK_LOG 평가 칸(검토 발견 문제 수·재요청 횟수)을 추가.
- 테스트: 문서 작업. `git diff --check` 통과. ABYSSFALL Node 회귀 3종을 main `41f7517`에서 실행해 통과.
- Git/PR: [PR #1](https://github.com/kirakein-gif/PLAYVAULT/pull/1) 커밋 `1efb63a`, `e31bf75`, `95f1bff`. GitHub 쓰기 권한 문제로 첫 푸시가 403으로 실패했다가 사용자 권한 승인 후 제출됨.
- 결과: 사용자가 PR #2 문서 채택을 승인하여 PR #1은 병합하지 않고 닫는다. PR #1에만 있던 역할 분담 규칙, WORK_LOG 평가 칸, 작업 이력은 이번 이관 PR에서 PR #2 형식으로 옮긴다.
- 검토 담당 / 발견 문제 수: 사용자 / 해당 없음(PR #2 채택으로 종료).
- 사용자 재요청 횟수: 0회.
- 종료 상태: PR #1 종료, 내용 이관.

### 2026-10-31 (Asia/Seoul) · THE HOLLOW KEEP 방향·기준선 분석·기반 규격·인수 테스트

- 담당 AI: Claude Code(규격·검증 기준). 구현 담당: Codex.
- 대상: `games/the-hollow-keep/docs/`, `games/the-hollow-keep/next/tests/` 새 파일. 기존 게임 파일 변경 없음.
- 기준 / 브랜치: main `41f7517` / `claude/hollow-keep-foundation-spec`.
- 버전: 변경 없음(새 기반의 번호 체계는 사용자 결정 사항).
- 목적·배경: 사용자가 역할 분담 시범 대상으로 THE HOLLOW KEEP을 지정. 방향: 마성전설2의 **플레이 감각**을 장르 수준에서 참고(원작의 맵·캐릭터·스프라이트·음악 등은 복제하지 않음), 고딕 아트, 처음부터 재구축, 1단계는 설정·이동·무기·움직임 확인.
- 변경:
  - `DESIGN_DIRECTION.md` — 확정 방향, 참고 범위, 미정 사항
  - `BASELINE_ANALYSIS.md` — 기존 구현의 구조 문제(로직·DOM 결합, 가변 시간 간격)와 이동·무기 기준 수치
  - `FOUNDATION_SPEC.md` — `next/` 새 기반, 고정 1/60 틱, DOM 없는 `sim.js` 계약, 시험 방·디버그 패널
  - `CODEX_TASK_01.md` — Codex 지시문
  - `next/tests/foundation-contract.cjs` — 인수 테스트 40개
- 테스트: 저장소 밖 임시 참조 구현(커밋 안 함)으로 40/40 통과. 결함을 넣은 변형 4종(방향 미갱신, 자동 연사, 다중 피격, 비결정성)이 실패로 검출됨을 확인.
- Git/PR: [PR #3](https://github.com/kirakein-gif/PLAYVAULT/pull/3), 커밋 `bcf7a09`.
- 검토 담당 / 발견 문제 수: Codex가 구현하며 규격 사용(규격 결함 보고 없음).
- 사용자 재요청 횟수: 0회.
- 종료 상태: 규격 제출, Codex 구현으로 인계(PR #4).

### 2026-10-31 (Asia/Seoul) · PR #4 교차 검토와 사용자 결정 반영

- 담당 AI: Claude Code(검토). 구현 담당: Codex.
- 대상: PR #4 `codex/hollow-keep-foundation` head `766630e`. 검토 담당은 구현 브랜치를 수정하지 않음.
- 버전: 변경 없음.
- 테스트(Claude Code 환경에서 재실행): 인수 40/40, Codex 경계 7/7, 브라우저 14/14(`CHROMIUM_PATH=/opt/pw-browsers/chromium`), ABYSSFALL 회귀 3종 통과. 추가로 시뮬레이션 전수 측정과 화면 캡처 확인.
- 발견 문제 **3건**(수정 요청):
  1. Noah가 벽에 붙으면 Ethan으로 교대 불가 — 몸 폭 차이(42/39px)로 중심 기준 후보가 벽과 1.5px 겹쳐 `swapBlocked`
  2. 시험 방의 145px 구덩이는 Ethan이 어떤 타이밍으로도 건널 수 없음(최대 수평 점프 약 91px) — 규격 권장과 다르고, Ethan으로 오른쪽 구역을 시험할 수 없음
  3. 모바일 가로 화면에서 터치 버튼이 플레이 영역 아래쪽을 덮어 시작 위치의 주인공이 가려짐
- 사용자 결정(2026-10-31): **룬탄은 관통하지 않음**(첫 명중 시 소멸, 기존 구현과 같음). **Noah 3단 콤보는 나중에 진행**. 공중 감속은 시험 방에서 판단(미정).
- 결정 반영: PR #3에 결정 사항과 "투사체 첫 명중 후 소멸" 인수 테스트 1개 추가(커밋 `c6a31bf`, 총 41개). 임시 참조 구현에서 41/41, PR #4 head `766630e`에서는 이 항목만 실패(현재 관통 구현이므로 예상 결과).
- Git/PR: [PR #4 리뷰](https://github.com/kirakein-gif/PLAYVAULT/pull/4) (COMMENT, 승인 아님).
- 검토 담당 / 발견 문제 수: Claude Code / 3건(+ 사용자 결정에 따른 동작 변경 1건: 관통 제거).
- 사용자 재요청 횟수: 0회.
- 다음: Codex가 PR #3의 최신 커밋을 받아 문제 3건과 관통 제거를 수정하고, 인수 41/41을 확인한 뒤 같은 PR에 푸시. Claude Code가 재검토.
- 종료 상태: 수정 대기(Codex).

### 2026-10-31 (Asia/Seoul) · PR #1 내용을 PR #2 문서로 이관

- 담당 AI: Claude Code. 사용자 지시: "PR #1 닫고 PR #2로 옮기기".
- 대상: `AGENTS.md`, `CLAUDE.md`, `docs/WORK_LOG.md`. 게임 코드·자산 변경 없음.
- 기준 / 브랜치: `docs/ai-collaboration-handoff` `86f28ec` / `claude/port-pr1-into-pr2`(PR #2 브랜치 대상 PR).
- 버전: 변경 없음.
- 변경:
  - `AGENTS.md` — "역할 분담(시범 운영)" 절 추가(PR #1의 §9 내용을 PR #2 문체로 정리, 인수 테스트 약화 금지 포함)
  - `CLAUDE.md` — Claude Code 환경 전용 사항 4줄 추가(공통 규칙은 복제하지 않음)
  - `docs/WORK_LOG.md` — 양식에 "검토 담당 / 발견 문제 수", "사용자 재요청 횟수" 추가, PR #1 이력과 THE HOLLOW KEEP 규격·검토 기록을 이 형식으로 추가
  - `docs/STATUS.md`, `CHANGELOG.md` — 검토만 하고 변경하지 않음. PR #4가 STATUS를 크게 수정 중이어서 충돌을 피함. THE HOLLOW KEEP 현황·결정 반영은 PR #4 수정 시 Codex가 갱신
- 테스트: `git diff --check` 통과, 변경 경로 3개 한정 확인.
- 병합 시 주의: PR #4도 이 WORK_LOG의 같은 위치(파일 끝)에 항목을 추가했으므로, 둘 중 나중에 병합되는 쪽에서 WORK_LOG 충돌이 난다. 두 항목을 모두 남기고 시간순(Codex PR #4 구현 → Claude Code 검토)으로 정렬하면 된다.
- 검토 담당 / 발견 문제 수: 사용자 검토 대기.
- 사용자 재요청 횟수: 0회.
- 종료 상태: 이관 PR 제출, PR #1 종료.

### 2026-10-31 (Asia/Seoul) · PR #4 재검토(수정 4건 확인)

- 담당 AI: Claude Code(검토). 구현 담당: Codex. 검토 담당은 구현 브랜치를 수정하지 않음.
- 대상: PR #4 `codex/hollow-keep-foundation` head `229a50c`.
- 버전: 변경 없음.
- 규칙 준수 확인: 원본 인수 테스트와 규격 문서 4종이 `c6a31bf`와 파일 내용 동일(cherry-pick `9f862bc`). `main` 대비 기존 게임 파일·루트 런처·공용 자산·다른 게임 변경 없음. 3단 콤보 미추가, 공중 감속 유지(사용자 결정과 일치).
- 테스트(Claude Code 환경 재실행): 인수 41/41, 경계 12/12, 구덩이 4/4, 브라우저 15/15, ABYSSFALL 회귀 3종 통과.
- 독립 확인:
  - 벽 교대: 1차 재현 스크립트로 Noah 벽 밀착 → Ethan 교대 성공
  - 85px 구덩이: 점프 시점 전수 측정 — Ethan 59개 시점 통과·착지 x=543(약 12px 걸침), Noah 74개 시점·착지 x=630
  - 모바일: 시작 화면 주인공 노출 확인
  - 룬탄: 가까운 표적만 피해(978/1000)
- 개선 제안(차단 아님): 모바일 캔버스가 가로 폭의 약 절반으로 작아 라벨이 작음(버튼 좌우 배치 제안), 상단 안내 문구 줄바꿈.
- 미확인: Cloudflare 미리보기(`https://codex-hollow-keep-foundation.kirakein-playvault.pages.dev/games/the-hollow-keep/next/`)는 이 환경 네트워크 정책으로 접속 불가. 실기기·Safari/Firefox·손맛 평가 미확인.
- Git/PR: [PR #4 재검토 리뷰](https://github.com/kirakein-gif/PLAYVAULT/pull/4) (COMMENT).
- 검토 담당 / 발견 문제 수: Claude Code / 신규 0건(개선 제안 2건). 1차 3건 + 결정 반영 1건 모두 해결.
- 사용자 재요청 횟수: 0회.
- 다음: 사용자가 시험 방에서 손맛·공중 감속 판단, PR #5 → #2 → #3 → #4 순 병합 결정.
- 종료 상태: 재검토 완료, 사용자 판단 대기.

### 2026-10-31 (Asia/Seoul) · THE HOLLOW KEEP 모바일 화면 크기 — 사용자 실기기 발견과 기준 추가

- 담당 AI: Claude Code(기준·검사 작성). 구현 담당: Codex.
- 배경: 사용자가 Cloudflare 미리보기(`codex-hollow-keep-foundation.kirakein-playvault.pages.dev`)를 실제 휴대전화로 열어 "너무 작아 확인 불가"를 보고. 측정 결과 PR #4 `229a50c`에서 780×330 기준 캔버스 293×165(원래 크기의 31%). 원인: 상단 제목줄 52px + 캔버스 아래 버튼 줄 69px + 실제 브라우저 주소창.
- **검토 누락 기록**: Claude Code는 PR #4 재검토에서 "캔버스가 가로 폭의 약 절반"을 보고도 선택 제안으로 분류했고, 크기 기준과 실기기에 가까운 낮은 화면(740×320, 780×330) 검사를 두지 않았다. 사용자가 발견한 문제로 집계한다.
- 변경(PR #3 `fa33f01`): `FOUNDATION_SPEC.md` §7-1 모바일 가로 배치 기준, `next/tests/mobile-layout.cjs`(4개 화면 × 5항목 = 20개 검사).
- 테스트: PR #4 `229a50c`에서 12/20(캔버스 크기 4개 화면 모두 실패, 방 초기화 버튼 32px 실패). 임시 CSS(커밋 안 함)로 좌우 여백 배치를 적용하면 20/20 통과 — 달성 가능 확인.
- Git/PR: PR #3 `fa33f01`, [PR #4 수정 요청 댓글](https://github.com/kirakein-gif/PLAYVAULT/pull/4).
- 검토 담당 / 발견 문제 수: Claude Code 검토 누락 1건(사용자 발견).
- 사용자 재요청 횟수: 0회(새 문제 보고).
- 다음: Codex가 `fa33f01`을 반영하고 좌우 여백 배치로 수정, mobile-layout 20/20 확인 후 같은 PR에 푸시. Claude Code 재검토 시 실제 휴대전화와 비슷한 화면 크기 캡처를 함께 확인.
- 종료 상태: 수정 대기(Codex).

### 2026-10-31 (Asia/Seoul) · THE HOLLOW KEEP 모바일 가로 전체 화면 기준 추가

- 담당 AI: Claude Code(기준·검사 작성). 구현 담당: Codex.
- 배경: 사용자 요청 "모바일에선 가로 모드에 풀스크린이 가능하게". 브라우저 주소창·상태바가 차지하는 세로 공간 문제(앞 항목)와 연결.
- 변경(PR #3 `44bd915`): `FOUNDATION_SPEC.md` §7-2(가로 화면 전체 화면 버튼, 세로 회전 안내 안의 전체 화면 버튼, 사용자 조작 시 `requestFullscreen` + `screen.orientation.lock('landscape')`, 거절·미지원 시 오류 없음, 자동 진입 금지), `next/tests/mobile-fullscreen.cjs` 6개 검사. §7-1의 전체 화면 "권장"을 §7-2 "필수"로 변경.
- 테스트: PR #4 `229a50c`에서 1/6(버튼 없음). 임시 구현(커밋 안 함)에서 6/6, 배치 검사 20/20 동시 통과. 결함 변형 2종(가로 고정 요청 누락, 거절 미처리) 검출 확인. headless에서는 실제 회전 불가 — 실기기 확인 필요.
- Git/PR: PR #3 `44bd915`, [PR #4 수정 요청 댓글](https://github.com/kirakein-gif/PLAYVAULT/pull/4).
- 검토 담당 / 발견 문제 수: 해당 없음(신규 요구).
- 사용자 재요청 횟수: 0회.
- 다음: Codex가 `fa33f01`·`44bd915` 반영 후 배치·전체 화면을 구현, 같은 PR에 푸시. Claude Code 재검토, 사용자 실기기 확인.
- 종료 상태: 수정 대기(Codex).

### 2026-10-31 (Asia/Seoul) · PR #4 재검토(모바일 배치·가로 전체 화면)

- 담당 AI: Claude Code(검토). 구현 담당: Codex. 검토 담당은 구현 브랜치를 수정하지 않음.
- 대상: PR #4 head `9b39ace`.
- 버전: 변경 없음.
- 규칙 준수: 검사 원본 3종·규격 문서가 `44bd915`와 파일 내용 동일(cherry-pick `462f363`, `d304724`). `main` 대비 기존 게임·공용 영역 변경 없음.
- 테스트(Claude Code 환경, `git archive` head를 로컬 서버로 실행): 인수 41/41, 경계 12/12, 구덩이 4/4, 모바일 배치 20/20, 모바일 전체 화면 6/6, 브라우저 18/18, ABYSSFALL 회귀 3종 통과.
- 화면 확인: 780×330에서 캔버스가 세로를 채움(587px, 이전 293px). 왼쪽 위 도구·왼쪽 아래 조이스틱·오른쪽 동작 버튼 배치, 겹침 없음. 세로 화면 회전 안내에 "가로 전체 화면" 버튼.
- 발견 문제: **경미 1건(차단 아님)** — 조이스틱을 누른 채 `resize`/`fullscreenchange`가 일어나면 `input.clear()`로 조이스틱 포인터가 해제되어, 손을 뗐다가 다시 누를 때까지 이동이 멈춤(CDP 터치로 재현).
- Git/PR: [PR #4 재검토 리뷰](https://github.com/kirakein-gif/PLAYVAULT/pull/4) (COMMENT).
- 검토 담당 / 발견 문제 수: Claude Code / 경미 1건.
- 사용자 재요청 횟수: 0회.
- 미확인: 실제 가로 회전, 전체 화면에서 주소창 사라짐, 조이스틱 이동 폭(약 28px) 손맛 — 사용자 실기기 확인 필요.
- 종료 상태: 재검토 완료, 사용자 실기기 확인 대기.

### 2026-10-31 (Asia/Seoul) · THE HOLLOW KEEP 사용자 실기기 확인과 공중 조작 기준 추가

- 담당 AI: Claude Code(기준·검사 작성). 구현 담당: Codex.
- 사용자 실기기 확인(PR #4 `9b39ace` 미리보기): 시험 방 크기·배치 "적당함". 공중에서 키를 떼면 수직 낙하 — 유지 승인.
- 사용자 결정: 점프 중 좌우 조작은 의도. 단 **처음부터 앞으로 뛴 점프와 제자리 점프 후 앞으로 간 것은 다르게 표현**.
- 측정(`9b39ace`): 제자리 점프 후 앞으로 누르면 공중에서 `runSpeed`까지 가속 → 달리며 뛴 점프 거리의 85%(Ethan)·95%(Noah)로 거의 같음.
- 해석(사용자에게 알림): ① 속도 — 도약 속도 유지 vs `airControlSpeed` 제한, ② 표시 — `jumpKind`(running/standing)에 따른 자세 구분(임시 도형은 기울기, 정식 그림은 아트 단계).
- 변경(PR #3 `6ce2654`): `FOUNDATION_SPEC.md` §4-1 공중 조작 규칙, CONFIG `airControlSpeed`, `getPlayer().jumpKind`; `DESIGN_DIRECTION.md` 결정 표 갱신; `foundation-contract.cjs` 공중 조작 10개 추가(총 51).
- 테스트: 임시 참조 구현(커밋 안 함) 51/51. PR #4 `9b39ace`는 7개 실패(새 CONFIG·jumpKind 없음), 달리며 뛴 점프 속도 유지·수직 낙하는 통과.
- Git/PR: PR #3 `6ce2654`, [PR #4 요청 댓글](https://github.com/kirakein-gif/PLAYVAULT/pull/4).
- 검토 담당 / 발견 문제 수: 해당 없음(사용자 결정에 따른 신규 요구).
- 사용자 재요청 횟수: 0회.
- 다음: Codex가 §4-1 구현(경미 1건 조이스틱 resize 함께 권장), 인수 51/51 확인 후 같은 PR에 푸시. Claude Code 재검토, 사용자 시험 방에서 `airControlSpeed` 수치 판단.
- 종료 상태: 수정 대기(Codex).

### 2026-10-31 (Asia/Seoul) · PR #4 재검토(공중 조작·조이스틱 유지)

- 담당 AI: Claude Code(검토). 구현 담당: Codex. 검토 담당은 구현 브랜치를 수정하지 않음.
- 대상: PR #4 head `4d6ecc8`.
- 버전: 변경 없음.
- 규칙 준수: 검사 원본 3종·규격 문서가 `6ce2654`와 파일 내용 동일(cherry-pick `805e903`). `main` 대비 기존 게임·공용 영역 변경 없음.
- 테스트(Claude Code 환경, `git archive` head 로컬 서버): 인수 51/51, 경계 16/16, 구덩이 4/4, 모바일 배치 20/20, 전체 화면 6/6, 브라우저 20/20, ABYSSFALL 회귀 3종 통과.
- 독립 측정: 제자리 점프 후 앞으로 이동 거리 / 달리며 뛴 점프 — Ethan 35/91px(38%, 이전 85%), Noah 75/177px(42%, 이전 95%). 초기 `airControlSpeed` = `runSpeed`의 45%(1.33 / 1.73).
- 조이스틱: CDP 터치로 누른 채 크기 변경 시 오른쪽 입력 유지, 손 떼면 해제 확인. (측정 중 두 번 "멈춤"으로 나온 것은 시험 방 벽·발판에 막힌 위치 측정이었으며, 입력 기록으로 다시 확인함 — 검토 쪽 측정 방법 오류.)
- 발견 문제: 신규 0건. 앞선 경미 1건 해결.
- Git/PR: [PR #4 재검토 리뷰](https://github.com/kirakein-gif/PLAYVAULT/pull/4) (COMMENT).
- 검토 담당 / 발견 문제 수: Claude Code / 0건.
- 사용자 재요청 횟수: 0회.
- 미확인: 공중 조작 손맛(사용자 실기기).
- 종료 상태: 재검토 완료, 사용자 손맛 평가·병합 결정 대기.
