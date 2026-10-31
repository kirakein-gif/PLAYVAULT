# CLAUDE.md — Claude Code 작업 규칙

공통 규칙은 [`AGENTS.md`](AGENTS.md)를 따릅니다. 이 파일은 공통 규칙을 반복하지 않고 Claude Code 전용 사항만 적습니다.

## 작업 시작 시 반드시 읽을 문서

@AGENTS.md
@docs/STATUS.md
@docs/WORK_LOG.md

그다음 작업 대상 게임의 README·`docs/`와 실제 소스를 확인합니다(`AGENTS.md` §2-1).

## Claude Code 전용 사항

- 브랜치 이름은 `claude/<game-slug>-<요약>` 형식을 사용합니다. 세션에서 지정된 브랜치가 있으면 그 브랜치를 사용합니다.
- 클라우드 세션의 클론이 얕을 수 있습니다. 이력 판단 전에 `git fetch --unshallow origin main`으로 전체 이력을 확보합니다.
- 원격 브랜치와 열린 PR을 확인해 다른 AI의 진행 중 작업(`AGENTS.md` §3)이 있는지 먼저 봅니다.
- WORK_LOG의 담당 AI 칸에는 `Claude Code`라고 적습니다.
- 작업 결과는 PR로 제출하되(`AGENTS.md` §2-3), 사용자 승인 없이 `main`에 병합하거나 배포하지 않습니다.
