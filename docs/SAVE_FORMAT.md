# 세이브 포맷 & 날짜/일차 규칙 (save_version 2)

코드: `game/js/save.js` (`DotGame.Save`). JSON Schema: `data/schema/save.schema.json`.
저장 위치: 브라우저 **localStorage** 키 `dotgame.save` (JSON 문자열 1개).
`http://127.0.0.1:8000` 와 `file://` 은 출처가 달라 **세이브가 따로** 저장된다. 브라우저/프로필을 바꿔도 따로.

## 날짜 = 실제 KST 달력
- 항상 Asia/Seoul(UTC+9, 서머타임 없음) 기준. 브라우저/OS 시간대와 무관: `new Date(Date.now() + 9h).toISOString().slice(0,10)`.
- HUD 첫 줄: `날짜 2026-10-06 (화) KST · 1일차` (가짜 날짜면 `· 가짜 날짜(?date)`, 저장 불가면 `· 저장 불가(메모리)`).

## 일차 규칙 = 서로 다른 플레이 날짜 수
- 처음 실행한 날 = **1일차**. `start_date_kst` = `last_play_date_kst` = 그날.
- 게임을 열 때(그리고 켜 둔 동안 1분마다) KST 오늘 > `last_play_date_kst` 이면 `day += 1`, `last_play_date_kst = 오늘`.
- 며칠 건너뛰고 들어와도 **+1** 만 된다 (예: 10/6 → 10/8 → 10/20 접속 = 1, 2, 3일차).
  달력상 경과일이 필요하면 `DotGame.Save.calendarDaysSinceStart()` (= 오늘 − start_date_kst) 로 계산 가능.
- 오늘 < `last_play_date_kst` (시계를 되돌림/과거 가짜 날짜) 이면 아무것도 바뀌지 않는다.
- 자정을 넘겨 계속 켜 두면 1분 안에 일차가 오른다(가짜 날짜 모드에선 고정).

## 디버그 URL 파라미터
| 파라미터 | 효과 |
|---|---|
| `?date=2026-10-08` | 오늘 KST 날짜를 가짜로 지정 (형식 틀리면 무시 + 콘솔 경고). 세이브에 실제로 반영됨 |
| `?reset=1` | 세이브 삭제 후 새로 시작. 처리 후 주소에서 `reset` 은 자동 제거(새로고침 반복 리셋 방지) |
| 조합 | `?date=2026-10-08&reset=1` → 그 날짜를 1일차로 새 게임 |
콘솔: `DotGame.debug.save()` (읽기), `DotGame.Save.reset()` (즉시 리셋).

