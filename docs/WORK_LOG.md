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
