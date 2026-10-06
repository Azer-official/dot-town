# 아트 에셋 매니페스트 (아트 봇 작성)

규격 출처는 `game/js/assets.js`예요(타일 16px, SCALE 3). 맵 배치와 로딩 방식은 `game/js/map.js`, `game/js/main.js` 기준이에요.
기계가 읽을 수 있는 버전은 `art_manifest.json`이에요(타일 인덱스, solid, base, 건물 footprint, 문 위치 포함).
생성 스크립트는 `tools/town_art/`에 있어요(`town_tiles.py`, `town_buildings.py`, `install.py`, `install_building.py`, `town_preview.py`, `previews.py`).

## 1. 코드 수정 없이 바로 쓰이는 파일 (assets.js에 이미 경로가 정의된 것)
| assets.js 키 | 파일 | 크기 | 비고 |
|---|---|---|---|
| tiles.grass `.` | tiles/grass.png | 16×16 | 이음매 없이 타일링됨 |
| tiles.path `:` | tiles/path.png | 16×16 | 따뜻한 벽돌 보도(가로/세로 길 공용) |
| tiles.wall `#` | tiles/wall.png | 16×16 | 생울타리. 맵 외곽 테두리가 가로/세로 모두 자연스럽게 이어짐 |
| tiles.tree `T` | tiles/tree.png | 16×16 투명 | `base:'grass'` 위에 겹쳐 그려짐 |
| tiles.water `~` | tiles/water.png | 16×16 | 이음매 없는 물결 |
| tiles.flower `f` | tiles/flower.png | 16×16 투명 | `base:'grass'` 위에 겹쳐 그려짐 |
| buildings.pcbang | buildings/pcbang.png | 112×80 (7×5타일) | 옥상 모니터 + "PC" 네온 간판 |
| buildings.cooking | buildings/cooking.png | 112×80 | 셰프모자와 냄비 간판, 줄무늬 차양, 메뉴판 |
| buildings.entertainment | buildings/entertainment.png | 112×80 | 별과 음표 전광판, 레드카펫 |
| buildings.sports | buildings/sports.png | 112×80 | 농구공과 덤벨 간판 |
| buildings.academy | buildings/academy.png | 112×80 | 책과 연필 간판, 시계, 칠판 |
| buildings.newscenter | buildings/newscenter.png | 112×80 | 살구색 외벽과 벽돌색 평지붕. 옥상에 위성 안테나, 송신탑(빨간 경고등), 신문과 'NEWS' 자막 TV 간판. 간판 아래 LED 뉴스 전광판, 모니터 벽과 신문 진열대 창, 파란 신문 가판함 (2026-10-07 추가) |

건물 공통 사항:
- **문**: 로컬 타일 (3,4) = 픽셀 x48~63, y64~79예요. 문틀 윗부분만 y60부터 살짝 올라와 있어요. 문 앞 계단도 같은 타일 안에 있어요.
- **충돌**: main.js 기본값대로 7×5 footprint 전체예요.
- **간판**: y33~46, x7~104에 빈 크림색 간판이 있어요. main.js가 건물 이름을 로컬 (56, 39.5) 가운데에 그리기 때문에, 그 글자가 이 간판 위에 정확히 올라가요. 아이콘은 지붕 간판에 있어서 글자와 겹치지 않아요.
- 위쪽 모서리 일부(박공지붕)는 투명이라 아래 잔디가 비쳐요.

확인한 것: `?art=1`로 headless Chrome에서 로드해 봤어요. 위 파일들은 전부 200이었고 JS 오류는 없었어요.
유일한 404는 `hero/hero.png`예요(주인공 외형이 아직 미정이라 파일이 없어요. 그 경우 placeholder가 그려져요).

## 2. 추가 타일 (파일만 있고 아직 코드에 연결 안 됨)
`tiles/` 아래: `sidewalk`, `road`(노란 중앙 점선), `road_plain`, `crosswalk`, `bench`, `lamp`, `bush`, `flowerbed`, `fence_h`, `fence_v`, `fountain_tl/tr/bl/br`(2×2 분수).
모아 놓은 시트는 `tiles/town_tileset.png`예요(8열, index = row*8+col, 순서는 art_manifest.json 참고).
배치 예시는 `art/town/town_preview_extras.png`와 `art/town/extras_decor_example.json`에 있어요.

