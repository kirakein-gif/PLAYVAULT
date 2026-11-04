# 고딕 · 중세 · 노블 / Codex 비교용 스킨

2026-11-03 Asia/Seoul. 기준 앱: Claude Code의 `family-chess-premium`, 브랜치 `ccr-6aa2a39e-1vn67a`, 착수 `bfee4c9`. 사용자의 추가 결정으로 두 세트에서 **고딕·중세·노블 세 세트**로 확대했습니다. [코드 인계 기준](../../CODEX_SKINS_HANDOFF.md).

| 세트 | 기물 나열 | 실제 대국 비교 |
| --- | --- | --- |
| 고딕 | [라벤더·자주색 석상](gothic-lineup.webp) | [853×533@1.5](gothic-compare-853x533.webp) · [1280×800](gothic-compare-1280x800.webp), Claude/Codex |
| 중세 | [성벽 위 방패병·창을 든 기마 기사](medieval-lineup.webp) | [853×533@1.5](medieval-compare-853x533.webp) · [1280×800](medieval-compare-1280x800.webp), Claude/Codex |
| 노블 | [백석·흑석 갑옷 석상](noble-lineup.webp) | [853×533@1.5](noble-compare-853x533.webp) · [1280×800](noble-compare-1280x800.webp), 중세/노블 |

세트별 바닥: [밝은/어두운 재료 견본](floor-materials.webp). 런타임 타일은 각각1024×1024입니다.

60 CSS px의 실제 기물 가독성: [고딕](gothic-codex-60px-matrix.webp) · [중세](medieval-codex-60px-matrix.webp) · [노블](noble-codex-60px-matrix.webp). 각12기물을 밝은/어두운 칸에 모두 놓았습니다. 판 위에서 잘 읽히는지, 지나치게 화려하지 않은지는 가족이 판단합니다.

모든 대국 캡처는 설정에서 스킨을 선택하고 **1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6**를 실제 입력한 화면입니다. 기물 위치 주입 없음. 32기물 로딩·지정 경로·수순·제작자 표시·재시작 후 스킨 저장을 확인했습니다. PNG 원본은 로컬 중간 자료이며 공개 비교 WebP는 디코딩 RGBA 동일 검증을 거쳤습니다.

## 이번 실행 검증

| 항목 | 결과 |
| --- | --- |
| `npm test` / Vitest | 5파일·396/396 통과 |
| `npm run build` | 타입 검사·Vite 프로덕션 빌드 성공 |
| 원본 오프라인 E2E | 23/23, 외부 요청0 |
| 추가 실제 스킨 비교 | 13/13, 외부 요청0 |
| 파일 규격 | 36기물256×256·진영별 투명 배경, 비교용 걷는 나이트2개; 바닥6장1024×1024 |
| 용량 | WebP44개 합계922,456bytes(약0.92MB), 기물 각60KB·바닥 각200KB 이하 |
| 노블 진영 구분 | 모든 기물의 불투명 픽셀 평균 밝기: 백170.7~189.3 / 흑62.8~66.9 (0~255), 역할별 차이70 이상 |
| 보존 | 기존 Claude SVG·스킨 제작기·기존board.css·게임 규칙·인수검사 수정 없음 |

[단위 로그](unit-results.txt) · [빌드 로그](build-results.txt) · [E2E 로그](e2e-results.txt) · [비교 로그](comparison-results.txt) · [파일 크기·노블 색 구분](asset-checks.json) · [실제 캡처 관측](observations.json).

환경: Windows, Node24.18, Python3.12/Pillow/numpy/scipy, 설치된Chrome/Playwright. 원본 E2E의 Windows `npx` 실행·Chromium 위치만 외부 preload로 연결했고 검사와 오프라인 차단 로직은 바꾸지 않았습니다. 같은 방식을 재현하는 `scripts/windows-e2e-preload.mjs`를 포함했습니다. 초기 비교 도구의 `wP` 기대값은 실제 DOM의 `wp`로 정정했습니다. 초기 Python 의존성 경로 오설정으로 노블 파일 조립 전 단위1개가 실패했으나 경로를 고쳐 전체396개를 재실행·통과했습니다.

## 재현

앱 폴더에서 잠긴 의존성을 설치하고 빌드합니다. 그림 빌더에는 Pillow/numpy/scipy가 필요합니다. 원화·전체prompt·후처리는 `scripts/art-source/codex-skins/PROMPTS.md`와 각 `public/skins/<id>/PROVENANCE.md`를 참고하세요.

```sh
npm ci
python scripts/build-codex-skins.py
npm test
npm run build
# Linux/macOS: NODE_PATH=<Playwright 경로> node tests/e2e/run-e2e.mjs
# Windows: NODE_PATH와 CHROMIUM_PATH를 지정한 뒤
node --import ./scripts/windows-e2e-preload.mjs tests/e2e/run-e2e.mjs
```

비교 캡처는 Vite preview4173 실행 후 `CHESS_URL=http://127.0.0.1:4173/`, `CHROMIUM_PATH`를 지정해 `node scripts/capture-codex-skins.cjs`, 이어 `python scripts/pack-codex-skins.py`로 포장합니다. 코드 인계 문서는 세 이름/id·바닥·진영색·최종 기물 형태를 명시합니다.

교차 검토 담당: Claude Code. 가족의 외형 선택·실기기 성능/터치 확인 대기. 이번 작업에서 APK 빌드·실기 설치·main 병합·배포는 하지 않았습니다. 메뉴 상세 일러스트는 기물 모양 선택 이후 별도 단계입니다.
