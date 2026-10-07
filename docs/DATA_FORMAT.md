# 데이터 포맷 (v1)

모든 데이터는 `/workspace/dotgame/data/` 아래 JSON. 공통 규칙:

- `version`: 정수, 현재 `1`. **호환이 깨지는 변경**(필드 이름 변경/의미 변경)일 때만 올린다. 필드 추가는 version 유지.
  게임은 지원 버전보다 높으면 경고만 띄우고 읽을 수 있는 만큼 표시.
- `updated_at`: ISO 8601, KST 오프셋 포함 (`2026-10-07T07:00:00+09:00`).
- `is_sample`: `true`면 게임 화면에 **"예시 데이터"** 배지와 `[예시 데이터]` 문구가 붙는다. 실데이터는 `false`.
- `note`: 자유 메모(선택).
- 문자열은 UTF-8. 게임은 모두 `textContent` 로 넣으므로 HTML 은 해석되지 않음(그대로 글자로 보임).
- JSON Schema: `data/schema/*.schema.json` (Draft 2020-12). 검사: `.venv/bin/python tools/validate_data.py`

## file:// 대체본 (.js 미러) — 중요

브라우저는 `file://` 에서 `fetch()`로 로컬 JSON 을 못 읽는다. 그래서 각 JSON 의 `.js` 미러를 함께 둔다.

| 원본 JSON | 미러 (자동 생성) | 전역 변수 |
|---|---|---|
| `data/news.json` | `data/news.js` | `window.NEWS_DATA` |
| `data/study/index.json` + 교재 파일들 | `data/study/study.js` | `window.STUDY_DATA = {index, materials:{id: 교재}}` |
| `data/story/story.json` | `data/story/story.js` | `window.STORY_DATA` |
| `data/daily_reactions.json` | `data/daily_reactions.js` | `window.DAILY_REACTIONS_DATA` |

로딩 순서: http 로 열렸으면 JSON 을 fetch(캐시 무시) → 실패 시 `.js` 미러 → 그것도 없으면 안내 문구.
`file://` 이면 fetch 를 시도하지 않고 바로 미러 사용(콘솔 에러 방지). 화면 왼쪽 위 HUD 에 출처 표시.

**콘텐츠 봇 업데이트 절차 (매일 아침):**
1. JSON 파일만 새로 쓴다 (가능하면 임시파일에 쓰고 rename → 반쯤 쓴 파일 노출 방지).
2. `python3 /workspace/dotgame/tools/build_fallbacks.py` → `.js` 미러 4종 재생성.
3. (권장) `.venv/bin/python tools/validate_data.py` 로 검증, 실패 시 이전 파일 유지.

서버 모드에선 1번만 해도 새로고침 시 반영된다. 2번은 file:// 사용자를 위한 것.

---

## 1. 소식 `data/news.json`

```json
{
  "version": 1,
  "updated_at": "2026-10-07T07:00:00+09:00",
  "is_sample": false,
  "note": "선택",
  "buildings": {
    "pcbang": {
      "name": "PC방",
      "speaker": "PC방 사장님",
      "greeting": "어서 와! 오늘 게임계 소식 들려줄게.",
      "items": [
        { "title": "제목 (60자 이내)", "lines": ["한 줄 = 대화 한 페이지", "두 번째 페이지"], "source": "https://..." }
      ]
    },
    "cooking": { "items": [] },
    "entertainment": { "items": [] },
    "sports": { "items": [] }
  }
}
```

- 건물 id: `pcbang`, `cooking`, `entertainment` (items), `sports` (items 또는 종목별 categories, 아래 1-2), `newscenter` (categories, 아래 1-1). `academy` 는 학습 UI라 news 에 넣지 않음.
- `name`/`speaker`/`greeting` 선택 (없으면 게임 기본값). `items` 는 0~10개 권장.
- `lines`: 1줄 = 1페이지. 60자 내외 권장, 90자 초과는 게임이 문장 경계에서 자동 분할.
- `source`: 선택. 화면에는 도메인만 "출처: example.com" 으로 표시(링크 클릭 불가).
- 대화 흐름: 인사말 → (각 item: 「제목」 → lines…) → 마무리 인사.
- 대체 처리: 건물 키 누락 → "지금은 이 건물의 소식이 준비되지 않았어요…", `items` 빈 배열 → "오늘은 새로운 소식이 없네요…", 파일 자체 없음 → "불러오지 못했어요".

