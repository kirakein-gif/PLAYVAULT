# THE HOLLOW KEEP · Foundation 시험 방

픽셀아트 HD 주인공·타일 위에서 이동·점프·무기·교대를 비교하는 독립 시험 방입니다. 리뷰의 4건 수정과 모바일 화면 확대·가로 전체 화면과 도약 종류별 공중 조작 요구를 반영했으며 사용자 조작감 평가와 Claude Code 재검토를 기다립니다. 게임 버전 번호는 부여하지 않았습니다. 기존 게임과 루트 런처는 그대로입니다.

## 현재 기본 자산 · CODEX_TASK_04 x2 전체 동작

사용자가 선택한 **x2(scale 2)**를 기본 `assets/pixel/`에 적용했습니다. Ethan·Noah 각각 idle4, run6, 제자리/달리기 점프 각3, 착지2, 공격4프레임입니다. 새 자세 원본을 생성한 뒤 축소·공유64색·알파/윤곽/손·발 정렬을 정리하는 경로 A로 제작했습니다. Noah 달리기도 새 원본을 사용했습니다. 생성 지시문 전문은 [PROVENANCE](assets/pixel/PROVENANCE.md)에 있습니다.

일반 프레임256×192, 공격320×224, 발 pivot(128,190), 타일60px, 발판 불투명 두께32px, 배경1920×1080입니다. 게임 속 몸 크기·판정은 그대로입니다. 캔버스는 1920k×1080k, 변환은 `setTransform(k*2,0,0,k*2,0,0)`입니다. 공격 준비는 두 주인공 모두2틱, 이후 발사/베기→후속→복귀로 진행합니다. Noah 효과는 공격 나이에서 준비 시간을 뺀 시간으로 한 번 재생하고, 프레임별 손 위치에서 앞쪽으로 그립니다. 준비 자세에는 효과가 없으며 공격 방향을 유지합니다. 실제 판정·룬탄 발사 시점은 바꾸지 않았습니다.

```sh
python games/the-hollow-keep/next/tools/build-full-x2.py
HK_URL=http://127.0.0.1:8766/games/the-hollow-keep/next/ CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tools/capture-full-x2.cjs
```

기본 자산51/51, 렌더7/7, 인수51/51, 경계16/16, 구덩이4/4, 모바일배치20/20, 전체화면6/6, 브라우저20/20, 시험본10/10, ABYSSFALL 회귀3종 통과. [목표6자세·실제 공격 연속·PC/780×330 비교](assets/pixel-review/README.md)를 제출합니다. 시험본 디렉터리와 이번 검사 원본은 수정하지 않았습니다. 이전50/51의 slash 반복 문제는 이번 비반복 효과로 해결했습니다. **외형·동작 품질은 사용자 판단 대기, 재검토는 Claude Code**입니다. 실제 기기 회전은 확인 필요입니다.

아래 CODEX_TASK_03·02 내용과 수치는 당시 작업 기록입니다. 현재 기본 세트 재생성에는 위 `build-full-x2.py`를 사용합니다.

## 이전 목표 외형 밀도 시험 · CODEX_TASK_03

당시 작업은 전체 재제작 전의 **밀도 선택용 시험본**입니다. 사용자가 지정한 `docs/reference/target-pose-board-2026-10-31.jpg`의 원본 PNG를 경로 A 밑그림으로 사용했습니다. 어느 쪽이 낫다는 판단은 하지 않습니다.

