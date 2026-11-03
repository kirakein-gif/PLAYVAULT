# Codex 작업 지시서 · CHESS MASTER 스킨 메뉴 일러스트

작성: Claude Code, 2026-11-03 · 대상 브랜치 기준 `ccr-6aa2a39e-1vn67a`(또는 이 브랜치가 병합된 main)
담당: **Codex**(이미지 생성 필요 — AGENTS.md 역할 분담 "아트 생성·교체")

## 1. 목적

스킨 "마법사의 석실(Wizard Stone)"과 "고딕 성채(Gothic Keep)"의 **메인 메뉴 카드 3개**에 들어갈 상세 일러스트를 만든다.
판 위의 기물은 바꾸지 않는다. 판 위 기물은 칸이 약 60px까지 작아지므로 단순한 SVG(`public/pieces/<skin>/`)를 그대로 쓴다. 이 일러스트는 **장식용**이다.

## 2. 반드시 지킬 것

1. **화려하지 않게 (가족 요청, 최우선).** 무채색·저채도, 빛나는 효과·불꽃·번개·금박·과한 광택 금지. 배경 없이 기물(조각상)만.
2. **독자 디자인.** 영화 「해리 포터」의 체스 세트, 공식 상품(예: 시판 위자드 체스 세트)의 조형을 베끼지 않는다. 이름·로고·특정 장면 재현 금지. "돌로 깎은 중세 체스 조각상"이라는 일반적인 주제 수준에서 새로 디자인한다.
3. 판 위 SVG 기물과 같은 정체성을 유지한다(같은 상징: 아래 표).

| 카드 | Wizard Stone (회색·검정 석재, 끌 자국 있는 석상) | Gothic Keep (달빛 석재·무광 흑철, 첨탑·뾰족 아치) |
| --- | --- | --- |
| 둘이서 대국 `menu-two` | 회색 기사 1 + 검정 기사 1이 마주 봄. 말을 탄 기사 표현 허용 | 달빛 석재 나이트 + 흑철 나이트(말머리, 톱니 갈기) |
| 컴퓨터와 대국 `menu-ai` | 검정 석재 왕(왕좌·왕관) 1 | 흑철 킹(중앙 첨탑+십자, 좌우 작은 첨탑) 1 |
| 체스 아카데미 `menu-academy` | 회색 석재 여왕 + 두건 쓴 주교(지팡이) | 달빛 석재 퀸(뾰족 첨탑 왕관) + 비숍(뾰족 아치 모자) |

## 3. 파일 규격

- 경로: `games/family-chess-premium/public/art/wizard/menu-two.webp`, `menu-ai.webp`, `menu-academy.webp`, `public/art/gothic/` 동일.
- 형식: WebP, **투명 배경(알파)**, 세로형 **600×600px**(정사각, 아래쪽 정렬, 위·좌우 여백 약 6%). 파일당 **250KB 이하**.
- 바닥 그림자는 짧고 옅게(알파 0.4 이하). 외곽은 깔끔하게(배경 잔여 픽셀 없음).
- 출처 기록: `public/art/PROVENANCE.md`에 생성 도구, 프롬프트 전문, 후처리 내용, 날짜를 적는다(저장소의 다른 게임과 같은 방식).

## 4. 연결 방법 (코드는 이미 준비됨)

`src/skins.ts`의 해당 스킨에 `menuArt`만 추가하면 메인 메뉴가 자동으로 일러스트를 쓴다. 파일이 없으면 지금처럼 SVG 기물이 나온다.

```ts
{ id: 'wizard', ..., menuArt: { two: 'art/wizard/menu-two.webp', ai: 'art/wizard/menu-ai.webp', academy: 'art/wizard/menu-academy.webp' } },
```

## 5. 검증 (완료 조건)

1. `npx vitest run` 전체 통과, `npm run build` 성공.
2. `NODE_PATH=$(npm root -g) node tests/e2e/run-e2e.mjs` 전체 통과(메뉴 화면이 853×533·1024×600·1280×800·1920×1200에서 넘치지 않을 것).
3. 각 스킨의 메인 화면 캡처(853×533, 1280×800)를 `docs/screenshots/skin-art/`에 저장하고 PR에 첨부.
4. 사용자(가족)의 "화려하지 않은가" 판단을 받는다. 판단 전 병합 금지.
5. 관리 문서(WORK_LOG·STATUS·CHANGELOG) 갱신, AGENTS.md 규칙대로 Claude Code 교차 검토 요청.
