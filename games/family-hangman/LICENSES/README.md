# 오픈소스 라이선스와 출처 / Licences and sources

| 구성 요소 | 버전 | 라이선스 | 출처 |
| --- | --- | --- | --- |
| React / React DOM | 19.3.1 | MIT | https://react.dev |
| Capacitor core/android/app/preferences/filesystem/share/haptics | 8.x | MIT | https://capacitorjs.com |
| @capacitor-community/text-to-speech | 8.0.2 | MIT | https://github.com/capacitor-community/text-to-speech (발음 — 기기의 음성 엔진 호출, 음성 데이터는 포함하지 않음) |
| Gowun Dodum · Gowun Batang (Fontsource) | 5.3.0 | SIL OFL 1.1 | https://fontsource.org/fonts/gowun-dodum · https://fontsource.org/fonts/gowun-batang |
| Nunito (Fontsource variable) | 5.3.0 | SIL OFL 1.1 | https://fontsource.org/fonts/nunito |

## 자체 제작

- 단어 목록(`src/game/words.ts`): 이 앱을 위해 직접 작성한 기초 영어 단어와 한국어 뜻. 외부 단어 목록을 복사하지 않음.
- 풍선 장면·카드 그림·아이콘(`src/components/BalloonScene.tsx`, `src/screens/HomeScreen.tsx`, `scripts/build-icons.cjs`): 코드로 그린 원본 SVG.
- 효과음: `src/audio/sound.ts`에서 실행 시 합성(음원 파일 없음, CHESS MASTER와 같은 코드).
- 서명 키 `android/family-hangman.keystore`: CHESS MASTER의 가족 키(`family-chess.keystore`)를 복사한 같은 키.