### 1-1. 뉴스 센터 `buildings.newscenter` (같은 news.json 안)

콘텐츠 봇이 매일 **파일 하나**만 쓰면 되도록 별도 파일 대신 news.json 의 건물 항목으로 넣었다(같은 version/updated_at/is_sample,
같은 .js 대체본·검증 경로를 그대로 사용). 다른 건물과 같은 형식에 `items` 대신 `categories` 배열을 둔다.

```json
"newscenter": {
  "name": "뉴스 센터",
  "speaker": "뉴스 센터 앵커",
  "greeting": "오늘의 주요 뉴스를 분야별로 전해 드려요.",
  "categories": [
    { "id": "politics", "label": "국내 정치·시사", "items": [
      { "title": "제목", "lines": ["본문 한 줄 = 한 페이지"], "source": "https://...", "published_at": "2026-10-07T07:00:00+09:00" } ] },
    { "id": "economy",  "label": "경제",          "items": [] },
    { "id": "society",  "label": "사회·사건사고",  "items": [] },
    { "id": "world",    "label": "국제",          "items": [] }
  ]
}
```

- 분야 id: `politics`, `economy`, `society`, `world` (메뉴 순서 고정). `label` 생략 시 기본 이름. 모르는 id 는 메뉴 끝에 추가.
- `items` 형식은 다른 건물과 같고 `published_at`(선택, ISO 8601 **+09:00**)만 추가. 화면 meta 에 `MM-DD HH:mm` 로 표시. 분야당 10건 이하 권장.
- 흐름: 메뉴(분야별 건수) → 분야 선택 → "「분야」 주요 뉴스 N건" → (「제목」 → lines…) × N → 마무리 → **메뉴로 복귀**.
- 대체: 분야 `items` 가 비었거나 분야/`newscenter` 자체가 없으면 메뉴에 "(없음)", 선택 시 "오늘은 「분야」 분야 뉴스가 아직 없어요".
- 스키마: building 은 `items` 또는 `categories` 중 하나 필수 (`data/schema/news.schema.json`).

### 1-2. 스포츠센터 종목별 분야 `buildings.sports.categories` (콘텐츠 봇용)

스포츠센터도 뉴스 센터와 **같은 분야 메뉴 UI**를 쓴다. `buildings.sports` 에 `categories` 배열이 있으면 문에서 Space 를 눌렀을 때 종목 메뉴가 열린다.
없으면(예전 형식, `items` 만 있음) 지금처럼 바로 소식 대화가 나온다. 두 형식 모두 계속 지원한다.

```json
"sports": {
  "name": "스포츠센터",
  "speaker": "스포츠센터 코치",
  "greeting": "왔어요? 종목을 골라 봐요!",
  "categories": [
    { "id": "mancity", "label": "맨시티", "items": [
      { "title": "맨시티, 리버풀 원정 2-1 승리", "lines": ["한 줄 = 한 페이지"], "source": "https://...", "published_at": "2026-10-07T06:30:00+09:00" } ] },
    { "id": "doosan", "label": "두산 베어스", "items": [] },
    { "id": "f1",     "label": "F1",         "items": [] },
    { "id": "ufc",    "label": "UFC",        "items": [] }
  ]
}
```

- 종목 id와 메뉴 순서: `mancity`(맨시티), `doosan`(두산 베어스), `f1`(F1), `ufc`(UFC). `label` 을 생략하면 괄호 안 이름을 쓴다. 모르는 id 는 메뉴 끝에 붙는다.
- **분야당 최대 10개** (스키마 `maxItems: 10`). 게임도 10개까지만 보여 준다(11번째부터 무시). 뉴스 센터 분야도 같은 규칙.
- `items` 형식은 다른 건물과 같다. `published_at` 은 선택이다. **생략, `""`, `null` 모두 허용**하고, 이때는 시각 표시만 빠진다(오류 없음).
- 데이터가 없거나 빈 종목은 메뉴에 "(없음)"으로 나오고, 고르면 "오늘은 「F1」 소식이 아직 없어요"가 나온다.
- `categories` 와 `items` 가 **같이 있으면** `items` 는 메뉴 끝의 「기타 소식」 분야로 보인다(옮기는 동안 호환용).
- 흐름: 종목 메뉴 → 종목 선택 → "「맨시티」 소식 N건을 전해 드릴게요." → (「제목」 → lines…) → 마무리 → **메뉴로 복귀**. Esc: 대화 중이면 메뉴로, 메뉴에서는 닫힘.
- 메뉴를 닫으면 그 건물의 일일 반응 `after_news` 가 이어질 수 있다(4장).
- 일일 반응 `news_ref` 가 종목 소식을 가리킬 때는 `category_id` (`mancity` 등)와 그 분야 안의 `item_index` 를 쓴다.