- `/games/the-hollow-keep/next/?art=trial-x1`: scale1, Ethan68px / Noah64px 기준.
- `/games/the-hollow-keep/next/?art=trial-x2`: scale2, Ethan136px / Noah128px 기준.
- 게임 속 몸 크기·조작·방은 같고, 그림의 원래 픽셀 밀도만 다릅니다. 같은 원본과 같은 64색 팔레트에서 각각 독립적으로 면적 샘플링·윤곽/얼굴/손/알파/프레임 정리를 했습니다. x2는 x1을 두 배 확대한 파일이 아닙니다.
- 두 폴더 모두 Ethan idle4/run6, Noah idle4만 제공합니다. 빠진 점프·공격·착지/Noah run은 도형으로 대신 그립니다. `artStatus()`는 scale도 반환합니다. 전체 스프라이트·베기 효과 재제작은 사용자가 밀도를 선택한 뒤 진행합니다.
- `assets/pixel-trial/x1|x2/`의 manifest/palette/PROVENANCE에 원래 프레임·pivot·처리 과정을 적었습니다. 원본 PNG와 새 달리기 원본은 `tools/art-source/`, 재생성은 `tools/build-density-trial.py`(Pillow/numpy/scipy)입니다. 두 밀도 모두 같은 포즈/위상으로 제작했습니다.
- [비교 캡처 모음](assets/pixel-trial/comparison/README.md): 목표 자세 | x1 | x2를 같은 표시 높이로 나란히, PC1280×900와 모바일780×330 게임 화면에서 두 모드를 비교할 수 있습니다. 캡처는 PR #8에도 링크했습니다.

```sh
python games/the-hollow-keep/next/tools/build-density-trial.py
HK_ART_REQUIRE="ethan:idle,run;noah:idle" HK_ART_DIR=games/the-hollow-keep/next/assets/pixel-trial/x1 CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/pixel-assets.cjs
# x2 폴더도 같은 명령으로 검사
CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/density-trial.cjs
```

이번 결과: x1/x2 자산 각각 **18/18**, 각 시험본과 기본 모드의 렌더 검사 **5/5**, 추가 시험본 런타임 검사 **10/10**. 원래 pixel-render를 그대로 실행했을 때는 시험본에서 각각4/5였습니다. 강제404 경로가 기본 `/assets/pixel/`로 고정되어 시험본 요청을 막지 못한 문제여서, `4917569`에서 정규식 대상에 `pixel-trial/x[12]`도 포함하는 한 줄만 보완했습니다. 기존 failed/이동/오류 판정은 모두 그대로이며 완화·건너뛰기가 아닙니다. 실제 시험 경로를 막는 추가 검사에서도 404/대체/이동을 확인했습니다. 이 원본 검사 경로 변경은 검토 담당이 별도로 확인해야 합니다.

기본 자산도 새 원본 검사로 재실행해 **50/51**입니다. 알려진 `noah/fx-slash.loop=true`가 실패하며 전체/베기 재제작 보류 지시 때문에 그대로 두었습니다. 기본 pixel-render **5/5**, 인수51/51·경계16/16·구덩이4/4·배치20/20·전체 화면6/6·브라우저20/20·기존 회귀3종은 통과했습니다. 사용자 밀도 선택·외형 판단 및 실제 휴대전화 확인은 대기입니다.

## 이전 기본 픽셀 자산과 렌더링 (CODEX_TASK_02)


`assets/pixel/`에 46색 공통 팔레트, manifest, 제작 기록, 두 주인공의 네이티브 PNG 시트 12개와 선택 효과 2개, 30px 타일셋, 960×540 배경을 둡니다. 타이틀 키아트는 외형 참고로만 사용했습니다. 이미지 생성 보드 역시 참고용이며 최종 픽셀을 복사·축소하지 않았습니다. 전체 지시문·재작성·팔레트/투명도 정리 과정은 [PROVENANCE.md](assets/pixel/PROVENANCE.md)에 있습니다.

| 동작 | 프레임 | 원래 프레임 크기 | 선택 방식 |
| --- | --- | --- | --- |
| idle | 4 | 96×96 | 12틱씩 반복 |
| run | 6 | 96×96 | 6틱씩 반복 |
| jump-standing / jump-running | 각각 3 | 96×96 | jumpKind + vy(상승/정점/하강) |
| land | 2 | 96×96 | land 이벤트 후 각 4틱 |
| attack | 4 | 128×96 | attack 이벤트 후 각 5틱 |

