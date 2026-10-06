/*
 * assets.js — 모든 그래픽 에셋 정의를 한 곳에 모아 둔 파일 (아트 봇은 여기와 game/assets/ 만 보면 됨)
 *
 * 좌표계: 1 타일 = TILE_SIZE(16) px "월드 픽셀". 화면에는 SCALE(3)배로 확대(nearest-neighbor)되어 48px로 보임.
 * 모든 이미지 파일은 원본 해상도(16px 기준)로 그려서 넣는다. 확대는 엔진이 한다.
 *
 * placeholder → 이미지 전환:
 *   1) game/assets/ 아래에 아래 `file` 경로대로 PNG를 넣는다. (현재: 타일 20종 + 건물 5종 + 히로인 적용됨)
 *   2) USE_IMAGE_ASSETS 가 true(기본값)면 이미지를 쓴다. URL ?art=0 → 전부 placeholder, ?art=1 → 강제 이미지.
 *   3) 개별 파일이 없거나 로드 실패하면 해당 에셋만 자동으로 placeholder(단색 사각형)로 대체된다
 *      (실패한 파일은 콘솔에 404 한 줄).
 *   file: null → 요청 자체를 하지 않고 placeholder 사용 (404 없음).
 *   계절별 파일(seasons)·초상화(portraits)는 게임 날짜(KST, ?date= 반영)의 계절 파일 → 기본 파일 → placeholder/없음 순으로 대체.
 *   game/assets/asset_index.js (tools/build_asset_index.py 가 생성, run.sh 가 자동 실행) 에 없는 파일은 요청하지 않는다
 *   → 없는 선택 파일 때문에 404 가 나지 않음. 인덱스 파일이 없으면 일단 요청하고 실패 시 대체(404 1줄 가능).
 *   상세 규격: docs/ART_SPEC.md, 아트 봇 매니페스트: game/assets/ART_MANIFEST.md, art_manifest.json
 */
window.DotGame = window.DotGame || {};