## 2. 학습 `data/study/`

### 2-1. 교재 목록 `data/study/index.json`

```json
{
  "version": 1,
  "updated_at": "2026-10-07T07:00:00+09:00",
  "is_sample": false,
  "materials": [
    { "id": "jobcounsel2_part1", "title": "직업상담사 2급 1과목", "subject": "직업상담학", "page_count": 120, "file": "jobcounsel2_part1.json" }
  ]
}
```

- `file`: `data/study/` 기준 파일명. `page_count`: PDF 총 페이지(입력 범위 검증용, 선택).
- 교재가 2개 이상이면 학원 UI 첫 줄에서 ←/→ 로 선택.

### 2-2. 교재 내용 `data/study/<file>.json`

```json
{
  "version": 1,
  "id": "jobcounsel2_part1",
  "title": "직업상담사 2급 1과목",
  "subject": "직업상담학",
  "page_count": 120,
  "is_sample": false,
  "chunks": [
    {
      "id": "c01",
      "title": "특성-요인 이론",
      "pages": [11, 20],
      "summary": ["요약 한 줄 = 대화 한 페이지", "..."],
      "questions": [
        {
          "id": "q01",
          "question": "문제 본문",
          "choices": ["보기1", "보기2", "보기3", "보기4"],
          "answer_index": 1,
          "explanation": "해설",
          "pages": [12, 13]
        }
      ]
    }
  ]
}
```

- `pages`: `[시작, 끝]` PDF 페이지, 양끝 포함. 질문의 `pages` 생략 시 chunk 의 `pages` 사용.
- **`answer_index` 는 0부터** (0 = ①). 화면엔 ①②③④로 표시.
- 선택 규칙: 사용자가 입력한 `[s, e]` 와 **겹치는** (`p[0] <= e && p[1] >= s`) chunk 의 summary / question 을 문서 순서대로 사용. 퀴즈는 최대 10문제.
- 대체 처리: 겹치는 요약/문제 없음 → 강사가 "해당 범위의 요약/예상 문제가 아직 없어요" 안내.
- 입력 검증: 숫자만, 1 이상, 시작 ≤ 끝, 끝 ≤ page_count.

## 3. 스토리 `data/story/story.json` (스토리 봇 작성, 엔진: `game/js/story.js`)

```json
{
  "version": 1,
  "is_sample": false,
  "player": { "name": "현수" },
  "affection_stages": {
    "heroine": [
      { "id": "s1_comfortable", "name": "① 편한 동기" },
      { "id": "s2_study_mate", "name": "② 스터디 메이트", "from": "2026-11-01", "requires_flags": ["stage2_ready"] }
    ]
  },
  "characters": {
    "heroine": {
      "name": "주연",
      "location": "academy",
      "scenes": [
        {
          "id": "e01_opening_day",
          "available_from": "2026-10-07",
          "excludes_flags": ["e01_opening_day_done"],
          "set_flags": ["e01_opening_day_done", "met_heroine"],
          "affection": 1,
          "lines": [
            { "speaker": "　", "text": "(3층 302호 강의실.)", "portrait": null },
            { "speaker": "주연", "text": "현수쌤, 좋은 아침이에요!" },
            { "prompt": "어떻게 대답할까?", "choices": [
              { "id": "notes", "text": "제 필기 같이 볼래요?", "set_flags": ["e01_choice_notes"],
                "lines": [ { "speaker": "주연", "text": "표요? 보여 주세요!" } ] },
              { "id": "type", "text": "주연쌤은 S형 같아요.",
                "lines": [ { "speaker": "주연", "text": "…그런 말 들으니까 좀 힘나네요." } ] }
            ] },
            { "speaker": "주연", "text": "내일 봬요!" }
          ]
        },
        {
          "id": "e03_pcbang_meet",
          "available_from": "2026-10-17",
          "location": "pcbang",
          "door_mode": "instead",
          "requires_flags": ["e01_opening_day_done"],
          "lines": ["..."],
          "late_lines": ["(늦었지만…) 버전, 선택"]
        }
      ],
      "default_lines": ["맞는 장면이 없을 때 대사"]
    }
  }
}
```