발 기준점은 (48,95), idle 불투명 높이는 Ethan 68px/Noah 64px입니다. 오른쪽 방향으로 그리고 왼쪽은 렌더러에서 뒤집습니다. 룬탄 2프레임/참격 3프레임 효과와 바닥 윗면·벽 속·16px 발판 3종 타일도 같은 팔레트/0·255 투명도를 사용합니다.

캔버스는 표시 크기×DPR 이상인 최소 정수 k의 (960×scale)k×(540×scale)k 해상도를 쓰고, `setTransform(k)`와 `imageSmoothingEnabled=false`로 그립니다. PNG는 원래 해상도 그대로이며 화면에서만 확대/축소합니다. 스프라이트 출력 좌표는 그림 픽셀 단위로 반올림하고(/scale) 타일 크기도 scale을 반영하지만 시뮬레이션 좌표와 CONFIG는 바꾸지 않습니다. 창·전체 화면 크기가 달라져도 매 프레임 필요한 backing 크기를 확인합니다.

`HKPlaytest.artStatus()`는 `{loaded, failed, scale}`를 반환합니다. 이미지/manifest가 실패해도 게임은 계속 진행하며, 실패한 동작/타일/배경은 기존 도형·배경 경로로 대신 표시합니다. 개별 이미지 실패가 나머지 정상 이미지를 막지 않습니다.

자산 재작성은 Python 3와 Pillow(이번 실행 12.3.0)가 있는 도구 환경에서 다음과 같이 실행합니다. 런타임에는 Python이 필요 없습니다.

```sh
python games/the-hollow-keep/next/tools/build-pixel-art.py
CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/pixel-assets.cjs
```

원래 격자에 정수 좌표로 직접 그린 뒤 팔레트/알파를 정리하며, 재실행 PNG 해시가 동일함을 확인했습니다. 원본 참고 이미지를 읽거나 리사이즈하지 않습니다. 빌더는 검토용 `/tmp/hollow-keep-pixel-contact.png`도 출력합니다.

## 실행

저장소 루트에서:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:8765/games/the-hollow-keep/next/`를 엽니다. 수치 패널을 처음부터 보려면 `?debug=1`을 붙입니다. 기존 비교 대상은 `/games/the-hollow-keep/`입니다.

- A/D 또는 ←/→: 이동. 좌우 동시 입력은 감속합니다.
- Space/K/Z: 점프. 일찍 떼면 낮게 점프합니다. 누른 채 착지해도 자동 점프하지 않습니다.
- J/X: 공격. 누르고 있어도 연사하지 않습니다.
- Q/Tab: Ethan(빛·룬탄) ↔ Noah(그림자·근접) 교대. 천장이나 벽에 몸이 끼면 교대를 거절합니다.
- 터치: 왼쪽 여백의 한 축 조이스틱을 좌우로 밀어 이동하고, 오른쪽 여백의 점프·공격·교대 버튼을 누릅니다. 조이스틱 중앙은 정지이며, 이동과 점프를 동시에 누를 수 있습니다. 이동은 중앙 데드존 밖에서 해당 방향의 기존 속도를 사용합니다.
- F2 또는 ` 키 / 수치 조절 버튼: 디버그 전환.
- 방 초기화: 현재 주인공과 CONFIG를 유지하며 위치·표적·공격을 초기화합니다.
- 전체 화면: 가로 화면 왼쪽 위의 ‘전체 화면’ 버튼 또는 세로 회전 안내의 ‘가로 전체 화면’을 누릅니다. 진입 후 ‘화면 해제’를 누르면 나옵니다. 자동 진입하지 않습니다.

캔버스에 입력 초점이 있어야 키보드 조작이 됩니다. 수치 입력 중에는 게임 키가 작동하지 않습니다. 화면 이탈·초점 해제·세로 전환 시 입력과 누적 시간을 지웁니다. 실제 모바일에서는 가로 방향을 사용합니다.

