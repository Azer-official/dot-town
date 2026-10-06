/*
 * map.js — 마을 맵 (40 x 22 타일). 문자 의미는 assets.js 의 tiles[].char 참고.
 *   통과 가능: '.' 잔디  ':' 벽돌길  'f' 꽃  '=' 보도  'R' 차도  'r' 차도(중앙선)  'z' 횡단보도
 *   충돌:     '#' 생울타리(외곽)  'T' 나무  '~' 물  'b' 벤치  'l' 가로등  'o' 덤불  'F' 화단
 *            '-' 울타리(가로)  '|' 울타리(세로)  '1''2''3''4' 분수(2x2: 12/34)
 * 건물은 맵 문자 위에 BUILDINGS 로 겹쳐 놓이며 footprint 전체가 충돌 영역이다.
 * 문(door)은 건물 맨 아래 줄의 타일. 문 바로 아래 타일에 서서(또는 문을 바라보고) Space/Enter.
 */
window.DotGame = window.DotGame || {};

DotGame.MAP = {
  rows: [
    "########################################",
    "#......................................#",
    "#......................................#",
    "#..........T.......T...................#",
    "#......................................#",
    "#.o....................................#",
    "#...........TF.::.F....................#",
    "#.....:...o....::...To...:..T.....:...T#",
    "#.T.fl:.f.T.b.l::l.b....l:.l.o..l.:..l.#",
    "#==============::======================#",
    "#RRRRRRRRRRRRRRzzRRRRRRRRRRRRRRRRRRRRRR#",
    "#rrrrrrrrrrrrrrzzrrrrrrrrrrrrrrrrrrrrrr#",
    "#RRRRRRRRRRRRRRzzRRRRRRRRRRRRRRRRRRRRRR#",
    "#.o.......=====::======================#",
    "#.........~~~~|::.l..l........l..l...l.#",
    "#.........~~~~|::..12...........T......#",
    "#.........~~~~|::.b34b.......o....ob...#",
    "#.........-----::.....................T#",
    "#.o...:....o...::................f.....#",
    "#.T...::::::::::::::::::::..T......o...#",
    "#........f.....::...f...........T....f.#",
    "########################################"
  ],
  heroStart: { x: 15, y: 10 }   // 타일 좌표
};

// id 는 news.json 의 buildings 키와 동일해야 한다.
DotGame.BUILDINGS = [
  { id: 'pcbang',        name: 'PC방',            x: 3,  y: 2,  w: 7, h: 5, door: { x: 6,  y: 6 } },
  { id: 'cooking',       name: '요리학원',         x: 22, y: 2,  w: 7, h: 5, door: { x: 25, y: 6 } },
  { id: 'entertainment', name: '엔터테인먼트 회사', x: 3,  y: 13, w: 7, h: 5, door: { x: 6,  y: 17 } },
  { id: 'sports',        name: '스포츠센터',       x: 22, y: 14, w: 7, h: 5, door: { x: 25, y: 18 } },
  // type 'academy' → 문을 열면 소식 대화 대신 학습 UI(요약/예상문제)를 연다. 데이터: data/study/
  { id: 'academy',       name: '학원',            x: 12, y: 1,  w: 7, h: 5, door: { x: 15, y: 5 }, type: 'academy' },
  // type 'newscenter' → 분야(카테고리) 메뉴 → 하단 대화창으로 뉴스 열람. 데이터: news.json buildings.newscenter.categories
  { id: 'newscenter',    name: '뉴스 센터',        x: 31, y: 2,  w: 7, h: 5, door: { x: 34, y: 6 }, type: 'newscenter' }
];

// NPC. 타일 1칸을 차지(충돌)하며, 바라보고 Space/Enter → DotGame.NPC.talk(def)
//   대사: data/story/story.json characters[id] (없으면 storyKeys 의 별칭 키 순서로 찾음, 그래도 없으면 placeholder 대사)
//   목록/위치/별칭 문서: docs/NPCS.md
DotGame.NPCS = [
  // 메인 히로인(학원 같은 반 친구). 이름은 스토리 진행 전까지 '???'
  { id: 'heroine',         name: '???',    x: 17, y: 6, facing: 'down',  location: 'academy' },
  // 학원 마당 NPC 5인 (ART_MANIFEST 학원 NPC). 강사는 학원 문 바로 옆.
  { id: 'park_youngmi',    name: '박영미', role: '강사',   x: 14, y: 6, facing: 'down',  location: 'academy' },
  { id: 'jung_hyuna',      name: '정현아', role: '수강생', x: 12, y: 7, facing: 'right', location: 'academy' },
  { id: 'jo_sunmi',        name: '조선미', role: '반장',   x: 13, y: 8, facing: 'left',  location: 'academy', storyKeys: ['cho_sunmi'] },
  { id: 'lee_jin',         name: '이진',   role: '수강생', x: 18, y: 8, facing: 'up',    location: 'academy' },
  { id: 'kang_myeongheon', name: '강명헌', role: '수강생', x: 19, y: 7, facing: 'left',  location: 'academy', storyKeys: ['kang_myungheon'] }
];

// 스토리 장면이 다른 건물(location)에서 대기 중일 때 NPC(예: 히로인)가 서 있는 자리 — 문 옆, 길을 막지 않는 칸
//   game/js/story.js placement() 가 사용. 테스트 경로(문 앞 칸, 큰길)는 비워 둔다.
DotGame.STORY_SPOTS = {
  pcbang:        { x: 7,  y: 7,  facing: 'left' },
  cooking:       { x: 26, y: 7,  facing: 'left' },
  entertainment: { x: 7,  y: 18, facing: 'left' },
  sports:        { x: 26, y: 19, facing: 'left' },
  newscenter:    { x: 36, y: 7,  facing: 'left' }
};