## 구조
```json
{
  "save_version": 2,
  "created_at": "2026-10-06T23:53:48+09:00",
  "updated_at": "2026-10-06T23:56:10+09:00",
  "start_date_kst": "2026-10-06",
  "last_play_date_kst": "2026-10-08",
  "day": 2,
  "affection": { "heroine": 1 },
  "flags": { "met_heroine": true },
  "quiz": {
    "history": [
      { "date_kst": "2026-10-08", "day": 2, "at": "2026-10-08T21:10:00+09:00",
        "material_id": "jobcounsel2_sample", "range": [11, 14],
        "total": 1, "answered": 1, "correct": 0, "completed": true }
    ],
    "wrong": [
      { "material_id": "jobcounsel2_sample", "question_id": "q03", "times_wrong": 1,
        "last_chosen_index": 0, "answer_index": 1, "last_wrong_date_kst": "2026-10-08",
        "question": "(예시) 특성-요인 이론의 핵심 아이디어로…" }
    ]
  },
  "academy": { "last_range": { "material_id": "jobcounsel2_sample", "start": 11, "end": 14 } },
  "story": {
    "seen":     { "heroine/e01_opening_day": "2026-10-07" },
    "released": { "heroine/e01_opening_day": "2026-10-07", "heroine/e02_after_class": "2026-10-20" },
    "backlog_day": "2026-10-20",
    "choices":  { "heroine/e01_opening_day#7": "notes" },
    "stages":   { "heroine": { "id": "s1_comfortable", "since": "2026-10-07" } }
  },
  "daily": { "date": "2026-10-20", "played": ["r20261020_pcbang_juyeon"] }
}
```
- `created_at`/`updated_at`/`history[].at` 은 **실제** 시각(가짜 날짜 영향 없음). `*_date_kst`, `day` 는 게임 날짜(가짜 날짜 반영).
- `affection`: 캐릭터 id → 숫자. story.json 장면의 `affection` 값만큼 증감 (`DotGame.Save.addAffection`).
- `flags`: story.json 장면의 `set_flags` 가 여기 저장되고 `requires_flags`/`excludes_flags` 판정에 사용.
- `quiz.history`: 퀴즈 1세트 = 1건 (끝까지 풀었거나 1문제 이상 풀고 닫았을 때, `completed` 로 구분). 최대 200건(오래된 것부터 삭제).
- `quiz.wrong`: 오답노트. 틀리면 추가(이미 있으면 `times_wrong`+1), **나중에 맞히면 제거**. 최대 500건.
- `academy.last_range`: 마지막으로 실행한 교재/범위. 학원 UI를 열면 입력칸이 미리 채워짐.
- `story` (v2, `game/js/story.js`, 키 = `캐릭터id/장면id`, 값 = 게임 날짜 KST):
  - `seen`: 재생을 시작한 장면. `repeatable` 이 아니면 다시 나오지 않는다.
  - `released`: 풀린 날짜. 오늘이 `available_from` 이면 그날 바로 풀린다. 날짜가 지난 장면은 밀린 이벤트로 하루에 하나씩 풀린다.
  - `backlog_day`: 마지막으로 밀린 이벤트를 푼 플레이 날짜. 같은 날에는 하나만 푼다.
  - `choices`: 선택지 답. 키는 `장면키#줄번호`(lines 배열 위치), 값은 선택지 `id`(생략 시 a/b/c…).
  - `stages`: 캐릭터별 현재 호감도 단계 `{id, since}`. 올라가기만 한다.
- `daily` (v2, `game/js/daily.js`): `date` 는 기록 날짜, `played` 는 그날 재생한 일일 반응 id. 날짜가 바뀌면 비워진다.

## 로드 / 마이그레이션 / 리셋
- `DotGame.Save.init()` (부팅 시 1회): URL 파라미터 처리 → localStorage 읽기 → `migrate()` → 일차 반영 → 저장.
- `migrate(s, today)`: `save_version` 이 낮으면 `MIGRATIONS[n]`(n→n+1) 을 순서대로 적용, 이후 누락 필드를 기본값으로 보정.
  **필드 추가는 버전 유지 + 기본값 보정**으로 처리, 의미/이름이 바뀔 때만 `SAVE_VERSION` 을 올리고 `MIGRATIONS` 에 변환 함수 추가.
  게임보다 새 버전 세이브는 읽을 수 있는 만큼 사용.
- 손상된 JSON → `dotgame.save.corrupt` 에 원문 백업 후 새 세이브.
- localStorage 사용 불가(차단/용량 초과) → 메모리에만 저장, HUD 에 `저장 불가(메모리)` 표시.
- `reset()`: 키 삭제 후 오늘 날짜로 새 세이브.

### 버전 기록
| 버전 | 변경 | 마이그레이션 |
|---|---|---|
| 1 | 최초 (날짜/일차, 호감도, 플래그, 퀴즈, 학원) | — |
| 2 | 스토리 엔진·일일 반응: `story` {seen, released, backlog_day, choices, stages}, `daily` {date, played} 추가 | `MIGRATIONS[1]`: 둘을 빈 기본값으로 추가하고 `save_version = 2`. 기존 값(day/affection/flags/quiz/academy)은 그대로 둔다. v1 세이브에서 이미 본 장면은 `set_flags` 플래그(예: `e01_opening_day_done`)와 `excludes_flags` 로 계속 걸러진다 |