## 모바일 가로 화면·전체 화면

캔버스는 16:9 비율을 유지하며 좌우 조작 여백을 제외한 가능한 최대 크기로 표시합니다. 위쪽 제목줄과 아래쪽 버튼줄은 모바일 가로에서 제거했습니다. 이동은 왼쪽, 점프·공격·교대는 오른쪽, 방 초기화·수치 조절·전체 화면은 여백 위쪽에 배치하며 캔버스를 가리지 않습니다. 수치 조절을 열면 별도 스크롤 패널로 확인할 수 있습니다.

| 가로 화면 | 캔버스(약 CSS px) |
| --- | --- |
| 740×320 | 569×320 |
| 780×330 | 587×330 |
| 844×390 | 693×390 |
| 915×412 | 732×412 |

전체 화면 버튼을 누른 순간 `requestFullscreen({navigationUI:'hide'})`를 호출하고, 성공하면 `screen.orientation.lock('landscape')`를 요청합니다. 가로 고정이 거절되어도 전체 화면은 유지하며 직접 기기를 돌리라는 안내를 표시합니다. 전체 화면 자체가 거절되거나 iPhone Safari처럼 미지원이면 오류 없이 안내를 표시하고 일반 가로 화면에서 조작할 수 있습니다. 화면 크기가 바뀌면 동적 뷰포트 기준으로 재배치하고 누적 시간만 초기화합니다. 유효한 조이스틱 포인터와 방향은 유지하며, 손 떼기·취소·실제 초점 이탈·숨김·세로 전환 시에는 입력을 해제합니다. 조이스틱을 누른 채 다른 손가락으로 전체 화면을 누를 수 있습니다.

**실제 화면 회전은 실기기 확인 필요**입니다. 자동 검사는 전체 화면 진입/해제와 가로 고정 호출, 거절 처리, 미지원 대응 및 크기 변경 후 배치를 확인합니다. 실제 휴대전화의 주소창·노치·터치감·방향 전환은 사용자가 확인해야 합니다.

## 공중 조작

점프 시작 순간의 수평 속도를 `getPlayer(world).takeoffVx`에 기록하고, 그 절댓값이 `runSpeed`의 50% 이상이면 `jumpKind='running'`, 아니면 `'standing'`으로 표시합니다. 코요테·버퍼 점프도 실제 도약 순간의 속도를 기록합니다. 종류와 기록은 착지까지 유지하고 착지 시 `jumpKind=null`, `takeoffVx=0`으로 초기화합니다.

- 도약 방향의 공중 속도 상한: `max(airControlSpeed, abs(takeoffVx))`.
- 반대 방향의 공중 속도 상한: `airControlSpeed`.
- 제자리 점프 후 이동은 공중 조작 속도만큼, 달리며 뛴 점프는 도약 속도만큼 움직입니다. 반대 방향을 누르면 감속 후 제한된 속도로 후진합니다.
- 키를 떼면 기존 마찰·정지 상한을 그대로 적용해 수직 낙하합니다. 이 동작은 사용자 승인으로 유지했습니다.
- 초기 공중 조작 속도는 Ethan **1.33px/틱**, Noah **1.73px/틱**으로 달리기 속도의 약 45%입니다. 패널에서 `공중 조작 속도`를 조절·복사할 수 있으며 `0 < airControlSpeed < runSpeed`를 유지합니다. 달리기 속도를 낮춰 범위를 벗어나면 공중 속도를 약 45%로 다시 맞춥니다.
- 달리기 점프는 앞으로 기운 별도 jump-running 시트, 제자리 점프는 곧게 선 jump-standing 시트로 표시합니다. PNG를 회전·늘리지 않고 원래 픽셀을 그립니다. 자산 실패 시 이전 약 9° 기울기의 도형 대체 경로를 사용하며 몸/공격 판정은 기울이지 않습니다. 디버그에는 종류와 도약 속도를 표시합니다.

