# NPC 목록 · 배치 · 대사 연결

NPC는 `game/js/map.js` 의 `DotGame.NPCS` 에 정의된다. 아트(시트, 초상화) 등록은 `game/js/assets.js`,
대사는 `data/story/story.json` 의 `characters.<id>` 에 있다(스토리 봇 담당, file:// 용 미러는 `data/story/story.js`).
NPC는 타일 1칸을 차지해 충돌하고, 바라보고 **Space / Enter** 를 누르면 `DotGame.NPC.talk(def)` 가 대화를 연다.

## 1. NPC 표

이름과 역할은 `game/assets/ART_MANIFEST.md` 의 "학원 NPC 5인" 표를 따른다. 좌표는 타일 기준 (x, y)이다.
학원 건물은 x12–18, y1–5이고 문은 (15,5), 문 앞은 (15,6)이다.

| id | 표시 이름 / 역할 | 맵 위치 | 바라봄 | 말 거는 칸(예) | 시트 (64×128) | 초상화 (96×96) | 스토리 키 |
|---|---|---|---|---|---|---|---|
| `heroine` | ??? → 주연 (메인 히로인) | (17,6) 학원 문 오른쪽 | down | (16,6)에서 → | `npcs/heroine.png` | `npcs/heroine_portrait.png` | `characters.heroine` |
| `park_youngmi` | 박영미 / 강사 | (14,6) **학원 문 바로 왼쪽**(가장 가까움) | down | (15,6)에서 ← | `npcs/park_youngmi.png` | `npcs/park_youngmi_portrait.png` | `characters.park_youngmi` |
| `jung_hyuna` | 정현아 / 수강생 | (12,7) 왼쪽 화단 앞 | right | (13,7)에서 ← | `npcs/jung_hyuna.png` | `npcs/jung_hyuna_portrait.png` | `characters.jung_hyuna` |
| `jo_sunmi` | 조선미 / 반장 | (13,8) 벤치와 가로등 사이 | left | (13,7)에서 ↓ | `npcs/jo_sunmi.png` | `npcs/jo_sunmi_portrait.png` | `characters.jo_sunmi` (별칭 `cho_sunmi`) |
| `lee_jin` | 이진 / 수강생 | (18,8) 가로등과 벤치 사이 | up | (18,7)에서 ↓ | `npcs/lee_jin.png` | `npcs/lee_jin_portrait.png` | `characters.lee_jin` |
| `kang_myeongheon` | 강명헌 / 수강생 | (19,7) 오른쪽 나무 옆 | left | (18,7)에서 → | `npcs/kang_myeongheon.png` | `npcs/kang_myeongheon_portrait.png` | `characters.kang_myeongheon` (별칭 `kang_myungheon`) |

시트와 초상화 경로는 `game/assets/` 기준이다.

**배치 규칙** (테스트 `test_npcs` 가 확인):
- 걸을 수 있는 칸에만 둔다.
- 문, 문 앞 칸, 다른 테스트의 이동 경로는 비워 둔다. 이동 경로는 다음과 같다:
  - 학원 진입: 15열 y5–10
  - 히로인 접근: (16,6)
  - 큰길: 10행
  - PC방: 6–7열
  - 뉴스 센터: 33–35열
- 시작점 (15,10)에서 닿는 인접 칸이 있어야 한다.
- 기존 장식은 옮기지 않았다. 마당의 빈 잔디 칸에 배치했다.

**말 걸기 안내**: 강사와 반장에게는 "박영미 강사님에게 말 걸기", "조선미 반장님에게 말 걸기"가 뜨고, 나머지는 "정현아에게 말 걸기"처럼 뜬다.

## 2. 대사 (story.json) 연결

`DotGame.NPC.talk(def, where)` 는 다음 순서로 대사를 고른다. `where` 는 NPC 가 지금 서 있는 장소이고 보통 `academy` 다.

1. **캐릭터 찾기**: `characters[def.id]` 를 먼저 찾는다. 없으면 `def.storyKeys` 에 적힌 별칭 키를 순서대로 찾는다.
2. **스토리 장면** (`DotGame.Story.talkScene`): 조건을 모두 만족하는 **첫 장면**을 재생한다(`game/js/story.js`).
   - 조건: `requires_flags`/`excludes_flags`, `available_from`/`available_until`, 밀린 이벤트 차례, `stage`, 한 번만 재생.
   - 상세 필드는 [`DATA_FORMAT.md` 3장](DATA_FORMAT.md)에 있다.
   - 재생하면 `set_flags` 를 기록하고 `affection[<npc id>]` 에 `affection` 을 더한 뒤 호감도 단계를 다시 계산한다.
   - 나레이션 줄은 이름표와 초상화 없이, 선택지 줄은 보기 목록으로 나온다.
3. **일일 반응** (`DotGame.Daily`): 오늘 `data/daily_reactions.json` 에 이 캐릭터·장소의 `on_talk` 반응이 있으면 재생한다(하루 한 번).
4. **기본 대사**: `default_lines`.
5. **파일 대체 대사**: `daily_reactions.json` 의 `fallback_lines.<캐릭터>` (`heroine` 은 `juyeon` 키).
6. **내장 대체 대사**: 위가 모두 없거나 캐릭터 항목 자체가 없으면 placeholder 대사를 보여 준다. 크래시는 나지 않는다.
   > (박영미 강사님이 가볍게 눈인사를 한다.) / (아직 대사가 준비되지 않았어요 — data/story/story.json 의 characters.park_youngmi)
7. **예시 표시**: `is_sample: true` 이면 첫 쪽 앞에 `[예시 데이터]` 가 붙는다.

### 2-0. 다른 건물로 옮겨 가는 NPC (건물 장면)
- 장면의 `location` 이 다른 건물 id(예: E03 `pcbang`)이고 그 장면이 지금 재생 가능하면, 그 NPC 는 마당 자리 대신 **그 건물 앞 자리**에 선다.
  - 자리는 `map.js` `DotGame.STORY_SPOTS` 에 있고, 모두 왼쪽을 바라본다.
  - 단, 기본 장소의 장면이 먼저 재생 가능하면 그 장면을 우선한다(NPC 는 마당에 남는다).

  | 건물 | 문 | NPC 자리 |
  |---|---|---|
  | `pcbang` | (6,6) | (7,7) |
  | `cooking` | (25,6) | (26,7) |
  | `entertainment` | (6,17) | (7,18) |
  | `sports` | (25,18) | (26,19) |
  | `newscenter` | (34,6) | (36,7) |

- 그 건물 문에서 Space 를 누르면 장면이 재생된다.
  - `door_mode: "instead"`(기본): 소식 대신 장면이 나온다.
  - `door_mode: "before"`: 장면 뒤에 소식이 이어진다.
  - 옮겨 간 NPC 에게 직접 말을 걸어도 같은 장면이 나온다.
- 대화가 끝날 때마다, 그리고 날짜가 바뀔 때 NPC 위치를 다시 계산한다(`refreshNpcs`). 히어로가 그 칸에 서 있으면 옮기지 않는다.
- 테스트: `test_story` (주연이 (7,7)로 이동하고, PC방 문에서 E03 이 재생된 뒤 다음 방문 때 소식이 나오는지 확인).

대화창 이름은 `characters.<id>.name` 이고, 없으면 `DotGame.NPCS` 의 `name` 을 쓴다. 장면 줄마다 `speaker` 를 지정할 수 있다.

### 2-1. 화자 이름 → 초상화 (`assets.js` `speakerPortraits`)

대화창은 각 쪽(줄)마다 다음 순서로 초상화를 고른다.

1. 줄의 `portrait` 값(초상화 id, 또는 `null` 이면 초상화 없음)
2. `speaker` 이름 → `speakerPortraits`
3. 화자가 없거나 NPC 본인 이름이면 그 NPC의 초상화

| 화자 이름 (`speaker`) | 초상화 id | 파일 |
|---|---|---|
| 현수 (= `player.name`) | `hero` | `hero/hero_<계절>_portrait.png` (가을/겨울) |
| 주연, 이주연 | `heroine` | `npcs/heroine_portrait.png` |
| 박영미, 박영미 선생님, 박영미 강사 | `park_youngmi` | `npcs/park_youngmi_portrait.png` |
| 정현아, 현아쌤 | `jung_hyuna` | `npcs/jung_hyuna_portrait.png` |
| 조선미, 조선미 반장, 반장님, 선미쌤 | `jo_sunmi` | `npcs/jo_sunmi_portrait.png` |
| 이진, 이진쌤 | `lee_jin` | `npcs/lee_jin_portrait.png` |
| 강명헌, 명헌쌤 | `kang_myeongheon` | `npcs/kang_myeongheon_portrait.png` |

목록에 없는 이름에는 초상화가 없다(기존 레이아웃). 예: `"　"`(전각 공백) + `"portrait": null` 은 나레이션이다.
호칭 별칭(선생님, ○○쌤)은 `story/academy_npcs.md` 를 참고해 추가했다. 맨 "선생님"은 다른 선생님과 겹칠 수 있어 넣지 않았다.

### 2-2. story.json 예시

```json
{
  "characters": {
    "lee_jin": {
      "name": "이진",
      "location": "academy",
      "scenes": [
        {
          "id": "lee_first_talk",
          "excludes_flags": ["met_lee_jin"],
          "set_flags": ["met_lee_jin"],
          "affection": 1,
          "lines": [
            { "speaker": "이진쌤", "text": "현수쌤~ 오늘 쪽지시험 범위 들으셨어요?" },
            { "speaker": "현수", "text": "아뇨, 어디까지래요?" },
            { "speaker": "　", "text": "(이진쌤이 교재를 펼쳐 보여 준다.)", "portrait": null }
          ]
        }
      ],
      "default_lines": ["안녕하세요, 현수쌤~ 오늘 수업도 같이 버텨요!"]
    }
  }
}
```

- 스키마: `data/schema/story.schema.json`. 검사: `python3 tools/validate_data.py`.
- story.json 을 고친 뒤에는 `python3 tools/build_fallbacks.py` 로 `story.js` 를 다시 만든다. `run.sh` 는 실행할 때 자동으로 다시 만든다.

## 3. NPC 추가 방법

1. 아트를 둔다: `game/assets/npcs/<id>.png` (64×128, 16×32 프레임, 행 down/left/right/up)와 `<id>_portrait.png` (96×96).
   그다음 `python3 tools/build_asset_index.py` 를 실행한다. 인덱스에 없는 파일은 요청하지 않으므로 404가 나지 않는다.
2. `assets.js` 에 등록한다: `npcs.<id>` (file, 프레임, placeholder 색), `portraits.<id>`, `speakerPortraits` 의 이름 → id.
3. `map.js` `DotGame.NPCS` 에 `{ id, name, role?, x, y, facing, location, storyKeys? }` 를 추가한다.
4. 대사는 `story.json` `characters.<id>` 에 넣는다. 없어도 placeholder 로 동작한다.
