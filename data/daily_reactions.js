// 자동 생성 파일 — 직접 수정 금지. 원본: data/daily_reactions.json
// 재생성: python3 tools/build_fallbacks.py
window.DAILY_REACTIONS_DATA = {
  "version": 1,
  "updated_at": "2026-10-11T21:00:00+09:00",
  "is_sample": false,
  "date": "2026-10-11",
  "news_updated_at": "2026-10-11T21:00:00+09:00",
  "reactions": [
    {
      "id": "r20261011_cooking_juyeon",
      "character": "juyeon",
      "topic": "recipe",
      "where": "cooking",
      "trigger": "after_news",
      "news_ref": {
        "building": "cooking",
        "item_index": 0,
        "title": "오늘의 레시피: 백종원 어묵볶음 (인덕션 2구, 3인분)"
      },
      "conditions": {
        "stages": [
          "s1_comfortable"
        ],
        "periods": [
          "class"
        ]
      },
      "emotion": "curious",
      "priority": 5,
      "lines": [
        {
          "speaker": "juyeon",
          "text": "현수쌤, 어묵볶음은 양념까지 다 넣고 불을 켠대요.",
          "emotion": "curious"
        },
        {
          "speaker": "hyunsu",
          "text": "3~4분이면 끝나니까 반찬으로 딱이네요."
        }
      ]
    },
    {
      "id": "r20261011_sports_juyeon_f1",
      "character": "juyeon",
      "topic": "f1",
      "where": "sports",
      "trigger": "after_news",
      "news_ref": {
        "building": "sports",
        "category_id": "f1",
        "item_index": 0,
        "title": "싱가포르 GP 예선: 베르스타펜 첫 마리나베이 폴"
      },
      "conditions": {
        "stages": [
          "s1_comfortable"
        ],
        "periods": [
          "class"
        ]
      },
      "emotion": "surprised",
      "priority": 4,
      "lines": [
        {
          "speaker": "juyeon",
          "text": "현수쌤, 싱가포르 예선도 베르스타펜 선수가 1위래요!",
          "emotion": "surprised"
        }
      ]
    },
    {
      "id": "r20261011_sports_kang_myeongheon",
      "character": "kang_myeongheon",
      "topic": "kbo_doosan",
      "where": "sports",
      "trigger": "after_news",
      "news_ref": {
        "building": "sports",
        "category_id": "doosan",
        "item_index": 0,
        "title": "KIA, 롯데에 1-4 패…3위는 12일 KIA-LG 최종전에서 결정"
      },
      "conditions": {
        "stages": [
          "s1_comfortable"
        ],
        "periods": [
          "class"
        ]
      },
      "emotion": "smile",
      "priority": 5,
      "lines": [
        {
          "speaker": "kang_myeongheon",
          "text": "현수쌤, 3위는 내일 KIA-LG 최종전에서 정해진대요.",
          "emotion": "smile"
        },
        {
          "speaker": "hyunsu",
          "text": "두산 상대도 내일 정해지겠네요."
        }
      ]
    }
  ]
};
