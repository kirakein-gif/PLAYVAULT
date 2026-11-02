# THE HOLLOW KEEP · 3단계 전투 — 1차: Noah 3단 콤보와 Ethan 3단계 충전 사격

> 작성: Claude Code, 2026-11-02. 구현 담당: Codex(AGENTS.md "역할 분담(시범 운영)").
> 기준: [FOUNDATION_SPEC.md](FOUNDATION_SPEC.md) §4(무기 계약), [ART_DIRECTION.md](ART_DIRECTION.md)(그림 규칙, 베기 효과 한 획)
> 자동 검사: `next/tests/weapons-contract.cjs`(1차 규칙), `next/tests/pixel-assets.cjs`(새 동작·효과 그림)

## 1. 사용자 결정 (2026-11-02)

| 항목 | 결정 |
|---|---|
| 진행 | 3단계 전투와 Noah 3단 콤보를 **함께** 진행 |
| Ethan | Noah 3단 콤보에 맞춰 Ethan도 무언가 → **3단계 충전 사격**. Noah는 연타, Ethan은 누르고 있다가 놓기로 손맛을 가른다 |
| 체력 | **주인공별로 따로** (2차에서 구현) |
| 쓰러짐 | **자동 교대 + 짧은 무적 시간** (2차에서 구현). 둘 다 쓰러졌을 때의 처리는 **미정** — 2차 규격에서 제안 후 결정 |
| 범위 | **1차 무기 → 2차 체력·피격·적 3종**. 보스는 이후 |

이전 결정 유지: 룬탄은 **관통하지 않는다**(2026-10-31). 3단 충전탄도 첫 표적에서 멈추고, 그 자리에서 빛이 터져 주변에 피해를 준다.

## 2. Noah 3단 콤보 (연타)

`CONFIG.heroes.noah.weapon`에 다음을 더한다. 1단 값은 지금 `weapon`의 값과 같아야 한다(1단계 검사 유지).

```js
combo: [
  { damage: 22, range: 66, height: 46, activeTicks: 9,  recoveryTicks: 18 },             // 1단: 지금과 같음
  { damage: 22, range: 72, height: 46, activeTicks: 9,  recoveryTicks: 18 },             // 2단: 조금 더 길게
  { damage: 44, range: 84, height: 60, activeTicks: 12, recoveryTicks: 30, lunge: 10 }   // 3단: 크게, 앞으로 디딤
],
comboWindowTicks: 14
```

- **k단이 시작된 틱을 t라 하면** 다음 공격은 `t + recoveryTicks` 이후에만 나간다(지금의 cooldownTicks와 같은 뜻).
- **이어 치기:** t+1 ~ `t + recoveryTicks + comboWindowTicks - 1` 사이에 공격을 **누른 순간**이 있으면 다음은 (k+1)단이다. 회복 중에 누른 것은 **미리 입력**으로 기억했다가 `t + recoveryTicks`에 바로 나간다. 3단 다음은 1단이다.
- 그 사이에 누르지 않으면 콤보가 끊겨 다음 공격은 1단이다.
- 3단의 `lunge`: 공격 판정이 있는 동안 바라보는 방향으로 모두 10단위 앞으로 디딘다. 벽·닫힌 봉쇄물은 뚫지 않는다.
- 교대하면 콤보와 미리 입력은 사라진다(지금처럼 근접 판정도 사라짐).
- 공중·사다리에서도 콤보는 이어진다. 공중 3단의 디딤은 가로로만.
- 이벤트: `{ type: 'attack', hero: 'noah', step: 1|2|3 }`.

## 3. Ethan 3단계 충전 사격 (누르고 있다가 놓기)

`CONFIG.heroes.ethan.weapon`에 다음을 더한다. 1단(지금의 룬탄)은 그대로다.

```js
charge: {
  stage2Ticks: 40, stage3Ticks: 80,
  shots: [
    { damage: 44, width: 26, height: 18, speed: 11.5 },                                   // 2단
    { damage: 66, width: 34, height: 24, speed: 12.5, burstRadius: 45, burstDamage: 33 } // 3단
  ]
}
```