연결하려면 `assets.js`의 `tiles`에 아래를 추가하고, `map.js`의 rows에 해당 문자를 쓰면 돼요(문자는 제안이에요. 기존 문자와 겹치지만 않으면 아무거나 괜찮아요).
```js
sidewalk:    { char: '=', file: 'tiles/sidewalk.png',    solid: false, color: '#f6efe2', detail: '#d9ccb6' },
road:        { char: 'r', file: 'tiles/road.png',        solid: false, color: '#8f8b94', detail: '#ffe9a8' },
road_plain:  { char: 'R', file: 'tiles/road_plain.png',  solid: false, color: '#8f8b94', detail: '#7b7781' },
crosswalk:   { char: 'z', file: 'tiles/crosswalk.png',   solid: false, color: '#8f8b94', detail: '#f8f4ec' },
bench:       { char: 'b', file: 'tiles/bench.png',       solid: true,  color: '#a9d58c', detail: '#c98d63', base: 'grass' },
lamp:        { char: 'l', file: 'tiles/lamp.png',        solid: true,  color: '#a9d58c', detail: '#ffd36b', base: 'grass' },
bush:        { char: 'o', file: 'tiles/bush.png',        solid: true,  color: '#a9d58c', detail: '#7fbf73', base: 'grass' },
flowerbed:   { char: 'F', file: 'tiles/flowerbed.png',   solid: true,  color: '#a9d58c', detail: '#f4a3b8', base: 'grass' },
fence_h:     { char: '-', file: 'tiles/fence_h.png',     solid: true,  color: '#a9d58c', detail: '#f6efe2', base: 'grass' },
fence_v:     { char: '|', file: 'tiles/fence_v.png',     solid: true,  color: '#a9d58c', detail: '#f6efe2', base: 'grass' },
fountain_tl: { char: '1', file: 'tiles/fountain_tl.png', solid: true,  color: '#8fd0e8', detail: '#f6efe2', base: 'grass' },
fountain_tr: { char: '2', file: 'tiles/fountain_tr.png', solid: true,  color: '#8fd0e8', detail: '#f6efe2', base: 'grass' },
fountain_bl: { char: '3', file: 'tiles/fountain_bl.png', solid: true,  color: '#8fd0e8', detail: '#f6efe2', base: 'grass' },
fountain_br: { char: '4', file: 'tiles/fountain_br.png', solid: true,  color: '#8fd0e8', detail: '#f6efe2', base: 'grass' },
```
(main.js의 `makeTilePlaceholder`는 이름을 모르는 키도 color 단색으로 처리하니까, 위 내용만 추가하면 돼요.)

## 3. 이미지 모드 켜기
- `assets.js`에서 `USE_IMAGE_ASSETS: true`로 바꾸거나 URL에 `?art=1`을 붙이면 돼요.
- 주인공 시트(`hero/hero.png`)가 정해지기 전까지 콘솔 404를 없애고 싶으면 `hero.file: null`로 두면 돼요. 로더가 건너뛰고 placeholder를 써요.
- 히로인(`npcs/heroine.png`, C안)은 New Bot이 넣은 파일 그대로예요. 아트 봇은 건드리지 않았어요.

## 백업
덮어쓰기 전에 기존 파일이 있으면 `game/assets/_backup/<시각>/`에 복사하게 해 뒀어요(`install.py`). 이번에는 `tiles/`와 `buildings/`가 비어 있어서 백업할 파일이 없었어요.

## 주인공 현수 (hero/) — 확정 외형, 2026-10-07 추가
- `hero/hero.png` (가을 시트 복사본, 기본) · `hero/hero_autumn.png` · `hero/hero_winter.png` — 64x128, 16x32 프레임, 행 down/left/right/up, 프레임 0 정지/1 걸음A/2 정지/3 걸음B
- `hero/hero_autumn_portrait.png` · `hero/hero_winter_portrait.png` — 96x96
- 현재 assets.js 는 `hero.file: null` 이라 아직 로드되지 않음 → `hero.file: 'hero/hero.png'` 로 바꾸면 적용. 계절 전환(12/1~ 겨울) 항목 제안은 art/hero/README.md 참고.
- 원본·미리보기·니트 대안: art/hero/, 스크립트: tools/hero_art/

## 학원 NPC 5인 (npcs/) — 2026-10-07 추가
| id | 이름 | 시트 (64x128) | 초상화 (96x96) |
|---|---|---|---|
| park_youngmi | 박영미 강사 | npcs/park_youngmi.png | npcs/park_youngmi_portrait.png |
| jung_hyuna | 정현아 | npcs/jung_hyuna.png | npcs/jung_hyuna_portrait.png |
| jo_sunmi | 조선미 반장 | npcs/jo_sunmi.png | npcs/jo_sunmi_portrait.png |
| lee_jin | 이진 | npcs/lee_jin.png | npcs/lee_jin_portrait.png |
| kang_myeongheon | 강명헌 | npcs/kang_myeongheon.png | npcs/kang_myeongheon_portrait.png |

- 규격은 주인공/히로인과 같아요: 16x32 프레임, 행 down/left/right/up, 프레임 0 정지 · 1 걸음A · 2 정지 · 3 걸음B.
- 파일은 설치됐고 `asset_index.js`도 다시 생성했어요. 하지만 `assets.js`의 `npcs`, `portraits`, `speakerPortraits`에 항목이 없어서 아직 로드되지 않아요. 넣을 스니펫은 `art/npcs/README.md`에 있어요(임시 복사본에서 전부 200, JS 오류 없음, 맵과 대화창 표시를 확인).
- 원본, 미리보기, GIF, 비교 이미지는 art/npcs/, 스크립트는 tools/npc_art/에 있어요.

## 뉴스 센터 건물 (buildings/newscenter.png) — 2026-10-07 추가
- `map.js`(`id: 'newscenter'`, x31 y2, 7x5, 문 (34,6), `type: 'newscenter'`)와 `assets.js`(`buildings.newscenter.file = 'buildings/newscenter.png'`)에 이미 정의돼 있어서, 코드 수정 없이 바로 쓰여요.
- 규격은 다른 건물과 같아요: 112x80, 문은 로컬 타일 (3,4)(x48~63, y64~79), 빈 크림색 간판은 y33~46.
- 설치할 때 같은 이름의 기존 파일이 없어서 백업은 없었어요. `tools/build_asset_index.py`로 `asset_index.js`에 등록했고, `art_manifest.json`의 buildings에도 추가했어요.
- `?art=1` 헤드리스(포트 8766)에서 200, 텍스처 112x80, JS 오류 없음, 간판 위 '뉴스 센터' 라벨 위치까지 확인했어요(`art/town/newscenter_ingame_test.png`).