## 시험 방과 디버그

바닥, 70/70/140px 높이 차이의 세 발판, 가장자리와 85px 구덩이, 낮은 천장, 벽, 가까운/먼 표적을 제공합니다. 실제 방 데이터로 바닥 x=320부터 달려 x=450 부근에서 점프하는 시뮬레이션에서 Ethan은 x=543.08, Noah는 x=630.04에 착지하며, 이후 두 몸 모두 오른쪽 바닥 위로 이동합니다. 기존 145px 지형 비교에서는 111개 점프 입력 위치 중 Ethan 0개, Noah 89개가 통과했습니다. 구덩이에 빠지면 방 전체와 표적이 자동 초기화됩니다. 표적은 움직이지 않으며 HP가 0이 되면 공격을 더 받지 않습니다. 방 초기화로 복원합니다.

디버그는 몸(초록)·공격(분홍) 판정, 속도, onGround, 코요테·버퍼, 틱을 표시합니다. 패널에서 이동·점프·무기·교대 값을 바꾸면 방을 다시 시작합니다. ‘현재 CONFIG 복사’는 전체 JSON을 복사하고 텍스트로도 표시합니다. 클립보드 권한이 없으면 표시된 텍스트를 직접 복사합니다. 기본값 복원은 페이지의 초기 CONFIG로 돌아갑니다. 조절 값은 새로고침 후 유지되지 않습니다.

## 구조와 수치

- `sim.js`: DOM/시계/난수 없이 실행되는 규칙. Node `module.exports`와 브라우저 `HKSim` 계약을 공유합니다.
- `input.js`: 키보드·한 축 조이스틱·여러 포인터를 틱 입력으로 합칩니다. 프레임 사이에 눌렀다 뗀 입력도 큐로 보존하며, 동작 자체는 시뮬레이션의 입력 edge에서 시작합니다.
- `fullscreen.js`: 버튼에서만 전체 화면 진입/해제, 진입 후 가로 고정 요청 및 미지원/거절 안내.
- `room.js`: 브라우저와 시뮬레이션 검사에서 공유하는 실제 시험 방 데이터와 85px 구덩이 라벨.
- `app.js`: 누적 시간에 따라 1/60초 step을 반복합니다. 한 화면 프레임은 최대 8틱입니다. 지연 초과분은 버려 복귀 시 갑자기 수백 틱을 진행하지 않습니다.
- `pixel-art.js`: manifest/PNG 비동기 로드와 개별 실패 기록.
- `render.js`: 정수 배율 캔버스, 동작 시트·타일·배경·효과와 표적/피해 숫자, 개별 자산 실패 시 이전 도형 대체 경로.
- `tools/build-pixel-art.py`: 원래 격자의 픽셀 재작성·팔레트/알파 정리·manifest 생성. 게임 규칙과 독립된 도구입니다.

단위는 px, px/틱, 틱(1/60초)입니다. 속도·중력·몸 크기·가속·마찰·코요테·버퍼·룬탄 수치는 기존 구현에서 출발했습니다. 점프 높이는 가변 시간 구현의 근사 85/150px를 고정 틱 이산 궤적으로 정리한 80/145px입니다. 초기 점프 속도는 목표 높이와 중력에서 계산합니다. 짧은 점프는 34/56px를 목표로 상승 속도를 제한합니다. 정지는 마찰에 더해 `stopTicks` 상한을 보장하는 감속을 적용합니다.

| CONFIG.heroes 항목 | Ethan | Noah |
| --- | --- | --- |
| `width` | 42 | 39 |
| `height` | 68 | 64 |
| `runSpeed` | 2.95 | 3.85 |
| `airControlSpeed` | 1.33 | 1.73 |
| `stopTicks` | 8 | 5 |
| `accelerationGround` | 0.42 | 0.68 |
| `accelerationAir` | 0.22 | 0.4 |
| `friction` | 0.82 | 0.6 |
| `gravity` | 0.7 | 0.57 |
| `jumpHeight` | 80 | 145 |
| `variableJump` | true | true |
| `minJumpHeight` | 34 | 56 |
| `maxFall` | 13.5 | 13.8 |
| `coyoteTicks` | 6 | 8 |
| `jumpBufferTicks` | 7 | 8 |

