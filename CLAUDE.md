# Claude Code · PLAYVAULT 진입 지침

작업을 시작하기 전에 다음 문서를 순서대로 읽는다.

1. [AGENTS.md](AGENTS.md) — 모든 AI의 공통 개발 규칙이며 이 저장소 작업의 기준.
2. [docs/STATUS.md](docs/STATUS.md) — 브랜치별 현재 상태와 담당·인계 여부.
3. [docs/WORK_LOG.md](docs/WORK_LOG.md) — 이전 변경과 검증·미해결 문제.

이후 AGENTS.md의 절차에 따라 CHANGELOG, README, 대상 게임의 문서·기존 인계 문서 및 실제 최신 GitHub 소스를 교차 확인한다. 공통 규칙을 이 파일에 별도로 복제하거나 다른 기준으로 운영하지 않는다.

매 작업 완료 전 [AGENTS.md의 다섯 문서 지속 갱신 규칙](AGENTS.md#다섯-관리-문서의-지속-갱신)에 따라 `AGENTS.md`, `CLAUDE.md`, `docs/STATUS.md`, `docs/WORK_LOG.md`, `CHANGELOG.md`를 모두 검토·관리한다. 갱신 기준과 확인 불가 표기는 AGENTS.md를 따른다.

Claude Code 환경에서만 필요한 사항:

- 클라우드 세션의 클론은 얕을 수 있다. 이력을 판단하기 전에 `git fetch --unshallow origin main`으로 전체 이력을 확보한다.
- 세션에 지정된 작업 브랜치가 있으면 그 브랜치를 쓰고, 없으면 `claude/<대상>-<요약>` 형식을 쓴다.
- 브라우저 검사는 사전 설치된 Chromium(`/opt/pw-browsers/chromium`)과 전역 Playwright를 사용한다(`NODE_PATH=$(npm root -g)`).
- AGENTS.md의 "역할 분담(시범 운영)"에 따라 검토 담당일 때는 구현 브랜치를 직접 수정하지 않는다.
