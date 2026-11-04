# HANGMAN MASTER (가족 행맨)

CHESS MASTER와 같은 컨셉으로 만든 **완전 오프라인 Android 태블릿 + PC 웹** 영어 단어 맞히기 게임입니다. 아이가 체스와 같은 태블릿에서 혼자, 또는 가족과 둘이서 합니다.

- **혼자 하기**: 기초 영어 단어 358개(10개 주제, 한국어 뜻 포함). 난이도는 글자 수로 정함 — 쉬움 2~4, 보통 5~6, 어려움 7글자 이상, 또는 섞어서.
- **둘이서**: 한 사람이 단어(영어 2~14글자)와 힌트(한글 가능)를 넣고 태블릿을 건네면 다른 사람이 맞힘.
- **단어장**: 한 판·성공·성공률·연속 기록, 맞힌 단어(별 1~3개)·놓친 단어, 주제별 진행, **놓친 단어 다시 하기**.
- **그림**: 교수대 대신 **풍선 바구니**. 틀릴 때마다 풍선 하나가 날아가고(6개), 다 날아가면 바구니가 언덕에 살짝 내려앉습니다. 맞히면 바구니가 떠오릅니다. "너무 화려하지 않게" 원칙으로 차분한 색.
- **힌트**: 뜻 보기(무료, 별 최대 2개), 글자 하나 보기(풍선 1개 사용).
- 체스와 같은 것: 프로필 2개·이름 변경, 한/영, 효과음(같은 합성 코드)·진동, 절전 모드, JSON 기록 백업·복원, 글꼴(고운돋움·고운바탕·Nunito), INTERNET 권한 없음, 같은 가족 서명 키.
- 조작: 화면 A~Z 자판(최소 44px, 853×533 기준). PC에서는 실제 키보드(한글 입력 상태에서도 동작).

## 설치 (태블릿)

1. GitHub Releases `family-hangman-v1.0.0`(main 병합 후 CI가 자동 생성)에서 `FamilyHangman-v1.0.0-debug.apk`를 받습니다. 병합 전에는 Actions 실행의 Artifacts `FamilyHangman-v1.0.0-debug-apk`(90일 보관).
2. 태블릿에서 APK를 탭해 설치합니다(처음이면 "출처를 알 수 없는 앱" 허용). 체스와 별개 앱(`com.playvault.familyhangman`)이라 체스 기록에 영향이 없습니다.

## 개발

```bash
npm ci
npm run dev            # 브라우저에서 개발
npm test               # 단위 테스트 (Vitest)
npm run build          # dist/ (APK용)
npm run build:web      # play/ (PLAYVAULT 웹 버전, 커밋 대상)
NODE_PATH=$(npm root -g) node tests/e2e/run-e2e.mjs            # 오프라인 브라우저 E2E
E2E_OUTDIR=play NODE_PATH=$(npm root -g) node tests/e2e/run-e2e.mjs test-results/e2e-play
NODE_PATH=$(npm root -g) node scripts/build-icons.cjs         # 아이콘·스플래시 다시 만들기
```

APK는 `.github/workflows/family-hangman-android.yml`이 빌드합니다: 단위 테스트·웹 빌드 일치 → APK(가족 키 지문·INTERNET 권한 없음 확인) → Android 14 에뮬레이터 네트워크 차단 검사(`tests/android/smoke.cjs`) → main에서만 Release 업로드.

## 구조

| 경로 | 내용 |
| --- | --- |
| `src/game/hangman.ts` | 순수 규칙(추측·풍선·힌트·별·단어 고르기) |
| `src/game/words.ts` | 단어 목록과 주제 |
| `src/storage/` | 저장 형식·검증·복구, 백업 (체스 구조 재사용) |
| `src/screens/` | 홈·게임·둘이서·단어장·설정·라이선스 |
| `src/components/BalloonScene.tsx` | 풍선 바구니 그림 |
| `src/platform`, `src/audio`, `src/i18n`, `src/components/ui.tsx` | CHESS MASTER에서 복사한 공통 모듈 |

테스트 결과: [docs/TEST_REPORT.md](docs/TEST_REPORT.md) · 라이선스: [LICENSES](LICENSES/README.md)