### 3-1. 캐릭터 `characters.<id>`
- 키 = NPC id: `heroine`, `park_youngmi`, `jung_hyuna`, `jo_sunmi`, `lee_jin`, `kang_myeongheon` (`game/js/map.js` 의 `DotGame.NPCS`).
  NPC 목록·위치·화자 이름→초상화 표는 **[`docs/NPCS.md`](NPCS.md)**. 키는 정식 id(`jo_sunmi`, `kang_myeongheon` 등)를 쓴다.
- `name`: 대화창 이름. `location`: 기본 장소(NPC 가 서 있는 곳, 보통 `academy`). `default_lines`: 맞는 장면이 없을 때.
- `stages` (선택): 이 캐릭터의 호감도 단계. 최상위 `affection_stages.<id>` 에 둬도 된다(3-4).

### 3-2. 장면 `scenes[]` — 재생 조건 (모두 AND)
말을 걸면(또는 건물 문에서) 위에서부터 **조건을 모두 만족하는 첫 장면** 1개를 재생한다.

| 필드 | 형식 | 뜻 |
|---|---|---|
| `id` | 문자열, 필수 | 캐릭터 안에서 유일. 세이브 키 = `캐릭터id/장면id` |
| `requires_flags` / `excludes_flags` | 문자열 배열 | 모두 켜짐 / 하나도 안 켜짐. **`date_reached_YYYY-MM-DD`** 는 가상 플래그로, 오늘(KST) ≥ 그 날짜이면 켜진 것으로 본다. 날짜 트리거가 생기기 전 스토리 봇이 쓰던 방식이며 계속 동작한다 |
| `set_flags` | 문자열 배열 | 재생을 시작할 때 켬 (세이브 `flags`) |
| `affection` | 숫자 | 재생할 때 호감도 증감 (세이브 `affection[캐릭터id]`) |
| **`available_from`** | `YYYY-MM-DD` | 이 날짜(KST)부터 재생 가능. 날짜 기준은 `Save.todayKST()` 라서 `?date=` 로 시험할 수 있다 |
| **`available_until`** | `YYYY-MM-DD` | 이 날짜까지만 (선택). 지나면 밀린 이벤트로도 나오지 않음 |
| **`late_lines`** | 대사 배열 | `available_from` 보다 늦게 재생될 때 `lines` 대신 사용 ("늦었지만…" 버전, 선택) |
| **`stage`** | 단계 id | 그 캐릭터의 호감도 단계가 **이 단계 이상**일 때만. 단계 정의가 없으면 메타데이터로만 취급 |
| **`location`** | 건물 id | 캐릭터 `location` 과 같거나 생략 → NPC 에게 말 걸 때. **다른 건물 id**(`pcbang` 등) → 그 건물 문에서 Space 를 누를 때 재생 (3-5) |
| **`door_mode`** | `instead`(기본) \| `before` | 건물 장면: 건물 기본 콘텐츠(소식/메뉴) **대신** 재생, 또는 장면 **후** 기본 콘텐츠 |
| `repeatable` | 불리언 | `true` 면 재생 후에도 조건이 맞으면 다시 (기본: 장면은 **한 번만**, 세이브 `story.seen`) |
| **`kind`** / `type` / `bypass_backlog` / `priority` | `"ending"` / `"ending"` / `true` / `"immediate"` | 즉시 장면 (아래 '즉시 장면') |
| `event_id`, `note`, `key_event` | — | 메타데이터 (게임은 무시) |

**밀린 이벤트 (놓친 이벤트) 규칙**
- `available_from` 이 **오늘**인 장면은 바로 풀린다.
- `available_from` 이 **오늘보다 이전**인데 아직 안 풀린 장면은 밀린 이벤트다. **게임 속 하루(플레이 날짜)에 하나씩, 오래된 날짜 순서로** 풀린다.
  - 같은 날짜라면 목록 순서를 따른다.
  - 지금 다른 조건(플래그·단계·`available_until`)이 맞는 장면만 대상이다. 조건이 안 맞는 장면 때문에 그날 차례를 날리지 않는다.
  - 풀렸지만 아직 안 본 밀린 이벤트가 있으면 다음 것을 풀지 않는다.
