# THE HOLLOW KEEP · 1단계 기반(Foundation) 규격

> 작성: Claude Code, 2026-10-31. 구현 담당: Codex (`AGENTS.md` "역할 분담(시범 운영)").
> 방향: [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md) · 현재 구현 분석: [BASELINE_ANALYSIS.md](BASELINE_ANALYSIS.md)
> 인수 테스트: `games/the-hollow-keep/next/tests/foundation-contract.cjs`

## 1. 목표

새 기반 위에서 **이동·점프·무기·교대**가 정확하고 손에 붙는지 확인할 수 있게 만듭니다.
탐험·적 AI·보스·정식 아트는 이번 범위가 아닙니다.

완료 판단은 두 단계입니다.
1. **자동 검증** — 인수 테스트 전부 통과(규칙과 수치의 일관성)
2. **사용자 플레이 판단** — 시험 방에서 직접 움직여 보고 손맛을 승인. 자동 테스트 통과만으로 "조작감 완성"이라고 하지 않습니다.

## 2. 위치와 보존

- 새 기반은 **`games/the-hollow-keep/next/`** 에 만듭니다.
- 기존 `games/the-hollow-keep/`의 `index.html`·`core.js`·`art.js`·`game.css`·`assets/`는 **수정하지 않습니다.** 비교 플레이용으로 그대로 둡니다.
- 루트 런처(`index.html`)와 다른 게임, 공용 `assets/`는 수정하지 않습니다.
- 기존 자산은 읽어서 임시 그래픽으로 쓸 수 있습니다. 새 이미지 생성은 이번 범위가 아닙니다(사용자가 요청할 때만).

권장 구성(파일 이름은 바꿔도 되지만 `sim.js`와 테스트 경로는 유지):

```
games/the-hollow-keep/next/
├─ index.html      시험 방 실행 페이지
├─ sim.js          게임 규칙·물리·전투 (DOM 없음, Node에서 로드 가능)
├─ input.js        키보드·터치 → 틱 단위 입력 상태
├─ render.js       캔버스 그리기
├─ app.js          고정 시간 간격 루프, 모듈 연결
├─ README.md       실행·조작·검증 방법, 현재 한계
└─ tests/
   └─ foundation-contract.cjs   (Claude Code 작성, 수정 시 §6 참고)
```

## 3. 구조 요구사항

1. **고정 시간 간격** — 1틱 = 1/60초. 화면 갱신과 무관하게 누적 시간만큼 `step`을 반복합니다(한 프레임 최대 처리 틱 수 제한 포함).
2. **규칙과 화면 분리** — `sim.js`는 `window`·`document`·캔버스·오디오를 참조하지 않습니다. 화면·소리는 `step`이 돌려준 이벤트를 보고 처리합니다.
3. **입력은 틱마다 "누르고 있는 상태"로 전달** — 누른 순간(edge) 판정은 `sim.js` 안에서 합니다. 이벤트 핸들러가 동작을 직접 실행하지 않습니다.
4. **결정성** — 같은 초기 상태와 같은 입력 기록이면 결과가 항상 같습니다. `Math.random`·`Date.now`·`performance.now`를 규칙 계산에 쓰지 않습니다.
5. **수치는 `CONFIG` 한 곳** — 이동·점프·무기·교대 수치는 모두 `CONFIG`에 둡니다. 수치를 바꿔도 테스트는 그 수치대로 검사합니다.

## 4. 시뮬레이션 계약 (`sim.js`)

브라우저에서는 `window.HKSim`, Node에서는 `module.exports`로 같은 객체를 내보냅니다.

```js
HKSim.TICK                  // 1/60
HKSim.CONFIG = {
  swapCooldownTicks,        // 교대 후 재교대까지 틱
  heroes: {
    ethan: { width, height,          // 몸 판정(px)
             runSpeed,               // 최고 달리기 속도(px/틱)
             stopTicks,              // 키를 뗀 뒤 멈출 때까지 최대 틱
             jumpHeight,             // 끝까지 누른 점프의 실제 최고 높이(px, 발 기준)
             variableJump,           // 짧게 누르면 낮게 뛰는지(boolean)
             minJumpHeight,          // variableJump=true일 때, 한 틱만 눌렀을 때 실제 높이(px)
             maxFall,                // 최대 낙하 속도(px/틱)
             coyoteTicks,            // 발판을 벗어난 뒤 점프 허용 틱
             jumpBufferTicks,        // 착지 전 미리 누른 점프를 기억하는 틱
             weapon: { kind: 'melee'|'projectile', damage, range, cooldownTicks, ... } },
    noah:  { ...같은 키... }
  }
}

const world = HKSim.createWorld({
  room:  { width, height,
           solids:  [{x,y,w,h}, ...],                 // 통과 불가 블록
           dummies: [{id,x,y,w,h,hp}, ...] },          // 맞기만 하는 시험 표적
  spawn: { x, y },                                     // 몸 왼쪽 위 좌표
  hero:  'ethan' | 'noah'
});

const events = HKSim.step(world, { left, right, up, down, jump, attack, swap }); // 모두 boolean(누르고 있음)
// events: 이번 틱에 일어난 일
//   {type:'jump'} {type:'land'} {type:'attack', hero} {type:'hit', target, damage} {type:'swap', from, to}

HKSim.getPlayer(world)   // { x, y, w, h, vx, vy, onGround, face(1|-1) } — 현재 조작 중인 주인공
HKSim.getHitboxes(world) // [{x,y,w,h}, ...] — 이번 틱에 살아 있는 플레이어 공격 판정(근접·투사체)
HKSim.snapshot(world)    // JSON으로 저장 가능한 전체 상태
world.active             // 'ethan' | 'noah'
world.dummies            // 표적 목록(hp 확인용)
```

