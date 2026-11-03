# 오픈소스 라이선스와 출처 / Licences and sources

| 구성 요소 | 버전 | 라이선스 | 출처 |
| --- | --- | --- | --- |
| Stockfish | 19 | GPL-3.0 | https://github.com/official-stockfish/Stockfish |
| Stockfish.js (`stockfish-19-lite-single.js/.wasm`) | npm `stockfish@19.0.1` | GPL-3.0 | https://github.com/nmrugg/stockfish.js (tag `v19.0.1`) · NNUE `nn-61e7af4bb97d` |
| chess.js | 1.4.0 | BSD-2-Clause | https://github.com/jhlywa/chess.js |
| React / React DOM | 19.3.1 | MIT | https://react.dev |
| Capacitor core/android/app/preferences/filesystem/share/haptics | 8.x | MIT | https://capacitorjs.com |
| Noto Serif KR (Fontsource) | 5.3.1 | SIL OFL 1.1 | https://fontsource.org/fonts/noto-serif-kr |
| Cinzel (Fontsource) | 5.3.0 | SIL OFL 1.1 | https://fontsource.org/fonts/cinzel |

## 자체 제작 에셋

- 기물 SVG: `scripts/build-pieces.mjs`가 생성한 원본(타사 기물 이미지 사용 없음).
- 체스판 원목 텍스처: `scripts/build-textures.cjs`의 절차적 생성.
- 앱 아이콘·스플래시: `scripts/build-icons.cjs`(자체 나이트 SVG 사용).
- 효과음: `src/audio/sound.ts`에서 실행 시 합성(음원 파일 없음).
- 전술 문제 1–121: 엔진 자체 대국에서 채굴 후 Stockfish 19로 검증(`scripts/puzzles/`).
- 전술 문제 122번 이후(ID `LI-…`): [Lichess 퍼즐 데이터베이스](https://database.lichess.org/)(CC0)에서 선별해 Stockfish 19로 재검증. 각 문제의 `source`에 원본 퍼즐 ID·레이팅·원본 대국 주소를 기록.

## GPLv3 고지

APK와 웹 빌드에는 GPLv3인 Stockfish 엔진 바이너리(WASM)가 포함됩니다. 배포할 경우 GPLv3에 따라 대응 소스를 함께 제공해야 하며, 엔진의 대응 소스는 위 저장소(Stockfish.js `v19.0.1`, Stockfish 19)에 있습니다. GPLv3 전문은 `GPL-3.0.txt`, 앱 안에서는 설정 → 오픈소스 라이선스에서 볼 수 있습니다. 개인 기기 설치 용도라면 추가 조치는 필요 없지만, 다른 사람에게 APK를 배포할 때는 이 프로젝트 소스도 GPLv3 호환 조건으로 함께 제공하는 것을 권장합니다(앱 자체 소스의 라이선스 결정은 저장소 소유자 판단 사항).
