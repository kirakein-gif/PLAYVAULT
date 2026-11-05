# BLOCK MASTER · 1차 검증 보고서

- 날짜: 2026-11-04 (Asia/Seoul)
- 담당: ChatGPT / 작업 브랜치: `chatgpt/family-blocks-solo`
- 최초 기준 main: `4e7abd0` / **검증 성공 커밋**: `f4797ee03422084924746c1b55f3796520cbdedc`
- 증거: [GitHub Actions run 41823354763](https://github.com/kirakein-gif/PLAYVAULT/actions/runs/41823354763) — 완료, **success**
- 제출: [Draft PR #28](https://github.com/kirakein-gif/PLAYVAULT/pull/28), main 병합·GitHub Release·사이트 공개 배포는 수행하지 않음

## 실행한 검증

| 작업 / 명령 | 실행 결과 | 근거 |
| --- | --- | --- |
| `npx tsc --noEmit -p tsconfig.json` | **통과** | run 41823354763 / unit-tests |
| `npx vitest run` | **31/31 통과** | 동일 |
| `npm run build:web` + `play/` 소스 일치 검사 | **통과** | 동일 / web-build-refresh, unit-tests |
| `node tests/e2e/run-e2e.mjs` (Playwright Chromium) | **11/11 통과**, 실패 0, 외부 요청 0, JS 오류 0 | 동일 / unit-tests |
| 853×533, 1280×800 홈/모드/회전/터치·동시 터치/키보드/일시정지/기록 | **통과** | 동일 / E2E 스크린샷 |
| 60초 고정 시드 자동 플레이 | **통과**; 직전 성공 시각의 3604프레임, p95 약 16.8ms(참고 수치) | run 41823050606 / E2E 산출물. 최신 run 41823354763도 동일 테스트 통과 |
| `npm run build`, `npx cap sync android`, `./gradlew assembleDebug --no-daemon` | **통과**, APK 생성 | run 41823354763 / build |
| Android Manifest 및 패키징 APK의 INTERNET 권한 검사 | **통과** — INTERNET 권한 없음 | 동일 / build |
| APK 서명 검증 (`apksigner`) | **통과** — 가족 서명 인증서 SHA-256 `bc658c0933d0a9cdedecd65926f5eb14c5c767882f65fc8317295772d53e8a6a` | 동일 / build |
| Android 14 1280×800 오프라인 에뮬레이터 `node tests/android/smoke.cjs android-smoke` | **통과** — 실제 ADB 터치 이동/시계 방향 회전/즉시 떨어뜨리기, 그만하기, 앱 완전 재실행 후 기록 유지 | 동일 / emulator-offline-test |
| Android smoke 외부 네트워크 요청 / JavaScript 오류 | **각 0건**, 전체 PASS | 동일 / android-smoke-results `result.json` |
| GitHub Release | **미실행(정상)** — main 브랜치 병합 뒤에만 게시하도록 제한 | 동일 / release: skipped |

Android 입력 증거: ADB로 왼쪽 버튼(49,694), 회전 버튼(1155,694), 하드 드롭(1231,694)을 탭했습니다. 실제 게임 상태는 이동 X 3→2, 회전 1, 하드 드롭 후 판에 4칸이 고정되고 점수 32였으며, 앱 재시작 후 기록 유지가 확인됐습니다. 검증 도중 Wi-Fi와 데이터를 차단했습니다.

## 실패 이력과 수정

- **41808095710**: 웹 11/11, 단위 31/31, APK 서명·빌드 성공. Android 실기 시험에서 하드 드롭 판정 실패. 원인은 아직 확정하지 않음(후속 시험 수단 문제 확인).
- **41821010109**: Android WebView의 Playwright `locator.tap()`이 `hasTouch`를 지원하지 않아 시험 자체 실패.
- **41822268923**, **41823050606**: ADB 실제 터치 전 요소 확인 코드를 추가했지만 시험 선택자 파싱이 잘못되어 검사가 중단됨. 검증 코드를 수정.
- **41822593679**: 브라우저 E2E에서 회전 불변인 O 블록이 무작위로 선택되어 동시 회전 검사가 오탐. 처음부터 T 블록이 나오는 고정 시드 77을 사용해 해결; O 블록 게임 규칙은 유지.
- **41823354763**: 위 오류를 고친 뒤 **모든 필수 CI 단계 통과**. 다른 검사 기준을 약하게 하거나 생략하지 않았습니다.

## 화면 검사

853×533 / 1280×800 스크린샷을 확인해, 하단 캔버스 모드 이름이 왼쪽 이동 버튼을 가리던 문제를 발견했습니다. 상단 모드 칩과 중복되므로 하단 글자를 제거했고, 수정 후 화면에서 겹침이 없음을 확인했습니다. 원목 스킨과 단정한 줄 지우기 연출의 실물 기기 표현은 아래 미확인 항목에 남깁니다.

## 확인 못 함 / 후속

- 실제 사용자의 저가형 Android 태블릿에서 **터치 지연·프레임·음향 크기·진동·공유/백업 파일 선택**은 확인하지 못했습니다. CI/에뮬레이터 통과를 실기 검증으로 확대하지 않습니다.
- Claude Code 또는 Codex의 **독립 교차 리뷰**는 아직 미실행입니다.
- `main` 병합·GitHub Release `family-blocks-v1.0.0` 생성·PLAYVAULT 카드 등록·사이트 배포 **미실행** (사용자 승인 필요). 현재 APK는 90일 만료되는 Actions 아티팩트이며, 영구 Release가 아닙니다.
- AGENTS.md / CLAUDE.md 공통 규칙을 검토했으며 이번 작업에서는 변경하지 않았습니다.

## 2026-11-04 Claude Code 교차 검토 대응 (수정 후 검증 진행)

- [PR #28 Claude 교차 검토](https://github.com/kirakein-gif/PLAYVAULT/pull/28): 수정 **전** 버전에서 타입 검사, 단위 32/32, 브라우저 11/11, 7종 블록/16개 SRS 회전 표·고정 30틱·점수·홀드·레벨·40줄 규칙 재검토.
- 수정 완료: 보이는 첫 행에 즉시 등장(막혔을 때만 숨은 행 대체), Android 시스템 뒤로가기(홈 종료 확인/설정·기록 홈 이동/게임 일시정지 재개), 화면 결과 중복 문구, 불필요한 체스·폰트 의존성.
- 새 단위 테스트: 7종 첫 등장 가시 위치·숨은 줄 대체. 브라우저 E2E: 첫 가시 행 픽셀 샘플, 정확히 1칸 이동, 레벨 글자/보관 버튼 겹침 판정, 기록 게임 횟수·최근 목록을 새로고침 전후 비교. Android smoke: 기기 뒤로가기·실제 기록값 검사.
- 기존 통과 Actions 41823354763은 **수정 전 커밋**. 이 수정 뒤 전체 CI 검사 **결과 확인 필요**. Android 실물 태블릿의 가독성·진동·성능·음량 검사는 미실행.
- 출처 충돌은 최신 main(행맨 이력 포함)을 기반으로 관리 문서 3종에 BLOCK MASTER 내역을 추가하는 방식으로 해결. main 브랜치는 미수정, 병합·Release 미실행.

## 최종 통합 커밋 검증 (Claude 리뷰 수정 반영)

- 기준 작업 SHA: `2c1724ae4a330b2112817f2a79320e607b324669` (main `2185514` 이력 포함, 변경은 작업 브랜치에만 적용).
- [GitHub Actions 41829962993](https://github.com/kirakein-gif/PLAYVAULT/actions/runs/41829962993): **전체 실행 성공**. Node 22 TypeScript 컴파일 통과, Vitest **34/34**, 오프라인 Playwright 브라우저 E2E **11/11**(853×533 / 1280×800, 정확한 한 칸 이동·최초 블록 픽셀·레벨 글자-보관 버튼 겹침·저장된 게임 횟수와 최근 내역 새로고침 후 비교·60초 자동 플레이) 통과. 외부 요청 및 JavaScript 오류 각 0건.
- Android `./gradlew assembleDebug` 성공, INTERNET 권한 없음(Manifest·APK 양쪽), 동일한 가족 서명 키 SHA-256 확인. Android 14 오프라인 에뮬레이터의 `node tests/android/smoke.cjs` **PASS**: 생성 직후 블록 위치(`J`의 `y=1`), 물리적 이동·회전·즉시 낙하(잠금된 칸 4개), 시스템 뒤로가기(게임 중 일시정지 → 재개 / 기록 → 홈 / 설정 → 홈 / 홈 종료 확인 취소), 앱 강제 종료·재실행 후 기록에 실제 게임 횟수와 최근 내역 유지. Release 단계는 main에서만 실행되므로 정상적으로 생략.
- 이전 run 41823354763(31/31)은 **수정 전 버전** 검증임. 41829962993은 리뷰 수정과 최신 main 병합 기록이 모두 들어간 검증임.
- Claude Code 독립 **재검토 필요**. 실제 저가형 태블릿의 프레임·터치 반응·음량·진동·미리보기 가독성 및 JSON 내보내기/불러오기 실기 검증은 아직 **확인 못 함**.

## 2026-11-05 세로 모드·전체화면 (Claude Code, 가족 요청)

- 변경: APK 세로 고정(`screenOrientation=portrait` + Android 16 호환 속성), 캔버스 세로 배치(`computeLayout`), 홈·설정·기록·결과 세로 CSS, 폭 480px 미만 안내, 전체화면(로컬 Android 플러그인 `FullscreenPlugin` + 웹 Fullscreen API, 사용자별 저장). 렌더러가 실제 배치를 `window.__familyBlocksLayout`으로 내보내 테스트가 같은 값을 쓰도록 변경.
- 이번 실행: tsc, 단위 **39/39**(세로 배치 4·전체화면 1 추가), 웹 빌드 대상 브라우저 E2E **22/22**(853×533·1280×800·533×853·800×1280, 버튼과 판·HUD 글자 겹침 0, 외부 요청 0, 오류 0).
- CI 에뮬레이터를 800×1280 세로로 변경, smoke에 세로 확인·전체화면 켜면 WebView 높이 증가·재실행 후 유지 검사 추가. 결과는 push 후 CI에서 확인.
- 확인 못 함: 실제 태블릿의 세로 손맛·버튼 위치 편의, Android 16 기기에서의 방향 고정.