DotGame.ASSETS = {
  TILE_SIZE: 16,          // 원본 타일 크기(px)
  SCALE: 3,               // 화면 확대 배율 (16px → 48px)
  USE_IMAGE_ASSETS: true,
  BASE_PATH: 'assets/',   // game/index.html 기준 상대경로

  // 맵 타일. key = 텍스처 이름, char = map.js 의 맵 문자.
  // base 가 있으면 base 타일을 먼저 깔고 그 위에 이 타일(투명 PNG 가능)을 겹쳐 그린다.
  tiles: {
    grass:  { char: '.', file: 'tiles/grass.png',  solid: false, color: '#6abe30', detail: '#5ca828' },
    path:   { char: ':', file: 'tiles/path.png',   solid: false, color: '#d9a066', detail: '#c48a52' },
    wall:   { char: '#', file: 'tiles/wall.png',   solid: true,  color: '#6b4a2f', detail: '#4e3420' },
    tree:   { char: 'T', file: 'tiles/tree.png',   solid: true,  color: '#2f6b2a', detail: '#1f4a1c', base: 'grass' },
    water:  { char: '~', file: 'tiles/water.png',  solid: true,  color: '#3f7fd9', detail: '#6aa0ee' },
    flower: { char: 'f', file: 'tiles/flower.png', solid: false, color: '#6abe30', detail: '#ff77aa', base: 'grass' },
    // --- 추가 타일 (ART_MANIFEST.md §2, art_manifest.json 의 solid/base 그대로) ---
    sidewalk:    { char: '=', file: 'tiles/sidewalk.png',    solid: false, color: '#f6efe2', detail: '#d9ccb6' },
    road:        { char: 'r', file: 'tiles/road.png',        solid: false, color: '#8f8b94', detail: '#ffe9a8' },  // 가로 중앙선
    road_plain:  { char: 'R', file: 'tiles/road_plain.png',  solid: false, color: '#8f8b94', detail: '#7b7781' },
    crosswalk:   { char: 'z', file: 'tiles/crosswalk.png',   solid: false, color: '#8f8b94', detail: '#f8f4ec' },  // 세로 줄무늬
    bench:       { char: 'b', file: 'tiles/bench.png',       solid: true,  color: '#a9d58c', detail: '#c98d63', base: 'grass' },
    lamp:        { char: 'l', file: 'tiles/lamp.png',        solid: true,  color: '#a9d58c', detail: '#ffd36b', base: 'grass' },
    bush:        { char: 'o', file: 'tiles/bush.png',        solid: true,  color: '#a9d58c', detail: '#7fbf73', base: 'grass' },
    flowerbed:   { char: 'F', file: 'tiles/flowerbed.png',   solid: true,  color: '#a9d58c', detail: '#f4a3b8', base: 'grass' },
    fence_h:     { char: '-', file: 'tiles/fence_h.png',     solid: true,  color: '#a9d58c', detail: '#f6efe2', base: 'grass' },
    fence_v:     { char: '|', file: 'tiles/fence_v.png',     solid: true,  color: '#a9d58c', detail: '#f6efe2', base: 'grass' },
    fountain_tl: { char: '1', file: 'tiles/fountain_tl.png', solid: true,  color: '#8fd0e8', detail: '#f6efe2', base: 'grass' },
    fountain_tr: { char: '2', file: 'tiles/fountain_tr.png', solid: true,  color: '#8fd0e8', detail: '#f6efe2', base: 'grass' },
    fountain_bl: { char: '3', file: 'tiles/fountain_bl.png', solid: true,  color: '#8fd0e8', detail: '#f6efe2', base: 'grass' },
    fountain_br: { char: '4', file: 'tiles/fountain_br.png', solid: true,  color: '#8fd0e8', detail: '#f6efe2', base: 'grass' }
  },

  // 주인공 스프라이트 시트: 가로 frames 칸 x 세로 rows 줄. 프레임 1칸 = 16x32 px → 시트 전체 64x128 px.
  // 줄 순서: 0=down(정면), 1=left, 2=right, 3=up(뒷모습). 각 줄의 0번 프레임 = 정지(idle) 프레임.
  // 발밑(시트 프레임의 아래쪽 가운데)이 캐릭터 위치 기준점. 충돌 박스는 발밑 10x6 px.
  hero: {
    file: 'hero/hero.png',                       // 기본(=가을 복사본). 계절 파일이 없거나 실패하면 이것, 그것도 실패하면 placeholder
    seasons: { autumn: 'hero/hero_autumn.png', winter: 'hero/hero_winter.png' },
    frameWidth: 16, frameHeight: 32,
    frames: 4,
    rows: ['down', 'left', 'right', 'up'],
    fps: 8,
    color: '#e04848', skin: '#f5c9a0', hair: '#4a2c1a', pants: '#2e4a8a'
  },

  // 건물: 크기는 map.js 의 BUILDINGS 의 w,h(타일) 기준. 이미지 크기 = (w*16) x (h*16) px (기본 7x5 타일 = 112x80 px).
  // 문은 건물 이미지 안에 그려 넣는다 (문 위치 = 맨 아래 줄, 가운데 칸: 로컬 타일 (3,4) → 픽셀 x 48~63, y 64~79).
  buildings: {
    pcbang:        { file: 'buildings/pcbang.png',        color: '#4a6cd4', roof: '#27397a' },
    cooking:       { file: 'buildings/cooking.png',       color: '#f2c14e', roof: '#b5462f' },
    entertainment: { file: 'buildings/entertainment.png', color: '#c25bd6', roof: '#5e2370' },
    sports:        { file: 'buildings/sports.png',        color: '#3fb27f', roof: '#1f6b4a' },
    academy:       { file: 'buildings/academy.png',       color: '#9cc3ea', roof: '#34507a' },
    // 아직 파일 없음 → asset_index.js 에 없으므로 요청하지 않고 placeholder. 파일을 넣고 인덱스 재생성 시 자동 사용.
    newscenter:    { file: 'buildings/newscenter.png',    color: '#dfe6ee', roof: '#b03a2e' }
  },

  // NPC 스프라이트 시트: 주인공과 완전히 같은 규격 (16x32 프레임, 4열 x 4행, 64x128 px, 행 순서 down/left/right/up).
  // 지금은 정지 프레임(해당 방향 행의 0번)만 사용. 걷기/표정 프레임은 추후.
  npcs: {
    heroine: {
      file: 'npcs/heroine.png',
      frameWidth: 16, frameHeight: 32, frames: 4, rows: ['down', 'left', 'right', 'up'],
      color: '#f28ab2', skin: '#f7d2b0', hair: '#2b1d3a', pants: '#f7f2e8'
    },
    // 학원 NPC 5인 (ART_MANIFEST.md "학원 NPC 5인", art/npcs/README.md 스니펫 그대로)
    park_youngmi:    { file: 'npcs/park_youngmi.png',    frameWidth: 16, frameHeight: 32, frames: 4, rows: ['down', 'left', 'right', 'up'], color: '#9b5a68', skin: '#f6d3b3', hair: '#2c272d', pants: '#8a4d5c' },
    jung_hyuna:      { file: 'npcs/jung_hyuna.png',      frameWidth: 16, frameHeight: 32, frames: 4, rows: ['down', 'left', 'right', 'up'], color: '#c7b5dc', skin: '#f6d3b3', hair: '#6e4c3d', pants: '#d8d3cb' },
    jo_sunmi:        { file: 'npcs/jo_sunmi.png',        frameWidth: 16, frameHeight: 32, frames: 4, rows: ['down', 'left', 'right', 'up'], color: '#4fa58c', skin: '#f6d3b3', hair: '#8a4a3a', pants: '#3b3340' },
    lee_jin:         { file: 'npcs/lee_jin.png',         frameWidth: 16, frameHeight: 32, frames: 4, rows: ['down', 'left', 'right', 'up'], color: '#efc462', skin: '#f6d3b3', hair: '#2e2526', pants: '#5d5a68' },
    kang_myeongheon: { file: 'npcs/kang_myeongheon.png', frameWidth: 16, frameHeight: 32, frames: 4, rows: ['down', 'left', 'right', 'up'], color: '#7fa3cf', skin: '#f6d3b3', hair: '#4a3226', pants: '#8f8a94' }
  },
  door: { color: '#3b2414', knob: '#ffd34e' },

  // 계절: 게임 날짜(KST) 의 MM-DD 가 WINTER 범위면 winter, 아니면 DEFAULT_SEASON(autumn). (연도를 넘는 범위 지원)
  SEASONS: { DEFAULT: 'autumn', WINTER_FROM: '12-01', WINTER_TO: '03-31' },

  // 대화창 초상화: 96x96 원본(ART_MANIFEST), 정수배 확대 + pixelated. 화면 기준폭 960px 에서 PORTRAIT_SCALE 배.
  PORTRAIT_SIZE: 96,
  PORTRAIT_SCALE: 2,
  portraits: {
    hero:    { seasons: { autumn: 'hero/hero_autumn_portrait.png', winter: 'hero/hero_winter_portrait.png' }, file: null },
    heroine: { file: 'npcs/heroine_portrait.png' },
    park_youngmi:    { file: 'npcs/park_youngmi_portrait.png' },
    jung_hyuna:      { file: 'npcs/jung_hyuna_portrait.png' },
    jo_sunmi:        { file: 'npcs/jo_sunmi_portrait.png' },
    lee_jin:         { file: 'npcs/lee_jin_portrait.png' },
    kang_myeongheon: { file: 'npcs/kang_myeongheon_portrait.png' }
  },
  // 화자 이름 → 초상화 id (story.json 의 player.name 도 자동으로 hero 에 연결됨). 줄마다 "portrait" 로 직접 지정 가능.
  // 매니페스트 스니펫 + 스토리 봇 문서(story/academy_npcs.md)의 대화창 이름/호칭 별칭
  speakerPortraits: {
    '현수': 'hero', '주연': 'heroine', '이주연': 'heroine',
    '박영미': 'park_youngmi', '정현아': 'jung_hyuna', '조선미': 'jo_sunmi', '이진': 'lee_jin', '강명헌': 'kang_myeongheon',
    '박영미 선생님': 'park_youngmi', '박영미 강사': 'park_youngmi', '조선미 반장': 'jo_sunmi', '반장님': 'jo_sunmi',
    '현아쌤': 'jung_hyuna', '선미쌤': 'jo_sunmi', '이진쌤': 'lee_jin', '명헌쌤': 'kang_myeongheon'
  }
};

// URL 파라미터로 이미지 모드 토글: ?art=1 / ?art=0
(function () {
  try {
    var m = /[?&]art=(0|1)\b/.exec(location.search);
    if (m) DotGame.ASSETS.USE_IMAGE_ASSETS = m[1] === '1';
  } catch (e) { /* ignore */ }
})();
