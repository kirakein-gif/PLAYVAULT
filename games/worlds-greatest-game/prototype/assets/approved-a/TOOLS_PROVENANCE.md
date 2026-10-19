# 도구 동작 아트 제작 기록

2026-10-19, 내장 image_gen 편집. 기존 승인한 `enemy-rps.png`와 `player-rps.png`, `approved-rps-reference.png`를 기준으로 제작했습니다. 원본 생성 PNG 픽셀은 재가공하지 않았으며 atlas 샘플링으로 사용합니다.

- `tool-bodies.png`: 투명 2172×724, 3열. 상대 기본/피격, 주인공 등·뒤통수. 동적 팔을 붙일 몸통이며 휴식 팔은 소매 레이어로 렌더링합니다.
- `tool-grips.png`: 투명 1774×887, 2열. 상대 오른손 손등과 주인공 오른손 손바닥/옆면. 손목이 가로로 나가며 손잡이는 Canvas 도구로 별도 합성합니다.

## 몸통 전체 프롬프트

Create a transparent game sprite atlas with ONE ROW of THREE equal square cells. Reference images are existing registered RPS character sheets. Preserve exact identity, hair, ink-and-painted mature Korean comic art and camera. LEFT cell: beige opponent full upper torso, head to waist, same view and proportions as reference, BOTH arms OMITTED cleanly from the shoulder caps (no hanging sleeves, hands or extra arms); torso includes jacket shoulder caps, complete neck and head. MIDDLE cell: EXACT same registered beige armless torso but startled comic pain face, eyes shut, mouth ouch, harmless hammer reaction. RIGHT cell: navy foreground protagonist seen from behind, same back head, collar and back shoulders as reference, BOTH arms OMITTED cleanly below shoulder caps. Full head and waist, no active arms, no hand, no furniture or prop. Bodies will have animated arms composited at shoulder caps, so do not paint hanging arms into torsos. All isolated on genuine transparent background, no text, labels or grid. Left/middle beige characters same position and scale. Match the references closely, realistic neck connection, preserve the over-right-shoulder camera.

## 잡는 손 전체 프롬프트

Create a transparent ONE ROW TWO-CELL game hand sprite sheet matching the semi-realistic ink painted Korean comic style of reference. ONLY hands with a short wrist stump, no forearms, tool or other parts. Both are anatomically RIGHT HANDS holding an invisible VERTICAL cylinder handle, fingers naturally curled fully around it and thumb locking above. LEFT cell: opponent right-hand grip viewed from BACK OF HAND, wrist stump exits LEFT HORIZONTALLY, knuckles and nails face camera, thumb up, handle axis vertical at hand center. RIGHT cell: protagonist right-hand grip viewed from PALM/SIDE, wrist stump exits RIGHT HORIZONTALLY, palm side visible with curled fingers, thumb up, handle axis vertical at hand center. Hands natural adult proportion, clean five-finger anatomy, slightly foreshortened, no detached digits. Both fists centered at exactly same height in respective equal square cells, generous transparent margin. No actual tool, rod, props, body, background, checkerboard, label, grid or text. Crucial: wrists extend SIDEWAYS, not downwards; will connect to horizontal forearms reaching across desk.

