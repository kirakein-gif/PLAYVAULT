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

### 2026-10-31 (Asia/Seoul) · THE HOLLOW KEEP 1단계 기반 구현 및 PR #4

- 담당 AI / 인계받은 담당: Codex / 사용자가 PR #3 지시문 실행 및 기존 작업 브랜치 재개를 승인. PR #2 규칙·문서 적용 승인. 다른 AI에게 메시지를 발송하지 않음.
- 검토 담당: **Claude Code / 검토 대기**.
- 작업 대상: `games/the-hollow-keep/next/`와 승인된 관리 문서. 기존 게임·루트 런처·공용 자산·다른 게임·원본 인수 테스트는 수정하지 않음.
- 기준: 규격 `claude/hollow-keep-foundation-spec`의 `bcf7a09018cf1141290d99fd80ec008f5f565b43`, 재개 `codex/hollow-keep-foundation`의 `5175afdfdf24987d8965c3dc612501db149a0737`. `git fetch origin --prune`로 전체 원격 브랜치, 열린 PR #1/#2/#3, 실제 기존 게임 소스를 확인. 기존 작업 브랜치 발견 후 사용자의 이어서 진행 승인을 받음. PC 로컬 미푸시 작업은 미확인.
- 수정 전 → 후 버전: 기존 게임·캐시 표기 변경 없음. 새 기반 번호 미정·미부여.
- 목적: 기존 게임과 비교 가능한 고정 1/60 틱 기반을 만들고 사용자 손맛 조정과 Claude Code 독립 검토를 준비.
- 관리 문서: PR #2의 AGENTS/CLAUDE/CHANGELOG/STATUS/WORK_LOG 원문을 보존하여 도입(`5cf5748`)한 뒤 해당 게임 현황·새 이력·변경 내역만 갱신. 5개 문서 검토, AGENTS/CLAUDE 규칙 변경 없음. 루트 README는 읽기만 함.
- 구현 파일: `next/sim.js`(DOM/시계/난수 없는 규칙·CONFIG·snapshot), `input.js`(키보드/멀티터치·프레임 사이 입력 큐·초점 해제), `render.js`(기존 고딕 배경/임시 도형/피해 숫자), `app.js`(누적 고정 틱·최대 8틱·시험 방·CONFIG 조절/복사), `index.html`, `style.css`, `README.md`, 추가 검사 `tests/foundation-edge.cjs`, `tests/browser-playtest.cjs`.
- 원본 테스트: `node games/the-hollow-keep/next/tests/foundation-contract.cjs` **40/40 통과**. 기준 PR #3 대비 원본 파일 diff 없음. 테스트 약화·건너뛰기 없음.
- 추가 검사: `node games/the-hollow-keep/next/tests/foundation-edge.cjs` **7/7 통과**. 버퍼 0 설정의 즉시 점프, 낮은 천장 교대 거절, 교대 시 공격 수명, 고속 탄/얇은 벽, 왼쪽 공격, snapshot/입력 방 데이터 격리, 공중 정지 상한.
- 기존 회귀: `node tests/polish-regression.cjs`, `node tests/audio-regression.cjs`, `node tests/audio-wind-regression.cjs` **3종 통과**. audio 404 로그는 의도적인 실패 경로 테스트. 이 결과는 기존 ECLIPSE 회귀이며 HOLLOW KEEP 전체 플레이 인증은 아님.
- 브라우저: 저장소 루트 로컬 HTTP 서버 + Playwright/시스템 Chromium, PC 1280×900 및 모바일 844×390/DPR2 에뮬레이션. `node games/the-hollow-keep/next/tests/browser-playtest.cjs` **14/14 통과**. 실제 키보드 이동/점프/공격/교대, debug 기본 숨김, 수치 입력/복사·복원, 입력란 포커스 격리, blur, 가로 터치 버튼 크기, CDP 멀티터치 이동+점프, 터치 공격/교대, 세로 정지/가로 복귀, 페이지 오류·자산 실패 없음 확인.
- 발견·수정: 첫 브라우저 실행은 앞 3검사 후 짧은 X 입력이 틱 사이에서 사라져 표적 무피해로 실패. 입력 전환을 틱 큐에 보존하도록 수정 후 동일 검사를 14/14 통과. 스크린샷에서 발견한 터치 버튼 글자 줄바꿈도 수정. 최종 스크린샷 `/tmp/hollow-keep-desktop.png`, `/tmp/hollow-keep-mobile.png` 육안 확인. 브라우저 검사 초안은 최종 체크아웃에서 재실행 가능하도록 포함.
- 수치·범위 차이: 기존 속도/중력/몸 크기/가속/마찰/코요테/버퍼/룬탄을 출발점으로 삼음. 고정 틱 목표 점프 80/145px, 짧은 점프 34/56px, 정지 상한 감속을 적용. Noah는 22 피해/66px 단일 참격이며 기존 3단 콤보·전진·히트스톱·넉백은 미포함(규격의 추가 선택 항목). Ethan의 장거리 관통 룬탄 유지. 발 위치·중심 보존 교대, 공간 부족 시 거절.
- Git/PR: 착수 기록 `5175afd`를 이어 관리 문서 담당 선언 `5cf5748`을 푸시하고 Draft [PR #4](https://github.com/kirakein-gif/PLAYVAULT/pull/4)를 구현 전에 개설. 최종 구현 커밋은 PR head 참조. 완료 후 Ready로 전환하여 검토 요청 상태로 인계. main 대상 diff에는 미병합 PR #2 관리 문서 및 #3 규격/원본 테스트가 포함되며 자동 병합하지 않음.
- 미해결·미확인: 사용자 캐릭터 상세 설정 미제공, 사용자 조작감 평가·실제 휴대전화·Safari/Firefox·장시간 플레이 미확인. 수치를 바꿔도 시험 방 지형은 자동 조정되지 않음. 프레임 지연 초과분은 버리고 렌더 보간은 미구현. 정식 아트/음향·적 AI·방 연결·장치·체력/사망·저장은 범위 밖.
- 다음 AI: PR #4 head에서 원본 인수/추가/기존 회귀를 재실행하고 로컬 HTTP 브라우저 조작으로 독립 검토. 사용자와 점프·무기 거리·교대 감각 평가. PR #2/#3과 관리 문서 중복의 병합 순서 조율.
- 종료 상태: 구현 제출 / **Claude Code / 검토 대기**. 자동 검사 통과를 조작감 완성으로 표현하지 않음. 병합·배포하지 않음.

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

### 2026-10-31 (Asia/Seoul) · PR #4 검토 반영 — 4건 수정

- 담당 AI: Codex / 사용자 요청으로 같은 `codex/hollow-keep-foundation` 브랜치 재개.
- **검토 담당 Claude Code / 발견 문제 3건 + 결정 반영 1건 / 수정 내역**: 아래 1~4 반영, Claude Code 재검토 대기.
- 기준: 기존 PR #4 head `766630edd93a388af34edae3c7870ad67868249e`. 최신 규격 `c6a31bf1d9d7eadbbad62bbbb6a5da73b56b3cb4`를 먼저 cherry-pick(`9f862bc`)하고 담당·범위를 STATUS에 공유(`fd91385`). PR #4의 Claude Code 리뷰 및 보충 댓글을 직접 읽음. 열린 PR #2/#3/#4/#5 확인, 닫힌 PR #1 확인. PR #5 관리 기록은 이번 범위 밖이며 향후 충돌 시 두 WORK_LOG 항목을 보존해 시간순 정리.
- 범위/버전: `games/the-hollow-keep/next/` 및 관리 문서. 기존 게임·공용 자산·루트 런처·다른 게임·기존 회귀 테스트 보존. 게임 버전/캐시 표기 변경 없음. 41개 인수 테스트는 `c6a31bf` 원본 그대로이며 직접 수정하지 않음.
- 1. 교대 벽 끼임: 중심 후보가 겹치면 폭 차이 이내의 고체 경계 후보를 수평 보정 거리순으로 재검사. 좌/우 벽 Noah→Ethan 모두 성공, 발 위치 보존. Ethan보다 좁은 통로와 낮은 천장은 계속 거절. CONFIG와 공중 감속 코드는 변경하지 않음.
- 2. Ethan 구덩이: 145px → 85px(왼쪽 끝 470, 오른쪽 시작 555), 라벨도 85px. `room.js`에 실제 방을 공유해 앱/테스트가 같은 데이터를 사용. `room-traversal.cjs`에서 x=320부터 달려 x=450 부근에 점프, Ethan x=543.08 / Noah x=630.04 착지 후 몸 전체가 오른쪽 바닥으로 이동함을 확인. 이전 145px 비교(점프 입력 기준 x=390..500, 1px 간격 111개)는 Ethan 0/111, Noah 89/111 통과. 첫 발판 뒤의 바닥 구간부터 측정한 정해진 입력 시나리오이며 사용자 손맛 평가는 아님.
- 3. 모바일 가림: 버튼을 캔버스 아래의 별도 영역으로 옮기고 가로 화면 높이에서 조작 영역을 확보. 844×390/DPR2에서 모든 버튼과 캔버스가 화면 내에 있고 서로 겹치지 않음. 시작 Ethan x=35의 화면 좌표가 캔버스에 노출됨을 검사하고 `/tmp/hollow-keep-mobile-start.png` 캡처 육안 확인. 기존 멀티터치/가로·세로 전환 검사도 유지.
- 4. 룬탄 관통 제거: 이동 방향상 가장 먼저 닿은 표적 1개만 피해 후 즉시 소멸. 빠른 탄에서 표적 배열 순서와 무관하게 접촉 순서를 처리하고 고체에 가려진 뒤 표적은 무피해. README 및 브라우저 기대값을 가까운 표적 978 HP / 먼 표적 1000 HP로 갱신. Noah 단일 참격 유지, **3단 콤보는 사용자 결정으로 보류**.
- 변경 파일: `next/{sim.js,room.js,app.js,index.html,style.css,README.md}`, `next/tests/{foundation-edge.cjs,room-traversal.cjs,browser-playtest.cjs}`, `docs/{WORK_LOG.md,STATUS.md}`, `CHANGELOG.md`. 규격·원본 인수 테스트 변경은 Claude Code 커밋을 그대로 적용한 것뿐임.
- 이번 검증: `node games/the-hollow-keep/next/tests/foundation-contract.cjs` **41/41**, `foundation-edge.cjs` **12/12**, `room-traversal.cjs` **4/4**, `browser-playtest.cjs` **15/15 통과**. 브라우저는 로컬 HTTP 서버 + Playwright/시스템 Chromium, PC 1280×900 / 모바일 가로 844×390/DPR2. 콘솔 오류/자산 실패 없음. 인수 원본은 규격 적용 직후 관통 1개만 실패(40/41)했고 수정 후 41/41 통과.
- 기존 회귀 재실행: `node tests/polish-regression.cjs`, `node tests/audio-regression.cjs`, `node tests/audio-wind-regression.cjs` **3종 통과**. audio 404 경고는 의도적인 실패 경로. ECLIPSE 회귀 통과를 HOLLOW KEEP 전체 게임 검증으로 확대하지 않음.
- 5개 관리 문서 검토: WORK_LOG 누적, STATUS/CHANGELOG 갱신. AGENTS/CLAUDE는 절차 변경이 없어 해당 항목 변경 없음. 과거 WORK_LOG는 수정하지 않음.
- 제출/인계: 같은 PR #4에 푸시하며 수정 커밋은 PR head 참조. 다음 검토 담당 **Claude Code / 재검토 대기**. 독립 테스트 재실행·브라우저 조작·이번 네 수정 확인 요청. 병합·수동 배포 명령 없음. 저장소 GitHub 연동 Cloudflare 미리보기 자동 배포 댓글은 별도 관찰로 구분.
- 미확인: 실기기·Safari/Firefox·장시간 플레이·사용자 손맛 승인. 자동 통과를 조작감 완성으로 표현하지 않음. 원격 밖 PC 로컬 작업은 미확인.

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

### 2026-10-31 (Asia/Seoul) · PR #4 추가 수정 — 모바일 화면 크기 + 가로 전체 화면

- 담당 Codex / 검토 담당 **Claude Code / 재검토 대기**. 사용자가 실제 휴대전화에서 게임 화면이 너무 작다고 확인한 뒤 모바일 확대·전체 화면 구현을 요청.
- 기준: `codex/hollow-keep-foundation`의 `229a50ca6f9e5b667afd2fa7d47b099243a21d89`. 원격 전체 브랜치 fetch 후 PR #4의 “모바일 화면이 너무 작음”, “모바일 가로 전체 화면” 댓글과 규격 §7-1/§7-2, 최신 원본 검사 두 파일을 직접 읽음. `fa33f01`과 `44bd915`를 순서대로 cherry-pick(`462f363`, `d304724`)하고 담당·범위를 STATUS에 기록/원격 공유(`018654f`).
- 범위/버전: `next/`의 입력·배치·전체 화면 및 관리 문서. 기존 게임·공용 자산·다른 게임·루트 런처·기존 회귀·sim.js/CONFIG/공중 감속은 변경하지 않음. 룬탄 비관통과 Noah 콤보 보류 유지. 게임/캐시 버전 변경 없음.
- 배치: 모바일 가로 제목줄/아래 조작줄을 없애고 좌우 72px 이상 여백을 제외한 최대 16:9 캔버스를 사용. 740×320→약 569×320, 780×330→587×330, 844×390→693×390, 915×412→732×412. 스크롤 없음. 도구는 여백 상단, 한 축 조이스틱은 왼쪽, 교대/공격/점프는 오른쪽. 조작 44px 이상, 도구/전체 화면 36px 이상이며 캔버스/서로를 가리지 않음. 수치 패널은 사용자가 열 때 별도 스크롤 영역으로 표시.
- 입력: `data-control="move"` 한 축 조이스틱에 포인터 캡처·중앙 데드존·좌우 전환·손 떼기/취소/초점 해제 처리를 추가. 조이스틱+점프 멀티터치 유지. 시뮬레이션의 기존 속도를 그대로 사용하고 새 이동 수치를 부여하지 않음.
- 전체 화면: 새 `fullscreen.js`에서 가로 `[data-fullscreen]`과 `#rotate` 안 버튼을 연결. 클릭 순간 `document.documentElement.requestFullscreen({navigationUI:'hide'})` 호출 후 `screen.orientation.lock('landscape')`. 가로 고정 거절 시 전체 화면 유지+안내, 전체 화면 거절/미지원 시 안내 및 처리되지 않은 Promise 거절 없음. 재클릭 해제 및 잠금 해제 시도. 자동 진입 없음. resize/fullscreenchange에 동적 CSS 재배치와 입력/누적 시간 초기화, 캔버스 포커스 복원.
- 변경 파일: `next/{index.html,style.css,input.js,app.js,fullscreen.js,README.md}`, `next/tests/browser-playtest.cjs`, `docs/{WORK_LOG.md,STATUS.md}`, `CHANGELOG.md`. 원본 `foundation-contract.cjs`, `mobile-layout.cjs`, `mobile-fullscreen.cjs`는 최신 규격 커밋 원본과 동일하며 직접 수정/약화하지 않음.
- 이번 검사: `mobile-layout.cjs` **20/20**, `mobile-fullscreen.cjs` **6/6**, `foundation-contract.cjs` **41/41**, `foundation-edge.cjs` **12/12**, `room-traversal.cjs` **4/4**, `browser-playtest.cjs` **18/18 통과**. 기존 `tests/polish-regression.cjs`, `tests/audio-regression.cjs`, `tests/audio-wind-regression.cjs` **3종 통과**. 오디오 404는 의도적인 실패 경로 로그. 검사 원본·보호 경로·기존 이력 보존, JS 구문, diff 검사도 수행.
- 환경/재현: 저장소 루트 HTTP 서버 127.0.0.1:8766, `HK_URL=http://127.0.0.1:8766/games/the-hollow-keep/next/`, `CHROMIUM_PATH=/usr/bin/chromium`, Playwright/시스템 Chromium. 배치는 4개 가로 크기/DPR2. 기존 브라우저 검사의 터치 위치를 조이스틱으로 변경하고, 좌우 전환/취소·자동 진입 없음·전체 화면 거절 후 조작 유지·전체 화면 중 780×330→915×412 재배치도 검사.
- 중간 실패: 기존 8765 HTTP 서버가 ERR_EMPTY_RESPONSE를 반환해 8766의 새 로컬 서버로 검증. 초기 고정 위치 도구는 offsetParent 기준 가시성 검사에 걸려 배치 16/20·전체 화면 4/6이었고, main 내부 절대 위치로 바꾸어 최종 20/20·6/6 통과. 검사 파일을 고치지 않고 구현을 수정.
- 캡처: `HK_SHOT_DIR=/tmp`의 `/tmp/hk-mobile-{740x320,780x330,844x390,915x412}.png` 및 `/tmp/hollow-keep-mobile-start.png`, `/tmp/hollow-keep-mobile-fullscreen.png`. 가로 780×330/844×390 및 전체 화면 캡처 육안 확인. 시작 주인공과 바닥/표적/라벨이 보이고 조작은 여백에 있음.
- 5개 관리 문서 검토: WORK_LOG 누적, STATUS/CHANGELOG 갱신, AGENTS/CLAUDE는 절차 변경이 없어 해당 항목 변경 없음. 과거 WORK_LOG 보존. README에 배치/전체 화면 사용법·미지원 안내·검증 명령·한계 갱신.
- 한계: **실제 화면 회전은 실기기 확인 필요**. headless 검사는 전체 화면 진입/해제와 가로 고정 요청 및 거절 대응을 확인하며, 실제 Android 회전/주소창·노치/iPhone Safari 설치 모드/터치 손맛을 검증한 것은 아님. 실기기·타 브라우저·장시간 플레이·사용자 손맛 평가는 미확인.
- 제출/인계: 같은 PR #4에 푸시, 수정 커밋은 PR head 참조. Claude Code가 원본 검사 전체 재실행·독립 브라우저·실기기 확인 항목 검토. 병합·수동 배포 명령 없음. GitHub 연동 미리보기는 별도 자동 작업으로 구분.

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

### 2026-10-31 (Asia/Seoul) · PR #4 추가 수정 — 공중 조작 사용자 결정

- 담당 Codex / 검토 담당 **Claude Code / 재검토 대기**. 사용자는 시험 방 크기/배치와 키를 놓을 때 수직 낙하를 승인하고, 달리며 뛴 점프와 제자리 점프 후 이동의 구분을 요청.
- 기준 `codex/hollow-keep-foundation`의 `9b39ace1d63952ddf610eba66c02a169a1e5c69f`. 전체 원격 fetch/열린 PR #2/#3/#4/#5 확인 및 PR #4 “공중 조작” 댓글·규격 §4-1·51개 원본 인수 검사를 읽음. `6ce2654`를 먼저 cherry-pick(`805e903`)하고 담당·범위 STATUS 기록/원격 공유(`4174aa0`).
- 범위/버전: `next/` 시뮬레이션/렌더/패널/입력/검사와 관리 문서. 기존 게임·공용 자산·루트 런처·다른 게임·기존 회귀 보존. 51개 인수 및 모바일 배치/전체 화면 검사 원본 그대로. 게임/캐시 버전 변경 없음. Noah 콤보 보류, 룬탄 비관통 유지.
- 시뮬레이션: 점프 시작 틱의 `takeoffVx`를 기록(코요테·착지 버퍼 포함), 절댓값이 runSpeed의 50% 이상이면 running, 미만이면 standing. `getPlayer()`로 두 값을 노출하고 착지 전까지 유지. 착지 시 null/0 초기화. 도약 방향 상한 `max(airControlSpeed,abs(takeoffVx))`, 반대 방향 상한 airControlSpeed. 걷다가 가장자리에서 떨어질 때는 코요테 도약 전 관성을 유지. 기존 무입력 감속/stopTicks 블록은 그대로 보존.
- CONFIG/표시: Ethan 1.33, Noah 1.73 px/틱(각 달리기 속도의 약 45%). 패널에 공중 조작 속도 추가, 0보다 크고 runSpeed보다 작게 검증. runSpeed를 낮춰 상한이 깨지면 약 45%로 조정. running 자세는 도약 방향으로 약 9° 기울고 standing은 곧게 표시, 판정 상자는 그대로. 디버그에 종류·도약 속도 표시.
- 경미 문제: resize/fullscreenchange는 누적 시간만 초기화하고 유효한 포인터/방향을 유지. 조이스틱 손잡이는 정규화된 축 값으로 재배치. 도구 포커스에서는 키보드만 해제해 다른 손가락의 터치 입력을 보존. 실제 blur/숨김/세로 전환 및 손 떼기·취소·캡처 해제에서는 기존 입력 해제 유지. 전체 화면 버튼은 멀티터치 중에도 touch pointerup의 사용자 활성화에서 동작하고 호환 click 중복은 억제.
- 변경 파일: `next/{sim.js,render.js,app.js,input.js,fullscreen.js,README.md}`, `next/tests/{foundation-edge.cjs,browser-playtest.cjs}`, `docs/{STATUS.md,WORK_LOG.md}`, `CHANGELOG.md`. 지형·모바일 CSS·무기·기존 점프 높이/중력 등 수치는 변경하지 않음(공중 조작 값만 추가).
- 이번 검사: 원본 `foundation-contract.cjs` **51/51**, `foundation-edge.cjs` **16/16**, `room-traversal.cjs` **4/4**, `mobile-layout.cjs` **20/20**, `mobile-fullscreen.cjs` **6/6**, `browser-playtest.cjs` **20/20 통과**. 기존 회귀 `node tests/polish-regression.cjs`, `node tests/audio-regression.cjs`, `node tests/audio-wind-regression.cjs` **3종 통과**. audio 404는 의도적인 실패 경로 로그.
- 구덩이 재확인: 실제 85px 지형에서 Ethan x=451.63 도약 → x=543.08 착지 후 몸 전체 통과, Noah x=452.94 → x=630.04 통과. 이전 145px 비교는 Ethan 0/111, Noah 89/111로 유지. 자동 검사 결과이며 손맛 승인이 아님.
- 추가 경계: 두 주인공의 코요테 도약 속도/방향 전환 중 종류 고정, 착지 버퍼의 실제 도약 속도와 착지 초기화를 추가. 브라우저는 실제 키보드로 종류/속도 및 CONFIG 적용, 두 자세 캡처, 실제 CDP 멀티터치로 조이스틱을 누른 채 다른 손가락의 전체 화면 버튼→resize→손 떼기를 검증.
- 중간 검사 수정: 기존 브라우저의 동시 이동+제자리 점프는 새 상한에서 15px 이동 기대값에 못 미쳤으므로 기대값을 airControlSpeed와 실제 틱 수에 따른 상·하한 및 standing 종류 검사로 변경. 최초 멀티터치 전체 화면 검사는 CDP touchEnd에 잘못된 손가락 ID를 보내 대기 시간 초과였고, 전체 화면 손가락 ID를 해제하도록 수정 후 통과. 보호된 인수 검사 세 파일은 수정하지 않음.
- 환경/캡처: 로컬 HTTP 127.0.0.1:8766, HK_URL 해당 next 경로, CHROMIUM_PATH=/usr/bin/chromium, Playwright/Chromium. PC 1280×900, 모바일 844×390/DPR2 및 배치 4개 크기, 전체 화면 resize 780×330/915×412. `/tmp/hollow-keep-standing-jump.png`, `/tmp/hollow-keep-running-jump.png` 육안 확인. 실제 화면 회전은 **실기기 확인 필요**, 실제 휴대전화 새 공중 손맛·타 브라우저·장시간 플레이는 미확인.
- 5개 관리 문서 검토: WORK_LOG 누적, STATUS/CHANGELOG 갱신, AGENTS/CLAUDE는 절차 변경이 없어 해당 항목 변경 없음. README의 규칙·수치·캡처/검사 결과 및 입력 유지 설명 갱신. 과거 WORK_LOG 보존.
- 제출/인계: 같은 PR #4에 푸시, 수정 커밋은 PR head 참조. Claude Code가 인수/경계/구덩이/모바일/전체 화면/브라우저/기존 회귀 재실행과 독립 조작 확인. 병합·수동 배포 명령 없음. 사용자 손맛 평가는 별도 대기.

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

### 2026-10-31 (Asia/Seoul) · PR #2·#3·#4·#5 병합과 문서 충돌 정리

- 담당 AI: Claude Code. 사용자 승인(“지금 병합”).
- 대상: 저장소 공통 문서, THE HOLLOW KEEP `next/`(코드 변경 없음, 병합만).
- 병합 순서: PR #5 → PR #2 브랜치(`7c347bb`), PR #3 → main(`526d917`), PR #2 → main(`71f2dcb`), PR #4 → 통합 브랜치 `claude/merge-pr4-foundation`(`ecdcfd1`) → main. 계획은 #5→#2→#3→#4였으나 병합 요청을 동시에 보내 #3이 #2보다 먼저 병합됨 — 두 PR은 서로 다른 파일만 다뤄 영향 없음(작업 방식 실수로 기록). PR #2는 GitHub 병합 가능 계산 지연으로 1회 실패 후 재시도.
- PR #4 충돌(add/add): `AGENTS.md`·`CLAUDE.md`는 PR #4 쪽이 PR #2 원본과 같아 main 유지, `CHANGELOG.md`·`docs/STATUS.md`는 main 쪽이 PR #2 원본과 같아 PR #4 유지, `docs/WORK_LOG.md`는 main 양식 + 양측 14개 항목을 커밋 시각 순으로 원문 보존(스크립트로 원문 포함 확인).
- 테스트(병합 결과): 인수 51/51, 경계 16/16, 구덩이 4/4, 모바일 배치 20/20, 전체 화면 6/6, 브라우저 20/20, ABYSSFALL 회귀 3종 통과. `git diff --check` 통과.
- STATUS: 병합 결과·다음 단계(픽셀아트 HD 아트 기준) 반영, “재검토 대기” 표기를 완료로 갱신.
- 사용자 결정: 다음 단계는 아트 기준부터, 콘셉트 **픽셀아트 HD**(1단위 = 1픽셀, 960×540), 고딕 방향 유지.
- 검토 담당 / 발견 문제 수: 해당 없음(병합 작업).
- 사용자 재요청 횟수: 0회.
- 다음: Claude Code가 픽셀아트 HD 아트 기준·자동 검사 작성, Codex가 그림 제작·적용.
- 종료 상태: 병합 완료.

### 2026-10-31 (Asia/Seoul) · THE HOLLOW KEEP 픽셀아트 HD 아트 기준과 자동 검사

- 담당 AI: Claude Code(아트 기준·검사). 구현 담당: Codex(그림 제작·적용).
- 대상: `games/the-hollow-keep/docs/ART_DIRECTION.md`, `CODEX_TASK_02.md`, `next/tests/pixel-assets.cjs`, `next/tests/pixel-render.cjs` 새 파일. 게임 코드·자산 변경 없음.
- 기준 / 브랜치: main `af58238` / `claude/hollow-keep-pixel-art-spec`.
- 버전: 변경 없음.
- 사용자 결정: 픽셀아트 HD(1단위 = 1픽셀, 960×540, 주인공 약 64~68px), 고딕, 아트 기준 먼저.
- 내용: 그림체(빛 2종·왼쪽 위 광원·선택적 윤곽·명암 3~5단계), 주인공 외형(기존 타이틀 키아트 기준), 타일 30×30(32×18칸), PNG·투명도 0/255·팔레트 64색 이하·원래 해상도, 오른쪽 방향·발 기준점·idle 높이 판정 ±15%, 필수 동작(idle 4, run 6, jump-standing 3, jump-running 3, land 2, attack 4), 타일 3종, manifest 형식, 화면 확대(960k 정수 배 + 보간 끔 + 정수 좌표 + 브라우저 축소), 자산 실패 시 도형 대체, 이미지 생성 → 원래 해상도 재작성 → 팔레트 → 손질 → 기록 과정, 특정 게임·작가 이름 지시문 금지.
- 테스트:
  - `pixel-assets.cjs`: 합성 자산 세트(저장소 밖, 커밋 안 함) 52/52 통과. 결함 10종(중간 투명도, 팔레트 밖 색, 2배 확대 저장, 발 뜸, 몸 크기 불일치, 두 점프 동일, ledge 두께, PNG 아님, 동작 누락, body 불일치) 모두 검출. 현재 main은 자산 없음으로 실패(예상).
  - `pixel-render.cjs`: 현재 main 0/5(예상). 기준대로 동작하는 임시 스크립트 5/5. 결함 2종(보간 켬, 해상도 1920 고정 — DPR 2.625에서 부족) 검출.
- Git/PR: 브랜치 `claude/hollow-keep-pixel-art-spec`(PR 번호는 PR 본문 참조).
- 검토 담당 / 발견 문제 수: 사용자 검토 대기.
- 사용자 재요청 횟수: 0회.
- 다음: 사용자 PR 검토·병합 → Codex가 `CODEX_TASK_02.md`로 제작·적용 → Claude Code 검토 → 사용자 실기기·외형 판단.
- 종료 상태: 기준 제출.


### 2026-10-31 (Asia/Seoul) · CODEX_TASK_02 — 픽셀아트 HD 주인공·타일 제작과 적용

- 담당 Codex / **검토 담당 Claude Code / 검토 대기**. 발견 문제 수 미확정(아직 교차 검토 전). 사용자 재요청 횟수 0회(이번 지시서 첫 제작 요청).
- 기준/브랜치: main `af58238`에서 PR #4 기반이 병합된 것을 확인. 지시서가 main에 아직 없어 허용된 기준 `claude/hollow-keep-pixel-art-spec`의 `d8c6a21`에서 새 `codex/hollow-keep-pixel-art` 생성. 열린 PR은 기준 PR #7뿐이며 다른 미병합 구현 충돌 없음. STATUS의 Claude Code→Codex 인계 확인 후 담당 범위를 첫 커밋 `e6efc15`로 공유하고 Draft PR #8을 제작 전에 개설.
- 읽기: 최신 AGENTS 역할 분담·CLAUDE·STATUS·WORK_LOG 최근 검토/병합 기록·CHANGELOG·실제 next 소스, ART_DIRECTION/DESIGN_DIRECTION/FOUNDATION_SPEC 및 CODEX_TASK_02, 원본 pixel-assets/pixel-render 검사. 두 타이틀 키아트(Ethan/Noah hd-v2)를 열어 인물 외형 확인.
- 대상/버전: `games/the-hollow-keep/next/` 픽셀 자산·로더/렌더러·도구/README, 관리 문서. 시뮬레이션 sim.js·CONFIG·입력/지형·기존 게임·공용 자산·런처·다른 게임·인수 검사 원본 보존. 게임/캐시 버전 변경 없음.
- 제작: image_gen으로 두 키아트를 외형 참고한 투명 자세 보드 생성(원본을 런타임 그림으로 축소하지 않음). 전체 지시문·도구·로컬 출력 경로를 `assets/pixel/PROVENANCE.md`에 기록. 특정 게임·작가 이름의 모방 지시 없음. Python/Pillow로 최종 격자에 실루엣/관절/머리·후드·코트·장비·무기·명암 클러스터를 독립적으로 다시 그림. 빌더는 참고 이미지를 읽지 않음.
- 자산: 46색 palette.json, manifest.json, Ethan/Noah 각각 idle 4·run 6·jump-standing 3·jump-running 3·land 2·attack 4 프레임. 네이티브 96×96(attack 128×96), pivot(48,95), idle 높이 68/64px. 선택 효과 룬탄2/참격3, 30px floor-top/wall-fill/ledge 타일, 960×540 bg-chapel. RGBA PNG·alpha0/255·팔레트 제한·원래 해상도. 시트/발 기준/두 점프 차이/타일 두께를 검사하고 컨택트 시트 육안 확인.
- 도구/손질: `next/tools/build-pixel-art.py` 정수 좌표 재작성, 팔레트 최근접 remap·알파 이진 정리·투명 RGB 정규화. 외곽/접지·윤곽/강조점 손질을 좌표에 반영. 재실행 전후 PNG 해시 동일(바이트 단위 재현) 확인. 참고 보드 `/workspace/generated_images/exec-01f1b4a9-1527-49a1-abd8-6eba010c48a7.png`는 로컬 참고용, 최종 자산으로 쓰지 않음.
- 적용: `pixel-art.js` manifest/PNG 로드와 loaded/failed 상태, `HKPlaytest.artStatus()` 노출. `render.js`는 표시×DPR 이상인 최소 정수 k의 960k×540k backing, setTransform(k), 보간 끔, PNG 정수 좌표 출력·좌우 뒤집기. 두 점프는 jumpKind/vy, 공격/착지는 시뮬레이션 이벤트를 받아 프레임 선택. 타일은 기존 비격자 지형에 잘라 적용. 개별 파일 실패 시 기존 해당 도형으로 대체하고 정상 그림/게임은 계속 동작. app 변경은 렌더 이벤트 전달과 artStatus뿐, 게임 규칙 변경 없음.
- 이번 검증: `CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/pixel-assets.cjs` **49/49**, 로컬 HTTP의 `pixel-render.cjs` **5/5** 통과. PC 1280×900/DPR1, 모바일 780×330/DPR2, 915×412/DPR2.625에서 최소 backing/보간/로드·크기 변경·ethan-idle 404 후 이동 유지 검사. 첫 자산 검사는 제작 기록 작성 전이어서 PROVENANCE 없음 1건 실패(48/49), 기록 추가 후49/49.
- 기존 전체 재실행: foundation-contract **51/51**, foundation-edge **16/16**, room-traversal **4/4**, mobile-layout **20/20**, mobile-fullscreen **6/6**, browser-playtest **20/20**, ABYSSFALL polish/audio/audio-wind **3종 통과**. audio404는 의도적인 실패 경로 로그. 기준 브랜치의 검사 파일 수정/약화/건너뛰기 없음.
- 환경/캡처: Python3/Pillow12.3.0, Playwright/시스템 Chromium, 로컬 HTTP 127.0.0.1:8766/HK_URL 지정. HK_SHOT_DIR=/tmp로 `/tmp/hk-pixel-jump-standing.png`, `/tmp/hk-pixel-jump-running.png`, 모바일 `/tmp/hk-mobile-780x330.png` 등 저장/육안 확인. PC·모바일에서 native 픽셀 클러스터와 서로 다른 점프 실루엣, 타일 윗면을 확인. 거친 확대 블록이나 혼합 크기 픽셀은 관찰하지 못했지만 모바일 축소 경계에는 약한 브라우저 필터링이 있을 수 있음. 선명도는 해당 캡처의 육안 관찰이며 전체 실기기 보증이 아님.
- 5개 관리 문서: WORK_LOG 누적·STATUS/CHANGELOG 갱신. AGENTS/CLAUDE는 역할/절차 변경이 없어 해당 항목 변경 없음. README에 자산 구조/프레임/원래 크기 재작성/검사·대체 표시·한계 추가. 과거 이력 보존.
- 한계/판단 대기: 외형이 닮았는지·보기 좋은지·동작이 자연스러운지는 자동 검사로 확인 불가, **사용자 판단 대기**. 실기기·실제 회전·타 브라우저·장시간 플레이 미확인. 타깃/레이블/디버그는 기존 벡터·시스템 글꼴 유지(이번 범위 밖). 적·보스·음향·추가 방·Noah 콤보는 범위 밖.
- 제출/인계: [PR #8](https://github.com/kirakein-gif/PLAYVAULT/pull/8), 구현 커밋은 PR head 참조. 완료 후 Ready로 전환하여 Claude Code의 독립 자산/렌더·기반 전체 검사와 외형/픽셀 선명도 검토 요청. PR #7 미병합이므로 main diff에 규격·원본 검사도 포함됨. 병합·수동 배포 명령 없음.


### 2026-10-31 (Asia/Seoul) · 픽셀아트 HD 원격 제출 기록

- 담당 Codex / 검토 담당 Claude Code / 검토 대기. 구현 커밋 `d6052ba`를 `codex/hollow-keep-pixel-art`에 푸시 완료, PR #8. 마지막 정리는 PROVENANCE 끝의 빈 줄 제거와 이 제출 기록뿐이며 코드/PNG/검사 결과는 동일함.
- 자산 49/49, 렌더 5/5와 위 기반 전체 검사 통과. 범위/원본 보존 및 전체 PR diff 검사를 최종 확인 후 Ready로 전환. 병합·수동 배포 없음. 사용자 외형·동작 판단 대기.

### 2026-10-31 (Asia/Seoul) · PR #8 검토(픽셀아트 HD 주인공·타일·렌더러)와 팔레트 결정

- 담당 AI: Claude Code(검토). 구현 담당: Codex. 검토 담당은 구현 브랜치를 수정하지 않음.
- 대상: PR #8 `codex/hollow-keep-pixel-art` head `e82b5f2`.
- 사용자 결정: 팔레트 **64색 이하** 확정 → `ART_DIRECTION.md` §1에 기록. PR #8은 46색.
- 규칙 준수: 검사 원본 5종·규격이 `d8c6a21`과 동일. `main` 대비 기존 게임·공용 자산·런처·다른 게임·`sim.js` 변경 없음. PROVENANCE: 이미지 생성은 참고용, 최종 스프라이트는 `tools/build-pixel-art.py`가 원래 해상도 격자에 직접 그림(축소·잘라 쓰기 없음), 특정 게임·작가 이름 지시문 없음.
- 테스트(Claude Code 환경, `git archive` head 로컬 서버): pixel-assets 49/49(효과·배경 수에 따라 항목 수가 달라지며 약화 아님), pixel-render 5/5, 인수 51/51, 경계 16/16, 구덩이 4/4, 모바일 배치 20/20, 전체 화면 6/6, 브라우저 20/20, ABYSSFALL 회귀 3종 통과.
- 외형·움직임 관찰(차단 아님, 사용자 판단): ① 두 인물 옆얼굴 코가 부리처럼 튀어나옴 ② Noah 자세가 구부정해 키아트의 날렵한 인상이 약함 ③ Ethan `jump-running` 상체가 곧아 앞으로 기운 느낌 약함, `jump-standing`이 idle과 비슷 ④ `land` 웅크림 약함 ⑤ Ethan 달리기 다리가 코트에 가려 보폭이 잘 안 읽힘. 배경·타일·색 대비는 양호.
- Git/PR: [PR #8 검토 리뷰](https://github.com/kirakein-gif/PLAYVAULT/pull/8) (COMMENT).
- 검토 담당 / 발견 문제 수: Claude Code / 기술 0건, 외형 관찰 5건(사용자 판단).
- 사용자 재요청 횟수: 0회.
- 다음: 사용자가 미리보기로 외형·움직임 판단 → 수정 여부 결정. PR #7 → PR #8 순 병합.
- 종료 상태: 검토 완료, 사용자 판단 대기.

### 2026-10-31 (Asia/Seoul) · 사용자 화면 확인 — 외형 차이·Noah 베기 효과, 아트 기준 보완

- 담당 AI: Claude Code(기준·검사). 구현 담당: Codex.
- 사용자 보고: ① 키아트와 스프라이트의 외형 차이가 심함 ② Noah 칼 휘두를 때 "꺾인 선" 같은 이상한 효과.
- 재현(PR #8 `e82b5f2`, 공격 중 연속 캡처): `noah-fx-slash`가 직선 3토막을 이은 꺾인 띠 모양에 진한 청록 단색 채움, 3프레임이 거의 같고 `loop: true`. 칼을 머리 위로 든 첫 프레임부터 이미 펼쳐져 있고, 왼쪽 끝이 몸 뒤까지 내려옴.
- 원인 분석(외형): 스프라이트를 코드로 다각형을 그려 만든 방식(경로 B)의 한계. 규격 §2·§5의 "줄여서 쓰지 않는다 / 단순 축소만으로 끝내지 않는다" 문구가 생성 그림을 밑그림으로 쓰는 것까지 금지하는 것으로 읽힐 수 있었음 — **규격 작성(Claude Code) 쪽 원인**으로 기록.
- 변경(`claude/hollow-keep-pixel-art-spec`):
  - `ART_DIRECTION.md`: §2 문구 정리, §3 외형 확인 목록(비율, 옆얼굴 코, 자세, 대표 요소), §4-4 베기 효과 규칙(한 번 재생, 칼 궤적, 매끄러운 호, 단색 채움 금지, 공격 프레임·손 위치 기준), §5 제작 경로 A(생성 자세 그림을 밑그림으로 줄인 뒤 팔레트·손질 필수, 권장)/B(직접 그리기)
  - `pixel-assets.cjs`: 효과 이웃 프레임이 같으면 실패, `fx-slash`는 `loop: true`면 실패(룬탄은 반복 허용)
- 테스트: 합성 세트 56/56. PR #8 자산 50/51(`fx-slash` 반복 재생 1건 실패 — 실제 문제와 일치). 결함 변형(베기 3프레임 동일) 검출.
- 검토 담당 / 발견 문제 수: 사용자 발견 2건(외형 차이, 베기 효과). Claude Code는 1차 검토에서 외형 관찰 5건을 적었으나 베기 효과는 정지 시트만 보고 실제 재생을 확인하지 않아 놓침 — 검토 누락으로 기록.
- 사용자 재요청 횟수: 0회.
- 다음: Codex가 경로 A로 주인공 스프라이트를 다시 만들고 베기 효과·렌더러 위치를 수정(같은 PR #8). Claude Code 재검토 시 공격 연속 캡처와 키아트 나란히 비교 포함.
- 종료 상태: 기준 보완 제출, 수정 대기(Codex).

### 2026-10-31 (Asia/Seoul) · 목표 외형 지정과 그림 밀도 시험 준비

- 담당 AI: Claude Code(기준·검사). 구현 담당: Codex.
- 사용자: Codex가 만든 생성 참고 그림(자세 12종)을 보내며 "이것과의 괴리도 너무 심함" → **목표 외형**으로 지정, 저장소 보관 승인. 그림 밀도는 "둘 다 시험 후 결정".
- 분석: 참고 그림(인물 높이 189·208px)을 손질 없이 68px로 줄이기만 해도 현재 스프라이트보다 훨씬 가까움 → 차이의 주원인은 제작 방식(코드 다각형). 136px에서는 얼굴·장식이 더 남음(비교 캡처를 사용자에게 전달).
- 변경(`claude/hollow-keep-pixel-art-spec`):
  - `docs/reference/target-pose-board-2026-10-31.jpg`(사용자 첨부 사본)와 README
  - `ART_DIRECTION.md`: 목표 외형·밀도 시험 결정, `scale`(1|2) 도입(그림 해상도·타일·몸 높이·배경·발판 두께·캔버스 해상도 기준이 scale배), `artStatus().scale`, 시험본 전환 `?art=trial-x1|x2`
  - `pixel-assets.cjs`: `manifest.scale`, 시험본 모드 `HK_ART_REQUIRE`(적힌 동작만, 타일·배경 생략)
  - `pixel-render.cjs`: 실제 해상도 단위 = 960×scale
  - `CODEX_TASK_03.md`: 68/136px 시험본 지시
- 테스트: 합성 scale 1 세트 56/56, 합성 scale 2 세트 56/56, 시험본 모드 51/51, PR #8 자산 50/51(베기 반복 재생, 앞 항목과 같음). scale 2인데 1로 표기한 결함 → 몸 크기·타일 실패로 검출. 렌더 검사: main 기준 scale 2 임시 구현 5/5, scale 2 표기 + 960 단위 해상도 결함 검출, PR #8 렌더러(scale 없음) 5/5.
- 검토 담당 / 발견 문제 수: 해당 없음(기준 작업).
- 사용자 재요청 횟수: 1회(외형 차이 — 같은 주제 두 번째 지적).
- 다음: Codex가 `CODEX_TASK_03.md`로 시험본 제작 → Claude Code 검토 → 사용자 밀도 선택 → 전체 재제작.
- 종료 상태: 시험 준비 완료.


### 2026-10-31 (Asia/Seoul) · CODEX_TASK_03 목표 외형 시험본 x1/x2

- 담당 Codex / **검토 담당 Claude Code / 검토 대기**. 사용자 재요청 횟수 1회(이전 외형 차이 피드백 후 시험본 우선 지시), 이번 검토 발견 문제 수 미확정. 밀도는 사용자가 선택하며 우열 판정하지 않음.
- 기준: 같은 PR #8 `codex/hollow-keep-pixel-art`의 `e82b5f2`. 원격 fetch/열린 PR #7/#8, “순서 변경: 목표 외형 시험본 먼저” 댓글, CODEX_TASK_03/ART_DIRECTION/목표 참고 README·JPEG/원본 PNG 확인. `3350dfb`, `0224e70`, `89453ef`를 순서대로 cherry-pick(`0e1b23d`, `5525153`, `b99a679`). WORK_LOG 충돌은 기존 구현/제출 항목 전체 뒤에 검토 항목을 붙여 양측 원문을 시간순으로 보존. 착수 STATUS `5791d6c` 공유 후 구현.
- 범위/버전: `next/assets/pixel-trial/` x1/x2(각 Ethan idle4/run6, Noah idle4), 비교 캡처, 경로 A 소스 PNG/빌더, scale 렌더/로더, 추가 런타임 검사, README·관리 문서. sim.js/CONFIG·기존 게임·기본 pixel 자산·입력/지형·공용 자산·런처·다른 게임·기타 검사 원본 보존. pixel-render의 실패 주입 경로만 한 줄 보완, 판정 조건은 보존. 게임/캐시 버전 변경 없음. 전체 스프라이트/베기 재제작은 밀도 선택 후로 보류.
- 제작: 목표 보드 JPEG 대신 이전 image_gen 원본 PNG를 사용하고 같은 인물의 여섯 달리기 위상을 새로 생성. 특정 게임/작가 이름 모방 지시 없음. 원본 두 PNG를 `next/tools/art-source/`에 보존, 두 시험 폴더 PROVENANCE에 전체 지시문/경로 A/손질/소스 출처 기록. 첫 running 프레임은 목표 보드의 해당 자세를 유지하고 나머지 위상은 새 원본에서 제작.
- 밀도/손질: 같은 소스를 각각 독립 면적 샘플링(x2는 x1 확대 아님), 두 시안 합동에서 공통64색 팔레트 도출. alpha0/255·투명RGB정리·떨어진 단일픽셀/흐린조각 제거·1px 선택 윤곽, 내부 얼굴 눈/눈썹/하이라이트 재찍기(튀어나온 코 도형 없음), 손/옷 고립1px 구멍 정리. 같은 게임공간의 호흡/자락 위상, 머리/몸 정렬과 접지 고정. x1 frame128×96/pivot64,95; x2 frame256×192/pivot128,190; body는 게임42×68/39×64 유지. tileSize30/60 메타데이터, 새 타일/배경은 시험 범위 밖.
- 렌더: 선택 query에서 x1/x2 manifest/그림 로드, artStatus.scale 반환. 실제 해상도=(960×scale)×k, setTransform(k×scale), PNG는 frame/scale 게임 크기로 출력하며 그림픽셀 좌표로 반올림. 빠진 run/jump/attack/land와 효과는 도형 대체. 없는 공격/착지의 표시 기간도 기존20/8틱을 유지해 idle 그림으로 잘못 대체하지 않게 함. 기본 mode는 scale1·기존 자산 그대로.
- 시험 자산: 지정 HK_ART_REQUIRE=`ethan:idle,run;noah:idle`, HK_ART_DIR x1/x2, CHROMIUM_PATH=/usr/bin/chromium의 원본 pixel-assets는 **각각18/18 통과**. 기록 작성 전 17/18(PROVENANCE 없음), 기록 작성 후18/18.
- 원래 pixel-render 그대로는 두 trial HK_URL에서 **각각4/5**. 정상 로드/세 뷰포트 backing/resize 통과. 실패 주입 정규식이 `/assets/pixel/ethan-idle.png`로 고정되어 시험 PNG를 막지 못한 것이 원인. 검사 강도를 유지하고 시험 폴더도 404로 차단하도록 정규식을 `/assets/(?:pixel|pixel-trial/x[12])/ethan-idle.png/`로 한 줄 확장(`4917569`), failed/이동/오류 판정은 바꾸지 않음. 보완 후 **두 시험본 및 기본 각각5/5 통과**. 처음에는 원본 보존/별도 검사로 구분하려 했으나, 이 오류는 판정 약화 없이 실제 선택 경로를 검사하게 고칠 수 있어 수정하고 별도 커밋으로 검토 대상으로 명시. 원본 작성자의 한 줄 변경 검토 필요.
- 추가 검사 `density-trial.cjs`: **10/10 통과**. 실제 시험 PNG 경로의404/failed기록/대체 후 이동, 두 scale/backing·같은 게임크기·native정렬·run/좌우반전·누락점프 대체·PC/모바일(780×330) 캡처 확인. 원래 시험의 경로 문제와 한 줄 보완을 숨기지 않고 추가 결과와 구분.
- 기본 자산 재실행: 최신 원본 pixel-assets **50/51**, 유일 실패 `noah/fx-slash.loop=true`. 알려진 전체/베기 재제작 보류 지시 때문에 기본 자산은 그대로 둠. 기본 pixel-render **5/5**, foundation-contract **51/51**, foundation-edge **16/16**, room-traversal **4/4**, mobile-layout **20/20**, mobile-fullscreen **6/6**, browser-playtest **20/20**, ABYSSFALL polish/audio/audio-wind **3종 통과**. audio404는 의도적인 실패 경로. pixel-render 주입 경로 외 원본 검사 변경/건너뛰기 없음.
- 비교/첨부: `next/assets/pixel-trial/comparison/`에 Ethan idle/run·Noah idle의 목표|x1|x2 같은 표시 높이 이미지3장 및 두 모드의 PC1280×900·모바일780×330/DPR2 Ethan/Noah 게임 캡처8장, 설명 README. 원본/candidate를 같은 물리 표시 높이로 비교. 게임 캡처는 실제 재생 중 idle 위상이 조금 다를 수 있음. PR #8에 이미지/비교 모음 링크를 첨부.
- 환경: Python3/Pillow/numpy/scipy, Playwright/Chromium, HTTP127.0.0.1:8766, HK_URL query trial-x1/x2 및 기본. 실제 휴대전화·화면 회전·장시간 동작은 미확인. 자동 검사는 외형/자연스러움/우열 판단을 하지 않음.
- 5개 관리 문서 검토: WORK_LOG 누적·STATUS/CHANGELOG 갱신, AGENTS/CLAUDE는 절차 변경이 없어 해당 항목 변경 없음. README에 시험 주소/밀도/원본과 추가 검사 결과/보류 사항 추가. 과거·검토 기록 보존.
- 제출/인계: 같은 PR #8에 푸시, 구현 커밋은 PR head 참조. **사용자 밀도 선택 / Claude Code 검토 대기**. pixel-render 주입 경로 한 줄 확장을 검토 담당에게 별도 검토 요청하고, 선택 후 전체 동작/베기 재제작을 진행. 병합·수동 배포 없음.

### 2026-10-31 (Asia/Seoul) · PR #8 검토(목표 외형 밀도 시험본 x1/x2)

- 담당 AI: Claude Code(검토). 구현 담당: Codex. 검토 담당은 구현 브랜치를 수정하지 않음.
- 대상: PR #8 head `b36f092`.
- 규칙 준수: 검사·규격·참고 그림 원본 동일(`89453ef` 기준). 단 `pixel-render.cjs` 1줄 수정(`4917569`) — 자산 누락 주입 경로에 시험본 경로 추가, 판정 조건 동일. **검사 작성(Claude Code) 쪽 결함**(시험본 모드를 추가하며 이 경로를 갱신하지 않음)을 바로잡은 타당한 수정으로 판단.
- 테스트(Claude Code 환경): 시험본 자산 x1·x2 각 18/18, 화면 적용 기본·trial-x1·trial-x2 각 5/5, density-trial 10/10, 인수 51/51, 경계 16/16, 구덩이 4/4, 모바일 배치 20/20, 전체 화면 6/6, 브라우저 20/20, ABYSSFALL 회귀 3종 통과. 기본 자산 50/51(베기 효과, 보류).
- 비교: x2(136px)는 목표 그림에 상당히 가까움. x1(68px)은 탁하고 Noah 얼굴·대비가 거의 사라짐. 휴대전화 780×330·DPR 2 실제 화면(기기 픽셀 약 1174px)에서도 x2가 더 또렷함. x2 비용: 이후 그림 작업량 약 4배, 파일 크기 증가. 두 시험본 모두 축소 잔색이 있어 최종 제작 때 손질 필요.
- 사소한 점: `density-trial.cjs` 기본 포트·Chromium 경로가 다른 검사와 다름, 실행 시 비교 캡처를 덮어씀.
- Git/PR: [PR #8 검토 리뷰](https://github.com/kirakein-gif/PLAYVAULT/pull/8) (COMMENT).
- 검토 담당 / 발견 문제 수: Claude Code / 차단 0건, 사소 2건. 검사 쪽 결함 1건(Claude Code).
- 사용자 재요청 횟수: 0회.
- 다음: 사용자 밀도 선택 → 선택한 밀도로 전체 동작·베기 효과·타일·배경 재제작.
- 종료 상태: 검토 완료, 사용자 선택 대기.

### 2026-10-31 (Asia/Seoul) · 그림 밀도 x2 확정과 전체 제작 기준 보강

- 담당 AI: Claude Code(기준·검사). 구현 담당: Codex.
- 사용자 결정: 시험본 비교 링크로 확인 후 **x2(136px, scale 2) 확정**. "점프·공격 등은 아직 반영 안 됨" 확인 — 시험 범위(idle·run)였음.
- 변경(`claude/hollow-keep-pixel-art-spec`):
  - `ART_DIRECTION.md`: §1 밀도 확정, attack 첫(준비) 프레임 2틱 이하, §4-4 베기 효과 자동 검사 명시
  - `pixel-render.cjs`: Noah 베기 효과 좌·우 검사 2개 추가(실제 게임에서 그리기 호출을 기록해, 공격 그림 없이 효과만 그려짐·준비 프레임에 그려짐·몸 중심보다 뒤쪽을 실패 처리)
  - `pixel-assets.cjs`: `attack.ticks[0] ≤ 2`
  - `CODEX_TASK_04.md`: scale 2 전체 제작 지시
- 발견(기준 쪽): 게임 판정·탄 발사는 누르는 즉시인데 공격 그림 준비 프레임이 5틱이라 휘두르기 전에 피해가 먼저 보임 → 조작감은 유지하고 그림 쪽(준비 ≤ 2틱)으로 맞춤.
- 테스트: 베기 효과 검사 — PR #8 `b36f092` 렌더러에서 좌·우 모두 실패(준비 프레임부터 효과), 저장소 밖 사본에서 렌더러를 임시로 고치면 7/7 통과. 자산 검사 — 합성 scale 1·2 세트 56/56(준비 2틱으로 갱신), PR #8 기존 기본 자산은 준비 5틱·베기 반복으로 실패(예상).
- 검토 담당 / 발견 문제 수: 기준 쪽 결함 1건(공격 그림·판정 타이밍 불일치 — 이전 기준에 없었음).
- 사용자 재요청 횟수: 0회.
- 다음: Codex가 `CODEX_TASK_04.md`로 scale 2 전체 제작 → Claude Code 검토 → 사용자 외형 판단.
- 종료 상태: 기준 제출.

### 2026-11-01 (Asia/Seoul) · CODEX_TASK_04 선택 x2 전체 동작 구현 제출

- 담당 Codex / 재검토 Claude Code(대기) / 브랜치 `codex/hollow-keep-pixel-art`, 같은 PR #8. 기준 b36f092, 시작 전 최신 원격/PR/댓글 확인. 규격 최신2a8ecc6와 앞선a89db8c를 c95a5f8/59b4dca로 반영하고 착수e06d682를 원격 공유. WORK_LOG 충돌은 양측 기존 기록을 보존해 해결했다.
- 범위: `next/assets/pixel/`, renderer/loader, 생성 원본·재현 도구, `pixel-review/`, README·관리 문서. 게임 버전 전후: foundation 시험 방(버전 번호 없음) 유지. x2 확정으로 기본136/128px 밀도 적용, 게임 속 몸 크기와 판정 동일.
- 경로 A: 새 Ethan/Noah 동작 원본 생성 → 각 자세 높이별 축소 → 공유64색·알파·1px 윤곽·떠 있는 점·손/옷 구멍·머리/발 정렬 정리. 선택 trial x2 idle/run 출발점 보존, Noah run 신규. Ethan 생성 보드의 제자리 점프가2개여서 목표 원본 중간 자세로 보완해3개 구성. 생성 지시문 전문·도구 정보는 기본 PROVENANCE. 각 주인공 idle4/run6/jump-standing3/jump-running3/land2/attack4.
- 공격 준비 모두2틱; 판정/룬탄은 종전 즉시. attack 이벤트 방향을 고정하고 손 위치 metadata로 Noah 베기를 앞쪽에 배치, 준비에는 숨김, 공격 나이 기준3프레임 단발. 얇은 곡선·밝은 칼날·가늘어지는 꼬리/분산점으로 재제작. Rune2프레임 반복,60px 타일(ledge32행만 불투명),1920×1080 배경. 기본 로드 실패 시에도 scale2 backing hint.
- 검증(이번 실행, Chromium / 로컬 HTTP8766): pixel-assets **51/51**, pixel-render **7/7**(좌/우 베기 포함), foundation-contract **51/51**, foundation-edge **16/16**, room-traversal **4/4**, mobile-layout **20/20**, mobile-fullscreen **6/6**, browser-playtest **20/20**, density-trial **10/10**. ABYSSFALL polish/audio/audio-wind **3종 통과**(audio404 경고는 의도한 실패 복구 검사). 로그 `/tmp/hk04-*.log`. 이전 기본50/51 slash.loop 실패는 이번 loopfalse로 해결.
- 재현: 저장소 루트 HTTP 서버, `HK_URL=http://127.0.0.1:8766/games/the-hollow-keep/next/ CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/<name>.cjs`; 자산 검사는 HTTP 불필요. 기존 회귀는 `node tests/{polish-regression,audio-regression,audio-wind-regression}.cjs` 각각 실행.
- 검사 보존: 이번 작업은 tests 파일을 수정하지 않았다. 이전4917569의 시험 경로404 정규식 보완은 Claude Code가 이미 검토한 상태로 유지. density-trial 원본은 시험본 디렉터리에 캡처를 덮어쓰기 때문에 **내용이 동일한 사본**을 `/tmp/hk-density-check/tests/`에서 실행하고 출력도 임시 sibling assets로 격리(HK_URL 위 주소, 전역 Playwright NODE_PATH 설정). 원본 판정/경로 코드 변경·건너뛰기 없음. 이 출력 경로 제약은 검사 담당에게 인계.
- 보존 확인: task04 착수e06d682 대비 sim.js·모든 검사·pixel-trial 전체 diff없음; trial은 b36f092 대비도 diff없음. 다른 게임·공용 자산·루트 런처 변경 없음. 원본 PNG16개 재빌드 SHA256 동일. 로컬 자산 검사에서 ledge 아래 잔점1개를 발견해 빌더 y경계 수정 후51/51 통과. 비교용 생성 도구의 참조 crop 오류/네임스페이스 오류는 정리 후 재실행.
- 제출 캡처: `next/assets/pixel-review/README.md`, 목표6자세 동일 표시 높이 비교(각 주인공), 실제 공격 연속(실제 관찰 tick 표기, 느린 프레임 누락 가능), PC1280×900·모바일780×330/DPR2. 기술 검사 통과는 외형 유사성·움직임 품질의 증거가 아님. 사용자 판단 대기, 실제 기기 회전 확인 필요.
- 5개 관리 문서 검토: STATUS·WORK_LOG·CHANGELOG 갱신, AGENTS·CLAUDE 규칙/흐름 변경 없음. 루트 README 관련 변경 불필요, next README 현재/과거 구분 및 재현 절차 갱신.
- 검토 담당 / 발견 문제 수: Claude Code / 이번 구현 재검토 전으로 미확인(직전 규격 타이밍 결정 반영). 사용자 재요청 횟수: task04 구현 착수 후0회. 다음: 같은 PR #8에 푸시 → Claude Code 재검토 → 사용자 외형 판단. 병합·배포하지 않음.

### 2026-11-01 (Asia/Seoul) · PR #8 검토(x2 전체 동작·베기 효과·타일·배경)와 검사 수정

- 담당 AI: Claude Code(검토). 구현 담당: Codex. 검토 담당은 구현 브랜치를 수정하지 않음.
- 대상: PR #8 head `71b7fe7`.
- 규칙 준수: 검사·규격·참고 그림 원본이 `2a8ecc6`과 동일(cherry-pick `59b4dca`). `pixel-render.cjs`의 차이는 이전에 확인한 시험본 경로 1줄뿐. `main` 대비 기존 게임·공용 자산·런처·다른 게임·`sim.js` 변경 없음. 기본 자산 scale 2, 타일 60, 64색, 배경 `bg-chapel.png`, 공격 준비 프레임 Ethan·Noah 모두 2틱, `fx-slash` 한 번 재생.
- 테스트(Claude Code 환경): 기본 자산 51/51, 시험본 자산 x1·x2 각 18/18, 화면 적용 기본 7/7(3회 반복 안정), density-trial 10/10, 인수 51/51, 경계 16/16, 구덩이 4/4, 모바일 배치 20/20, 전체 화면 6/6, 브라우저 20/20, ABYSSFALL 회귀 3종 통과.
- **검사 결함(Claude Code 쪽):** `pixel-render.cjs` 베기 효과 검사가 `?art=trial-*`에서도 기본 manifest를 기준으로 판단해, 베기 효과가 없는 시험본에서 실패함. 지금 화면이 쓰는 자산의 manifest를 보도록 수정하고, Codex의 시험본 경로 1줄 보완도 이 브랜치에 반영. 수정 후 `71b7fe7` 기본·trial-x1·trial-x2 모두 7/7, 이전 `b36f092`는 여전히 베기 효과 실패로 검출.
- 외형 확인: 동작 6종 모두 목표 그림의 자세·옷·색에 가까움. 착지 웅크림·달리며 뛴 점프의 기울기 분명. 베기 효과는 가는 초승달 호가 칼끝을 따라 펼쳐지고 몸 앞쪽에만 그려짐. 관찰(차단 아님): Ethan `jump-standing` 2번째 프레임 폭 80px로 다른 프레임(103·139px)보다 좁아 작아 보일 수 있음.
- 검토 담당 / 발견 문제 수: Claude Code / 구현 차단 0건, 관찰 1건. 검사 쪽 결함 1건(Claude Code).
- 사용자 재요청 횟수: 0회.
- 다음: 사용자 미리보기 확인(외형·동작) → 승인 시 PR #7 → PR #8 병합.
- 종료 상태: 검토 완료, 사용자 판단 대기.

### 2026-11-01 (Asia/Seoul) · Noah 베기 효과 "두 줄" — 사용자 발견과 검사 추가

- 담당 AI: Claude Code(기준·검사). 구현 담당: Codex.
- 사용자 보고: Noah가 칼을 휘두를 때 효과가 두 줄로 보임(PR #8 `71b7fe7`).
- 원인: 그리기 기록상 효과는 한 순간에 한 번만 그려짐. **효과 그림 자체**가 프레임마다 밝은 칼날 선과, 1~2픽셀 틈을 둔 어두운 평행선 두 덩어리로 되어 있음(프레임별 덩어리 크기 202/68, 324/106, 208/57).
- **검토 누락(Claude Code):** 직전 검토에서 연속 캡처를 보고도 평행선을 "가는 초승달 호"로만 판단해 놓침.
- 변경(`claude/hollow-keep-pixel-art-spec`): `ART_DIRECTION.md` §4-4 "한 획" 규칙, `pixel-assets.cjs` — `fx-slash` 프레임마다 6픽셀 이상 덩어리가 정확히 1개.
- 테스트: `71b7fe7` 기본 자산 50/51(`fx-slash` 0번 프레임 덩어리 2개로 실패). 저장소 밖 사본에서 떨어진 선을 지우면 51/51. 합성 scale 1·2 세트 56/56.
- 검토 담당 / 발견 문제 수: 사용자 발견 1건(Claude Code 검토 누락).
- 사용자 재요청 횟수: 0회.
- 다음: Codex가 `fx-slash`를 한 획(칼날 선에 붙은 가늘어지는 꼬리)으로 수정 → Claude Code 재검토.
- 종료 상태: 수정 대기(Codex).

### 2026-11-01 (Asia/Seoul) · PR #8 Noah 베기 두 줄 수정 제출

- 담당 Codex / 검토 담당 Claude Code(재검토 대기). 사용자 요청 및 PR #8 "Noah 베기 효과가 두 줄로 보임" 댓글 확인. 기준 head71b7fe7, 같은 `codex/hollow-keep-pixel-art`. 시작 전 원격 fetch·main af58238·PR #7/#8·실제 코드/관리 문서 확인, 착수 cb78e82 원격 공유. 게임 버전 전후: foundation 시험 방(번호 없음) 유지.
- 규격 반영: 앞선559c722(활성 자산 기준 렌더 검사·직전 검토 기록)→7aa2def, 요청db1679b(한 획 규칙·연결 덩어리 검사)→ef92a4a. WORK_LOG 충돌은 HEAD의 task04 제출 기록과 규격 브랜치의 새 검토 기록을 모두 보존해 해결. pixel-assets/pixel-render 원본은 db1679b와 바이트 동일, 이후 변경하지 않았다. 기타 검사도 변경 없음.
- 원인 재현: 새 pixel-assets를 기존 효과에 실행하면50/51, 0번 프레임의6px 이상 덩어리2개로 실패. 단일 그리기 호출 문제가 아니라 밝은 호와 떨어진 어두운 평행선의 그림 문제.
- 수정: image_gen으로 기존 투명3프레임을 한 획으로 편집한 밑그림 생성(`tools/art-source/noah-slash-single-stroke-source.png`). 재현 빌더에서 연결된3개 호를 분리하고 종전 네이티브 위치/크기에 맞춰 축소·기존64색·알파0/255로 정리, 떨어진 축소 잔점 제거. 밝은 칼날 바로 안쪽에 붙은 어두운 꼬리, 끝은 가늘게. 떨어진 평행선을 만들던 별도 inner arc 코드는 제거. 효과 frame112×144/pivot(0,72)/각2틱/loopfalse 유지, 렌더러·게임 수치 변경 없음. PROVENANCE 전문 지시문/정리 절차 갱신.
- 이번 실행: pixel-assets **51/51**, pixel-render **7/7**, foundation-contract **51/51**, foundation-edge **16/16**, room-traversal **4/4**, mobile-layout **20/20**, mobile-fullscreen **6/6**, browser-playtest **20/20**, density-trial **10/10**, ABYSSFALL polish/audio/audio-wind **3종 통과**. 추가 시험 자산 x1/x2 각각18/18, 각 시험 렌더7/7. audio404 경고는 기존 실패 복구 검사에서 예상됨. 로그 `/tmp/hk-slash-*.log`(before의50/51은 수정 전 재현).
- 재현: 저장소 루트 HTTP8766, `HK_URL=http://127.0.0.1:8766/games/the-hollow-keep/next/ CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/<name>.cjs`; trial 렌더는URL에?art=trial-x1|x2. density-trial 원본을 내용 동일 사본으로 `/tmp/hk-slash-density/tests/`에서 실행해 sibling assets 임시 출력으로 격리(시험본 비교 파일 보존), cmp 동일 확인. 원본 판정·검사 코드는 변경하지 않음. 기존 회귀는 `node tests/<name>.cjs`.
- PNG 검증: 효과3프레임의8방향 연결 덩어리는 각각1개(302/581/288px), 기존 색상4개 사용. 다른 런타임 PNG15개는71b7fe7 기준 SHA256 동일. 전체 PNG16개 재생성 해시 동일. manifest·palette·sim.js·render.js·pixel-trial·기존 게임·공용 자산·런처 변경 없음.
- 캡처: 새 `capture-noah-single-stroke.cjs`에서 Playwright 브라우저 시계를 제어하고 실제 키보드 입력/기존 루프를 사용, pose/world 주입 없음. 좌우 실제 공격 나이0~11 모든 틱을 확인 후 연속 캡처 저장. `pixel-review/noah-single-stroke/README.md` 및 개별 PNG/연속 strip. 준비0~1 효과없음,2~7 단발3프레임,8이후 효과없음. 이전 task04 캡처는 이력으로 보존하고 새 수정 링크를 우선 안내.
- 5개 관리 문서 검토: STATUS·WORK_LOG·CHANGELOG 갱신, AGENTS·CLAUDE 흐름 변경 없음. 루트 README 변경 필요 없음, next README/PROVENANCE/캡처 README 갱신.
- 검토 담당 / 발견 문제 수: Claude Code / 사용자 발견1건(직전 검토 누락 기록은 기준 커밋에서 보존), 이번 수정 재검토 전. 사용자 재요청 횟수: task04 제출 후1회(이번 두 줄 수정). 종료 상태: 같은 PR #8 푸시·재검토 대기. 외형/동작 사용자 판단 대기, 실기기 회전 확인 필요. 병합·배포하지 않음.
