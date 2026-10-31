# THE HOLLOW KEEP · Foundation 시험 방

상태: 구현 착수 준비 / Codex / 2026-10-31 (Asia/Seoul).

- 작업 브랜치: `codex/hollow-keep-foundation`
- 기준: `claude/hollow-keep-foundation-spec` / `bcf7a09018cf1141290d99fd80ec008f5f565b43` (PR #3)
- 범위: `games/the-hollow-keep/next/`의 이동·점프·무기·교대 시뮬레이션, 입력/렌더 분리, 시험 방과 디버그 조절 패널.
- 보존: 기존 게임 파일·공용 자산·런처·다른 게임·기존 인수 테스트를 변경하지 않는다. 새 게임 버전을 부여하지 않는다.
- 계획: CONFIG/DOM 없는 고정 1/60 시뮬레이션 → 입력·시험 방·디버그 → 인수 40항목/기존 회귀/브라우저 검증 → 실행 지침·STATUS/WORK_LOG 인계.
- 인수 테스트는 기준 브랜치의 `tests/foundation-contract.cjs` 원본을 사용한다.
- 캐릭터 상세 추가 설정은 미제공이며 현 소스의 Ethan(빛/원거리 룬탄), Noah(그림자/근접)를 출발점으로 삼는다.
- 게임 코드는 아직 구현하지 않았고 테스트를 실행하지 않았다. 완료 검토 담당은 Claude Code다.
- PR #3의 시작 요건에 따라 먼저 이 준비 커밋을 원격에 공유한다. GitHub API 접근 차단으로 Draft PR 개설 여부를 확인해야 한다.