- **누른 순간(공격 가능할 때):** 지금처럼 1단 룬탄이 바로 나간다(`attack`, level 1). 동시에 충전이 시작된다. 공격 대기 중에 누른 것은 지금처럼 무시하고 충전도 시작하지 않는다.
- **누르고 있는 동안:** 충전 틱이 늘어난다. 누른 순간부터 40틱이 되면 2단, 80틱이 되면 3단이 되고 그때마다 `{ type: 'charge', hero: 'ethan', level }` 이벤트가 한 번씩 난다.
- **놓은 순간:** 2단 이상이면 그 단계의 충전탄을 쏜다(`attack`, level 2|3). 2단 미만이면 아무것도 쏘지 않는다. 충전탄을 쏘면 공격 대기는 `cooldownTicks`부터 다시 센다.
- 충전탄도 **관통하지 않는다**(첫 표적·벽·봉쇄물·부서지는 벽에서 멈춤). 사거리·발사 높이는 1단과 같다.
- **3단 빛 터짐:** 3단 탄이 멈춘 자리(맞은 면의 가운데)를 중심으로 반지름 45단위 안에 몸이 걸치는 **다른** 표적·적에게 `burstDamage`. 직접 맞은 표적은 탄 피해만 받는다. 벽 너머도 반지름 안이면 맞는다(짧은 거리라 단순화). 부서지는 벽은 빛 터짐으로 부서지지 않는다(퍼즐 우회 방지). 이벤트 `{ type: 'burst', x, y, r }`.
- 충전 중에도 걷기·점프·사다리는 그대로 할 수 있다(이동 감속 없음 — 시험 후 조정 가능하도록 `charge.moveScale` 등을 넣지는 않는다).
- 교대하면 충전은 사라지고, 놓아도 아무것도 쏘지 않는다.
- `HKSim.getPlayer(world).charge` = `{ ticks, level }`. 충전 중이 아니면 `{ ticks: 0, level: 0 }`, 누른 뒤 2단 전에는 level 1.

## 4. 그림 (ART_DIRECTION 규칙: scale 2, 64색, 투명도 0/255, 원래 해상도, 경로 A)

| 이름 | 내용 |
|---|---|
| noah `attack-2`, `attack-3` | 4프레임 이상, 첫 프레임 2틱 이하(1단 `attack`과 같은 규칙). 2단은 올려 베기, 3단은 크게 가로 베기 + 디딤 |
| noah `fx-slash-2`, `fx-slash-3` | 3프레임 이상, 한 번만 재생, 프레임마다 **한 획**(1단 규칙과 같음). 세 단의 궤적이 서로 달라야 한다 |
| ethan `charge` | 충전 중 몸 자세 2프레임 이상, 반복. (공격 동작을 그대로 쓰면 안 됨) |
| ethan `fx-charge` | 손에 모이는 빛 3프레임 이상, 반복. 2단·3단을 크기나 밝기로 구분(렌더러가 단계별로 다르게 그림) |
| ethan `fx-rune-2`, `fx-rune-3` | 2단·3단 탄, 2프레임 이상. 1단보다 크게 |
| ethan `fx-burst` | 3단 빛 터짐, 3프레임 이상, 한 번만 재생 |

렌더러: Noah는 단계별 attack·fx-slash를, Ethan은 충전 중 charge 자세와 fx-charge를 단계에 맞게 그린다. 이 그림 규칙은 `pixel-assets.cjs`가 검사한다.

## 5. 입력·조작 패널

- 키보드·모바일 모두 지금의 공격 키·버튼을 그대로 쓴다(누르고 있기 = 충전). 모바일 공격 버튼은 누르고 있는 동안 계속 눌린 상태여야 한다.
- 조작 패널(F2)에 combo의 단계별 damage·range·recoveryTicks, comboWindowTicks, charge의 stage2Ticks·stage3Ticks·단계별 damage를 추가한다.

## 6. 2차 예고 (이번에 구현하지 않음)

체력(주인공별), 피격·밀려남, 쓰러지면 자동 교대 + 짧은 무적, 기본 적 3종, "특정 적 처치" 봉쇄물을 실제 적으로 교체. 1차 손맛을 사용자가 확인한 뒤 규격을 쓴다.

## 7. 하지 않는 것

1단계 이동 수치 변경, 1단 무기 수치 변경, 적·체력(2차), 보스, 기존 게임·공용 자산 수정, 병합·배포.
