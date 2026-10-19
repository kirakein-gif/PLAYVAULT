# A안 게임 아트 제작 기록

v0.13 수평 테이블과 짧은 뿅망치 타격 그림의 출처·전체 프롬프트는 [STAGE_PROVENANCE.md](STAGE_PROVENANCE.md)에 기록했습니다. 현재는 `table-horizontal`과 `*-crown-compact`를 사용하며 이전 strike 파일은 이력으로 보존합니다.

v0.11 정수리 내려치기 단일 이미지의 출처와 프롬프트는 [CROWN_PROVENANCE.md](CROWN_PROVENANCE.md)에 기록했습니다. 현재 로더는 이전 5개 이미지에 `enemy-crown-strike`, `player-crown-strike`를 추가합니다.

v0.10 완성형 정지 포즈와 전체 프롬프트는 [STILLS_PROVENANCE.md](STILLS_PROVENANCE.md)에 기록했습니다. 현재 실행 페이지는 office / enemy-rps / player-rps / enemy-stills / player-stills만 로드합니다. 아래 설명은 이전 버전의 제작 이력입니다.

v0.9 도구 구간의 몸통·오른손 그립 아트와 전체 프롬프트는 [TOOLS_PROVENANCE.md](TOOLS_PROVENANCE.md)에 기록했습니다.

v0.8 오른손 가위바위보 연결형 포즈, 기준 이미지와 전체 프롬프트는 [RPS_PROVENANCE.md](RPS_PROVENANCE.md)에 기록했습니다.

- 방식: 내장 image_gen. 2026-10-19, 사용자 선택 A · 우측 어깨너머 구도와 그림체 반영.
- 기준 이미지: `approved-storyboard.png`는 이 대화에서 새로 생성하고 사용자가 선택한 A안입니다. 외부 게임 그림/소스/음원은 사용하지 않았습니다.
- `characters.png`: 투명 2×2 파츠 시트(상대 머리/몸통, 플레이어 뒤통수/몸통), 1254×1254.
- `limbs.png`: 투명 4×2 파츠 시트(소매 4종, RPS 손 3종, 잡는 손), 1774×887.
- `office.png`: 인물과 도구가 없는 사무실 배경. 테이블/도구는 Canvas 도형과 질감으로 별도 렌더링.
- `hurt.png`: 상대 피격 표정. 머리 파츠와 별도로 교체합니다.
- atlas 바운드는 PNG 알파 영역을 읽어 측정했으며 원본 PNG를 편집/잘라내지 않았습니다. 실제 샘플링 영역은 `../../art-bounds.js`입니다.
- 손/소매는 분리된 레이어로 배치합니다. 짧은 RPS 팔과 멀리 뻗는 팔의 화면상 길이는 원근 단축을 반영한 2.5D 포즈입니다. 최종 3D 골격이나 완성된 리깅을 의미하지 않습니다.
- 그림체를 반영한 1차 동작 블로킹이며 소매 연결, 주름/손목 회전 및 아트의 추가 QA가 필요합니다. 별도 상업 이용/권리 점검은 기존 저장소 정책을 따릅니다.

## 생성 프롬프트

### v0.7.1 enemy-bust / enemy-bust-hurt

- 내장 image_gen 편집, 투명 배경. 기존 `characters.png`를 기준으로 연결된 상반신 `enemy-bust.png` 생성. 이를 기준으로 같은 구도의 `enemy-bust-hurt.png` 생성. 두 파일 모두 1145×1374. 원본 PNG는 재가공하지 않았으며 같은 샘플링 영역을 사용합니다.
- 상대는 이제 머리와 몸통 파츠 및 예전 `hurt.png`를 렌더링하지 않습니다. 새 상반신 전체가 함께 반동합니다. 기존 파츠는 제작 이력으로 보존합니다.

enemy-bust 전체 프롬프트:

Use case: compositing. Edit target: supplied character atlas. Make a NEW single transparent game sprite: combine ONLY the stern dark-haired man's top-left head and top-right beige suit torso into ONE anatomically continuous seated upper-body portrait. Preserve his identity, face, hairstyle, illustrated ink and painted shading style, beige jacket, white shirt and burgundy tie. Head upright at same three-quarter angle looking toward viewer-right, natural complete neck connected seamlessly to shirt collar; absolutely no cut seam, floating head, missing neck or detached skin triangles. Show entire hair to waist, relaxed arms kept at sides, no hands extended. The head and body must be drawn as one continuous connected character. Transparent background, one character centered with generous transparent margins, no other sprites, no table, no text. Keep same head-to-shoulder proportions as reference: head width about 40 percent of shoulder width.

enemy-bust-hurt 전체 프롬프트:

Use case: identity-preserve. Edit target supplied continuous transparent beige-suited man sprite. Change ONLY his facial expression: eyes squeezed shut, brows raised in startled comic pain and mouth slightly open saying ouch, from a harmless toy hammer hit, no injury. Keep EXACT same canvas dimensions, framing, pixel positions, silhouette, head shape, hair, ears, complete neck, continuous collar, beige jacket, shirt, tie, body pose, ink style and shading. No head movement, no neck seam, no head separation, no crop, no added objects or text. Transparent background preserved. This is a registered alternate-expression frame of the identical full upper-body sprite; everything outside eyes eyebrows cheeks and mouth must stay unchanged.

