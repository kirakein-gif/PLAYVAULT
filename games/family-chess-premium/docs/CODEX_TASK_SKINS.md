# Codex 작업 지시서 · CHESS MASTER 비교용 스킨 (Codex안)

작성: Claude Code, 2026-11-03 · 기준 브랜치 `ccr-6aa2a39e-1vn67a`(또는 이 브랜치가 병합된 main)
담당: **Codex** — 이미지 생성이 필요한 작업(AGENTS.md 역할 분담 "아트 생성·교체")

## 1. 목적

가족(아빠·아들·엄마)이 **같은 주제의 스킨을 Claude안과 Codex안으로 나란히 비교**해 고르려고 한다.
Claude Code가 만든 두 스킨은 이미 앱에 있다. Codex는 **같은 주제로 자기 방식의 스킨 두 개**를 만들어 **추가**한다.

| 주제 | Claude안 (이미 있음, 수정 금지) | Codex안 (이번 작업) |
| --- | --- | --- |
| 위자드 체스풍 석상 | `wizard` 마법사의 석실 — SVG 기물 | `wizard-codex` |
| PLAYVAULT 고딕 | `gothic` 고딕 성채 — SVG 기물 | `gothic-codex` |

비교는 앱의 **설정 → 스킨**에서 한다. 스킨 카드에 만든 쪽(Claude/Codex)이 표시된다.
Claude안과 똑같이 만들 필요는 없다. 오히려 **그림(이미지 생성) 기반이라 가능한 다른 해석**을 보여 주는 것이 이번 비교의 목적이다.

## 2. 반드시 지킬 것

1. **화려하지 않게 (엄마의 요청 — 최우선).** 저채도, 빛나는 효과·불꽃·번개·금박·과한 광택·장식 테두리 금지. 판과 기물만 바꾸고 UI 색은 건드리지 않는다.
2. **판 위에서 읽혀야 한다.** 저가형 태블릿(853×533)에서 한 칸은 약 60px이다. 이 크기에서 6종 기물이 실루엣만으로 즉시 구분되어야 하고, 흰 기물은 밝은 칸·어두운 칸 모두에서, 검은 기물도 양쪽 칸에서 또렷해야 한다(필요하면 옅은 외곽선). 세부 장식이 60px에서 얼룩처럼 보이면 줄인다.
3. **독자 디자인.** 영화 「해리 포터」의 체스 세트, 시판 공식 상품(위자드 체스 세트)의 조형을 베끼지 않는다. 영화 이름·로고·특정 장면 재현 금지. "돌로 깎은 중세 체스 조각상"이라는 일반 주제 수준에서 새로 디자인한다. 말 탄 기사, 방패 든 병사가 선 성탑 같은 일반적 중세 모티프는 사용 가능.
4. **Claude안 파일·코드는 수정하지 않는다**(`public/pieces/wizard|gothic/`, `scripts/build-skin-pieces.mjs`, `board.css`의 기존 스킨 규칙, `src/skins.ts`의 기존 항목).

### 주제별 방향

- **wizard-codex**: 검정·회색 대리석 바닥, 검정·회색 석재 기물. 아드님이 가진 실물 세트처럼 "석상이 체스를 두는" 분위기.
  참고: 가족 피드백 — 회색 칸은 너무 어둡지 않게, 대리석 결은 아주 옅은 노란빛, 금 간 선처럼 보이지 않게.
- **gothic-codex**: PLAYVAULT 고딕 방향(`games/the-hollow-keep/docs/ART_DIRECTION.md`의 "차가운 청보라 어둠, 촛불 주황·달빛 청백, 석재·철·천"). 가족 선택: **보라색 계열이 좋다**.

## 3. 만들 파일 (스킨마다)

경로: `games/family-chess-premium/public/skins/<id>/` (`<id>` = `wizard-codex`, `gothic-codex`)

| 파일 | 규격 |
| --- | --- |
| 기물 12개 `wK wQ wR wB wN wP bK bQ bR bB bN bP` + 확장자 | **WebP(권장) 또는 PNG, 투명 배경**, 정사각 **256×256px**. 기물 바닥 중심이 가로 중앙, 받침 아래 끝이 위에서 약 92% 지점. 위·좌우 여백 약 5%. 파일당 **60KB 이하** |
| `board-light.webp`, `board-dark.webp` | 밝은 칸·어두운 칸 텍스처, **1024×1024px**, 이음새 없어도 됨(앱이 칸마다 다른 부분을 확대해 씀). 각 **200KB 이하** |
| `board-frame.webp` (선택) | 판 테두리 텍스처 1024×256px |
| `menu-two.webp`, `menu-ai.webp`, `menu-academy.webp` (선택) | 메인 메뉴 카드 장식 일러스트, 투명 배경 600×600px, 각 250KB 이하. 판 위 기물보다 상세해도 됨(장식용). 둘이서 대국=기사 둘(흑·백), 컴퓨터와 대국=흑 킹, 아카데미=백 퀸+비숍 |
| `PROVENANCE.md` | 생성 도구, 프롬프트 전문, 후처리(배경 제거·크기 조정), 날짜 |

## 4. 앱에 등록 (코드는 이미 준비됨)

`src/skins.ts`의 `SKINS` 배열 끝(주석 위치)에 항목만 추가한다. 그 외 코드 수정은 필요 없다.

```ts
{
  id: 'wizard-codex', author: 'Codex',
  name: { ko: '마법사의 석실 · Codex', en: 'Wizard Stone · Codex' },
  desc: { ko: '<한 줄 설명>', en: '<one line>' },
  pieces: { dir: 'skins/wizard-codex', ext: 'webp' },
  board: { light: 'skins/wizard-codex/board-light.webp', dark: 'skins/wizard-codex/board-dark.webp',
           frame: 'skins/wizard-codex/board-frame.webp', coord: '#c3c5c9', outline: 'rgba(170,172,176,0.55)' },
  menuArt: { two: 'skins/wizard-codex/menu-two.webp', ai: 'skins/wizard-codex/menu-ai.webp', academy: 'skins/wizard-codex/menu-academy.webp' },
},
```

`gothic-codex`도 같은 형식. 텍스처가 1024px보다 작으면 판이 흐려지니 규격을 지킨다.

## 5. 검증 (완료 조건)

1. `npx vitest run` 전체 통과 — `tests/unit/skins.test.ts`가 등록된 모든 스킨의 기물 12개·판·메뉴 파일 존재와 id 중복을 자동 검사한다.
2. `npm run build` 성공, `NODE_PATH=$(npm root -g) node tests/e2e/run-e2e.mjs` 전체 통과(외부 요청 0).
3. **비교 캡처**를 `docs/screenshots/skin-compare/`에 저장하고 PR에 첨부:
   - 각 주제마다 Claude안과 Codex안을 **같은 대국 장면**(1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 진행 후)으로, 853×533(1.5배)과 1280×800에서 캡처.
   - 기물 12개를 밝은 칸·어두운 칸 위에 늘어놓은 표 이미지.
4. 앱 용량: 두 스킨 합계 **3MB 이하**.
5. 관리 문서(WORK_LOG·STATUS·CHANGELOG) 갱신, AGENTS.md 규칙대로 **Claude Code 교차 검토** 요청.
6. **가족의 판단 전 병합 금지.** 어느 안을 남길지는 가족이 정한다(둘 다 남기거나, 하나만 남기거나).