| weapon 항목 | Ethan | Noah |
| --- | --- | --- |
| `kind` | projectile | melee |
| `damage` | 22 | 22 |
| `range` | 1017.6 | 66 |
| `cooldownTicks` | 29 | 18 |
| `speed` | 10.6 | — |
| `width` | 18 | — |
| `height` | 12 | 46 |
| `activeTicks` | 96 | 9 |

공통: `swapCooldownTicks=11`, `swapVelocityScale=0.82`. 교대 시 발과 몸 중심을 유지하며 속도를 승계합니다. 벽에 붙어 몸이 넓어지면 폭 차이(기본 3px) 이내에서 가장 작은 수평 보정을 적용하고, 그래도 고체와 겹치면 교대를 거절합니다. 진행 중 근접 판정은 교대 시 취소하고 이미 발사한 탄은 유지합니다. 룬탄은 **관통하지 않으며 첫 표적 명중 즉시 소멸**합니다. 사거리/수명을 소진하거나 고체에 닿아도 사라집니다. 한 틱에 여러 물체를 지나면 이동 방향에서 가장 먼저 접촉하는 물체를 처리합니다.

## 검증 재현

```sh
node games/the-hollow-keep/next/tests/foundation-contract.cjs
node games/the-hollow-keep/next/tests/foundation-edge.cjs
node games/the-hollow-keep/next/tests/room-traversal.cjs
node tests/polish-regression.cjs
node tests/audio-regression.cjs
node tests/audio-wind-regression.cjs
```

브라우저 검사는 Playwright 모듈과 Chromium이 있는 환경에서 위 HTTP 서버를 켜고 실행합니다. 저장소 루트의 의존성 설정은 변경하지 않았습니다. 모듈이 없으면 별도 도구 환경에 Playwright를 설치해야 합니다.

```sh
CHROMIUM_PATH=/usr/bin/chromium HK_SHOT_DIR=/tmp node games/the-hollow-keep/next/tests/pixel-render.cjs
CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/mobile-layout.cjs
CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/mobile-fullscreen.cjs
CHROMIUM_PATH=/usr/bin/chromium node games/the-hollow-keep/next/tests/browser-playtest.cjs
```

서버 주소는 `HK_URL`, Chromium 경로는 `CHROMIUM_PATH`로 바꿉니다. 스크린샷은 `/tmp/hollow-keep-desktop.png`, `/tmp/hollow-keep-mobile.png`, 시작 위치 확인용 `/tmp/hollow-keep-mobile-start.png`, 전체 화면 `/tmp/hollow-keep-mobile-fullscreen.png`, 자세 비교 `/tmp/hollow-keep-standing-jump.png`와 `/tmp/hollow-keep-running-jump.png`에 저장됩니다. `HK_SHOT_DIR=/tmp`를 지정해 `mobile-layout.cjs`를 실행하면 4개 가로 크기의 캡처도 저장합니다.