### characters

Use the supplied A storyboard as an EXACT art/character design reference, not an edit target. Create a production game character-parts ATLAS on a genuinely TRANSPARENT background, square 2048x2048, EXACTLY 2 columns by 2 rows, equal 1024x1024 cells, NO drawn cell borders, NO text, NO shadows cast outside each piece. Every piece stays entirely within its own cell with at least 8% transparent padding. Maintain the beautiful mature semi-realistic Korean comic ink-and-cel-shading style and exact two adult men from the reference. Do not make crude flat vector figures.
TOP LEFT cell: beige opponent's complete HEAD with dark parted hair, face, jaw and short neck only, stern focused gaze toward lower-right; no torso, no shoulders, no hands. Center vertically; whole head fits inside cell, crown at 10% cell height, neck ends 90%, head faces three-quarter right, same handsome adult office worker.
TOP RIGHT cell: matching opponent headless beige-jacket TORSO from short neck stump down to waist, burgundy tie, white shirt, jacket lapels, fabric folds. Shoulders in three-quarter front view to right. Arms hang down quietly at sides, blend into torso silhouette, no visible hands/forearms. NO head in this cell. Fill central 85% width and height.
BOTTOM LEFT cell: navy player's HEAD ONLY seen directly from behind at a slight upper-left facing angle: dark short hair with natural painted strands, back of skull and a little nape. NO facial profile, eyes, nose or ear. Crown at 10%, nape at 90%, no torso or hands. Match reference hair and rear camera.
BOTTOM RIGHT cell: navy player's headless BACK AND SHOULDERS / jacket torso, seen from behind and angled to face upper-left, broad near right shoulder, slightly foreshortened left shoulder. White shirt collar around nape, navy suit folds, cropped at waist. Arms tucked down as part of body contour, no exposed hand or reaching arm, NO head.
All four parts have clean anti-aliased transparent edges, painted fabric detail and lighting from upper left, matching identity. These pieces will be independently positioned and animated in Canvas, so separate them completely. No table, props, office, caption, watermark or checkerboard.

### limbs

Use the supplied A storyboard as visual style reference. Generate an animation SPRITE ATLAS, truly TRANSPARENT, landscape 2048x1024, exactly 4 columns by 2 rows of EQUAL square cells, NO grid lines or text. Every isolated piece centered in its cell with at least 8% alpha padding. Mature natural adult anatomy, beautiful detailed comic shading matching reference, realistic suit folds, not rubber tubes. For all sleeve pieces the limb points straight DOWN: proximal joint at cell top-center (y12%), distal joint at bottom-center (y88%); no hands attached. Keep narrow natural tapered sleeves, no huge bulbous shapes.
TOP ROW left to right:
1 beige jacket UPPER ARM sleeve segment, rounded shoulder cap to elbow, anatomical fabric volume.
2 beige jacket FOREARM sleeve segment, elbow to white shirt cuff at bottom; tapered forearm.
3 navy jacket UPPER ARM sleeve segment, rounded shoulder cap to elbow.
4 navy jacket FOREARM sleeve segment ending white cuff at bottom.
BOTTOM ROW left to right:
1 adult hand ROCK fist, five fingers correctly folded, short wrist at bottom center, knuckles toward camera, no forearm.
2 adult hand SCISSORS two fingers, clearly extended index and middle fingers pointing UP, other fingers folded, wrist bottom center, no forearm.
3 adult hand PAPER open five-finger palm pointing UP, wrist bottom center, no forearm.
4 adult tool-GRIP hand with fingers wrapped around a small invisible vertical handle at center, short wrist at bottom center, no actual tool.
Natural skin shading and thin ink contours, hand scale consistent. Isolated parts only. No background, tool, body, labels, checkerboard, watermark, decorative objects. Do not draw duplicates inside any cell.

### office

Use supplied storyboard A only as style and office-environment reference. Create ONE wide empty office training room game background, 1920x1152, same mature semi-realistic Korean comic ink-and-color style, with muted warm gray walls, distant office desks and chairs, a whiteboard and one small potted plant. Camera at seated eye level from the player's right over-shoulder viewpoint, but REMOVE ALL PEOPLE from the image. Also NO foreground table and NO hammer or pot: a separate game table and animated characters will be composited in front. Put room furnishings in the far background, maintain calm low contrast, give a broad unobstructed central area. Floor horizon around lower third; strong readable but subtle perspective. No foreground objects obscuring game actors. No text, labels, HUD, watermark or borders. Atmospheric natural daylight, detailed restrained neutral colors matching the approved storyboard.

### hurt

Create ONE transparent game head portrait, matching EXACTLY the beige opponent's TOP LEFT HEAD in this reference atlas: same adult Korean man, same parted dark brown hair, same thin ink contours and detailed semi-realistic Korean comic shading, same three-quarter orientation and head scale/proportions. Isolate complete hair, face, jaw and short neck, no body/shoulders. Change only expression for a comic toy-hammer impact: eyes squeezed shut, brows lifted in startled pain, mouth open in a brief 'ouch', gently compressed cheek, non-graphic and humorous. Head remains anatomically consistent, no blood/injury. Center full head with 8% transparent padding, no other parts, background, labels or watermark.
