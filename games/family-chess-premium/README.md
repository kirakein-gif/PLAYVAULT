# CHESS MASTER PREMIUM (구 우리집 체스 PREMIUM) v1.0.0

아빠와 아들이 함께 두고 함께 배우는 **완전 오프라인 Android 태블릿 체스**입니다.
로그인·광고·서버·유료 API가 없고, Stockfish 엔진·문제·글꼴·이미지·효과음이 모두 앱 안에 들어 있습니다.

## 스킨 (2026-11-03 확정)

설정 → 스킨에서 **Classic**(원목 판·아이보리/흑단 기물), **Magic**(대리석 판·석상 기물, Claude 제작), **Gothic**(보라 석판·첨탑 기물, Codex 제작·Claude 윤곽 보완) 세 가지 중 고를 수 있습니다. 스킨 이름은 한국어·영어 모드 모두 영문으로 표시하고, 설명만 언어에 따라 바뀝니다. 선택은 프로필별로 저장됩니다. 원칙은 "화려하지 않게"입니다.

가족 검토 결과 Codex의 중세·노블 세트와 Claude의 고딕 성채 세트는 앱에서 뺐습니다. 이전 버전에서 고딕 성채를 쓰던 프로필은 Gothic으로 자동 전환됩니다. Codex 고딕 기물의 윤곽선은 `scripts/outline-skin.cjs`로 덧입혔고 원본은 `scripts/art-source/codex-skins/gothic-codex-original/`에 있습니다. 비교 과정 기록: [비교 캡처·검증](docs/screenshots/skin-compare/README.md), [Codex 인계문](docs/CODEX_SKINS_HANDOFF.md).

## 주요 기능

| 영역 | 내용 |
| --- | --- |
| 메인 | 큰 메뉴 3개(둘이서 대국 / 컴퓨터와 대국 / 체스 아카데미), 한국어·EN 전환, 설정 |
| 둘이서 대국 | 탭-탭·드래그 이동, 합법 수 표시, 마지막 수·체크 강조, 무르기, 판 뒤집기, 매 턴 자동 회전(선택), 기권·합의 무승부, 3회 반복·50수 무승부 주장, 5회 반복·75수·스테일메이트·기물 부족 자동 무승부, PGN 저장·불러오기 |
| 컴퓨터와 대국 | Stockfish 19 Lite(WASM, Web Worker) 5단계(쉬움·보통·도전·어려움·마스터), 백·흑·무작위, 생각 중 표시, 무르기, 대국 결과 저장 |
| 복기 | 모든 수를 같은 깊이(기본 12)로 분석, 좋은 수·부정확·실수·큰 실수 판정, 깊이 부족 시 "확실하지 않음" 표기, 추천 수 화살표·수순 재생, "이 장면에서 다시 두기" |
| 아카데미 | 전술·체크메이트 문제 322개(자체 검증 121 + Lichess CC0 201, Lichess 레이팅 표시), 전략 6강·오프닝 5강·엔드게임 5강(직접 두는 과제 포함), 실전 복기, 용어 사전, 기물 이동 도움말 |
| 문제 기록 | 문제별 ★★★/★★/★, 미해결·미도전, 도전 횟수·최초 성공일·최근 결과, 최고 기록 유지, 필터·즐겨찾기, 오늘의 10분 훈련 |
| 데이터 | 프로필 2개(이름 변경), 프로필별 기록·언어·난이도, Capacitor Preferences 저장(스키마 버전), JSON 백업·복원 |
| 연출 | 원목 보드·자체 입체 기물 SVG, 160ms 슬라이드·착지 반동, 잡기 축소 연출, 합성 효과음 13종, 선택적 진동 |

## APK 설치 방법 (Android 태블릿)

1. **영구 보관본:** GitHub 저장소 → **Releases** → `family-chess-v1.0.0`에서 `FamilyChessPremium-v1.0.0-debug.apk`를 내려받습니다(main에 반영될 때마다 테스트 통과 후 자동 갱신).
   브랜치 빌드는 Actions → `family-chess-android` → Artifacts에 90일간 남습니다.
2. 파일을 태블릿으로 옮겨(USB·드라이브 등) 탭합니다. 처음이면 "출처를 알 수 없는 앱 설치"를 허용합니다.
3. 설치 후 인터넷 없이 실행됩니다. 기록은 기기 안에만 저장되므로 앱을 지우기 전에는 설정 → **기록 내보내기**로 백업해 두세요.

**서명 키:** 2026-11-04부터 모든 빌드가 고정 키(`android/family-chess.keystore`, 인증서 SHA-256 `BC:65:8C:09…:3E:8A:6A`)로 서명되어 새 APK를 덮어 설치해도 기록이 유지됩니다. 그 이전 APK가 설치되어 있다면 한 번만 "기록 내보내기 → 앱 삭제 → 새 APK 설치 → 기록 불러오기"가 필요합니다. 개인 설치용 키이며 Play 스토어 배포용이 아닙니다.

전체 개발 정리: [docs/DEVELOPMENT_SUMMARY.md](docs/DEVELOPMENT_SUMMARY.md)

## 개발·빌드

```bash
npm ci
npm run dev                 # 브라우저 개발 서버
npm test                    # 단위 테스트(Vitest)
npm run build               # dist/ 생성 (엔진 파일 복사 + 타입 검사 + Vite)
NODE_PATH=$(npm root -g) node tests/e2e/run-e2e.mjs   # 오프라인 브라우저 인수 테스트(Playwright)
npx cap sync android && cd android && ./gradlew assembleDebug   # Android SDK 36 · JDK 21 필요
```

에셋 재생성: `node scripts/build-pieces.mjs`, `NODE_PATH=$(npm root -g) node scripts/build-textures.cjs`, `NODE_PATH=$(npm root -g) node scripts/build-icons.cjs`.
문제 재생성: `scripts/puzzles/`(자체 대국 → 채굴 → Stockfish 19 심층 검증 → 분류·선별, 자세한 내용은 `docs/PUZZLES.md`).

## 구조

```
src/
  game/        gameController.ts(규칙·무승부·PGN), pieceTracker.ts(애니메이션용 기물 식별), gameHistory.ts
  engine/      stockfishAdapter.ts(Worker·UCI 직렬화), difficulty.ts(난이도 설정표), analysis.ts(복기 판정), uci.ts
  academy/     puzzles/(puzzles.json), lessons/, puzzleValidator.ts, progressManager.ts, daily.ts, puzzleText.ts, glossary.ts
  components/  ChessBoard/(보드·드래그·애니메이션), ui.tsx, icons.tsx
  screens/     홈·대국·복기·아카데미·문제·강의·기록·설정 화면
  storage/     schema.ts(버전), store.ts(Preferences), backup.ts
  audio/       sound.ts(Web Audio 합성)
  i18n/        ko.json, en.json
public/        engine/(stockfish-19-lite-single.js/.wasm), pieces/(SVG 12종), licenses/
android/       Capacitor Android 프로젝트(인터넷 권한 없음)
tests/         unit/(Vitest), e2e/(Playwright 브라우저), android/(에뮬레이터 실기), engine/(난이도 강도 측정)
scripts/       에셋·문제 생성 스크립트
```

난이도 조정은 `src/engine/difficulty.ts`의 표만 고치면 됩니다. 앱에는 측정하지 않은 Elo를 표시하지 않습니다.

라이선스와 출처: `LICENSES/README.md`. 테스트 결과: `docs/TEST_REPORT.md`.