CODEX_TASK_02 당시 실행 기록(최신 시험 결과는 위 항목 참조): 픽셀 자산 **49/49**, 픽셀 렌더 **5/5**, 게임 규칙(6ce2654)의 원본 인수 **51/51**, 모바일 배치 **20/20**, 전체 화면 **6/6**, 추가 경계 검사 **16/16**, 시험 방 통과 검사 **4/4**, Chromium 브라우저 **20/20**, 기존 Node 회귀 **3종 통과**. 브라우저는 PC 1280×900 및 모바일 가로 844×390/DPR 2 에뮬레이션에서 실제 키보드·CDP 멀티터치 입력으로 검사했습니다. 세로 전환/복귀, 초점 해제, 수치 적용과 JSON 내보내기도 확인했습니다. 조이스틱/버튼과 캔버스의 비겹침, 시작 위치 Ethan의 가시성을 검사하고 캡처로 확인했습니다. 조이스틱 좌우 전환·취소, 전체 화면 중 뷰포트 변경과 조작 유지, 전체 화면 요청 자체의 거절 처리도 검사했습니다. 추가로 도약 종류·속도와 패널 적용, 실제 멀티터치로 조이스틱을 누른 채 전체 화면 진입/resize 후 이동 유지와 손 떼기 정지를 검사했습니다. 룬탄은 가까운 표적만 맞고 먼 표적은 무피해임을 검사합니다. 기존 회귀는 ECLIPSE 보존 검사이며 이 게임의 전체 플레이 검증을 대신하지 않습니다.

## 현재 한계와 인계

- Noah는 22 피해/66px의 단일 참격입니다. 기존 3단 콤보·전진·히트스톱·넉백은 이번 기반에 포함하지 않았습니다. Noah 3단 콤보는 **사용자 결정으로 나중에 진행**하며 키를 놓았을 때의 공중 감속은 현재대로 유지합니다. 이번 주인공/시험 방 픽셀 아트 외의 적·보스 아트, 음향·적 AI·맵·장치·체력/사망·저장은 범위 밖입니다.
- Ethan은 장거리 **비관통** 룬탄을 사용합니다. 근접 중심 감각과의 적합성은 사용자가 비교 플레이로 판단합니다.
- 수치를 극단적으로 바꾸면 시험 방의 지형은 자동으로 재설계되지 않습니다. 점프 궤적은 고정 틱이며 화면 렌더 보간은 없습니다. 큰 지연에서는 시뮬레이션이 실제 시간보다 늦어집니다.
- 사용자 손맛 평가, 실제 휴대전화 터치/성능, Safari·Firefox, 장시간 플레이는 **미확인**입니다. 자동 검사 통과는 조작감 승인을 뜻하지 않습니다.
- 픽셀 작업 기준 PR #7 `d8c6a21` (main `af58238`), 작업 `codex/hollow-keep-pixel-art`, 구현 PR #8. 아래 기반 이력은 보존합니다: 규칙 PR #3 `6ce2654` (공중 조작 적용 `805e903`; 모바일 규격 `fa33f01`/`44bd915`도 포함), 재개 `5175afd`, 작업 `codex/hollow-keep-foundation`, 구현 PR #4. 기반 PR #2/#3/#4/#5는 이후 사용자 승인으로 병합되었습니다. 이번 PR #8에는 아직 미병합인 PR #7의 아트 규격/검사도 포함됩니다. PR #7 병합 순서는 검토자가 조율해야 합니다.
- 다음 담당: **Claude Code / 검토 대기**. 픽셀 자산 외형·애니메이션·재질·원래 격자와 선명도 검토 및 사용자 판단을 기다립니다. 원본 인수 테스트 재실행, 독립 브라우저 조작 확인, 규격과 구현 검토를 요청합니다. 병합·수동 배포 명령은 실행하지 않았습니다.


픽셀 캡처: `/tmp/hk-pixel-jump-standing.png`, `/tmp/hk-pixel-jump-running.png`, `/tmp/hk-mobile-780x330.png`, 기존 브라우저 검사의 PC/모바일 캡처. PC와 모바일에서 선명한 1px 클러스터가 유지되고 거친 확대 블록이나 일부 픽셀만 큰 혼합 격자는 관찰하지 못했습니다. 모바일은 정수 backing을 브라우저가 축소하므로 가장자리에 약한 필터링이 보일 수 있습니다. 이는 육안 관찰이며 모든 기기·움직임의 선명도를 보증하지 않습니다. **외형 일치·미적 완성도·움직임 자연스러움은 사용자 판단 대기**입니다.
