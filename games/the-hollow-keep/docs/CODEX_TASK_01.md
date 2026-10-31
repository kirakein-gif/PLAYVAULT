# Codex 작업 지시 01 · THE HOLLOW KEEP 기반(이동·무기·교대)

> 작성: Claude Code, 2026-10-31 · 사용자 승인 후 Codex에 전달
> 아래 "Codex에게 전달할 지시문" 블록을 그대로 복사해 Codex에 붙여 넣으면 됩니다.

## 사용자가 Codex 실행 전에 확인할 것

1. 관리 문서 PR #1·#2 중 어느 쪽을 쓸지 정했는지 — 정해지지 않았어도 이 작업은 진행할 수 있습니다(게임 폴더만 다룸).
2. 이 지시서와 규격이 들어 있는 브랜치 `claude/hollow-keep-foundation-spec`(PR #3)을 `main`에 병합했는지 — **병합 전이면** 지시문의 "기준 브랜치"를 그대로 두면 됩니다.
3. 정리해 두신 캐릭터 설정이 있으면 함께 주세요. 없으면 현재 저장소 설정으로 진행합니다.

## Codex에게 전달할 지시문

```text
PLAYVAULT — THE HOLLOW KEEP 1단계 기반(이동·무기·교대) 구현

저장소: kirakein-gif/PLAYVAULT
기준 브랜치: claude/hollow-keep-foundation-spec  (이미 main에 병합되었다면 main)
작업 브랜치: codex/hollow-keep-foundation  (기준 브랜치에서 새로 만들 것)

[작업 시작 전 반드시]
1. git fetch origin --prune 후 기준 브랜치의 최신 커밋, 원격 브랜치, 열린 PR을 확인한다.
   games/the-hollow-keep/ 을 대상으로 하는 다른 미병합 브랜치나 열린 PR이 있으면 코드 변경을 시작하지 말고 나에게 확인한다.
2. 다음 문서를 읽는다.
   - AGENTS.md (기준 브랜치에 없으면 PR #1 또는 #2의 AGENTS.md 중 내가 지정한 것)
   - games/the-hollow-keep/docs/DESIGN_DIRECTION.md   ← 방향·참고 범위
   - games/the-hollow-keep/docs/BASELINE_ANALYSIS.md  ← 현재 구현 분석·기준 수치
   - games/the-hollow-keep/docs/FOUNDATION_SPEC.md    ← 이번 작업 규격(필수)
3. 문서만 믿지 말고 games/the-hollow-keep/core.js 등 실제 소스를 직접 확인한다.
4. 첫 커밋으로 작업 브랜치를 푸시하고 Draft PR을 연다(작업 중 표시).

[이번 작업]
FOUNDATION_SPEC.md 대로 games/the-hollow-keep/next/ 에 새 기반을 만든다.
- 고정 시간 간격(1/60) 루프, DOM 없는 sim.js(§4 계약), 입력 분리, CONFIG 한 곳에 수치 모으기
- Ethan(빛·원거리)과 Noah(그림자·근접) 두 주인공, 교대
- 시험 방 1개 + 디버그 표시 + CONFIG 조절 패널(§7)
- 키보드와 모바일 가로 터치 조작
- 초기 CONFIG 수치는 BASELINE_ANALYSIS.md §3의 현재 수치를 출발점으로 삼는다.

[참고 기준 — 반드시 지킬 것]
- 콘셉트는 "마성전설2의 플레이 감각"(촘촘한 한 화면 방 탐험, 단단한 점프, 짧은 근접 무기, 두 주인공 교대)을 지향한다.
- 원작의 맵·캐릭터·적·아이템·스프라이트·음악·화면 구성은 복제하거나 변형해서 쓰지 않는다. 모든 요소는 PLAYVAULT의 Ethan/Noah와 고딕 세계관으로 새로 만든다.

[금지]
- games/the-hollow-keep/ 의 기존 파일(index.html, core.js, art.js, game.css, assets/) 수정
- 루트 index.html, 공용 assets/, tests/, 다른 게임 수정
- 새 이미지 생성(이번 범위 아님. 기존 자산은 읽어서 사용 가능)
- 인수 테스트(next/tests/foundation-contract.cjs)를 약하게 고치거나 건너뛰기.
  규격이 맞지 않는다고 판단되면 고치지 말고 PR 본문과 WORK_LOG에 이유를 적는다.
- 강제 푸시, main 병합, 배포

[검증 — 결과를 그대로 보고]
1. node games/the-hollow-keep/next/tests/foundation-contract.cjs  → 40/40 통과가 목표. 실패가 남으면 실패 항목과 이유를 그대로 적는다.
2. 기존 회귀 테스트가 깨지지 않았는지: node tests/polish-regression.cjs, node tests/audio-regression.cjs, node tests/audio-wind-regression.cjs
3. 브라우저(로컬 HTTP 서버)에서 next/index.html 실행 확인: PC 키보드, 모바일 가로 크기. 확인하지 못한 항목은 "미확인"으로 적는다.
4. 자동 테스트 통과와 손맛 평가는 구분한다. "조작감 완성"이라고 쓰지 않는다. 손맛 판단은 사용자가 한다.

[완료 시]
- games/the-hollow-keep/next/README.md: 실행 방법, 조작, 디버그 사용법, CONFIG 수치표, 현재 한계
- docs/WORK_LOG.md 맨 아래에 새 항목 추가(양식의 "검토 담당" 칸은 "Claude Code / 검토 대기")
- docs/STATUS.md 의 THE HOLLOW KEEP 항목 갱신(진행 중 작업, 테스트 결과, 다음 우선순위)
- 게임 버전 번호는 올리지 않는다(새 기반의 번호 체계는 사용자가 정함)
- Draft PR을 Ready로 바꾸고 본문에 테스트 결과·변경 파일·미해결 문제를 적는다. 병합은 하지 않는다.
- 검토는 Claude Code가 한다.
```

## Codex 작업 후 Claude Code가 할 일 (검토 단계)

1. 인수 테스트·기존 회귀 테스트 재실행
2. 브라우저 자동 조작으로 키보드 입력 → 실제 이동·공격 확인, 화면 캡처
3. 규격 위반(기존 파일 수정, 테스트 약화, DOM 의존, 가변 시간 간격 등) 확인
4. PR 검토 의견 작성(코드는 직접 고치지 않음, `AGENTS.md` "역할 분담(시범 운영)"), WORK_LOG에 검토 결과·발견 문제 수 기록
