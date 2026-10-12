// 자동 생성 파일 — 직접 수정 금지. 원본: data/daily_reactions.json
// 재생성: python3 tools/build_fallbacks.py
window.DAILY_REACTIONS_DATA = {
  "version": 1,
  "updated_at": "2026-10-12T20:30:00+09:00",
  "is_sample": false,
  "date": "2026-10-12",
  "news_updated_at": "2026-10-12T20:30:00+09:00",
  "reactions": [
    {
      "id": "r20261012_cooking_juyeon",
      "character": "juyeon",
      "topic": "recipe",
      "where": "cooking",
      "trigger": "after_news",
      "news_ref": {
        "building": "cooking",
        "item_index": 0,
        "title": "오늘의 레시피: 백종원 제육볶음 (인덕션 2구, 2인분)"
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
          "text": "현수쌤, 제육볶음은 고기에 설탕부터 넣고 볶는대요.",
          "emotion": "curious"
        },
        {
          "speaker": "hyunsu",
          "text": "그래야 양념이 잘 밴다니까 오늘 해 봐야겠어요."
        }
      ]
    },
    {
      "id": "r20261012_sports_juyeon_mancity",
      "character": "juyeon",
      "topic": "epl_mancity",
      "where": "sports",
      "trigger": "after_news",
      "news_ref": {
        "building": "sports",
        "category_id": "mancity",
        "item_index": 0,
        "title": "맨시티, 안필드서 리버풀 3-0 완파…6전 전승"
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
      "priority": 5,
      "lines": [
        {
          "speaker": "juyeon",
          "text": "현수쌤, 맨시티가 리버풀 원정에서 3-0으로 이겼대요!",
          "emotion": "surprised"
        },
        {
          "speaker": "hyunsu",
          "text": "6경기 전승이에요. 오늘 기분 좋네요."
        }
      ]
    },
    {
      "id": "r20261012_sports_kang_myeongheon",
      "character": "kang_myeongheon",
      "topic": "kbo_kia",
      "where": "sports",
      "trigger": "after_news",
      "news_ref": {
        "building": "sports",
        "category_id": "doosan",
        "item_index": 2,
        "title": "KIA-LG 3위 결정전, 양현종 5이닝 1실점"
      },
      "conditions": {
        "stages": [
          "s1_comfortable"
        ],
        "periods": [
          "class"
        ]
      },
      "emotion": "excited",
      "priority": 6,
      "lines": [
        {
          "speaker": "kang_myeongheon",
          "text": "양현종 선수 5이닝 1실점이래요. 역시 대투수예요. 비기기만 해도 3위고요.",
          "emotion": "excited"
        },
        {
          "speaker": "hyunsu",
          "text": "명헌쌤, 기아 얘기엔 말이 많아지시네요."
        }
      ]
    },
    {
      "id": "r20261012_entertainment_juyeon",
      "character": "juyeon",
      "topic": "kpop_release",
      "where": "entertainment",
      "trigger": "after_news",
      "news_ref": {
        "building": "entertainment",
        "item_index": 3,
        "title": "제베원 성한빈, 첫 솔로 EP 'DEAD:ALIVE' 발매"
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
      "priority": 4,
      "lines": [
        {
          "speaker": "juyeon",
          "text": "성한빈 씨 첫 솔로래요. 댄서 출신이라 무대가 기대돼요.",
          "emotion": "smile"
        }
      ]
    },
    {
      "id": "r20261012_newscenter_jo_sunmi",
      "character": "jo_sunmi",
      "topic": "news_general",
      "where": "newscenter",
      "trigger": "after_news",
      "news_ref": {
        "building": "newscenter",
        "category_id": "economy",
        "item_index": 0,
        "title": "코스피 3.65% 급락, 6,384로 마감…코스닥 4.83%↓"
      },
      "conditions": {
        "stages": [
          "s1_comfortable"
        ],
        "periods": [
          "class"
        ]
      },
      "emotion": "worried",
      "priority": 3,
      "lines": [
        {
          "speaker": "jo_sunmi",
          "text": "현수쌤, 오늘 코스피가 3.65%나 내렸대요.",
          "emotion": "worried"
        },
        {
          "speaker": "hyunsu",
          "text": "환율은 2년여 만에 최저라던데요."
        }
      ]
    }
  ]
};