- 예: E01을 10-07에 보고 10-20에 다시 접속하면 그날은 E02만 풀린다. E03(10-17)은 다음 플레이 날짜에 풀린다.
- 기록은 세이브 `story.released` 와 `story.backlog_day` 에 남는다(`docs/SAVE_FORMAT.md`).

**즉시 장면 (엔딩 등) — 밀린 이벤트 큐를 건너뜀**

장면에 아래 표시 중 **하나**만 있으면 즉시 장면이다.

| 필드 | 값 |
|---|---|
| `kind` | `"ending"` (권장) |
| `type` | `"ending"` (`kind` 와 같은 뜻) |
| `bypass_backlog` | `true` |
| `priority` | `"immediate"` |

- **`available_from` 날짜부터** 언제 접속하든 바로 풀린다. 그 날짜든, 몇 달 뒤 처음 오는 날이든 상관없다.
- 다른 장면보다 **먼저** 재생된다. 더 오래된 밀린 이벤트보다도, 풀렸지만 안 본 밀린 이벤트보다도 먼저다.
- **그날 밀린 이벤트 몫을 쓰지 않는다**. 엔딩을 본 같은 날에도 가장 오래된 밀린 장면 1개가 평소처럼 풀린다. 그 뒤로는 다시 하루 1개다.
- **무시하는 조건**:
  - 밀린 이벤트 하루 1개 제한
  - `stage` (호감도 단계가 낮아도 재생)
  - `requires_flags` (오래 쉰 플레이어에게 없는 앞 장면 플래그, 예: `e24_back_from_home_done`)
- **지키는 조건**:
  - `available_from` (그 전 날짜엔 안 나옴)
  - `available_until`
  - `excludes_flags`
  - 한 번만 재생 (`repeatable` 이 아니면 세이브 `story.seen`)
- 재생 효과(`set_flags`, `affection`)는 보통 장면과 같다. 단, 호감도 단계는 앞에서부터 순서대로 오르기 때문에 앞 단계 조건이 비어 있으면 `ending_seen` 이 켜져도 `post_ending` 단계로 바로 가지는 않는다.
- **현재 데이터**: `heroine/e31_pass_together` 에 `"kind": "ending"` 이 들어 있다.
  - 개발 봇이 이 필드 하나만 병합했다. 백업: `story/backup/story.json.bak-20261007-201319-devbot`.
  - **story.json 을 다시 쓸 때 이 필드를 유지할 것**. 빠지면 E31 은 보통 밀린 이벤트처럼 하루 1개 순서와 조건을 따른다.
- 확인: 콘솔 `DotGame.debug.story().scenes["heroine/e31_pass_together"].immediate`, 테스트 `test_ending`.

### 3-3. 대사 줄 `lines[]`
| 형태 | 뜻 |
|---|---|
| `"문자열"` | 그 캐릭터(`name`)의 대사 |
| `{ "speaker", "text", "portrait"? }` | 화자 지정. `portrait`: 초상화 id(`hero`, `heroine`, `park_youngmi` …) 또는 `null`(없음). 생략 시 화자 이름으로 자동 (NPCS.md 2-1) |
| **나레이션** `{ "speaker": "　", "text": "(…)" }` 또는 `{ "narration": true, "text": "(…)" }` | `speaker` 가 공백뿐(전각 공백 `　` 포함)이거나 `narration: true` 면 나레이션이다. **이름표·초상화 없이** 어두운 보라색 상자에 가운데 정렬 기울임체로 나온다. 스토리 봇의 기존 `"　"` + `portrait: null` 표기가 그대로 동작한다 |
| **선택지** `{ "prompt"?, "choices": [ { "id"?, "text", "lines"?, "set_flags"?, "affection"? } ] }` | 반응만 다른 선택지(2~4개). 대화창에 보기가 뜨고 ↑↓/W/S/숫자키로 고른 뒤 Enter/Space(또는 클릭)로 정한다. 고른 말이 현수 대사로 한 쪽 나온다. 그다음 그 선택지의 `lines` 반응이 나오고, **장면의 다음 줄로 똑같이 이어진다**. `id`(생략 시 a, b, c…)는 세이브 `story.choices["캐릭터id/장면id#줄번호"]` 에 남는다. `set_flags`/`affection` 은 고른 선택지만 적용된다 |

