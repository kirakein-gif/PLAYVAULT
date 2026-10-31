# PLAYVAULT · 게임별 변경 내역

게임별 번호를 독립적으로 보존한다. 아래는 2026-10-31(Asia/Seoul)에 Git 이력·주요 diff·README·기존 게임 문서·현재 소스를 교차 확인해 복원한 기록이다. **버전 표기는 개발 표식이며 릴리스/배포 성공을 뜻하지 않는다.** 게임 코드·자산과 버전 자체는 변경하지 않았다.

main `41f7517`의 전체 233커밋과 미병합 `codex/wgg-action-prototype`의 추가 20커밋을 조사했다. 전체 커밋 색인과 변경 경로 분류, 과거 검증의 한계는 [WORK_LOG](docs/WORK_LOG.md#전체-커밋-색인), 현재 상태는 [STATUS](docs/STATUS.md) 참조. 날짜는 Git author timestamp를 한국 시간으로 환산했다. 표는 게임별 개발 흐름이며 서로 다른 브랜치의 날짜만으로 선후를 단정하지 않는다.

**근거 구분:** 표의 기능 요약은 관련 diff/소스 및 기존 기록에 근거한다. 각 바이너리의 외형·음질·저작권 및 모든 과거 버전의 실제 실행 결과를 재검증한 것은 아니다. Git 등록 전 작업, PC 미푸시 작업, 과거 담당 AI/요청 전문, 실제 릴리스 날짜·배포 버전·생략된 버전은 **확인 불가**다. 기존에 'Release'라는 커밋 제목이 있어도 배포 증거로 쓰지 않는다.

## ABYSSFALL: ECLIPSE

경로: `games/abyssfall-eclipse/`, 공용 `assets/`, 회귀 `tests/`. 초기에는 캐시 쿼리만 있고 이후 README·커밋·화면 버전이 함께 등장한다. v1–v3이라는 독립 릴리스의 존재는 확인 불가다.

| 날짜(KST) | 버전·근거 종류 | 주요 추가·구조 변경·수정 | 관련 커밋 |
| --- | --- | --- | --- |
| 2026-10-05 | 초기(게임 버전 확인 불가) | 게임 HTML·반응형 CSS·core·renderer 생성 후 HTML이 외부 스크립트를 로드하도록 연결. 두 주인공·자동 공격·던전·키보드/터치 입력의 기준선 | [2db4da8](https://github.com/kirakein-gif/PLAYVAULT/commit/2db4da8972298ce4c907ff6b6c79909e10febfa5) · [b856b74](https://github.com/kirakein-gif/PLAYVAULT/commit/b856b74b673f6780aa3d08f81cd0bc061b75d3f9) · [37919e8](https://github.com/kirakein-gif/PLAYVAULT/commit/37919e85b9c0c45fd00afc458a507bed89cf4f76) · [ef8827f](https://github.com/kirakein-gif/PLAYVAULT/commit/ef8827f56694ce22bcf789cccc21ed6461f06358) · [35c55de](https://github.com/kirakein-gif/PLAYVAULT/commit/35c55decc3f35032e546288b29efe123b8c17206) |
| 2026-10-05–2026-10-06 | 초기→캐시 4 | 영웅 이미지와 base64 atlas 조각 도입·보완, loader 추가, 피격/사망 상태와 공격 타이밍·전투 표현 연동 | [b1574e6](https://github.com/kirakein-gif/PLAYVAULT/commit/b1574e682653b3b8cacf00800daffae963b51b52) · [9a8b467](https://github.com/kirakein-gif/PLAYVAULT/commit/9a8b4670497645a7b4ed227d7392eff1e03179cd) · [2d6f538](https://github.com/kirakein-gif/PLAYVAULT/commit/2d6f53852b2ad788a74b56d532fbdd0a66f9962e) · [c63bc4a](https://github.com/kirakein-gif/PLAYVAULT/commit/c63bc4ab0425538b7a19f41aec360ec714f80744) · [c944748](https://github.com/kirakein-gif/PLAYVAULT/commit/c9447489f9e4e45821a3277865862c83866e7eab) · [c10ae62](https://github.com/kirakein-gif/PLAYVAULT/commit/c10ae62229323ed7eaf172df151bafeee0cd29de) · [9c4ee9f](https://github.com/kirakein-gif/PLAYVAULT/commit/9c4ee9fc852515420b137e7a5a0e409229ea4beb) · [d4bce24](https://github.com/kirakein-gif/PLAYVAULT/commit/d4bce246b80dc8ee01b0cd02f58ce4ce0eee9451) |
| 2026-10-06 | 캐시 5–8 | 주인공 atlas를 assets/characters 공용 경로로 승격. 공용 적 가족·상태 애니메이션, 4종 층 테마 및 전투/보물/회복/엘리트/보스 방 도입 | [57f1842](https://github.com/kirakein-gif/PLAYVAULT/commit/57f1842da11c1a468e4d286c113321051e57ee85) · [98bfed2](https://github.com/kirakein-gif/PLAYVAULT/commit/98bfed2cd002d56a415b76edf39e3fe0318a3e77) · [00f5248](https://github.com/kirakein-gif/PLAYVAULT/commit/00f5248378dc9711e59dd5166f9ce228dec8bd20) · [7511aed](https://github.com/kirakein-gif/PLAYVAULT/commit/7511aed38e209dad9396a8a23988cac181d16861) · [5e8106e](https://github.com/kirakein-gif/PLAYVAULT/commit/5e8106e63f224f01ae55a6f3e3df89e094a72727) · [23b454d](https://github.com/kirakein-gif/PLAYVAULT/commit/23b454dc49b9504dcd410c50c56a66375c938a21) · [1d8219e](https://github.com/kirakein-gif/PLAYVAULT/commit/1d8219e92fcccc8c95056820bc42da03a52aa9e5) · [5534367](https://github.com/kirakein-gif/PLAYVAULT/commit/55343673e468b000c7318bdfdf8b752f056beaec) · [649f96f](https://github.com/kirakein-gif/PLAYVAULT/commit/649f96f340f30c6b60cf05d331e9f27189afd8bd) |
| 2026-10-06 | 캐시 9–13 | 획득 유물 추적·인벤토리·배너·픽셀 아트 카드 추가. 플레이 영역 가림, XP바 및 모바일 미니맵 겹침, 일반 강화 카드와 유물 카드 혼용을 순차 조정 | [d13164d](https://github.com/kirakein-gif/PLAYVAULT/commit/d13164de58897ce2a00cf68e740418e13ab6532f) · [f83d3b6](https://github.com/kirakein-gif/PLAYVAULT/commit/f83d3b63c6c319e9d9494f502fe3929c07928b99) · [f4c0d12](https://github.com/kirakein-gif/PLAYVAULT/commit/f4c0d12276eb22a245b70e50ad45aed8f8156611) · [95b0874](https://github.com/kirakein-gif/PLAYVAULT/commit/95b0874b6344c7c9c3a0ebeadaf1abf98b4e4bcf) · [c8f0b7b](https://github.com/kirakein-gif/PLAYVAULT/commit/c8f0b7bf245af11408b70d79e39e0e726b2330d2) · [90eede1](https://github.com/kirakein-gif/PLAYVAULT/commit/90eede126d9d3b5a1f2152af692849201c9b9b7e) · [cd0c904](https://github.com/kirakein-gif/PLAYVAULT/commit/cd0c904c8113aa0282bcba86abcf1091f6273597) · [8c6dd1e](https://github.com/kirakein-gif/PLAYVAULT/commit/8c6dd1efeece6e8b0d69cbb94a5c1dce70ce51ab) · [a5e0f4a](https://github.com/kirakein-gif/PLAYVAULT/commit/a5e0f4a3dc5d226d234e58501ca986a754f9d17f) |
| 2026-10-06 | 캐시 14–16 | 유물을 단순 수치 보너스에서 관통·공명 등 전투 효과로 확장, 알림 과다 감소. Watcher 3페이즈 예고 패턴 및 고급 유물 7종 추가 | [2a49ae3](https://github.com/kirakein-gif/PLAYVAULT/commit/2a49ae3bdb3d0729d2c5cb6ba93670cf125ee430) · [4012c8b](https://github.com/kirakein-gif/PLAYVAULT/commit/4012c8b918d1f90b2b0ba43e1f61b329ca6398b4) · [e4722df](https://github.com/kirakein-gif/PLAYVAULT/commit/e4722df4e7f0d54edcef513c4d15e6aa8992fbd2) · [d20f5df](https://github.com/kirakein-gif/PLAYVAULT/commit/d20f5df81aa6f38f2f7d9f9e131df7d5c92a242c) · [9afb3f6](https://github.com/kirakein-gif/PLAYVAULT/commit/9afb3f6d40e039e213d8af404a3589e0e81088dd) · [7445187](https://github.com/kirakein-gif/PLAYVAULT/commit/7445187bb2baf97cc36bcd2972fc2ea0a578beed) · [1755b69](https://github.com/kirakein-gif/PLAYVAULT/commit/1755b69da4a73c52fbf67c96f3b81cee4f832517) |
| 2026-10-06 | 캐시 17→v18(README) | 보스 입장 유예·연기·승리 정지, 4층 CLEAR/기록/무한 진행, 적군별 공격과 층별 위험·배경 원근 구성 | [52ed50f](https://github.com/kirakein-gif/PLAYVAULT/commit/52ed50f910baf76db989964bc25e5bddf2584419) · [c15997f](https://github.com/kirakein-gif/PLAYVAULT/commit/c15997fdf7b23dedf4a3e3bd04d7c3af8026bdd7) · [a8f1f87](https://github.com/kirakein-gif/PLAYVAULT/commit/a8f1f875773a39f0c23ca67dfc9a30fa58066a5e) · [91bfaa2](https://github.com/kirakein-gif/PLAYVAULT/commit/91bfaa29b94d06609bcf9d621d6238f04fc071ae) · [528ae4a](https://github.com/kirakein-gif/PLAYVAULT/commit/528ae4a43b122de92bbfac2e19626ec5ec8d798e) · [6479002](https://github.com/kirakein-gif/PLAYVAULT/commit/6479002fd14d83b74933cf7018129a86a59da8f1) · [33f0e07](https://github.com/kirakein-gif/PLAYVAULT/commit/33f0e070b23e30753cd83548bc5e3e1c66b2461d) · [3254d29](https://github.com/kirakein-gif/PLAYVAULT/commit/3254d290694b66bb2ed729aaf05cf3173c156014) · [a89c6e9](https://github.com/kirakein-gif/PLAYVAULT/commit/a89c6e92f94b2511706c77fc48b60aeed0ea357a) |
| 2026-10-06 | v18→v19 | 4층 종료에서 12층 캠페인으로 확장. 3층 간격 보스, 깊이에 따라 늘어나는 분기 던전·비보스 출구·부분 회복. 4층/12층 기록 키 분리 | [3aae5ce](https://github.com/kirakein-gif/PLAYVAULT/commit/3aae5ced1bf54bed192866423c251723e57a0d86) · [9610b80](https://github.com/kirakein-gif/PLAYVAULT/commit/9610b80db14ac1fb0bcf393bbee7c55af1a815d5) · [5fe8b44](https://github.com/kirakein-gif/PLAYVAULT/commit/5fe8b44bd7594b35586a054da9377abba310ee74) · [9761f44](https://github.com/kirakein-gif/PLAYVAULT/commit/9761f44fb3220e34494ef1f33e0d46762d5a608c) · [f27486d](https://github.com/kirakein-gif/PLAYVAULT/commit/f27486dc3671dbc3f0e2167afe1029a679986c02) |
| 2026-10-06 | v19→v20 | HP/피해의 이차 성장, 엘리트/보스 내구도·단타 제한, 보스 사후 자동 이동 대신 출구 사용 | [4670fbf](https://github.com/kirakein-gif/PLAYVAULT/commit/4670fbf5995c0f2476e8654687275ed7e53adcb5) · [38cf712](https://github.com/kirakein-gif/PLAYVAULT/commit/38cf712305409a022f20c875874ebf5c58a548b1) · [0af2384](https://github.com/kirakein-gif/PLAYVAULT/commit/0af23848b6982451f8a8e3bd6abb9f9738b62f20) · [9a16041](https://github.com/kirakein-gif/PLAYVAULT/commit/9a16041606831b37439f7353ebb378285e184a15) |
| 2026-10-06 | 캐시 21–23 / README v22 | 출구 전환 멈춤 수정: paused/transitioning 상태 정리. Web Audio 매니저·이벤트 효과음·음소거 추가, 보스 사후 상태 강화·오디오 조정·프레임 오류 후 루프 복구 | [583c768](https://github.com/kirakein-gif/PLAYVAULT/commit/583c7682c0296b3063fc842c937b680b6411a133) · [22c434c](https://github.com/kirakein-gif/PLAYVAULT/commit/22c434cc36f7ad33c7e48a3a800d86b55aeb430f) · [65045c1](https://github.com/kirakein-gif/PLAYVAULT/commit/65045c1a5d09fc83bcc5f64a1b3fab9fefd05d52) · [3e0f53d](https://github.com/kirakein-gif/PLAYVAULT/commit/3e0f53d6a71ab413f4e61aedfbfb02a6c1b7ebb4) · [12533ca](https://github.com/kirakein-gif/PLAYVAULT/commit/12533ca7896abfa833cca09669a526f2eae365b3) · [ff24246](https://github.com/kirakein-gif/PLAYVAULT/commit/ff24246c38fd90cac02ee09aaf3c7935d0d145fb) · [8aa8e3c](https://github.com/kirakein-gif/PLAYVAULT/commit/8aa8e3c4c5a24d46aa7447235696a55091a3f690) · [6c64466](https://github.com/kirakein-gif/PLAYVAULT/commit/6c64466335474b0f8b8f34f1f6e9126413697a73) · [937a9de](https://github.com/kirakein-gif/PLAYVAULT/commit/937a9ded7fb2c732ca2691bd3f7826739d03d3cb) |
| 2026-10-06 | v24–v26(README) | 보스 문 봉인·숨은 제단과 물리적 계단, 발견한 잠긴 문 지도 기억. 드문 벽 흔적·일식 표식. 방별 가변 안개·바람·균열과 구역 진입 분위기 문구 | [14688b4](https://github.com/kirakein-gif/PLAYVAULT/commit/14688b4c5719f5f3b481fcc5b99e6f4f1977e9c3) · [20443bb](https://github.com/kirakein-gif/PLAYVAULT/commit/20443bbd2c22a5296eef3fb2e3becc6a37b48f9a) · [0df5440](https://github.com/kirakein-gif/PLAYVAULT/commit/0df5440ffd41807be590545fd7cf629ecb3265fd) · [d6f231c](https://github.com/kirakein-gif/PLAYVAULT/commit/d6f231ca17d829273a26a8354bfa03654bd9b37b) · [41b8a94](https://github.com/kirakein-gif/PLAYVAULT/commit/41b8a94a2dae41567d35ca6e9f63cf35531eb5cd) · [b4292ec](https://github.com/kirakein-gif/PLAYVAULT/commit/b4292ecfd36d7a5dc4f9b386a56e2ba6b3ca572c) · [43a4be1](https://github.com/kirakein-gif/PLAYVAULT/commit/43a4be1e3451bd23ead633f87360008024309c41) · [0f187b9](https://github.com/kirakein-gif/PLAYVAULT/commit/0f187b9a03a02d151d98ec253b36b2fa96a150ad) |
| 2026-10-06–2026-10-07 | v27–캐시 29 | 특수기 남은 시간·방사형 충전·READY 표현을 도입한 뒤 숫자 제거와 얇은 주인공별 색상 링으로 정리, 데스크톱 상태와 색상 공유 | [48ae3a6](https://github.com/kirakein-gif/PLAYVAULT/commit/48ae3a6b2e781230bc38d6818117d5a26797aed1) · [a87d00c](https://github.com/kirakein-gif/PLAYVAULT/commit/a87d00c43a75d569fd63e43520e8a18adac54390) · [349ad6e](https://github.com/kirakein-gif/PLAYVAULT/commit/349ad6ed5416e33dc3801cd5cba32d8741bb4086) · [7b06a67](https://github.com/kirakein-gif/PLAYVAULT/commit/7b06a67e8319dd24389fcc5e2fa9eece28602240) · [38532ba](https://github.com/kirakein-gif/PLAYVAULT/commit/38532ba5f144e63660e63a8950b67c6af4127e93) · [81b6c6a](https://github.com/kirakein-gif/PLAYVAULT/commit/81b6c6ac9aca7d44cb34a17b624413e2ac180a54) · [1580372](https://github.com/kirakein-gif/PLAYVAULT/commit/15803723a3106bf995173c78675c5bc74bfcb2ed) · [dca67ed](https://github.com/kirakein-gif/PLAYVAULT/commit/dca67edae9bf5505773b1e0490776d52212e5357) |
| 2026-10-07 | v30–v32(README) | 발 피벗·스프라이트 크기·DPR 안정화, 별도 art.js와 고해상도 방/행동 아트·WAV 앰비언스 및 회귀 검사. 성인 비례·작은 표시 크기와 주인공별 실루엣으로 재설계 | [8c18221](https://github.com/kirakein-gif/PLAYVAULT/commit/8c1822101786aacda8ebd1aa4cfec56d2ef326af) · [4f1913c](https://github.com/kirakein-gif/PLAYVAULT/commit/4f1913c0e92004cd8a5e63517525034583ca5308) · [1adeeeb](https://github.com/kirakein-gif/PLAYVAULT/commit/1adeeeb5c3458343cbde420cb8ede7eac714f37a) · [f53d5a1](https://github.com/kirakein-gif/PLAYVAULT/commit/f53d5a1cda20d0fa8e47fad12775dfd4292dbaba) · [829245b](https://github.com/kirakein-gif/PLAYVAULT/commit/829245bf22f860617df9faea823d966571d453ba) · [e845f91](https://github.com/kirakein-gif/PLAYVAULT/commit/e845f91123159fdad6dd13598cc8738ea7eac075) |
| 2026-10-07 | v33–v34(README) | 이동 애니메이션 안정화, 강화 숫자키, 문/상자/샘/계단 props·차분한 WAV 제작 도구. 측면 문을 벽 안으로 배치하고 지속 드론 제거·음원 실패 시 무음·영혼 XP 흡수·샘 사용 전후 형상 고정 | [e99f0e5](https://github.com/kirakein-gif/PLAYVAULT/commit/e99f0e572a5e56607530c6833a8f75da17a3876f) · [df04a58](https://github.com/kirakein-gif/PLAYVAULT/commit/df04a58f307df27233952a57f4eeca923108ab0b) |
| 2026-10-07 | 캐시 35–38 / 커밋 v38 | 방 안 통로와 유물 아트 통합, 측면 문 벽체와 손 높이 발사체 수정, 지면 링 제거. 고정 바닥·남쪽 통로·봉인석·Ethan/Noah 표기 및 문 렌더 회귀 정비 | [5f162c9](https://github.com/kirakein-gif/PLAYVAULT/commit/5f162c9c1392694009a0c4037ca43bbbb8bade37) · [a7ed4b5](https://github.com/kirakein-gif/PLAYVAULT/commit/a7ed4b59e2342c36f7a0acca8f86605f9644b51d) · [6271eea](https://github.com/kirakein-gif/PLAYVAULT/commit/6271eeaa43ad503cde5efe3e2dfc8a30147fd334) · [d6308c7](https://github.com/kirakein-gif/PLAYVAULT/commit/d6308c77e779d798c9dd79ec9de8400435e3005f) |
| 2026-10-08 | v39(캐시/후속 커밋 참조) | 12→24층, 4→8구역. 얼음·용광로·저수로·균열 자산/위험과 심층 적 압력·봉인·무한 진행 기준 확장 | [0a0c718](https://github.com/kirakein-gif/PLAYVAULT/commit/0a0c7184d465a743facf75ec44d5dae90060d427) |
| 2026-10-08 | v40–v43(커밋/캐시) | 보상·계단 전환 경합과 보상 큐 수정, 지속 얼음/안개 및 로컬 테스트 층 이동. 용암/독/빛을 바닥에 통합, 입장 표식/엘리트 십자 제거, 최종 초상 직접 로딩으로 구 아트 깜빡임 방지 | [1d45c30](https://github.com/kirakein-gif/PLAYVAULT/commit/1d45c30d0934ade266d0bc803ec4a85e9f1683de) · [a4aff2e](https://github.com/kirakein-gif/PLAYVAULT/commit/a4aff2e5ab9d9d409baaa058300e452da0d020d5) · [947ead0](https://github.com/kirakein-gif/PLAYVAULT/commit/947ead0b2fd9c87df25f95603ee3749cef8556bd) · [79f22c3](https://github.com/kirakein-gif/PLAYVAULT/commit/79f22c32cab2bbc7e1eaaeeaf6184ece3a1adc6f) |
| 2026-10-08 | v44–v46(커밋/캐시) | 구역 변경 때만 분위기 문구, 성광·바람과 연속 돌풍음, 균열을 석재 금으로 표현·쓴 샘 배수. 구역별 보스 8종과 깊은 층 적 구성/장갑/패턴 확장 | [7abb36a](https://github.com/kirakein-gif/PLAYVAULT/commit/7abb36afa0bb22f66c587c4060e1f4768ff591a5) · [ccd129f](https://github.com/kirakein-gif/PLAYVAULT/commit/ccd129f7f574c9fdb1f17d515ba51314280d8058) · [381cec9](https://github.com/kirakein-gif/PLAYVAULT/commit/381cec901199c83caa5adc1a6b5f0ce78dd3128f) |
| 2026-10-08 | v47–v48(커밋/캐시) | 적의 거리 기반 6프레임 보행, 보행 프레임 이웃 조각 분리, 보스 타격 표현 및 후속 스프라이트 분리/강철 궤적 조정 | [0a40541](https://github.com/kirakein-gif/PLAYVAULT/commit/0a40541b7e8b579e807d5c54130381b28dad1af6) · [2c295b4](https://github.com/kirakein-gif/PLAYVAULT/commit/2c295b499700f2a4225654d4560d0fee7dd6072c) · [86fd346](https://github.com/kirakein-gif/PLAYVAULT/commit/86fd34649fd31a58953b364cc97e361dcd691fcd) |
| 2026-10-14 | v49–v50(커밋/캐시) | Ethan 근접·돌진과 Noah 원거리·회피 역할 분리. Ethan 검 동작 전용 atlas 및 짧은 무적 몸통 돌진 도입 | [42e1420](https://github.com/kirakein-gif/PLAYVAULT/commit/42e14202c121472e33b538bb2ceaac80c2be58eb) · [c5a1d2c](https://github.com/kirakein-gif/PLAYVAULT/commit/c5a1d2c46d15a09c705714bc1cc9a987054cd79f) |
| 2026-10-14 | v51–v52(커밋/캐시) | 전투 자세의 신체 크기·황금 보호 효과·역할별 유물, 무기/충돌 피드백과 성장 차별화. 아트 준비 완료 후 시작 허용 및 로딩 실패 재시도 흐름 | [bfe5eb4](https://github.com/kirakein-gif/PLAYVAULT/commit/bfe5eb4b5f64713f19a806073417d470af633308) · [c4ecaa2](https://github.com/kirakein-gif/PLAYVAULT/commit/c4ecaa2bfa1a09cd83395fccfe23ae08ded266a9) |
| 2026-10-15 | v53–v54(커밋/캐시) | 적/보스 정지·준비·공격까지 atlas 조각 분리 확장. 보스 소환수의 등장 대기·안전 배치·보스 사망 취소와 보행 전환 완화 | [b3c053e](https://github.com/kirakein-gif/PLAYVAULT/commit/b3c053e40f16002e57d60372e9ef2b2a221ee361) · [e6f2631](https://github.com/kirakein-gif/PLAYVAULT/commit/e6f26317e161b8e3a0c0176dda83d4dbffa22a44) |
| 2026-10-15 | v55–v56(화면/캐시) | 깊이별 적/엘리트 XP와 역할 표기 이중 강화. 미니맵 실제 통로·문 잠금 상태, 용암 시각/피해 단계 동기화 | [07d2822](https://github.com/kirakein-gif/PLAYVAULT/commit/07d28226071d6bdea3618ecc6a5ba546a6aaea3d) · [5c47cf2](https://github.com/kirakein-gif/PLAYVAULT/commit/5c47cf2e8a97f9a53d1598b8551967c8786287a8) |
| 2026-10-15 | v57–v60(화면/캐시) | 유물 패널 위치 수정, 피격이 적 공격 준비/돌진을 취소하지 않도록 보정하되 대기 경직 유지. 미니맵 축소 복원. 깊이별 돌진 도달 거리 및 이동 구간 충돌 검사로 빠른 돌진 누락 방지 | [ee02f20](https://github.com/kirakein-gif/PLAYVAULT/commit/ee02f20d7df3cb74b110b229aae5f0b9878667f1) · [c24205c](https://github.com/kirakein-gif/PLAYVAULT/commit/c24205c63e0bd87dd412c3c67a26ef27daa65a3e) · [9d4aaad](https://github.com/kirakein-gif/PLAYVAULT/commit/9d4aaad85d503ad24e5ded115e23239b5902bf2f) · [8ce4d02](https://github.com/kirakein-gif/PLAYVAULT/commit/8ce4d0257ab46b9f67f1aa0840868521f22a7e75) |

## THE HOLLOW KEEP

경로: `games/the-hollow-keep/`. v4–v7은 README, v8은 커밋에도 명시된다. 그 뒤 캐시 쿼리 9–16을 정식 게임 v9–v16으로 승격하지 않는다. 현재 CSS 16 / art 15 / core 13이며 단일 최신 게임 버전은 확인 불가다.

| 날짜(KST) | 버전·근거 종류 | 주요 추가·구조 변경·수정 | 관련 커밋 |
| --- | --- | --- | --- |
| 2026-10-07 | 캐시 1–2 | 별도 게임 HTML/CSS·고정 30개 방과 챕터 엔진 구축. 주인공별 HP/공격/교대, 장치·지도·비밀벽·체크포인트·보스/종/귀환과 홈 카드 추가 | [53e3b89](https://github.com/kirakein-gif/PLAYVAULT/commit/53e3b89f9ecb759742b2aab841b395361449e5d2) · [9f56d17](https://github.com/kirakein-gif/PLAYVAULT/commit/9f56d17539a908439e21d1207d845d99ee8d871a) · [5350af8](https://github.com/kirakein-gif/PLAYVAULT/commit/5350af8f6be4542d7b3212cde8575f3aa971d991) · [83adaa7](https://github.com/kirakein-gif/PLAYVAULT/commit/83adaa77a2cf9e82ea9ef6af036deefd541b9055) · [4b09f6a](https://github.com/kirakein-gif/PLAYVAULT/commit/4b09f6ae3745ae8625eff861953d472266b6ea49) · [cb7c869](https://github.com/kirakein-gif/PLAYVAULT/commit/cb7c8698e1379c290bac5ed2437b8f9d9cc9a0f2) · [cb04d04](https://github.com/kirakein-gif/PLAYVAULT/commit/cb04d04f11bfa6be6b733e294e6d3302fe741a2a) · [bb92e1c](https://github.com/kirakein-gif/PLAYVAULT/commit/bb92e1c58436e14cff88c18cc4e3771c05a6de6c) |
| 2026-10-07 | 캐시 3 | 보이지 않는 영웅 수정: 몸체 w/h 초기화 및 유효 좌표 보정 | [ba0ffc3](https://github.com/kirakein-gif/PLAYVAULT/commit/ba0ffc39a79f7cf8694ab8397069a9334c9e7886) · [7076f12](https://github.com/kirakein-gif/PLAYVAULT/commit/7076f126ab41fba3cdde55b9ae2fabb99efed67b) |
| 2026-10-07 | v4(README/캐시) | Ethan의 무게와 Noah의 민첩성 분리, 가속/마찰·가변 점프·코요테 타임·입력 버퍼·교대 관성·착지/발사 피드백 | [56d40a9](https://github.com/kirakein-gif/PLAYVAULT/commit/56d40a9f401b6c29938fdccc1d01bd608b1b2a0d) · [cf964e1](https://github.com/kirakein-gif/PLAYVAULT/commit/cf964e1e415073eb85fed7fc58bfc6f4f44be54e) · [9b5e99d](https://github.com/kirakein-gif/PLAYVAULT/commit/9b5e99de07e84e621ed00d49c7e45a4229415030) · [0bae7a0](https://github.com/kirakein-gif/PLAYVAULT/commit/0bae7a0c0dd735f77418eb55ba7fe344999efded) · [ac488d6](https://github.com/kirakein-gif/PLAYVAULT/commit/ac488d676497856f29bcd83e14f08dbaa755c31c) |
| 2026-10-07 | v5(README/캐시) | Noah 3연타, Ethan 명중 경직·넉백. 적 접촉 위주 공격을 예고→공격→회복으로 개선, 타격·사망 피드백 보강 | [69b1390](https://github.com/kirakein-gif/PLAYVAULT/commit/69b1390bcfb5cd5ddc3dd80f2ee19de507139bc7) · [bbc53cb](https://github.com/kirakein-gif/PLAYVAULT/commit/bbc53cb084b25203415274a4bdef8a92aab169c2) · [99ab351](https://github.com/kirakein-gif/PLAYVAULT/commit/99ab351ffdd79d2190d281b7752cb46dbf85fb4d) · [a080f49](https://github.com/kirakein-gif/PLAYVAULT/commit/a080f4969c075edae30428b45c1449c1e75e4cbf) · [3e8fa01](https://github.com/kirakein-gif/PLAYVAULT/commit/3e8fa019a63ad636f2b8dc9164541d4e359790b9) |
| 2026-10-07 | v6–v7(README/캐시) | Ethan 시전·Noah 각 연타의 별도 자세, 실제 공격 시간 기반 모션. 3타 후 회복 잠금·이동 제한으로 연타 종료 박자 추가 | [4424a7d](https://github.com/kirakein-gif/PLAYVAULT/commit/4424a7df4ccae1f00e7f7c9401ee8ac54d380a83) · [7e63d67](https://github.com/kirakein-gif/PLAYVAULT/commit/7e63d670cbce8fbaeda13c9c91858f97fe69b523) · [4a3d36e](https://github.com/kirakein-gif/PLAYVAULT/commit/4a3d36eb8ababc834d008914c19f3144f0b5dba0) · [4350083](https://github.com/kirakein-gif/PLAYVAULT/commit/4350083519b87d09aae379f59643263938878f83) |
| 2026-10-08 | v8(커밋/캐시) | 히트스톱·차별화 타격과 적 경직/전조 보정. Noah 걸쇠·문으로 초반 성 순환 구성, art.js와 배경/공용 스프라이트 로딩 추가 | [ee448ac](https://github.com/kirakein-gif/PLAYVAULT/commit/ee448acf63933c96b9480043653a053c9aaff2f0) · [4a58bc7](https://github.com/kirakein-gif/PLAYVAULT/commit/4a58bc7148da87a4c36fc736a0ecba87c10c0ae2) · [dfa01b0](https://github.com/kirakein-gif/PLAYVAULT/commit/dfa01b026ceab561082941ab9d1345f64b0031a1) · [d540689](https://github.com/kirakein-gif/PLAYVAULT/commit/d540689bb8fb26761ecb2bf2d57a67471f48dccf) · [75a2317](https://github.com/kirakein-gif/PLAYVAULT/commit/75a23170f8b45a950f21bb52a14a913ca3236d18) |
| 2026-10-08 | 캐시 9–11 | 모바일 선명도 보정, 가로 우선 레이아웃·회전 안내, 전체화면/화면 방향 요청 후 세로 플레이를 단계적으로 차단 | [592570a](https://github.com/kirakein-gif/PLAYVAULT/commit/592570a6080f08db9b62168a4a4698d710e9f4a9) · [706d627](https://github.com/kirakein-gif/PLAYVAULT/commit/706d627d51b0aa7ed317c7f66ab56b6e511de605) · [aee3a14](https://github.com/kirakein-gif/PLAYVAULT/commit/aee3a14518593df864ce93fb2f4d11ccb5751356) · [59bf206](https://github.com/kirakein-gif/PLAYVAULT/commit/59bf206f9b71e5fe885a2a6af262045707780468) · [d5096e6](https://github.com/kirakein-gif/PLAYVAULT/commit/d5096e652d80bd8b412875f11b4f9971dda9285c) · [b6f22f3](https://github.com/kirakein-gif/PLAYVAULT/commit/b6f22f3fe5afbb28928045cbb170ecc175cebf10) · [c751cc6](https://github.com/kirakein-gif/PLAYVAULT/commit/c751cc63ccb0518a414f984aee4a1071d1f0e523) |
| 2026-10-08 | 캐시 12 및 후속 수정 | 조이스틱/터치와 첫 플레이 경로로 Chapter I 정리, 나머지 방은 후속용 정의로 보존. 종지기 보스 사후 출구/승강기 및 중앙홀 복귀 연결 수정 | [e56a45b](https://github.com/kirakein-gif/PLAYVAULT/commit/e56a45b067c9cba5f3fa966cf9d319ba7ae3a2de) · [cabbe8c](https://github.com/kirakein-gif/PLAYVAULT/commit/cabbe8cdc8b4e5d8afb4a8319a1946c22602efde) · [a9d357f](https://github.com/kirakein-gif/PLAYVAULT/commit/a9d357f10088dad1ac67a08b8c026be1a9b52a22) · [60a9f8d](https://github.com/kirakein-gif/PLAYVAULT/commit/60a9f8d0119926abfe443890dce3e93b841aac68) |
| 2026-10-08 | 캐시 분리: CSS 13→16, art 13→15, core 13 | 타이틀 키 비주얼·플레이 영웅·HD 그림 순차 반영, 고딕 아트를 스테이지·적까지 확장. 공식 단일 게임 버전 확인 불가 | [9fec3ae](https://github.com/kirakein-gif/PLAYVAULT/commit/9fec3aeed6e9dbaa2ecbee6f86cee32d6d9c64a5) · [5c99507](https://github.com/kirakein-gif/PLAYVAULT/commit/5c995077ad6cbbcdc508b3617c3643b524930ac8) · [e4e2661](https://github.com/kirakein-gif/PLAYVAULT/commit/e4e26619fa548ae980592609f071e26935c6681f) · [1911abd](https://github.com/kirakein-gif/PLAYVAULT/commit/1911abdf3575d2196929bcd3af7f76e183d14095) · [d9a9859](https://github.com/kirakein-gif/PLAYVAULT/commit/d9a9859063204cb5a770a5ad47fd2eb4f74a0e83) |

## 세계 최고의 게임 · main 원본

| 날짜(KST) | 버전·근거 종류 | 주요 추가·구조 변경·수정 | 관련 커밋 |
| --- | --- | --- | --- |
| 2026-10-19 | 원본 v0.1 / 화면 0.1.0 | 외부에서 만든 단일 HTML 원본을 최초 등록. 오프닝·최주임/김과장·RPS·버튼/키 타이밍 반응·승패 안내·커서 흔들기·로컬 진행 기록. Git 등록 이전 제작 과정 확인 불가 | [ebf5ae4](https://github.com/kirakein-gif/PLAYVAULT/commit/ebf5ae461ed7cc459a34155c1f5fa1bccbe82c40) |
| 2026-10-19 | 원본 유지 / 기획 문서 v1.0 | README와 게임 디자인·비주얼·입력·로드맵·CODEX_HANDOFF 등록. 드래그/스윙·직접 냄비 착용·결과 스스로 판단 등 정식 방향은 원본 구현과 구분 | [65e56dd](https://github.com/kirakein-gif/PLAYVAULT/commit/65e56dd280369524d028c8d5776f0e34305f5539) · [8f7723a](https://github.com/kirakein-gif/PLAYVAULT/commit/8f7723a82195dd42a67f877cf3d2b48a5cebbf86) · [e6e60ae](https://github.com/kirakein-gif/PLAYVAULT/commit/e6e60ae48efd8f9941ed81b6770704b0b7171b6a) · [dbeb112](https://github.com/kirakein-gif/PLAYVAULT/commit/dbeb112a7715b71722b24bcc81b650fc22ee304c) · [4496834](https://github.com/kirakein-gif/PLAYVAULT/commit/4496834d1f5aff355f429b5a7082ec9d6a577f1e) · [41f7517](https://github.com/kirakein-gif/PLAYVAULT/commit/41f7517a24822f73c9b0732996bb78661e47a284) |

## 세계 최고의 게임 · 미병합 액션 프로토타입

브랜치 tip `e7b28cf`, main 대비 20커밋. 원본 v0.1은 유지되며 별도 `prototype/`에 구현되어 있다. 아래 버전은 브랜치 문서/화면 표식이다. 세부 근거는 해당 브랜치의 `docs/ACTION_PROTOTYPE.md`, `prototype/README.md`이며 브랜치 작업을 main 또는 배포 완료로 기록하지 않는다.

| 날짜(KST) | 버전·근거 종류 | 주요 추가·구조 변경·수정 | 관련 커밋 |
| --- | --- | --- | --- |
| 2026-10-19 | 초기 액션→v0.2(브랜치 문서) | HTML5 유지/Godot 비교·별도 prototype 경로. DOM 분리 engine/config, 어깨너머 RPS 결과 비공개, 직접 grab/스윙/냄비/IK, 파울·AI·3점 경기·타격 정지·음소거/흔들림. Node/브라우저 검증 기록 추가 | [453ff43](https://github.com/kirakein-gif/PLAYVAULT/commit/453ff43bf3b8bfa15f8e49fca99e5ae562a8e938) · [046491f](https://github.com/kirakein-gif/PLAYVAULT/commit/046491f4f2c3630f75bc0ae53080554624754e70) · [d955860](https://github.com/kirakein-gif/PLAYVAULT/commit/d955860511d7dddcae19d887f185ce85299b92ad) · [b47ef45](https://github.com/kirakein-gif/PLAYVAULT/commit/b47ef454e29042caabd9528d703cfc786450b931) · [09bec29](https://github.com/kirakein-gif/PLAYVAULT/commit/09bec29ba76e324fc503e7e7b51333207bbf1320) · [761315f](https://github.com/kirakein-gif/PLAYVAULT/commit/761315f1d12b1170be6e4d3419eee8f8a624cafc) |
| 2026-10-19 | v0.3–v0.6(브랜치 문서) | 구도/팔 길이/즉시 입력과 템포 수정. 인물당 하나의 동작 팔·두 사람 사이 테이블, 대각선 뒤통수 시점 및 테이블 방향 조정 | [5f4412d](https://github.com/kirakein-gif/PLAYVAULT/commit/5f4412d030f0fc25ef1374691e73755730fb280e) · [fdf1331](https://github.com/kirakein-gif/PLAYVAULT/commit/fdf1331ade2cc3fa20cb2dd97276832c328c8d7d) · [ebcdfb7](https://github.com/kirakein-gif/PLAYVAULT/commit/ebcdfb7de1e2881f688b6a27fda5de304cf0fd18) · [60f6cac](https://github.com/kirakein-gif/PLAYVAULT/commit/60f6cacfabfcdee0663b51b7a759047c3af4445c) |
| 2026-10-19 | v0.7–v0.7.3(문서/화면) | A안 일러스트 레이어·투영 포즈로 전환, 목 연결·팔/손 비례·테이블 높이·RPS 앞으로 뻗기 수정 | [103203a](https://github.com/kirakein-gif/PLAYVAULT/commit/103203a94d6d9bad50276e08759eb1be499b4f83) · [0404015](https://github.com/kirakein-gif/PLAYVAULT/commit/0404015704cbb24e31e2a1da95641985280a8b41) · [aa85a53](https://github.com/kirakein-gif/PLAYVAULT/commit/aa85a53fe5149e71c4a8a51cd20f5f952ac5febe) · [4ed6f46](https://github.com/kirakein-gif/PLAYVAULT/commit/4ed6f462310b62e218e63b2fb72412346a821940) |
| 2026-10-19 | v0.8–v0.9(문서/화면) | 승인된 오른손 RPS 자세와 도구 잡기/스윙/냄비 구간의 오른팔-손잡이 연결 조정 | [3712387](https://github.com/kirakein-gif/PLAYVAULT/commit/3712387e8ba67c1f8abb2cfc35e2ac72650530bb) · [b09a052](https://github.com/kirakein-gif/PLAYVAULT/commit/b09a05213275b65231b9f9c05376abfaa76cb2d2) |
| 2026-10-19 | v0.10(문서/화면) | 연속 파츠 리깅 중심 표현에서 완성형 정지 포즈 교체 방식으로 전환, 도구 크기·배치 변경 및 10개 포즈 미리보기. 직접 입력 판정은 유지 | [0071bd3](https://github.com/kirakein-gif/PLAYVAULT/commit/0071bd33c83b69f62d07415370eb8e8c4614b606) |
| 2026-10-19 | v0.11(문서/화면) | 정수리 명중 영역·내려치기 아트, 3점 경기에서 100 에너지/-25 체계로 변경 | [dfc75d0](https://github.com/kirakein-gif/PLAYVAULT/commit/dfc75d03bf96ecc24683cc128ca5ff63df8f0680) |
| 2026-10-19 | v0.12(문서/화면) | 3→2→1 예약 패와 다음 판 자동 진행, 미선택 대기·로딩 후 시작·미리보기 일시정지·에너지 0 종료 | [b5c3c5b](https://github.com/kirakein-gif/PLAYVAULT/commit/b5c3c5b8b8510b0d029b70b62482d480405f0804) |
| 2026-10-19 | v0.13(문서/화면) | 수평 테이블과 타격 카메라 이동/축소 제거, 짧은 망치 머리·HUD 배치 조정. 정지 포즈 간 비례/앵커 정합은 남은 과제 | [e7b28cf](https://github.com/kirakein-gif/PLAYVAULT/commit/e7b28cfc1ce4e595cc7e8abfc6f55845543ca795) |

## 플랫폼·공용 구조 및 병합

| 날짜(KST) | 버전·근거 종류 | 주요 추가·구조 변경·수정 | 관련 커밋 |
| --- | --- | --- | --- |
| 2026-10-05 | 초기 등록 | 저장소 초기화, 정적 홈과 공통 스타일 생성 | [3deefb5](https://github.com/kirakein-gif/PLAYVAULT/commit/3deefb5c6faa8feb2778e3aaf06acc2ccbfe91a6) · [e83c4a7](https://github.com/kirakein-gif/PLAYVAULT/commit/e83c4a7c80480ccf54f4be41e5b2ed4e2508726a) · [a749330](https://github.com/kirakein-gif/PLAYVAULT/commit/a7493307bf8da5e57dfa9c9160161b9ae177a756) |
| 2026-10-08–2026-10-14 | 병합(게임 버전 아님) | polish/eclipse-art-audio에 당시 main의 HOLLOW KEEP 변경을 두 차례 통합. 독립 기능 구현 커밋으로 중복 계산하지 않음 | [985d589](https://github.com/kirakein-gif/PLAYVAULT/commit/985d5898ec450b9b7135f161e0e93f7b74c842fe) · [f1b355b](https://github.com/kirakein-gif/PLAYVAULT/commit/f1b355b748fee885ab113c42fa1134aceab34e27) |

## ECLIPSE 캐시 버전 변경의 직접 근거

아래는 매 커밋의 `games/abyssfall-eclipse/index.html`을 읽어 `?v=` 값이 바뀐 시점만 추출했다. 기능 도입은 위 표의 앞선 여러 커밋에 걸칠 수 있으므로 캐시 변경 커밋만을 기능 최초 도입으로 간주하지 않는다. 첫 HTML에는 쿼리 번호가 없고, 확인 가능한 첫 값은 4다.

| 캐시 값 | 최초 확인 커밋 | 날짜(KST) |
| --- | --- | --- |
| 4 | [c10ae62](https://github.com/kirakein-gif/PLAYVAULT/commit/c10ae62229323ed7eaf172df151bafeee0cd29de) | 2026-10-06 |
| 5 | [c3401af](https://github.com/kirakein-gif/PLAYVAULT/commit/c3401af3075eac6c5e46e93574b4afe921981d0b) | 2026-10-06 |
| 6 | [c353c14](https://github.com/kirakein-gif/PLAYVAULT/commit/c353c145b423acc91f825dcb16413dec6ae65f05) | 2026-10-06 |
| 7 | [707e0e5](https://github.com/kirakein-gif/PLAYVAULT/commit/707e0e5a6d6e2efd020741a80f87922752a8a3b6) | 2026-10-06 |
| 8 | [c52c0b5](https://github.com/kirakein-gif/PLAYVAULT/commit/c52c0b5c45e8d050a3b43c60fe7edaa8a6e54185) | 2026-10-06 |
| 9 | [f83d3b6](https://github.com/kirakein-gif/PLAYVAULT/commit/f83d3b63c6c319e9d9494f502fe3929c07928b99) | 2026-10-06 |
| 10 | [f4c0d12](https://github.com/kirakein-gif/PLAYVAULT/commit/f4c0d12276eb22a245b70e50ad45aed8f8156611) | 2026-10-06 |
| 11 | [9954822](https://github.com/kirakein-gif/PLAYVAULT/commit/9954822b529f8b253021e443673a752468e8d867) | 2026-10-06 |
| 12 | [d325ac7](https://github.com/kirakein-gif/PLAYVAULT/commit/d325ac718f978f88c654bba466819b635d5a9292) | 2026-10-06 |
| 13 | [c299471](https://github.com/kirakein-gif/PLAYVAULT/commit/c299471bfa7cc2a23bfaf09f9629687bc478378a) | 2026-10-06 |
| 14 | [d4e2284](https://github.com/kirakein-gif/PLAYVAULT/commit/d4e22840ec11677120439c52be272eee32455c3d) | 2026-10-06 |
| 15 | [bdaa758](https://github.com/kirakein-gif/PLAYVAULT/commit/bdaa758207c6a759df03105384c9f9e34e2cffb7) | 2026-10-06 |
| 16 | [a82b1a2](https://github.com/kirakein-gif/PLAYVAULT/commit/a82b1a2172af6920ad5f034474800cf92803f5b6) | 2026-10-06 |
| 17 | [653d09e](https://github.com/kirakein-gif/PLAYVAULT/commit/653d09e9ca3b00c51506162f51d634822b10e856) | 2026-10-06 |
| 18 | [8378d3b](https://github.com/kirakein-gif/PLAYVAULT/commit/8378d3b3aec6623f090f115b6998b1848ec37984) | 2026-10-06 |
| 19 | [5fe8b44](https://github.com/kirakein-gif/PLAYVAULT/commit/5fe8b44bd7594b35586a054da9377abba310ee74) | 2026-10-06 |
| 20 | [0af2384](https://github.com/kirakein-gif/PLAYVAULT/commit/0af23848b6982451f8a8e3bd6abb9f9738b62f20) | 2026-10-06 |
| 21 | [22c434c](https://github.com/kirakein-gif/PLAYVAULT/commit/22c434cc36f7ad33c7e48a3a800d86b55aeb430f) | 2026-10-06 |
| 22 | [3e0f53d](https://github.com/kirakein-gif/PLAYVAULT/commit/3e0f53d6a71ab413f4e61aedfbfb02a6c1b7ebb4) | 2026-10-06 |
| 23 | [937a9de](https://github.com/kirakein-gif/PLAYVAULT/commit/937a9ded7fb2c732ca2691bd3f7826739d03d3cb) | 2026-10-06 |
| 24 | [5305ed8](https://github.com/kirakein-gif/PLAYVAULT/commit/5305ed8d332a62aa981ff6a341d32b0ce3a6fb3a) | 2026-10-06 |
| 25 | [9836928](https://github.com/kirakein-gif/PLAYVAULT/commit/98369281b7f2dcc4608d08dd7ce5db41087da5d1) | 2026-10-06 |
| 26 | [f2b0e48](https://github.com/kirakein-gif/PLAYVAULT/commit/f2b0e480e0a476e776af319d61d10e9a3db96920) | 2026-10-06 |
| 27 | [48ae3a6](https://github.com/kirakein-gif/PLAYVAULT/commit/48ae3a6b2e781230bc38d6818117d5a26797aed1) | 2026-10-06 |
| 28 | [7b06a67](https://github.com/kirakein-gif/PLAYVAULT/commit/7b06a67e8319dd24389fcc5e2fa9eece28602240) | 2026-10-06 |
| 29 | [38532ba](https://github.com/kirakein-gif/PLAYVAULT/commit/38532ba5f144e63660e63a8950b67c6af4127e93) | 2026-10-07 |
| 30 | [4f1913c](https://github.com/kirakein-gif/PLAYVAULT/commit/4f1913c0e92004cd8a5e63517525034583ca5308) | 2026-10-07 |
| 31 | [829245b](https://github.com/kirakein-gif/PLAYVAULT/commit/829245bf22f860617df9faea823d966571d453ba) | 2026-10-07 |
| 32 | [e845f91](https://github.com/kirakein-gif/PLAYVAULT/commit/e845f91123159fdad6dd13598cc8738ea7eac075) | 2026-10-07 |
| 33 | [e99f0e5](https://github.com/kirakein-gif/PLAYVAULT/commit/e99f0e572a5e56607530c6833a8f75da17a3876f) | 2026-10-07 |
| 34 | [df04a58](https://github.com/kirakein-gif/PLAYVAULT/commit/df04a58f307df27233952a57f4eeca923108ab0b) | 2026-10-07 |
| 35 | [5f162c9](https://github.com/kirakein-gif/PLAYVAULT/commit/5f162c9c1392694009a0c4037ca43bbbb8bade37) | 2026-10-07 |
| 36 | [a7ed4b5](https://github.com/kirakein-gif/PLAYVAULT/commit/a7ed4b59e2342c36f7a0acca8f86605f9644b51d) | 2026-10-07 |
| 37 | [6271eea](https://github.com/kirakein-gif/PLAYVAULT/commit/6271eeaa43ad503cde5efe3e2dfc8a30147fd334) | 2026-10-07 |
| 38 | [d6308c7](https://github.com/kirakein-gif/PLAYVAULT/commit/d6308c77e779d798c9dd79ec9de8400435e3005f) | 2026-10-07 |
| 39 | [0a0c718](https://github.com/kirakein-gif/PLAYVAULT/commit/0a0c7184d465a743facf75ec44d5dae90060d427) | 2026-10-08 |
| 40 | [1d45c30](https://github.com/kirakein-gif/PLAYVAULT/commit/1d45c30d0934ade266d0bc803ec4a85e9f1683de) | 2026-10-08 |
| 41 | [a4aff2e](https://github.com/kirakein-gif/PLAYVAULT/commit/a4aff2e5ab9d9d409baaa058300e452da0d020d5) | 2026-10-08 |
| 42 | [947ead0](https://github.com/kirakein-gif/PLAYVAULT/commit/947ead0b2fd9c87df25f95603ee3749cef8556bd) | 2026-10-08 |
| 43 | [79f22c3](https://github.com/kirakein-gif/PLAYVAULT/commit/79f22c32cab2bbc7e1eaaeeaf6184ece3a1adc6f) | 2026-10-08 |
| 44 | [7abb36a](https://github.com/kirakein-gif/PLAYVAULT/commit/7abb36afa0bb22f66c587c4060e1f4768ff591a5) | 2026-10-08 |
| 45 | [ccd129f](https://github.com/kirakein-gif/PLAYVAULT/commit/ccd129f7f574c9fdb1f17d515ba51314280d8058) | 2026-10-08 |
| 46 | [381cec9](https://github.com/kirakein-gif/PLAYVAULT/commit/381cec901199c83caa5adc1a6b5f0ce78dd3128f) | 2026-10-08 |
| 47 | [0a40541](https://github.com/kirakein-gif/PLAYVAULT/commit/0a40541b7e8b579e807d5c54130381b28dad1af6) | 2026-10-08 |
| 48 | [2c295b4](https://github.com/kirakein-gif/PLAYVAULT/commit/2c295b499700f2a4225654d4560d0fee7dd6072c) | 2026-10-08 |
| 49 | [42e1420](https://github.com/kirakein-gif/PLAYVAULT/commit/42e14202c121472e33b538bb2ceaac80c2be58eb) | 2026-10-14 |
| 50 | [c5a1d2c](https://github.com/kirakein-gif/PLAYVAULT/commit/c5a1d2c46d15a09c705714bc1cc9a987054cd79f) | 2026-10-14 |
| 51 | [bfe5eb4](https://github.com/kirakein-gif/PLAYVAULT/commit/bfe5eb4b5f64713f19a806073417d470af633308) | 2026-10-14 |
| 52 | [c4ecaa2](https://github.com/kirakein-gif/PLAYVAULT/commit/c4ecaa2bfa1a09cd83395fccfe23ae08ded266a9) | 2026-10-14 |
| 53 | [b3c053e](https://github.com/kirakein-gif/PLAYVAULT/commit/b3c053e40f16002e57d60372e9ef2b2a221ee361) | 2026-10-15 |
| 54 | [e6f2631](https://github.com/kirakein-gif/PLAYVAULT/commit/e6f26317e161b8e3a0c0176dda83d4dbffa22a44) | 2026-10-15 |
| 55 | [07d2822](https://github.com/kirakein-gif/PLAYVAULT/commit/07d28226071d6bdea3618ecc6a5ba546a6aaea3d) | 2026-10-15 |
| 56 | [5c47cf2](https://github.com/kirakein-gif/PLAYVAULT/commit/5c47cf2e8a97f9a53d1598b8551967c8786287a8) | 2026-10-15 |
| 57 | [ee02f20](https://github.com/kirakein-gif/PLAYVAULT/commit/ee02f20d7df3cb74b110b229aae5f0b9878667f1) | 2026-10-15 |
| 58 | [c24205c](https://github.com/kirakein-gif/PLAYVAULT/commit/c24205c63e0bd87dd412c3c67a26ef27daa65a3e) | 2026-10-15 |
| 59 | [9d4aaad](https://github.com/kirakein-gif/PLAYVAULT/commit/9d4aaad85d503ad24e5ded115e23239b5902bf2f) | 2026-10-15 |
| 60 | [8ce4d02](https://github.com/kirakein-gif/PLAYVAULT/commit/8ce4d0257ab46b9f67f1aa0840868521f22a7e75) | 2026-10-15 |

## 이번 관리 문서 작업

게임 버전 변경 없음. 2026-10-31의 공동 규칙 구축과 전체 이력 복원은 [WORK_LOG](docs/WORK_LOG.md)에 기록한다. 앞으로 제품 변경은 해당 게임 표에 버전·날짜·커밋/PR·검증/배포 상태를 추가하고, 기존 행의 오류는 근거를 붙여 정정한다.


## THE HOLLOW KEEP · 새 기반 구현 (2026-10-31, Asia/Seoul)

- [PR #4](https://github.com/kirakein-gif/PLAYVAULT/pull/4), 작업 `codex/hollow-keep-foundation`. 기준 규격 `bcf7a09`, 재개 `5175afd`, 관리 문서 도입 `5cf5748`; 구현 커밋은 PR head 참조.
- 기존 구현을 보존하고 `next/`에 DOM 없는 고정 틱 시뮬레이션, Ethan 룬탄/Noah 단일 참격, 점프·충돌·교대, 시험 방, 키보드/터치, 수치 패널과 CONFIG 복사를 추가.
- 인수 40/40, 경계 7/7, Chromium 브라우저 14/14 및 기존 회귀 3종 통과. 사용자 손맛·실기기 평가는 미확인.
- 기존 게임 버전과 캐시 표기 보존, 새 번호 미부여. 검토 대기이며 병합·배포 없음. 상세 결과·한계는 WORK_LOG 및 `next/README.md` 참조.


## THE HOLLOW KEEP · PR #4 검토 반영 (2026-10-31, Asia/Seoul)

- 기준 구현 `766630e`, 규격 `c6a31bf`를 cherry-pick한 `9f862bc`, 착수 공유 `fd91385`. 수정 커밋은 [PR #4](https://github.com/kirakein-gif/PLAYVAULT/pull/4) head 참조.
- 발견 문제 3건: 좌우 벽에서 넓은 몸으로 교대할 때 폭 차이 이내로 수평 보정, 실제 두 주인공 통과가 확인된 85px 구덩이·라벨, 캔버스 밖으로 이동한 모바일 터치 버튼.
- 결정 반영 1건: Ethan 룬탄은 첫 표적 명중 시 소멸하는 비관통 방식. Noah 3단 콤보는 추후 진행, 공중 감속은 기존 유지.
- 이번 재실행: 원본 인수 41/41, 경계 12/12, 시험 방 통과 4/4, Chromium 브라우저 15/15, 기존 회귀 3종 통과. 844×390 시작 위치 캡처 확인. 게임 버전 변경 없음, 기존 게임 파일 보존, Claude Code 재검토 대기.


## THE HOLLOW KEEP · 모바일 화면 확대·가로 전체 화면 (2026-10-31, Asia/Seoul)

- [PR #4](https://github.com/kirakein-gif/PLAYVAULT/pull/4), 기준 `229a50c`, 규격 `fa33f01`/`44bd915` 반영 `462f363`/`d304724`, 착수 `018654f`. 수정 커밋은 PR head 참조.
- 모바일 캔버스를 가능한 최대 크기로 확대하고 한 축 조이스틱/동작/도구를 좌우 여백에 배치. 844×390에서 캔버스 약 693×390.
- 가로 및 세로 안내의 전체 화면 버튼, 사용자 클릭에서만 전체 화면 진입→가로 고정 요청, 거절·미지원 안내와 해제, 크기 변경 시 재배치/입력 초기화.
- 모바일 배치 20/20, 전체 화면 6/6, 인수 41/41, 경계 12/12, 구덩이 4/4, 브라우저 18/18, 기존 회귀 3종 통과. 실제 화면 회전은 **실기기 확인 필요**. 검사 원본·기존 게임·시뮬레이션 수치 보존, 게임 버전 변경 없음. Claude Code 재검토 대기.


## THE HOLLOW KEEP · 공중 조작 사용자 결정 반영 (2026-10-31, Asia/Seoul)

- [PR #4](https://github.com/kirakein-gif/PLAYVAULT/pull/4), 기준 `9b39ace`, 규격 `6ce2654` 적용 `805e903`, 착수 `4174aa0`. 수정 커밋은 PR head 참조.
- 도약 속도 `takeoffVx`, 고정된 `jumpKind`(running/standing), 방향별 공중 속도 상한과 `airControlSpeed`(1.33/1.73) 조절 패널, 달리기/제자리 점프 임시 자세 구분.
- 키를 놓았을 때의 수직 낙하 유지. 조이스틱을 누른 채 전체 화면 진입/resize 시 입력 유지, 손 떼기·취소·실제 초점 이탈 시 해제.
- 인수 51/51, 경계 16/16, 구덩이 4/4(Ethan 85px 달리기 점프 재확인), 모바일 배치 20/20, 전체 화면 6/6, 브라우저 20/20, 기존 회귀 3종 통과. 기존 게임·검사 원본 보존, 버전 변경 없음. Claude Code 재검토 대기, 실제 화면 회전은 실기기 확인 필요.


## THE HOLLOW KEEP · 픽셀아트 HD 제작·적용 (2026-10-31, Asia/Seoul)

- [PR #8](https://github.com/kirakein-gif/PLAYVAULT/pull/8), 기준 PR #7 `d8c6a21` / main `af58238`, 착수 `e6efc15`. 구현 커밋은 PR head 참조.
- 46색 네이티브 주인공 12개 동작 시트, 룬탄/참격 효과, 30px 석재 타일·고딕 배경, manifest/팔레트/전체 생성 지시문과 원래 격자 재작성 도구 추가.
- 정수 배 backing과 보간 끔, 정수 좌표·좌우 반전, jumpKind/vy 및 attack/land 이벤트 기반 프레임, 자산 실패 시 도형 대체.
- 자산 49/49·렌더 5/5 및 기반 전체 검사 통과. 게임 규칙/수치/원본 검사·기존 게임 보존, 게임 버전 상승 없음. 외형·미적 완성도·움직임은 사용자 판단 대기, Claude Code 검토 대기. 병합·수동 배포 없음.


## THE HOLLOW KEEP · 목표 외형 x1/x2 밀도 시험 (2026-10-31, Asia/Seoul)

- PR #8 같은 브랜치, 기준 `e82b5f2`, 규격 `89453ef` 적용 `b99a679`, 착수 `5791d6c`. 원본 PNG 밑그림 기반(경로 A) Ethan idle/run·Noah idle을 x1/x2에 별도 제작, 공유64색·원래 밀도/알파/윤곽/얼굴/손/발 정리와 비교 자료 추가.
- `?art=trial-x1|x2`, artStatus.scale, scale별 backing/출력 지원. 없는 동작은 도형 대체. 게임 수치·기본 자산·기타 원본 검사 보존, 렌더 검사 404 주입 경로만 한 줄 보완(4917569), 게임 버전 상승 없음.
- 시험 자산18/18씩·실제 시험 경로 런타임10/10. 시험 렌더5/5씩(기존 실패 주입 경로에 시험 폴더도 포함하도록 수정, 판정 완화 없음), 기본 자산50/51(기존 베기 반복 설정, 재제작 보류). 기본 렌더/인수·경계·구덩이·모바일·전체 화면·브라우저·기존 회귀는 통과.
- 어느 쪽이 나은지는 판단하지 않음. 사용자 밀도 선택/Claude Code 검토 대기, 전체 스프라이트와 베기 효과 재제작은 선택 이후. 병합·수동 배포 없음.