- 좌표: px, 왼쪽 위 원점, y는 아래로 증가. 속도 단위: px/틱.
- `CONFIG`에 위에 없는 키(가속, 공중 제어, 히트스톱, 넉백, 콤보 등)는 자유롭게 추가합니다.
- 테스트용 `room`은 실제 게임 방 데이터와 같은 형식을 쓰는 것을 권장합니다.

## 5. 인수 테스트가 검사하는 것

| 구분 | 검사 내용 |
|---|---|
| 계약 | API·`CONFIG` 필수 항목, 두 주인공 특성 차이, `snapshot` 직렬화 |
| 결정성 | 600틱 같은 입력 → 같은 `snapshot` |
| 지면 | 가만히 있으면 미끄러지거나 떨리지 않음, 높은 곳에서 떨어져도 바닥 통과 없음, `maxFall` 준수 |
| 달리기 | 최고 속도 = `runSpeed`(±5%), 바라보는 방향, `stopTicks` 안에 정지, 좌우 동시 입력 시 정지 |
| 충돌 | 벽 통과 없음(점프 중 포함), 천장에 부딪히면 통과 없이 낙하 |
| 점프 | 최고 높이 = `jumpHeight`(±8%), 짧은 점프 = `minJumpHeight`(±15%), 누르고 있어도 연속 점프 없음, 공중 재점프 없음, 코요테 타임, 점프 버퍼 |
| 무기 | 앞 표적 명중, 1회 공격 = 1회 피해(`damage`), 등 뒤 표적 무피해, 판정은 바라보는 쪽, 누르고 있어도 자동 연사 없음, 연타해도 `cooldownTicks`보다 빠르지 않음, **투사체는 첫 표적 명중 시 소멸(관통 없음)** |
| 교대 | 발 위치 유지, `swapCooldownTicks` 동안 재교대 불가, 교대 후 그 주인공의 수치로 움직임 |

테스트는 손맛 수치를 정하지 않습니다. 수치를 정하는 것은 사용자의 플레이 판단입니다.
이 테스트는 Claude Code가 저장소 밖의 임시 참조 구현으로 전 항목이 통과 가능함을 확인했습니다(2026-10-31, 처음 40개 + 관통 금지 1개 = 41개). 참조 구현은 커밋하지 않았습니다.

## 6. 테스트 파일 변경 규칙

- 구현 담당(Codex)은 테스트를 **약하게 만들거나 건너뛰지 않습니다.**
- 규격이 잘못되었거나 사용자 결정(예: 무기 방식 변경)과 충돌하면, 테스트를 고치지 말고 PR 본문과 WORK_LOG에 이유를 적어 사용자·검토 담당에게 넘깁니다.
- 테스트 추가는 자유입니다(새 파일 권장).

## 7. 시험 방 (사용자 플레이 확인용)

`next/index.html`을 열면 바로 움직일 수 있는 시험 방 하나를 둡니다.

**구성 요소**
- 평평한 바닥, 높이가 다른 발판 3단(낮음·중간·최대 점프 근처)
- 떨어지는 가장자리(코요테 확인), 낮은 천장 구간, 벽
- 건너뛰는 구덩이(Ethan은 겨우, Noah는 여유 있게 넘는 폭을 권장)
- 맞으면 피해 숫자가 보이는 시험 표적 2개 이상(가까운 것·먼 것)

**디버그 표시** (`?debug=1` 또는 키 토글, 일반 화면에는 숨김)
- 몸·공격 판정 상자, 현재 속도·onGround·코요테/버퍼 남은 틱
- `CONFIG` 주요 수치를 화면에서 바꿔 보는 조절 패널과 현재 값 복사 기능(사용자가 손맛을 맞춘 뒤 수치를 전달할 수 있게)

**조작** (기존과 같게 유지)
- 이동 A/D·←/→, 점프 Space/K/Z, 공격 J/X, 교대 Q/Tab
- 모바일 가로 화면 터치 버튼(이동·점프·공격·교대)

## 8. 1단계에서 하지 않는 것

방 연결·지도·장치·열쇠, 적 AI, 보스, 보조 무기, 체력·사망 처리, 정식 스프라이트·배경·음악, 런처 등록, 기존 구현 대체.