- 플레이어는 Backspace/← 로 이전 줄로 돌아갈 수 있다. 선택지는 **첫 선택이 고정**되고, 선택지·장면 효과는 한 번만 적용된다(README '이전 줄 규칙').
- `emotion` (표정 태그)은 받아 두기만 하고 아직 표시하지 않는다.
- 스토리 봇 메모: E01 쉬는 시간 선택지(A 필기 공유 / B S형)는 이제 `choices` 로 넣을 수 있다. 선택 결과 플래그로 E02 인사말을 바꾸려면 E02 를 플래그별로 두 장면으로 나눈다.

### 3-4. 호감도 단계 `affection_stages.<캐릭터id>` (또는 `characters.<id>.stages`)
```json
"affection_stages": { "heroine": [
  { "id": "s1_comfortable", "name": "① 편한 동기" },
  { "id": "s2_study_mate", "name": "② 스터디 메이트", "from": "2026-11-01", "requires_flags": ["stage2_ready"] },
  { "id": "s3_friend", "name": "③ 친구", "min_affection": 20, "from": "2026-12-01" }
] }
```
- 단계 조건은 모두 선택이고, 함께 쓰면 AND다:
  - `min_affection`: 호감도 이상(데이터의 임계값)
  - `from`: 날짜(KST) 이후
  - `requires_flags`: 플래그(예: 전 단계 ★ 이벤트가 켜는 `stage2_ready`)
- **앞에서부터 조건을 모두 만족하는 데까지**가 현재 단계다. 첫 단계에 조건이 없으면 시작 단계가 된다.
- 단계는 세이브 `story.stages.<id> = {id, since}` 에 남고 **내려가지 않는다**.
- 단계가 바뀌면 다음이 일어난다:
  - `DotGame.Story.onStageChange(fn)` 콜백이 `{character, from, to, name}` 을 받는다.
  - `window` 에 `dotgame:stagechange` 이벤트가 발생한다.
  - 화면 위쪽에 "주연와(과)의 관계: ② 스터디 메이트" 알림이 뜬다.
- 단계 판정 시점: 부팅, 장면 재생, 선택, 날짜 변경.
- 단계 정의가 없으면 단계 없음(`null`)이다. 이때 장면의 `stage` 는 조건으로 쓰지 않는다.
- 일일 반응의 `conditions.stages` 는 `heroine` 의 단계를 본다.

### 3-5. 다른 건물에서 일어나는 장면 (예: E03 PC방)
- 장면 `location` 이 캐릭터의 기본 장소와 다른 건물 id 이면, 그 건물 문에서 Space 를 누를 때 재생된다.
  - `door_mode: "instead"`(기본): 이번 방문은 장면만 나온다.
  - `door_mode: "before"`: 장면이 끝나면 건물 기본 콘텐츠가 이어서 열린다.
- 그 장면이 대기 중이고 기본 장소의 장면이 없으면, NPC 가 **그 건물 앞**(`map.js` `STORY_SPOTS`)으로 옮겨 가서 서 있는다. 그 자리에서 말을 걸어도 같은 장면이 재생된다.
  - 자리: PC방 (7,7), 요리학원 (26,7), 엔터 (7,18), 스포츠센터 (26,19), 뉴스 센터 (36,7). 모두 문 옆이고 길을 막지 않는다.
- 장면을 보고 나면 NPC 는 기본 자리로 돌아간다.

### 3-6. 말 걸기 우선순위 (`game/js/npc.js`)
1. 스토리 장면 (위 조건)
2. 오늘의 일일 반응 `on_talk` (4장)
3. `default_lines`
4. `daily_reactions.json` 의 `fallback_lines`
5. 내장 placeholder 대사 ("(○○이(가) 가볍게 눈인사를 한다.)")

- `is_sample: true` 면 첫 쪽에 `[예시 데이터]` 가 붙는다.
- 코드 훅: `DotGame.NPC.talk(npcDef, where)`, `DotGame.Story.play(cid, scene)`.

## 4. 일일 반응 대사 `data/daily_reactions.json` (콘텐츠 봇이 매일 아침 덮어씀)

