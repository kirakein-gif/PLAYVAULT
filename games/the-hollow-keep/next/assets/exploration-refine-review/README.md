# CODEX_TASK_06 · 출입문·봉쇄물·방 밀도 검토

실제 PC 앱의 입력 완주 재생에서 캡처했습니다. 캔버스는1920×1080, 지도는PC1280×900 페이지, 모바일은780×330/DPR2입니다. world/pose/좌표를 주입하지 않았습니다. 선택한28장을 **무손실WebP**로 보관하며 원본PNG와디코딩한RGBA 픽셀 전체가 동일함을 검사했습니다(총779,912바이트). 이전 task05 캡처는 별도 폴더에 그대로 있습니다.

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

| 봉쇄물 기호 | 닫힘 | 열림 |
| --- | --- | --- |
| 열쇠 | [닫힘](closed-bronze-door.webp) | [열림](open-bronze-door.webp) |
| 표적 | [닫힘](closed-oath-door.webp) | [열림](open-oath-door.webp) |
| 레버 | [닫힘](closed-bell-door.webp) | [열림](open-bell-door.webp) |
| 빛 | [닫힘](closed-light-door.webp) | [열림](open-light-door.webp) |
| 가로 격자/귀환 레버 | [닫힘](closed-return-seal.webp) | [열림](open-return-seal.webp) |

- 출입문: [성문 앞](before-enter-gate-arch.webp) → [보관실 도착](enter-gate-arch.webp); [잠긴 서고 아치 앞](before-enter-crypt-arch.webp) → [잠금 해제와 프리즘실 도착](enter-crypt-arch.webp).
- 숨은 물건: [벽 파괴](break-cracked-screen.webp), [인장 열쇠 획득](pickup-sigil-key.webp).
- 지도: [시작](map-start.webp), [모든 방·물건 확인 후 복귀](map-complete.webp).
- 모바일780×330: [시작 방](mobile-area-780x330.webp), [지도](mobile-map-780x330.webp).

재현:

```sh
HK_URL=http://127.0.0.1:8766/games/the-hollow-keep/next/ CHROMIUM_PATH=/usr/bin/chromium HK_SHOT_DIR=/tmp/hk06-review node games/the-hollow-keep/next/tests/exploration-browser.cjs
python games/the-hollow-keep/next/tools/pack-refine-review.py /tmp/hk06-review
```

막힌 길과 출입문의 의미·방법 기호는 실제 drawImage 기록으로도 확인합니다. 재미·난이도·외형은 사용자 판단 대기이며, 실기기 회전은 별도 확인이 필요합니다.
