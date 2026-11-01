# CODEX_TASK_07 · 타일 모자이크·사다리·봉인 검토

실제 브라우저에서 입력 기록을 재생해 얻은17장입니다. 방/사다리 캔버스는1920×1080, 지도/봉인 화면은PC1280×900, 모바일은780×330/DPR2입니다. 무손실WebP를 원본PNG와 디코딩RGBA 바이트 전체로 비교했습니다. 이전 검토 캡처는 별도 폴더에 보존합니다.

| 방 | PC |
| --- | --- |
| 잔광의 성문 | [gate](room-gate.webp) |
| 침묵의 서고 | [crypt](room-crypt.webp) |
| 금 간 보관실 | [vault](room-vault.webp) |
| 봉인 회랑 | [nave](room-nave.webp) |
| 잿빛 맹세의 홀 | [reliquary](room-reliquary.webp) |
| 기울어진 종탑 | [belfry](room-belfry.webp) |
| 달빛 프리즘실 | [prism](room-prism.webp) |
| 귀환의 다락 | [loft](room-loft.webp) |

- 봉인: [다락 사다리에서 내려가다 막힘](sealed-ladder-blocked.webp), [레버를 켠 뒤 성문으로 통과](sealed-ladder-open.webp). 첫 장면은 닫힌 봉인을 통과하지 않아 캐릭터가 아직 다락에 있고, 화면 안내로 막힘을 표시합니다.
- 실제 새 위층 경로: [회랑 상층](upper-gallery.webp), [사다리 오르기](ladder-up.webp), [내리기](ladder-down.webp).
- 지도: [시작](map-start.webp), [완주 후](map-complete.webp).
- 모바일780×330: [모자이크/밝은 사다리](mobile-area-780x330.webp), [지도](mobile-map-780x330.webp).

재현:

```sh
HK_URL=http://127.0.0.1:8766/games/the-hollow-keep/next/ CHROMIUM_PATH=/usr/bin/chromium HK_SHOT_DIR=/tmp/hk07-review node games/the-hollow-keep/next/tests/exploration-browser.cjs
python games/the-hollow-keep/next/tools/pack-mosaic-review.py /tmp/hk07-review
```

캡처는 실제 앱·키보드/터치와 기존 루프에서 얻었습니다. 브라우저 시계만 제어하며 world/pose/좌표를 주입하지 않습니다. 두 번째 봉인 점검도 시작부터 새로 플레이하며, 레버를 켜지 않고 다락 사다리로 가서 막힘을 확인한 뒤 실제 조사로 레버를 켭니다. 재미·외형과 실제 기기 회전은 사용자/검토 담당 확인 대기입니다.
