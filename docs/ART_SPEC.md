# 아트 스펙 (아트 봇용)

## 기본
- **타일 = 16×16 px**, 화면에서 **3배**(48 px) nearest-neighbor 확대. 이미지는 원본 해상도로 그린다(확대 금지).
- 포맷: PNG (투명 지원, sRGB). 안티앨리어싱 없는 도트.
- 맵: 40×22 타일 (640×352 px 월드, 뉴스 센터 추가로 오른쪽 8열 확장). 화면에는 20×12 타일이 보이고 카메라가 주인공을 따라감.
- 모든 경로/크기/색 정의는 **`game/js/assets.js` 한 파일**에 있음. 맵 배치는 `game/js/map.js`.

## 파일 위치 (`game/assets/` 아래)

| 에셋 | 경로 | 크기 | 비고 |
|---|---|---|---|
| 잔디 | `assets/tiles/grass.png` | 16×16 | 불투명 |
| 길 | `assets/tiles/path.png` | 16×16 | 불투명 |
| 울타리/벽 | `assets/tiles/wall.png` | 16×16 | 맵 테두리, 충돌 |
| 나무 | `assets/tiles/tree.png` | 16×16 | **투명 배경** (잔디 위에 겹침), 충돌 |
| 물 | `assets/tiles/water.png` | 16×16 | 충돌 |
| 꽃 | `assets/tiles/flower.png` | 16×16 | **투명 배경** (잔디 위), 통과 가능 |
| 주인공 (기본) | `assets/hero/hero.png` | 64×128 | 가을 시트 복사본. 계절 파일이 없거나 실패할 때 사용 |
| 주인공 가을 | `assets/hero/hero_autumn.png` | 64×128 | 게임 날짜가 겨울이 아닐 때 |
| 주인공 겨울 | `assets/hero/hero_winter.png` | 64×128 | 게임 날짜 12/1 ~ 3/31 (KST) |
| 주인공 초상화 | `assets/hero/hero_autumn_portrait.png`, `hero_winter_portrait.png` | 96×96 | 계절별, 대화창 |
| 히로인 초상화 | `assets/npcs/heroine_portrait.png` | 96×96 | 대화창 |
| 히로인 NPC | `assets/npcs/heroine.png` | 64×128 | 주인공과 동일 규격. **C안(최종) 적용됨** |
| 학원 NPC 5인 | `assets/npcs/<id>.png` (park_youngmi, jung_hyuna, jo_sunmi, lee_jin, kang_myeongheon) | 64×128 | 주인공과 동일 규격. **적용됨**. 목록·위치는 `docs/NPCS.md` |
| 학원 NPC 초상화 | `assets/npcs/<id>_portrait.png` | 96×96 | 대화창 |

### 추가 타일 (ART_MANIFEST.md §2 — 모두 16×16, 적용됨)
| 키 | 맵 문자 | 충돌 | base | 맵 배치 |
|---|---|---|---|---|
| sidewalk | `=` | 통과 | - | 대로 양옆 보도 (9행, 13행) |
| road_plain | `R` | 통과 | - | 대로 차선 (10행, 12행) |
| road | `r` | 통과 | - | 대로 가운데 줄 (11행, 노란 중앙선) |
| crosswalk | `z` | 통과 | - | 세로 벽돌길과 대로가 만나는 곳 (15–16열, 10–12행) = 시작 위치 |
| bench | `b` | 충돌 | grass | 대로 북쪽 잔디 2곳, 분수 양옆 2곳 |
| lamp | `l` | 충돌 | grass | 보도 바깥 잔디를 따라 9곳 |
| bush | `o` | 충돌 | grass | 잔디 곳곳 9곳 |
| flowerbed | `F` | 충돌 | grass | 학원 문 앞 양옆 (13,6), (18,6) |
| fence_h | `-` | 충돌 | grass | 연못 남쪽 (10–14열, 17행) |
| fence_v | `\|` | 충돌 | grass | 연못 동쪽 (14열, 14–16행) |
| fountain_tl/tr/bl/br | `1` `2` / `3` `4` | 충돌 | grass | 2×2 분수 (19–20열, 15–16행) |
충돌/base 값은 `art_manifest.json` 그대로. 전체 배치 미리보기: `docs/town_overview.png`.
| PC방 | `assets/buildings/pcbang.png` | 112×80 | 7×5 타일 |
| 요리학원 | `assets/buildings/cooking.png` | 112×80 | 7×5 타일 |
| 엔터테인먼트 회사 | `assets/buildings/entertainment.png` | 112×80 | 7×5 타일 |
| 스포츠센터 | `assets/buildings/sports.png` | 112×80 | 7×5 타일 |
| 학원 | `assets/buildings/academy.png` | 112×80 | 7×5 타일 |
| 뉴스 센터 | `assets/buildings/newscenter.png` | 112×80 | 7×5 타일, 문 = 로컬 타일 (3,4) (픽셀 x48–63, y64–79). 맵 위치 x31–37, y2–6, 문 (34,6). **적용됨** (아트 봇이 2026-10-07 추가; 파일이 없으면 요청 없이 placeholder(밝은 회색 벽 + 빨간 지붕)). 간판 글씨 "뉴스 센터"는 게임이 로컬 (56, 39.5)에 그리므로 y33–46 에 빈 간판판 권장. 넣은 뒤 `python3 tools/build_asset_index.py` (또는 run.sh 재시작) 하면 자동 사용 |

