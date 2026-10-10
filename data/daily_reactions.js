// 자동 생성 파일 — 직접 수정 금지. 원본: data/daily_reactions.json
// 재생성: python3 tools/build_fallbacks.py
window.DAILY_REACTIONS_DATA = {
  "version": 1,
  "updated_at": "2026-10-10T21:00:00+09:00",
  "is_sample": false,
  "date": "2026-10-10",
  "news_updated_at": "2026-10-10T21:00:00+09:00",
  "reactions": [
    {
      "id": "r20261010_cooking_juyeon",
      "character": "juyeon",
      "topic": "recipe",
      "where": "cooking",
      "trigger": "after_news",
      "news_ref": {
        "building": "cooking",
        "item_index": 0,
        "title": "오늘의 레시피: 백종원 된장찌개 (인덕션 2구, 3인분)"
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
          "text": "현수쌤, 백종원 된장찌개는 쌀뜨물에 무부터 끓인대요.",
          "emotion": "curious"
        },
        {
          "speaker": "hyunsu",
          "text": "쌀 씻을 때 물 버리지 말고 받아 둬야겠네요."
        }
      ]
    },
    {
      "id": "r20261010_sports_juyeon_f1",
      "character": "juyeon",
      "topic": "f1",
      "where": "sports",
      "trigger": "after_news",
      "news_ref": {
        "building": "sports",
        "category_id": "f1",
        "item_index": 0,
        "title": "싱가포르 스프린트, 베르스타펜 우승…러셀 리타이어"
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
          "text": "현수쌤, 싱가포르 스프린트는 베르스타펜 선수가 이겼대요!",
          "emotion": "surprised"
        }
      ]
    },
    {
      "id": "r20261010_sports_kang_myeongheon",
      "character": "kang_myeongheon",
      "topic": "kbo_doosan",
      "where": "sports",
      "trigger": "after_news",
      "news_ref": {
        "building": "sports",
        "category_id": "doosan",
        "item_index": 0,
        "title": "LG 3위 경쟁 불리…LG-두산 와일드카드 맞대결 가능성"
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
          "text": "현수쌤, 두산이 와일드카드에서 LG랑 붙을 수도 있대요.",
          "emotion": "smile"
        },
        {
          "speaker": "hyunsu",
          "text": "잠실 라이벌전이면 더 떨리겠네요."
        }
      ]
    }
  ]
};