형식은 스토리 봇 제안(`story/daily_reaction_slots.md`, `story/daily_reaction.schema.json`)을 그대로 채택했다.
- 스키마: `data/schema/daily-reactions.schema.json`. 제안본에서 바뀐 점은 sports 종목 `category_id` 설명 한 줄뿐이다.
- 예시: `story/daily_reaction_example.json`. 테스트용 복사본은 `tools/fixtures/daily_reactions.sample.json`.
- 미러: `data/daily_reactions.js` → `window.DAILY_REACTIONS_DATA`. 검증: `tools/validate_data.py` (스키마 + 반응 id 중복 + `news_ref` 제목 일치).

```json
{
  "version": 1, "updated_at": "2026-10-07T07:10:00+09:00", "is_sample": false,
  "date": "2026-10-07",
  "news_updated_at": "2026-10-07T07:00:00+09:00",
  "reactions": [
    { "id": "r20261007_pcbang_juyeon",
      "news_ref": { "building": "pcbang", "item_index": 0, "title": "news.json 의 그 item.title 과 똑같이" },
      "topic": "game_general", "character": "juyeon", "where": "pcbang", "trigger": "after_news",
      "conditions": { "stages": ["s1_comfortable"], "periods": ["class"] },
      "emotion": "curious",
      "lines": [ { "speaker": "juyeon", "text": "현수쌤, 이 게임 재밌어요?" }, { "speaker": "hyunsu", "text": "같이 해 봐요." } ],
      "priority": 5 }
  ],
  "fallback_lines": { "juyeon": ["오늘은 별 소식 없네요."] }
}
```

게임 동작:
- **`date` 가 오늘(KST)과 다르면 반응 전체를 쓰지 않는다**. `news_updated_at` 이 `news.json` 의 `updated_at` 과 다르면 `news_ref` 가 있는 반응만 건너뛴다.
  `news_ref` 가 가리키는 항목(`building` [+ `category_id`] + `item_index`)의 `title` 이 다를 때도 건너뛴다.
- 트리거:
  - `after_news`: 그 건물(`where`) 소식 대화를 다 보고 닫은 직후. 뉴스 센터와 종목 메뉴는 메뉴를 닫은 직후다.
  - `on_talk`: 그 장소(`where`, 학원 NPC 는 `academy`)에서 그 캐릭터에게 말 걸 때. 단, 그 캐릭터의 스토리 장면이 우선이다.
  - `message` (단톡·문자): 화면이 보류 중이라 **아직 재생하지 않는다**.
- `conditions`(모두 AND):
  - `stages`: 주연(heroine)의 현재 호감도 단계 id (3-4)
  - `periods`: 아래 날짜표
  - `requires_flags` / `excludes_flags`: 세이브 플래그 (`date_reached_*` 포함)
- 후보 중 `priority` 가 가장 큰 반응 1개를 재생한다. 같은 반응은 그날 다시 나오지 않는다(세이브 `daily.played`, 날짜가 바뀌면 비움).
  `variants[현재 단계]` 가 있으면 `lines` 대신 쓴다.
- 화자 id → 표시 이름/초상화: `juyeon`→주연/`heroine`, `hyunsu`→`player.name`/`hero`, 학원 NPC id → story.json 이름/같은 id 초상화.
- 기간(periods) 날짜표 (`game/js/daily.js` `PERIODS`, slots 문서 2-1):

  | 기간 | 날짜 |
  |---|---|
  | `class` | ~2027-01-14 |
  | `self_study` | 01-15~02-13 |
  | `juyeon_away` | 02-06~02-09 |
  | `exam_sprint` | 02-14~02-21 |
  | `exam_day` | 02-22~02-23 |
  | `waiting` | 02-24~03-04 |
  | `post_ending` | 03-05~ |

  기간이 겹치면 더 짧은 기간을 쓴다(예: 02-07 = `juyeon_away`, 02-22 = `exam_day`).
- 파일이 없거나 형식이 틀리면 `.js` 미러를 쓰고, 그것도 없으면 반응 없이 진행한다(오류 없음).
- 현재 `data/daily_reactions.json` 은 빈 자리 파일이다(`reactions: []`). 콘텐츠 봇이 매일 덮어쓴 뒤 `python3 tools/build_fallbacks.py` 를 실행한다.