## 캐릭터 스프라이트 시트 (주인공 / NPC 공통)
- 프레임 **16×32 px** (가로 1타일 × 세로 2타일, 스타듀밸리 비율).
- 시트 = **4열(걷기 프레임) × 4행(방향)** = 64×128 px.
- 행 순서: **0 = 아래(정면), 1 = 왼쪽, 2 = 오른쪽, 3 = 위(뒷모습)**.
- 각 행의 0번 열 = 정지(idle) 프레임. 걷기 애니메이션은 0→1→2→3 반복, 8 fps.
- 기준점: 프레임 **아래쪽 가운데 = 발밑**. 발은 프레임 맨 아래 2~3 px 안에 오도록. 충돌 박스는 발밑 10×6 px.
- 프레임 번호(Phaser): `행 × 4 + 열` (0~15).
- 히로인은 현재 정지 프레임만 사용(행 0, 열 0). 걷기/표정은 추후.

## 건물
- 크기 = `map.js` 의 `w×h` 타일 × 16 px. 현재 모두 **7×5 타일 = 112×80 px**, 건물 footprint 전체가 충돌.
- **문은 건물 이미지 안에 그린다**: 맨 아래 줄 가운데 칸 = 로컬 타일 (3,4) = 픽셀 x 48–63, y 64–79.
- 간판 글씨(건물 이름)는 게임이 이미지 위에 텍스트로 얹는다(로컬 y≈35–44 위치의 가로 띠). 이미지엔 빈 간판판만 그려도 되고, 글씨를 그려 넣었다면 `main.js` 의 라벨 생성 부분을 끄면 된다.
- 지붕이 footprint 위로 튀어나오는 큰 이미지는 현재 미지원(다음 단계: `offsetY` 설정 추가 예정).

## 이미지 사용 / placeholder
1. **기본값 `USE_IMAGE_ASSETS: true`** (현재 타일 20 + 건물 6 + NPC 6 + 주인공 계절 시트 1 + 초상화 7 = 40개 이미지 로드, 404 없음).
2. URL `…/game/?art=0` → 전부 placeholder(이미지 요청 0건), `?art=1` → 강제 이미지.
3. 없는/깨진 파일은 해당 에셋만 자동으로 단색 placeholder 로 대체된다(콘솔에 404 와 경고 1줄씩).
4. **`file: null`** → 요청 자체를 하지 않고 placeholder (404 없음).
6. **파일 인덱스** `game/assets/asset_index.js` (`tools/build_asset_index.py` 생성, `run.sh` 시작 시 자동 재생성): 게임은 인덱스에 없는 파일은 요청하지 않는다 → 없는 선택 파일(계절/초상화) 때문에 404 가 나지 않음.
   아트 봇은 파일 추가/삭제 후 `python3 tools/build_asset_index.py` 실행(또는 run.sh 재시작). 인덱스에 있는데 실제 로드가 실패하면 다음 후보로 넘어가며 이때만 404 1줄.

## 계절 (주인공 시트 + 초상화)
- 게임 날짜 = `DotGame.Save.todayKST()` (실제 KST, `?date=` 반영). MM-DD 가 **12-01 ~ 03-31 이면 winter**, 그 외 autumn (`assets.js` `SEASONS`).
  (art/hero/README.md 는 "12/1~2월 말" 을 제안했지만 요청 사양에 따라 3/31 까지 겨울.)
- 시트 대체 순서: `seasons[계절]` → `hero.file`(hero.png) → placeholder 사각형.
- 초상화 대체 순서: `portraits.hero.seasons[계절]` → 가을 초상화 → (file) → 초상화 없음.
- 계절은 페이지를 열 때 결정 (켜 둔 채 자정을 넘기면 새로고침 시 반영).

## 대화창 초상화
- 원본 96×96 투명 PNG, `PORTRAIT_SCALE: 2` 정수배 (기준 화면폭 960px 에서 192px, 화면 크기에 비례), `image-rendering: pixelated`, 대화창 오른쪽.
- 화자 → 초상화: 줄의 `portrait` 직접 지정 > 이름 매핑(`speakerPortraits`: 현수→hero, 주연/이주연→heroine, 박영미·정현아·조선미·이진·강명헌(+호칭 별칭)→각 NPC, story.json `player.name`→hero — 표: `docs/NPCS.md`) > NPC 대화의 기본 화자(히로인 '???' 포함)→그 NPC.
- 초상화가 없는 화자(건물 소식, 학원 강사 등)는 기존 레이아웃 그대로.
5. `file://` 로 열면 브라우저가 XHR 이미지 로드를 막기 때문에, 게임이 자동으로 `<img>` 로더 + Canvas 렌더러로 전환한다(http 에서는 WebGL).
   특정 에셋을 끄려면 `assets.js` 에서 그 항목의 `file` 을 `null` 로.
4. 경로/크기를 바꾸면 `assets.js` 의 `file`, `frameWidth/frameHeight`, `map.js` 의 `w/h/door` 를 함께 수정.

## placeholder 색 (참고)
잔디 `#6abe30`, 길 `#d9a066`, 벽 `#6b4a2f`, 나무 `#2f6b2a`, 물 `#3f7fd9`,
PC방 `#4a6cd4`, 요리학원 `#f2c14e`, 엔터 `#c25bd6`, 스포츠 `#3fb27f`, 학원 `#9cc3ea`,
주인공 빨간 상의 `#e04848`, 히로인 분홍 `#f28ab2`.
